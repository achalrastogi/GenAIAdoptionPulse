import { useState, useEffect, useCallback } from 'react';
import { handleAPIError, apiClient } from '../services/api';

export interface APIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
}

export interface UseAPIOptions {
  immediate?: boolean;
  cacheTime?: number; // Cache time in milliseconds
}

export function useAPI<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: UseAPIOptions = {}
): APIState<T> & {
  refetch: () => Promise<void>;
  clearError: () => void;
} {
  const { immediate = true, cacheTime = 5 * 60 * 1000 } = options; // 5 minutes default cache

  const [state, setState] = useState<APIState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetch: null,
  });

  const fetchData = useCallback(async () => {
    // Check if we have cached data that's still valid
    if (state.data && state.lastFetch && cacheTime > 0) {
      const timeSinceLastFetch = Date.now() - state.lastFetch.getTime();
      if (timeSinceLastFetch < cacheTime) {
        return; // Use cached data
      }
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiCall();
      setState({
        data: result,
        loading: false,
        error: null,
        lastFetch: new Date(),
      });
    } catch (error) {
      const errorMessage = handleAPIError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [apiCall, cacheTime, state.data, state.lastFetch]);

  const refetch = useCallback(async () => {
    // Force refetch by clearing cache
    setState(prev => ({ ...prev, lastFetch: null }));
    await fetchData();
  }, [fetchData]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, ...dependencies]);

  return {
    ...state,
    refetch,
    clearError,
  };
}

// Specialized hooks for different API endpoints
export function useGenAIAdoption(filters?: { year?: number; industry?: string }) {
  return useAPI(
    () => apiClient.getGenAIAdoption(filters),
    [filters?.year, filters?.industry]
  );
}

export function useAWSUsage(filters?: { year?: number; industry?: string }) {
  return useAPI(
    () => apiClient.getAWSUsage(filters),
    [filters?.year, filters?.industry]
  );
}

export function useGrowthPredictions(filters?: { year_range?: string }) {
  return useAPI(
    () => apiClient.getGrowthPredictions(filters),
    [filters?.year_range]
  );
}

export function useCorrelationData(filters?: { year?: number }) {
  return useAPI(
    () => apiClient.getCorrelationData(filters),
    [filters?.year]
  );
}

export function useInsights(filters?: { year?: number; industry?: string }) {
  return useAPI(
    () => apiClient.getInsights(filters),
    [filters?.year, filters?.industry]
  );
}

// Hook for managing multiple API calls
export function useMultipleAPI<T extends Record<string, any>>(
  apiCalls: { [K in keyof T]: () => Promise<T[K]> },
  dependencies: any[] = []
): {
  data: Partial<T>;
  loading: boolean;
  errors: Partial<Record<keyof T, string>>;
  refetchAll: () => Promise<void>;
  refetch: (key: keyof T) => Promise<void>;
} {
  const [data, setData] = useState<Partial<T>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const fetchData = useCallback(async (keys?: (keyof T)[]) => {
    const keysToFetch = keys || Object.keys(apiCalls) as (keyof T)[];
    setLoading(true);

    const results = await Promise.allSettled(
      keysToFetch.map(async (key) => {
        try {
          const result = await apiCalls[key]();
          return { key, result, error: null };
        } catch (error) {
          return { key, result: undefined, error: handleAPIError(error) };
        }
      })
    );

    const newData: Partial<T> = { ...data };
    const newErrors: Partial<Record<keyof T, string>> = { ...errors };

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { key, result: apiResult, error } = result.value;
        if (error) {
          newErrors[key] = error;
        } else if (apiResult !== undefined) {
          newData[key] = apiResult;
          delete newErrors[key];
        }
      }
    });

    setData(newData);
    setErrors(newErrors);
    setLoading(false);
  }, [apiCalls, data, errors]);

  const refetchAll = useCallback(() => fetchData(), [fetchData]);
  
  const refetch = useCallback((key: keyof T) => fetchData([key]), [fetchData]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    data,
    loading,
    errors,
    refetchAll,
    refetch,
  };
}