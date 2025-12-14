import { useAPI } from './useAPI';
import { apiClient } from '../services/api';

export interface KPIData {
  total_industries: number;
  avg_adoption: number;
  total_investment: number;
  top_industry: {
    industry: string;
    adoption_rate: number;
  };
  fastest_growing_industry: {
    industry: string;
    growth_rate: number;
  };
  computed_at: string;
  filters_applied: {
    year?: number;
    industry?: string;
  };
}

export function useKPIs(filters?: { year?: number; industry?: string }) {
  return useAPI(
    () => apiClient.getKPIs(filters),
    [filters?.year, filters?.industry]
  );
}