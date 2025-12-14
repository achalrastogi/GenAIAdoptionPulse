import React, { createContext, useContext, useState, useCallback } from 'react';

export interface FilterState {
  year?: number;
  industry?: string;
  yearRange?: string;
}

interface FilterContextType {
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  clearFilter: (key: keyof FilterState) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFiltersState] = useState<FilterState>({});

  const setFilter = useCallback(<K extends keyof FilterState>(
    key: K, 
    value: FilterState[K]
  ) => {
    setFiltersState(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  const clearFilter = useCallback((key: keyof FilterState) => {
    setFiltersState(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  return (
    <FilterContext.Provider value={{
      filters,
      setFilter,
      setFilters,
      clearFilters,
      clearFilter,
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};