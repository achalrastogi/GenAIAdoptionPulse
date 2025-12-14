import React, { useState } from 'react';

interface IndustryFilterProps {
  value?: string;
  onChange: (industry?: string) => void;
  industries?: string[];
  className?: string;
  label?: string;
  placeholder?: string;
  multiSelect?: boolean;
}

const DEFAULT_INDUSTRIES = [
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

export const IndustryFilter: React.FC<IndustryFilterProps> = ({
  value,
  onChange,
  industries = DEFAULT_INDUSTRIES,
  className = '',
  label = 'Industry',
  placeholder = 'All Industries',
  multiSelect = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(
    value ? [value] : []
  );

  const handleSingleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndustry = event.target.value;
    onChange(selectedIndustry === '' ? undefined : selectedIndustry);
  };

  const handleMultiSelect = (industry: string) => {
    const newSelection = selectedIndustries.includes(industry)
      ? selectedIndustries.filter(i => i !== industry)
      : [...selectedIndustries, industry];
    
    setSelectedIndustries(newSelection);
    onChange(newSelection.length > 0 ? newSelection.join(',') : undefined);
  };

  const clearSelection = () => {
    setSelectedIndustries([]);
    onChange(undefined);
  };

  if (!multiSelect) {
    return (
      <div className={className}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
        <select
          value={value || ''}
          onChange={handleSingleSelect}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     transition-colors duration-200"
        >
          <option value="">{placeholder}</option>
          {industries.map(industry => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     transition-colors duration-200 text-left flex items-center justify-between"
        >
          <span className="truncate">
            {selectedIndustries.length === 0 
              ? placeholder 
              : selectedIndustries.length === 1 
                ? selectedIndustries[0]
                : `${selectedIndustries.length} industries selected`
            }
          </span>
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="p-2 border-b border-gray-200 dark:border-gray-600">
              <button
                onClick={clearSelection}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                Clear all
              </button>
            </div>
            {industries.map(industry => (
              <label
                key={industry}
                className="flex items-center px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedIndustries.includes(industry)}
                  onChange={() => handleMultiSelect(industry)}
                  className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {industry}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Selected industries display */}
      {selectedIndustries.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedIndustries.map(industry => (
            <span
              key={industry}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
            >
              {industry}
              <button
                onClick={() => handleMultiSelect(industry)}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};