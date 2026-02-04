import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redisConnection } from './queue';
import { RateLimitError } from './errors';

/**
 * Rate Limiter Configuration
 * Uses Redis for distributed rate limiting across multiple instances
 */

// Rate limiter for search endpoint - 10 searches per hour
const searchRateLimiter = new RateLimiterRedis({
  storeClient: redisConnection,
  keyPrefix: 'ratelimit:search',
  points: 10, // Number of requests
  duration: 3600, // Per hour (3600 seconds)
  blockDuration: 0, // Don't block, just return error
});

// Rate limiter for API endpoints - 100 requests per minute
const apiRateLimiter = new RateLimiterRedis({
  storeClient: redisConnection,
  keyPrefix: 'ratelimit:api',
  points: 100,
  duration: 60,
  blockDuration: 0,
});

/**
 * Rate limit information returned to client
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number; // Seconds until next request allowed
}

/**
 * Check rate limit for search endpoint
 * Throws RateLimitError if limit exceeded
 */
export async function checkSearchRateLimit(
  userId: string
): Promise<RateLimitInfo> {
  try {
    const rateLimiterRes = await searchRateLimiter.consume(userId, 1);

    return {
      limit: 10,
      remaining: rateLimiterRes.remainingPoints,
      reset: new Date(Date.now() + rateLimiterRes.msBeforeNext),
    };
  } catch (error: any) {
    if (error.remainingPoints !== undefined) {
      // Rate limit exceeded
      const retryAfterSeconds = Math.ceil(error.msBeforeNext / 1000);

      throw new RateLimitError(
        `Search rate limit exceeded. Try again in ${retryAfterSeconds} seconds.`,
        retryAfterSeconds
      );
    }
    throw error;
  }
}

/**
 * Check rate limit for general API endpoints
 * Throws RateLimitError if limit exceeded
 */
export async function checkAPIRateLimit(
  identifier: string
): Promise<RateLimitInfo> {
  try {
    const rateLimiterRes = await apiRateLimiter.consume(identifier, 1);

    return {
      limit: 100,
      remaining: rateLimiterRes.remainingPoints,
      reset: new Date(Date.now() + rateLimiterRes.msBeforeNext),
    };
  } catch (error: any) {
    if (error.remainingPoints !== undefined) {
      // Rate limit exceeded
      const retryAfterSeconds = Math.ceil(error.msBeforeNext / 1000);

      throw new RateLimitError(
        `API rate limit exceeded. Try again in ${retryAfterSeconds} seconds.`,
        retryAfterSeconds
      );
    }
    throw error;
  }
}

/**
 * Get current rate limit status without consuming a point
 */
export async function getSearchRateLimitStatus(
  userId: string
): Promise<RateLimitInfo> {
  const rateLimiterRes = await searchRateLimiter.get(userId);

  if (!rateLimiterRes) {
    // No rate limit data yet
    return {
      limit: 10,
      remaining: 10,
      reset: new Date(Date.now() + 3600000), // 1 hour from now
    };
  }

  return {
    limit: 10,
    remaining: rateLimiterRes.remainingPoints,
    reset: new Date(Date.now() + rateLimiterRes.msBeforeNext),
  };
}

/**
 * Reset rate limit for a user (admin function)
 */
export async function resetSearchRateLimit(userId: string): Promise<void> {
  await searchRateLimiter.delete(userId);
}

/**
 * Reset API rate limit for an identifier (admin function)
 */
export async function resetAPIRateLimit(identifier: string): Promise<void> {
  await apiRateLimiter.delete(identifier);
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(info: RateLimitInfo): Record<string, string> {
  return {
    'X-RateLimit-Limit': info.limit.toString(),
    'X-RateLimit-Remaining': info.remaining.toString(),
    'X-RateLimit-Reset': info.reset.toISOString(),
    ...(info.retryAfter && {
      'Retry-After': info.retryAfter.toString(),
    }),
  };
}

/**
 * Extract user identifier for rate limiting
 * Falls back to IP address if user is not authenticated
 */
export function getUserIdentifier(userId: string | null | undefined, ip: string): string {
  return userId || `ip:${ip}`;
}
