import { NextRequest, NextResponse } from 'next/server';
import { addSearchJob } from '@/lib/queue';
import { log } from '@/lib/logger';
import { handleAPIError } from '@/lib/error-handler';
import { ValidationError, JobError } from '@/lib/errors';
import { searchFiltersSchema, getValidationErrorMessage, getValidationErrorField } from '@/lib/validation';
import { checkSearchRateLimit, getUserIdentifier, getRateLimitHeaders } from '@/lib/rate-limiter';
import { checkCSRF } from '@/lib/csrf';
import { auth } from '@/lib/auth';

/**
 * Search Contractors API - Now uses background job processing
 * This eliminates the 30-second timeout problem by handling searches asynchronously
 *
 * Rate Limit: 10 searches per hour per user/IP
 * CSRF Protection: Required for all POST requests
 */
export async function POST(request: NextRequest) {
  try {
    // CSRF validation FIRST (before any other processing)
    await checkCSRF(request);

    // Parse and validate request body (don't consume rate limit for invalid requests)
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch (error) {
      throw new ValidationError('Invalid request body. Expected JSON.');
    }

    // Validate filters with Zod schema
    const validationResult = searchFiltersSchema.safeParse(rawBody);

    if (!validationResult.success) {
      const errorMessage = getValidationErrorMessage(validationResult.error);
      const errorField = getValidationErrorField(validationResult.error);
      throw new ValidationError(errorMessage, errorField);
    }

    const filters = validationResult.data;

    // Get user session
    const session = await auth();
    const userId = session?.user?.id;

    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Get user identifier for rate limiting
    const identifier = getUserIdentifier(userId, ip);

    // Check rate limit AFTER validation (only consume quota for valid requests)
    const rateLimitInfo = await checkSearchRateLimit(identifier);

    log.request('POST', '/api/search-contractors', { filters, userId, ip });

    // Add search job to queue
    let job;
    try {
      job = await addSearchJob(filters);
    } catch (error) {
      throw new JobError(
        'Failed to create search job',
        'unknown',
        true
      );
    }

    log.info('Search job created', {
      jobId: job.id,
      filters,
      userId,
    });

    // Return job ID with rate limit headers
    return NextResponse.json(
      {
        jobId: job.id,
        status: 'queued',
        message: 'Search job created successfully. Poll /api/jobs/:jobId for status.',
      },
      {
        headers: getRateLimitHeaders(rateLimitInfo),
      }
    );
  } catch (error) {
    return handleAPIError(error, { endpoint: 'search-contractors' });
  }
}
