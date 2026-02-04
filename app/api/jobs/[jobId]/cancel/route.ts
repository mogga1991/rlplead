import { NextRequest, NextResponse } from 'next/server';
import { cancelJob } from '@/lib/queue';
import { log } from '@/lib/logger';
import { handleAPIError } from '@/lib/error-handler';
import { NotFoundError, JobError } from '@/lib/errors';

/**
 * Job Cancellation API - Cancel a running or queued job
 */

export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    log.info('Cancelling job', { jobId });

    const success = await cancelJob(jobId);

    if (!success) {
      throw new JobError(
        'Job may not exist or already completed',
        jobId,
        false
      );
    }

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Job cancelled successfully',
    });
  } catch (error) {
    return handleAPIError(error, { endpoint: 'jobs/cancel', jobId: params.jobId });
  }
}
