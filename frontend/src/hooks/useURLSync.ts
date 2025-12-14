import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFilters, FilterState } from '../contexts/FilterContext';

/**
 * Hook to synchronize filter state with URL parameters
 * This enables shareable filtered views and browser back/forward navigation
 */
export const useURLSync = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, setFilters } = useFilters();

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.year) {
      params.set('year', filters.year.toString());
    }
    
    if (filters.industry) {
      params.set('industry', filters.industry);
    }
    
    if (filters.yearRange) {
      params.set('yearRange', filters.yearRange);
    }

    // Only update URL if params have changed
    const currentParams = searchParams.toString();
    const newParams = params.toString();
    
    if (currentParams !== newParams) {
      setSearchParams(params, { replace: true });
    }
  }, [filters, setSearchParams, searchParams]);

  // Update filters when URL changes (e.g., browser back/forward, direct URL access)
  useEffect(() => {
    const urlFilters: FilterState = {};
    
    const yearParam = searchParams.get('year');
    if (yearParam) {
      const year = parseInt(yearParam);
      if (!isNaN(year)) {
        urlFilters.year = year;
      }
    }
    
    const industryParam = searchParams.get('industry');
    if (industryParam) {
      urlFilters.industry = industryParam;
    }
    
    const yearRangeParam = searchParams.get('yearRange');
    if (yearRangeParam) {
      urlFilters.yearRange = yearRangeParam;
    }

    // Only update filters if they're different from current state
    const hasChanges = 
      urlFilters.year !== filters.year ||
      urlFilters.industry !== filters.industry ||
      urlFilters.yearRange !== filters.yearRange;

    if (hasChanges) {
      setFilters(urlFilters);
    }
  }, [searchParams, filters, setFilters]);

  // Utility function to generate shareable URL
  const getShareableURL = (customFilters?: Partial<FilterState>) => {
    const filtersToUse = customFilters || filters;
    const params = new URLSearchParams();
    
    if (filtersToUse.year) {
      params.set('year', filtersToUse.year.toString());
    }
    
    if (filtersToUse.industry) {
      params.set('industry', filtersToUse.industry);
    }
    
    if (filtersToUse.yearRange) {
      params.set('yearRange', filtersToUse.yearRange);
    }

    const baseURL = window.location.origin + window.location.pathname;
    return params.toString() ? `${baseURL}?${params.toString()}` : baseURL;
  };

  return {
    getShareableURL,
  };
};