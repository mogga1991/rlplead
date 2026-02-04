import { NextRequest, NextResponse } from 'next/server';
import { getJob, getJobState } from '@/lib/queue';
import { log } from '@/lib/logger';
import { handleAPIError } from '@/lib/error-handler';
import { NotFoundError, JobError } from '@/lib/errors';

/**
 * Job Status API - Get status and results of background jobs
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    log.debug('Fetching job status', { jobId });

    // Get job from queue
    const job = await getJob(jobId);

    if (!job) {
      throw new NotFoundError(`Job ${jobId}`);
    }

    // Get job state
    const state = await job.getState();
    const progress = job.progress as any;

    // Build response based on state
    const response: any = {
      jobId: job.id,
      status: state,
      progress: progress || { percentage: 0 },
      createdAt: job.timestamp,
    };

    // If completed, include results
    if (state === 'completed') {
      const result = job.returnvalue;
      response.result = result;
      response.completedAt = job.finishedOn;
      response.duration = job.finishedOn! - job.processedOn!;
    }

    // If failed, include error
    if (state === 'failed') {
      response.error = job.failedReason;
      response.failedAt = job.finishedOn;
      response.attempts = job.attemptsMade;
    }

    // If active, include processing info
    if (state === 'active') {
      response.startedAt = job.processedOn;
    }

    log.debug('Job status retrieved', { jobId, status: state });

    return NextResponse.json(response);
  } catch (error) {
    return handleAPIError(error, { endpoint: 'jobs/status', jobId: params.jobId });
  }
}
