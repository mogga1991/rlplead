/**
 * Cache Middleware for API Routes
 * Provides automatic caching for GET requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCache, generateCacheKey, CacheTTL } from './cache';
import { log } from './logger';

/**
 * Cache middleware options
 */
export interface CacheOptions {
  prefix: string;
  ttl?: number;
  keyGenerator?: (request: NextRequest) => string;
  shouldCache?: (request: NextRequest, response: any) => boolean;
}

/**
 * Default key generator based on URL and query parameters
 */
function defaultKeyGenerator(request: NextRequest, prefix: string): string {
  const url = new URL(request.url);
  const params = {
    pathname: url.pathname,
    search: url.searchParams.toString(),
  };

  return generateCacheKey(prefix, params);
}

/**
 * Default cache condition - only cache successful responses
 */
function defaultShouldCache(request: NextRequest, response: any): boolean {
  // Only cache GET requests
  if (request.method !== 'GET') {
    return false;
  }

  // Don't cache if response has error
  if (response?.error) {
    return false;
  }

  return true;
}

/**
 * Wrap an API handler with caching
 */
export function withCache<T>(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse<T>>,
  options: CacheOptions
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse<T>> => {
    const {
      prefix,
      ttl = CacheTTL.MEDIUM,
      keyGenerator,
      shouldCache = defaultShouldCache,
    } = options;

    // Only cache GET requests
    if (request.method !== 'GET') {
      return handler(request, ...args);
    }

    // Generate cache key
    const cacheKey = keyGenerator
      ? keyGenerator(request)
      : defaultKeyGenerator(request, prefix);

    // Try to get from cache
    const cached = await getCached<T>(cacheKey);

    if (cached !== null) {
      log.debug('Cache hit for API route', { cacheKey, url: request.url });

      return NextResponse.json(
        { ...cached, fromCache: true } as any,
        {
          headers: {
            'X-Cache': 'HIT',
            'X-Cache-Key': cacheKey,
          },
        }
      );
    }

    // Cache miss - execute handler
    log.debug('Cache miss for API route', { cacheKey, url: request.url });

    const response = await handler(request, ...args);

    // Parse response data
    const responseData = await response.json();

    // Check if we should cache this response
    if (shouldCache(request, responseData)) {
      // Store in cache (don't await to avoid blocking)
      setCache(cacheKey, responseData, ttl).catch((error) => {
        log.warn('Background cache set failed for API route', {
          cacheKey,
          url: request.url,
          error,
        });
      });
    }

    return NextResponse.json(responseData, {
      status: response.status,
      headers: {
        'X-Cache': 'MISS',
        'X-Cache-Key': cacheKey,
      },
    });
  };
}

/**
 * Cache decorator for API route handlers
 * Use this for simple GET endpoints
 */
export function cached(options: CacheOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = withCache(originalMethod, options);

    return descriptor;
  };
}

/**
 * Conditional cache wrapper
 * Only caches when condition is met
 */
export async function cacheWhen<T>(
  key: string,
  condition: boolean,
  fetchFn: () => Promise<T>,
  ttl: number = CacheTTL.MEDIUM
): Promise<T> {
  if (!condition) {
    return fetchFn();
  }

  // Try cache
  const cached = await getCached<T>(key);

  if (cached !== null) {
    return cached;
  }

  // Fetch and cache
  const data = await fetchFn();
  await setCache(key, data, ttl);

  return data;
}
