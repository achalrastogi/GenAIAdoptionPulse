import React, { useState, useEffect } from 'react';
import { useFilters } from '../../contexts/FilterContext';
import { useURLSync } from '../../hooks/useURLSync';
import { Card } from '../Layout/Card';
import { GridContainer } from '../Layout/GridContainer';

interface FilterControlsProps {
  className?: string;
}

// Available filter options
const YEARS = [2020, 2021, 2022, 2023];
const INDUSTRIES = [
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Technology',
  'Retail',
  'Education',
  'Government',
  'Energy',
  'Transportation',
  'Media'
];

export const FilterControls: React.FC<FilterControlsProps> = ({ className }) => {
  const { filters, setFilter, clearFilters } = useFilters();
  const { getShareableURL } = useURLSync();
  const [localFilters, setLocalFilters] = useState(filters);
  const [hasChanges, setHasChanges] = useState(false);
  const [showShareMessage, setShowShareMessage] = useState(false);

  // Update local state when global filters change
  useEffect(() => {
    setLocalFilters(filters);
    setHasChanges(false);
  }, [filters]);

  // Check if there are unsaved changes
  useEffect(() => {
    const changed = 
      localFilters.year !== filters.year ||
      localFilters.industry !== filters.industry;
    setHasChanges(changed);
  }, [localFilters, filters]);

  const handleYearChange = (year: string) => {
    const yearValue = year === '' ? undefined : parseInt(year);
    setLocalFilters(prev => ({ ...prev, year: yearValue }));
  };

  const handleIndustryChange = (industry: string) => {
    const industryValue = industry === '' ? undefined : industry;
    setLocalFilters(prev => ({ ...prev, industry: industryValue }));
  };

  const applyFilters = () => {
    if (localFilters.year !== undefined) {
      setFilter('year', localFilters.year);
    } else {
      setFilter('year', undefined);
    }
    
    if (localFilters.industry !== undefined) {
      setFilter('industry', localFilters.industry);
    } else {
      setFilter('industry', undefined);
    }
    
    setHasChanges(false);
  };

  const resetFilters = () => {
    setLocalFilters({});
    clearFilters();
    setHasChanges(false);
  };

  const hasActiveFilters = filters.year !== undefined || filters.industry !== undefined;

  const shareCurrentView = async () => {
    const shareableURL = getShareableURL();
    
    try {
      await navigator.clipboard.writeText(shareableURL);
      setShowShareMessage(true);
      setTimeout(() => setShowShareMessage(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      console.log('Share URL:', shareableURL);
      alert(`Share URL: ${shareableURL}`);
    }
  };

  return (
    <Card 
      title="Filters & Controls"
      subtitle={hasActiveFilters ? 'Active filters applied' : 'No filters applied'}
      className={className}
    >
      <div className="space-y-4">
        {/* Filter Controls */}
        <GridContainer 
          cols={{ default: 1, sm: 2, lg: 5 }} 
          gap="md"
          className="items-end"
        >
          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Year
            </label>
            <select 
              value={localFilters.year || ''}
              onChange={(e) => handleYearChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition-colors duration-200"
            >
              <option value="">All Years</option>
              {YEARS.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Industry Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Industry
            </label>
            <select 
              value={localFilters.industry || ''}
              onChange={(e) => handleIndustryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition-colors duration-200"
            >
              <option value="">All Industries</option>
              {INDUSTRIES.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          {/* Apply Button */}
          <div>
            <button
              onClick={applyFilters}
              disabled={!hasChanges}
              className={`
                w-full px-4 py-2 rounded-md font-medium transition-colors duration-200
                focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${hasChanges
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Apply Filters
            </button>
          </div>

          {/* Reset Button */}
          <div>
            <button
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className={`
                w-full px-4 py-2 rounded-md font-medium transition-colors duration-200
                focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                ${hasActiveFilters
                  ? 'bg-gray-600 hover:bg-gray-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Clear All
            </button>
          </div>

          {/* Share Button */}
          <div className="relative">
            <button
              onClick={shareCurrentView}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors duration-200 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              title="Copy shareable URL to clipboard"
            >
              Share View
            </button>
            {showShareMessage && (
              <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-md text-center">
                URL copied to clipboard!
              </div>
            )}
          </div>
        </GridContainer>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active filters:
            </span>
            {filters.year && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                Year: {filters.year}
                <button
                  onClick={() => setFilter('year', undefined)}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none"
                >
                  ×
                </button>
              </span>
            )}
            {filters.industry && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                Industry: {filters.industry}
                <button
                  onClick={() => setFilter('industry', undefined)}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-600 focus:outline-none"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}

        {/* Filter Status */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            {hasActiveFilters 
              ? `${Object.keys(filters).filter(key => filters[key as keyof typeof filters] !== undefined).length} filter(s) active`
              : 'No filters applied - showing all data'
            }
          </span>
          {hasChanges && (
            <span className="text-orange-600 dark:text-orange-400 font-medium">
              Unsaved changes
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};