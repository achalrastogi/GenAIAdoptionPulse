import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterControls } from '../components/Filters/FilterControls';
import { GenAIAdoptionChart } from '../components/Charts/GenAIAdoptionChart';
import { AWSUsageHeatmap } from '../components/Charts/AWSUsageHeatmap';
import { CorrelationPanel } from '../components/Charts/CorrelationPanel';
import { InsightsPanel } from '../components/Charts/InsightsPanel';
import { useFilters } from '../contexts/FilterContext';

export const Dashboard: React.FC = () => {
  const { clearFilters } = useFilters();
  const [, setSearchParams] = useSearchParams();

  // Clear any existing filters and URL parameters on component mount
  useEffect(() => {
    clearFilters();
    setSearchParams({}, { replace: true });
  }, [clearFilters, setSearchParams]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          GenAI Adoption Pulse
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time insights into generative AI adoption trends, AWS service usage patterns, and industry analytics.
        </p>
      </div>

      {/* Filter Controls */}
      <FilterControls />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GenAI Adoption Chart */}
        <div className="lg:col-span-2">
          <GenAIAdoptionChart />
        </div>

        {/* AWS Usage Heatmap */}
        <div className="lg:col-span-2">
          <AWSUsageHeatmap />
        </div>

        {/* Correlation Panel */}
        <div>
          <CorrelationPanel />
        </div>

        {/* Insights Panel */}
        <div>
          <InsightsPanel />
        </div>
      </div>
    </div>
  );
};