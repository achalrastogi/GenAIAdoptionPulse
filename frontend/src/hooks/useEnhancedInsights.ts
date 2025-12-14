import { useAPI } from './useAPI';
import { apiClient } from '../services/api';

export function useEnhancedInsights(filters?: { years?: number[]; industries?: string[] }) {
  return useAPI(
    () => apiClient.getEnhancedInsights(filters),
    [filters?.years?.join(','), filters?.industries?.join(',')]
  );
}