import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { log } from './logger';

/**
 * Job Queue Infrastructure for Background Processing
 * Uses BullMQ + Redis for reliable job processing
 */

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null, // Required for BullMQ
  lazyConnect: true, // Don't connect during build
  enableOfflineQueue: false, // Fail fast if not connected
};

// Create Redis connection (lazy - won't connect until first use)
export const redisConnection = new Redis(redisConfig);

// Test connection
redisConnection.on('connect', () => {
  log.info('Redis connected successfully');
});

redisConnection.on('error', (error) => {
  // Only log in non-build environments
  if (process.env.NODE_ENV !== 'production' || process.env.REDIS_URL) {
    log.error('Redis connection error', error);
  }
});

/**
 * Search Jobs Queue
 * Handles long-running contractor searches
 */
export const searchQueue = new Queue('search-jobs', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // Retry up to 3 times on failure
    backoff: {
      type: 'exponential',
      delay: 1000, // Start with 1 second delay
    },
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 100, // Keep last 100 completed jobs
    },
    removeOnFail: {
      age: 7200, // Keep failed jobs for 2 hours
      count: 50, // Keep last 50 failed jobs
    },
  },
});

/**
 * Job progress tracking interface
 */
export interface JobProgress {
  step: string;
  current: number;
  total: number;
  percentage: number;
  message: string;
}

/**
 * Search job data interface
 */
export interface SearchJobData {
  filters: any;
  userId?: string;
  jobId: string;
}

/**
 * Search job result interface
 */
export interface SearchJobResult {
  leads: any[];
  totalContracts: number;
  totalCompanies: number;
}

/**
 * Add a search job to the queue
 */
export async function addSearchJob(
  filters: any,
  userId?: string
): Promise<Job<SearchJobData, SearchJobResult, string>> {
  const jobId = `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const job = await searchQueue.add(
    'search-contractors',
    {
      filters,
      userId,
      jobId,
    },
    {
      jobId,
    }
  );

  log.info('Search job added to queue', { jobId, userId });

  return job;
}

/**
 * Get job by ID
 */
export async function getJob(jobId: string): Promise<Job | undefined> {
  return await searchQueue.getJob(jobId);
}

/**
 * Get job state
 */
export async function getJobState(
  jobId: string
): Promise<string> {
  const job = await getJob(jobId);
  if (!job) return 'unknown';

  const state = await job.getState();
  return state;
}

/**
 * Cancel a job
 */
export async function cancelJob(jobId: string): Promise<boolean> {
  try {
    const job = await getJob(jobId);
    if (!job) {
      log.warn('Attempted to cancel non-existent job', { jobId });
      return false;
    }

    await job.remove();
    log.info('Job cancelled', { jobId });
    return true;
  } catch (error) {
    log.error('Failed to cancel job', error, { jobId });
    return false;
  }
}

/**
 * Get queue metrics
 */
export async function getQueueMetrics() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    searchQueue.getWaitingCount(),
    searchQueue.getActiveCount(),
    searchQueue.getCompletedCount(),
    searchQueue.getFailedCount(),
    searchQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
}

/**
 * Clean old jobs
 */
export async function cleanQueue() {
  await searchQueue.clean(3600 * 1000, 100, 'completed'); // Clean completed jobs older than 1 hour
  await searchQueue.clean(7200 * 1000, 50, 'failed'); // Clean failed jobs older than 2 hours
  log.info('Queue cleaned');
}

// Export queue for use in workers
export default searchQueue;
