import React, { useState, useEffect } from 'react';

interface YearRangeFilterProps {
  value?: string; // Format: "2023-2025"
  onChange: (yearRange?: string) => void;
  minYear?: number;
  maxYear?: number;
  className?: string;
  label?: string;
}

export const YearRangeFilter: React.FC<YearRangeFilterProps> = ({
  value,
  onChange,
  minYear = 2020,
  maxYear = 2030,
  className = '',
  label = 'Year Range'
}) => {
  const [startYear, setStartYear] = useState<number | undefined>();
  const [endYear, setEndYear] = useState<number | undefined>();
  const [error, setError] = useState<string>('');

  // Parse initial value
  useEffect(() => {
    if (value) {
      const [start, end] = value.split('-').map(Number);
      setStartYear(start);
      setEndYear(end);
    } else {
      setStartYear(undefined);
      setEndYear(undefined);
    }
  }, [value]);

  // Validate and update range
  useEffect(() => {
    setError('');
    
    if (startYear && endYear) {
      if (startYear > endYear) {
        setError('Start year must be less than or equal to end year');
        return;
      }
      if (startYear < minYear || endYear > maxYear) {
        setError(`Year range must be between ${minYear} and ${maxYear}`);
        return;
      }
      onChange(`${startYear}-${endYear}`);
    } else if (!startYear && !endYear) {
      onChange(undefined);
    }
  }, [startYear, endYear, minYear, maxYear, onChange]);

  const years = Array.from(
    { length: maxYear - minYear + 1 }, 
    (_, i) => minYear + i
  );

  const handleStartYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = event.target.value;
    setStartYear(year === '' ? undefined : parseInt(year));
  };

  const handleEndYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = event.target.value;
    setEndYear(year === '' ? undefined : parseInt(year));
  };

  const clearRange = () => {
    setStartYear(undefined);
    setEndYear(undefined);
    onChange(undefined);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {(startYear || endYear) && (
          <button
            onClick={clearRange}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          >
            Clear
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            From
          </label>
          <select
            value={startYear || ''}
            onChange={handleStartYearChange}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       transition-colors duration-200"
          >
            <option value="">Start Year</option>
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            To
          </label>
          <select
            value={endYear || ''}
            onChange={handleEndYearChange}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       transition-colors duration-200"
          >
            <option value="">End Year</option>
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {startYear && endYear && !error && (
        <p className="mt-1 text-xs text-green-600 dark:text-green-400">
          Range: {startYear} - {endYear} ({endYear - startYear + 1} years)
        </p>
      )}
    </div>
  );
};