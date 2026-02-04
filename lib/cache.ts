/**
 * Cache Utilities using Redis
 * Provides caching for API responses and enrichment data
 */

import { redisConnection } from './queue';
import { log } from './logger';
import crypto from 'crypto';

/**
 * Cache TTL (Time To Live) constants in seconds
 */
export const CacheTTL = {
  SEARCH_RESULTS: 3600, // 1 hour - search results
  ENRICHMENT_DATA: 86400, // 24 hours - company enrichment data
  COMPANY_DATA: 43200, // 12 hours - company aggregation
  SHORT: 300, // 5 minutes - temporary data
  MEDIUM: 1800, // 30 minutes - moderate persistence
  LONG: 604800, // 1 week - long-term data
} as const;

/**
 * Cache key prefixes for organization
 */
export const CachePrefix = {
  SEARCH: 'search',
  ENRICHMENT: 'enrichment',
  COMPANY: 'company',
  USASPENDING: 'usaspending',
  STATS: 'cache:stats',
} as const;

/**
 * Cache statistics interface
 */
export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  hitRate: number;
}

/**
 * Generate a deterministic cache key from prefix and parameters
 */
export function generateCacheKey(prefix: string, params: any): string {
  // Sort object keys for consistent hashing
  const sortedParams = JSON.stringify(params, Object.keys(params).sort());

  // Create hash of parameters
  const hash = crypto.createHash('md5').update(sortedParams).digest('hex');

  return `${prefix}:${hash}`;
}

/**
 * Get value from cache
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await redisConnection.get(key);

    if (!cached) {
      await incrementCacheStats('misses');
      log.debug('Cache miss', { key });
      return null;
    }

    await incrementCacheStats('hits');
    log.debug('Cache hit', { key });

    return JSON.parse(cached) as T;
  } catch (error) {
    await incrementCacheStats('errors');
    log.error('Cache get error', error, { key });
    return null; // Fail gracefully
  }
}

/**
 * Set value in cache with TTL
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number = CacheTTL.MEDIUM
): Promise<boolean> {
  try {
    const serialized = JSON.stringify(value);
    await redisConnection.setex(key, ttlSeconds, serialized);

    await incrementCacheStats('sets');
    log.debug('Cache set', { key, ttl: ttlSeconds });

    return true;
  } catch (error) {
    await incrementCacheStats('errors');
    log.error('Cache set error', error, { key });
    return false;
  }
}

/**
 * Delete value from cache
 */
export async function deleteCache(key: string): Promise<boolean> {
  try {
    await redisConnection.del(key);

    await incrementCacheStats('deletes');
    log.debug('Cache delete', { key });

    return true;
  } catch (error) {
    await incrementCacheStats('errors');
    log.error('Cache delete error', error, { key });
    return false;
  }
}

/**
 * Delete multiple keys matching a pattern
 */
export async function deleteCachePattern(pattern: string): Promise<number> {
  try {
    const keys = await redisConnection.keys(pattern);

    if (keys.length === 0) {
      return 0;
    }

    await redisConnection.del(...keys);
    await incrementCacheStats('deletes', keys.length);

    log.info('Cache pattern delete', { pattern, count: keys.length });

    return keys.length;
  } catch (error) {
    await incrementCacheStats('errors');
    log.error('Cache pattern delete error', error, { pattern });
    return 0;
  }
}

/**
 * Check if key exists in cache
 */
export async function hasCache(key: string): Promise<boolean> {
  try {
    const exists = await redisConnection.exists(key);
    return exists === 1;
  } catch (error) {
    log.error('Cache exists check error', error, { key });
    return false;
  }
}

/**
 * Get remaining TTL for a key
 */
export async function getCacheTTL(key: string): Promise<number> {
  try {
    return await redisConnection.ttl(key);
  } catch (error) {
    log.error('Cache TTL check error', error, { key });
    return -1;
  }
}

/**
 * Increment cache statistics
 */
async function incrementCacheStats(stat: keyof Omit<CacheStats, 'hitRate'>, amount: number = 1): Promise<void> {
  try {
    await redisConnection.hincrby(CachePrefix.STATS, stat, amount);
  } catch (error) {
    // Don't log errors for stats to avoid recursion
    console.error('Cache stats error:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<CacheStats> {
  try {
    const stats = await redisConnection.hgetall(CachePrefix.STATS);

    const hits = parseInt(stats.hits || '0');
    const misses = parseInt(stats.misses || '0');
    const total = hits + misses;

    return {
      hits,
      misses,
      sets: parseInt(stats.sets || '0'),
      deletes: parseInt(stats.deletes || '0'),
      errors: parseInt(stats.errors || '0'),
      hitRate: total > 0 ? (hits / total) * 100 : 0,
    };
  } catch (error) {
    log.error('Cache stats retrieval error', error);
    return {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      hitRate: 0,
    };
  }
}

/**
 * Reset cache statistics
 */
export async function resetCacheStats(): Promise<void> {
  try {
    await redisConnection.del(CachePrefix.STATS);
    log.info('Cache stats reset');
  } catch (error) {
    log.error('Cache stats reset error', error);
  }
}

/**
 * Get or set cache with generator function
 * This is a convenience function for cache-aside pattern
 */
export async function cacheOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = CacheTTL.MEDIUM
): Promise<T> {
  // Try to get from cache
  const cached = await getCached<T>(key);

  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Store in cache (don't await to avoid blocking)
  setCache(key, data, ttlSeconds).catch((error) => {
    log.warn('Background cache set failed', { key, error });
  });

  return data;
}

/**
 * Invalidate cache for a specific resource type
 */
export async function invalidateCache(prefix: string): Promise<number> {
  return await deleteCachePattern(`${prefix}:*`);
}

/**
 * Clear all application cache (use with caution)
 */
export async function clearAllCache(): Promise<void> {
  try {
    const prefixes = Object.values(CachePrefix);

    for (const prefix of prefixes) {
      await deleteCachePattern(`${prefix}:*`);
    }

    log.warn('All cache cleared');
  } catch (error) {
    log.error('Clear all cache error', error);
  }
}
