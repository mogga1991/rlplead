import { NextRequest, NextResponse } from 'next/server';
import { invalidateCache, clearAllCache } from '@/lib/cache';
import { handleAPIError } from '@/lib/error-handler';
import { ValidationError } from '@/lib/errors';
import { log } from '@/lib/logger';
import { cacheInvalidationSchema, getValidationErrorMessage, getValidationErrorField } from '@/lib/validation';

/**
 * POST /api/cache/invalidate
 * Invalidate cache for a specific resource type or all cache
 */
export async function POST(request: NextRequest) {
  try {
    log.request('POST', '/api/cache/invalidate');

    // Parse request body
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch (error) {
      throw new ValidationError('Invalid request body. Expected JSON.');
    }

    // Validate with Zod schema
    const validationResult = cacheInvalidationSchema.safeParse(rawBody);

    if (!validationResult.success) {
      const errorMessage = getValidationErrorMessage(validationResult.error);
      const errorField = getValidationErrorField(validationResult.error);
      throw new ValidationError(errorMessage, errorField);
    }

    const { prefix, all } = validationResult.data;

    if (all === true) {
      // Clear all cache
      await clearAllCache();
      log.info('All cache cleared');

      return NextResponse.json({
        success: true,
        message: 'All cache cleared successfully',
      });
    }

    // Invalidate specific cache prefix
    const count = await invalidateCache(prefix!);

    log.info('Cache invalidated', { prefix, count });

    return NextResponse.json({
      success: true,
      prefix,
      keysDeleted: count,
      message: `Invalidated ${count} cache entries for prefix: ${prefix}`,
    });
  } catch (error) {
    return handleAPIError(error, { endpoint: 'cache/invalidate' });
  }
}
