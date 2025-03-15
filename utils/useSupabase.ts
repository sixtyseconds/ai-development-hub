import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchFromTable, clearCache } from './supabaseClient';

/**
 * Custom hook for fetching data from Supabase with optimized performance
 */
export function useSupabaseQuery<T>(
  tableName: string,
  options: {
    select?: string;
    filters?: Record<string, any>;
    limit?: number;
    page?: number;
    orderBy?: { column: string; ascending?: boolean };
    cacheTTL?: number;
    enabled?: boolean;
    dependencies?: any[];
    forceRefresh?: boolean;
  } = {}
) {
  const {
    select,
    filters,
    limit,
    page,
    orderBy,
    cacheTTL,
    enabled = true,
    dependencies = [],
    forceRefresh = false,
  } = options;

  const [data, setData] = useState<T[] | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const isMounted = useRef(true);
  const previousTableName = useRef(tableName);
  const previousFilters = useRef(JSON.stringify(filters));

  // Function to fetch data
  const fetchData = useCallback(
    async (forceFresh = false) => {
      if (!enabled) return;

      const isInitialFetch = !data;
      const hasTableChanged = previousTableName.current !== tableName;
      const haveFiltersChanged = previousFilters.current !== JSON.stringify(filters);
      
      // Update refs
      previousTableName.current = tableName;
      previousFilters.current = JSON.stringify(filters);
      
      // Set loading states
      if (isInitialFetch || hasTableChanged || haveFiltersChanged) {
        setIsLoading(true);
        setIsRefetching(false);
      } else {
        setIsLoading(false);
        setIsRefetching(true);
      }

      try {
        const result = await fetchFromTable<T>(tableName, {
          select,
          filters,
          limit,
          page,
          orderBy,
          cacheTTL,
          forceRefresh: forceFresh || forceRefresh || hasTableChanged || haveFiltersChanged,
        });

        // Only update state if component is still mounted
        if (isMounted.current) {
          setData(result.data);
          setCount(result.count);
          setError(result.error);
        }
      } catch (err) {
        if (isMounted.current) {
          console.error(`Error in useSupabaseQuery for ${tableName}:`, err);
          setError(err);
          setData(null);
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
          setIsRefetching(false);
        }
      }
    },
    [tableName, select, JSON.stringify(filters), limit, page, JSON.stringify(orderBy), cacheTTL, enabled, forceRefresh, ...dependencies]
  );

  // Refetch function exposed to the component
  const refetch = useCallback(() => fetchData(true), [fetchData]);

  // Initial fetch
  useEffect(() => {
    isMounted.current = true;
    
    if (enabled) {
      fetchData();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [fetchData, enabled]);

  // Handle visibility change to refresh data when tab becomes visible
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled && isMounted.current) {
        fetchData(true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData, enabled]);

  return {
    data,
    count,
    error,
    isLoading,
    isRefetching,
    refetch,
  };
}

/**
 * Custom hook for managing a single record
 */
export function useSupabaseRecord<T>(
  tableName: string,
  id: string | null,
  options: {
    select?: string;
    cacheTTL?: number;
    enabled?: boolean;
    forceRefresh?: boolean;
  } = {}
) {
  const filters = id ? { id } : {};
  const enabled = !!id && (options.enabled ?? true);

  const result = useSupabaseQuery<T>(tableName, {
    ...options,
    filters,
    limit: 1,
    enabled,
  });

  return {
    ...result,
    data: result.data && result.data.length > 0 ? result.data[0] : null,
  };
}

/**
 * Clear all cache or specific cache entries
 */
export function useClearCache() {
  return useCallback((cacheKey?: string) => {
    clearCache(cacheKey);
  }, []);
} 