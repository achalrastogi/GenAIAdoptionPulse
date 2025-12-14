import React from 'react';

interface YearFilterProps {
  value?: number;
  onChange: (year?: number) => void;
  years?: number[];
  className?: string;
  label?: string;
  placeholder?: string;
}

const DEFAULT_YEARS = [2020, 2021, 2022, 2023, 2024, 2025];

export const YearFilter: React.FC<YearFilterProps> = ({
  value,
  onChange,
  years = DEFAULT_YEARS,
  className = '',
  label = 'Year',
  placeholder = 'All Years'
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedYear = event.target.value;
    onChange(selectedYear === '' ? undefined : parseInt(selectedYear));
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <select
        value={value || ''}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   transition-colors duration-200"
      >
        <option value="">{placeholder}</option>
        {years.map(year => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};