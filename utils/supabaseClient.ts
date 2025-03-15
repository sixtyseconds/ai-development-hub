import { createClient } from '@supabase/supabase-js';
import { Database } from './supabase-types';

// Initialize Supabase client with optimized settings
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client with optimized settings
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    // Increase timeout for better reliability
    fetch: (url, options) => {
      return fetch(url, { ...options, cache: 'no-store' });
    },
  },
  // Enable realtime subscriptions but with optimized settings
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Simple in-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 30000; // 30 seconds cache TTL (reduced from 60s)

// Track navigation events to clear cache when needed
if (typeof window !== 'undefined') {
  // Clear cache on navigation
  window.addEventListener('popstate', () => {
    console.log('Navigation detected, clearing cache');
    clearCache();
  });
  
  // Clear cache when tab becomes visible again
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.log('Tab became visible, clearing cache');
      clearCache();
    }
  });
}

/**
 * Optimized fetch function with caching
 */
export async function fetchWithCache<T>(
  tableName: string,
  query: any,
  options: {
    cacheTTL?: number;
    forceRefresh?: boolean;
    cacheKey?: string;
  } = {}
): Promise<{ data: T | null; error: any }> {
  const {
    cacheTTL = CACHE_TTL,
    forceRefresh = false,
    cacheKey = `${tableName}-${JSON.stringify(query)}`,
  } = options;

  // Check if we should bypass cache
  const shouldBypassCache = forceRefresh || 
    !cache[cacheKey] || 
    (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp > cacheTTL);

  // Check cache first if not forcing refresh
  if (!shouldBypassCache) {
    console.log(`Cache hit for ${cacheKey}`);
    return { data: cache[cacheKey].data, error: null };
  }

  try {
    // Execute query with performance optimizations
    const result = await query;

    // Cache successful results
    if (!result.error && result.data) {
      cache[cacheKey] = {
        data: result.data,
        timestamp: Date.now(),
      };
    }

    return result;
  } catch (error) {
    console.error(`Error fetching data from ${tableName}:`, error);
    return { data: null, error };
  }
}

/**
 * Fetch data from a table with optimized performance
 */
export async function fetchFromTable<T>(
  tableName: string,
  options: {
    select?: string;
    filters?: Record<string, any>;
    limit?: number;
    page?: number;
    orderBy?: { column: string; ascending?: boolean };
    cacheTTL?: number;
    forceRefresh?: boolean;
    cacheKey?: string;
  } = {}
): Promise<{ data: T[] | null; error: any; count: number | null }> {
  const {
    select = '*',
    filters = {},
    limit = 10,
    page = 0,
    orderBy,
    cacheTTL,
    forceRefresh,
    cacheKey,
  } = options;

  try {
    // Build query
    let query = supabase.from(tableName).select(select, { count: 'exact' });

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    // Apply pagination
    if (limit > 0) {
      query = query.range(page * limit, (page + 1) * limit - 1);
    }

    // Apply ordering
    if (orderBy) {
      query = query.order(orderBy.column, {
        ascending: orderBy.ascending ?? true,
      });
    }

    // Generate a unique cache key
    const customCacheKey = cacheKey || `${tableName}-${select}-${JSON.stringify(filters)}-${limit}-${page}-${JSON.stringify(orderBy)}`;
    
    // Execute with caching
    const result = await fetchWithCache(tableName, () => query, {
      cacheTTL,
      forceRefresh,
      cacheKey: customCacheKey,
    });

    return {
      data: result.data as T[] | null,
      error: result.error,
      count: result.data && Array.isArray(result.data) ? (result as any).count : null,
    };
  } catch (error) {
    console.error(`Error in fetchFromTable for ${tableName}:`, error);
    return { data: null, error, count: null };
  }
}

/**
 * Clear cache for specific key or entire cache
 */
export function clearCache(cacheKey?: string): void {
  if (cacheKey) {
    delete cache[cacheKey];
    console.log(`Cleared cache for key: ${cacheKey}`);
  } else {
    Object.keys(cache).forEach((key) => delete cache[key]);
    console.log('Cleared entire cache');
  }
}

/**
 * Batch multiple queries into a single request
 */
export async function batchQueries<T>(
  queries: Array<{
    tableName: string;
    select?: string;
    filters?: Record<string, any>;
    cacheKey?: string;
  }>
): Promise<Array<{ data: T | null; error: any }>> {
  return Promise.all(
    queries.map((query) =>
      fetchFromTable<T>(query.tableName, {
        select: query.select,
        filters: query.filters,
        cacheKey: query.cacheKey,
        forceRefresh: true, // Always get fresh data for batch queries
      }).then(result => ({
        data: result.data ? (result.data.length > 0 ? result.data[0] as unknown as T : null) : null,
        error: result.error
      }))
    )
  );
} 