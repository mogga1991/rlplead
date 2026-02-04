import { Worker, Job } from 'bullmq';
import { redisConnection, SearchJobData, SearchJobResult, JobProgress } from '../queue';
import { searchContractors, aggregateByCompany, calculateSalesIntelligence } from '../usaspending';
import { enrichCompanyContacts, generateMockEnrichment } from '../apify';
import type { EnrichedLead, Contact } from '../types';
import { log } from '../logger';
import { batchInsertEnrichedLeads, saveSearch } from '@/db/queries';

/**
 * Search Worker - Processes contractor search jobs in the background
 * This eliminates the 30-second timeout problem by handling searches asynchronously
 */

// Create worker
export const searchWorker = new Worker<SearchJobData, SearchJobResult, string>(
  'search-jobs',
  async (job: Job<SearchJobData, SearchJobResult, string>) => {
    const { filters, userId, jobId } = job.data;

    log.info('Processing search job', { jobId, userId });

    try {
      // Step 1: Search USASpending.gov (20% progress)
      await updateProgress(job, {
        step: 'searching',
        current: 1,
        total: 5,
        percentage: 20,
        message: 'Searching USASpending.gov for contractors...',
      });

      const contractResults = await searchContractors(filters);

      if (contractResults.length === 0) {
        await updateProgress(job, {
          step: 'complete',
          current: 5,
          total: 5,
          percentage: 100,
          message: 'No results found',
        });

        return {
          leads: [],
          totalContracts: 0,
          totalCompanies: 0,
        };
      }

      // Step 2: Aggregate by company (40% progress)
      await updateProgress(job, {
        step: 'aggregating',
        current: 2,
        total: 5,
        percentage: 40,
        message: `Found ${contractResults.length} contracts, aggregating by company...`,
      });

      const companies = aggregateByCompany(contractResults);
      log.info('Aggregated contracts', {
        jobId,
        contracts: contractResults.length,
        companies: companies.length,
      });

      // Step 3: Enrich with contacts (60% progress)
      await updateProgress(job, {
        step: 'enriching',
        current: 3,
        total: 5,
        percentage: 60,
        message: `Enriching ${Math.min(20, companies.length)} companies with contact data...`,
      });

      const companyNames = companies.slice(0, 20).map((c) => c.companyName);
      let enrichedData: Map<string, { contacts: Contact[]; companyInfo: any }>;

      if (process.env.APIFY_API_KEY) {
        log.debug('Enriching with Apify Apollo', { jobId });
        enrichedData = await enrichCompanyContacts(companyNames);

        if (enrichedData.size === 0) {
          log.warn('Apify returned no results, using mock data', { jobId });
          enrichedData = new Map();
          companies.slice(0, 20).forEach((company) => {
            enrichedData.set(company.companyName, generateMockEnrichment(company.companyName));
          });
        }
      } else {
        log.debug('No Apify key, using mock data', { jobId });
        enrichedData = new Map();
        companies.slice(0, 20).forEach((company) => {
          enrichedData.set(company.companyName, generateMockEnrichment(company.companyName));
        });
      }

      // Step 4: Calculate sales intelligence (80% progress)
      await updateProgress(job, {
        step: 'analyzing',
        current: 4,
        total: 5,
        percentage: 80,
        message: 'Calculating sales intelligence scores...',
      });

      const leads: EnrichedLead[] = companies.map((company) => {
        const enrichment = enrichedData.get(company.companyName) || {
          contacts: [],
          companyInfo: {},
        };

        const intelligence = calculateSalesIntelligence(company);

        const decisionMakers = enrichment.contacts.filter((contact: Contact) => {
          const title = contact.title.toLowerCase();
          return (
            title.includes('ceo') ||
            title.includes('cto') ||
            title.includes('cfo') ||
            title.includes('coo') ||
            title.includes('chief') ||
            title.includes('president') ||
            title.includes('director') ||
            title.includes('vp') ||
            title.includes('vice president')
          );
        });

        return {
          company,
          contacts: enrichment.contacts || [],
          companySize: enrichment.companyInfo.size || '',
          industry: enrichment.companyInfo.industry || '',
          website: enrichment.companyInfo.website || '',
          linkedIn: enrichment.companyInfo.linkedIn || '',
          description: enrichment.companyInfo.description || '',
          specialities: enrichment.companyInfo.specialities || [],
          salesIntelligence: {
            ...intelligence,
            bestContactTime: 'Tuesday-Thursday, 10am-2pm EST',
            decisionMakers,
          },
        };
      });

      // Step 5: Save to database (90% progress)
      await updateProgress(job, {
        step: 'saving',
        current: 5,
        total: 5,
        percentage: 90,
        message: 'Saving results to database...',
      });

      try {
        await batchInsertEnrichedLeads(leads);
        await saveSearch(filters, contractResults.length, companies.length, userId);
        log.info('Results saved to database', { jobId });
      } catch (dbError) {
        log.error('Error saving to database', dbError, { jobId });
        // Continue even if DB save fails
      }

      // Complete (100% progress)
      await updateProgress(job, {
        step: 'complete',
        current: 5,
        total: 5,
        percentage: 100,
        message: `Found ${leads.length} leads from ${contractResults.length} contracts`,
      });

      log.info('Search job completed', {
        jobId,
        leads: leads.length,
        contracts: contractResults.length,
      });

      return {
        leads,
        totalContracts: contractResults.length,
        totalCompanies: companies.length,
      };
    } catch (error) {
      log.error('Search job failed', error, { jobId, userId });
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process up to 5 jobs simultaneously
  }
);

/**
 * Update job progress
 */
async function updateProgress(
  job: Job<SearchJobData, SearchJobResult, string>,
  progress: JobProgress
) {
  await job.updateProgress(progress);
  log.debug('Job progress updated', {
    jobId: job.id,
    step: progress.step,
    percentage: progress.percentage,
  });
}

// Event handlers
searchWorker.on('completed', (job) => {
  log.info('Job completed successfully', {
    jobId: job.id,
    duration: Date.now() - job.processedOn!,
  });
});

searchWorker.on('failed', (job, error) => {
  log.error('Job failed', error, {
    jobId: job?.id,
    attempts: job?.attemptsMade,
  });
});

searchWorker.on('active', (job) => {
  log.debug('Job started processing', { jobId: job.id });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  log.info('SIGTERM received, closing worker...');
  await searchWorker.close();
  process.exit(0);
});

export default searchWorker;
