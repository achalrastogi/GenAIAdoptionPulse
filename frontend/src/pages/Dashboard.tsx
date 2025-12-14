import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterControls } from '../components/Filters/FilterControls';
import { GenAIAdoptionChart } from '../components/Charts/GenAIAdoptionChart';
import { AWSUsageHeatmap } from '../components/Charts/AWSUsageHeatmap';
import { CorrelationPanel } from '../components/Charts/CorrelationPanel';
import { InsightsPanel } from '../components/Charts/InsightsPanel';
import { KPIStrip } from '../components/KPI/KPIStrip';
import { InsightsComposer } from '../components/Insights/InsightsComposer';
import { IndustryProfileDrawer } from '../components/Insights/IndustryProfileDrawer';
import { ScenarioSimulator } from '../components/Insights/ScenarioSimulator';
import { useFilters } from '../contexts/FilterContext';

export const Dashboard: React.FC = () => {
  const { clearFilters } = useFilters();
  const [, setSearchParams] = useSearchParams();
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Clear any existing filters and URL parameters on component mount
  useEffect(() => {
    clearFilters();
    setSearchParams({}, { replace: true });
  }, [clearFilters, setSearchParams]);

  const handleIndustryClick = (industry: string) => {
    setSelectedIndustry(industry);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedIndustry(null);
  };

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

      {/* KPI Strip */}
      <KPIStrip />

      {/* Filter Controls */}
      <FilterControls />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* GenAI Adoption Chart */}
          <GenAIAdoptionChart />

          {/* AWS Usage Heatmap */}
          <AWSUsageHeatmap />

          {/* Correlation Panel */}
          <CorrelationPanel />
        </div>

        {/* Right Column - Insights */}
        <div className="space-y-6">
          {/* Insights Composer */}
          <InsightsComposer />

          {/* Original Insights Panel */}
          <InsightsPanel />
        </div>
      </div>

      {/* Scenario Simulator */}
      <div className="mt-6">
        <ScenarioSimulator />
      </div>

      {/* Industry Profile Drawer */}
      <IndustryProfileDrawer
        industry={selectedIndustry}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
      />
    </div>
  );
};