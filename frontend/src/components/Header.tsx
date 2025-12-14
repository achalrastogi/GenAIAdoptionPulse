import React from 'react';
import { ThemeToggle } from './ThemeToggle';

export const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              GenAI Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Industry AI Adoption & AWS Service Correlation Analysis
            </p>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="hidden sm:inline">Theme:</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};