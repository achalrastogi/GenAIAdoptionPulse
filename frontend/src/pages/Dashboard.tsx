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
    <div className="space-y-8 max-w-7xl mx-auto bg-background min-h-screen">
      {/* Header Section */}
      <div className="card-base p-8">
        <h1 className="text-3xl font-semibold text-primary mb-3 tracking-tight">
          GenAI Adoption Pulse
        </h1>
        <p className="text-lg text-secondary leading-relaxed">
          Enterprise analytics for generative AI adoption trends, cloud infrastructure patterns, and strategic insights.
        </p>
      </div>

      {/* KPI Strip */}
      <KPIStrip />

      {/* Filter Controls */}
      <FilterControls />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left Column - Charts */}
        <div className="xl:col-span-3 space-y-8">
          {/* GenAI Adoption Chart */}
          <GenAIAdoptionChart />

          {/* AWS Usage Heatmap */}
          <AWSUsageHeatmap />

          {/* Correlation Panel */}
          <CorrelationPanel />
        </div>

        {/* Right Column - Insights */}
        <div className="space-y-8">
          {/* Insights Composer */}
          <InsightsComposer />

          {/* Original Insights Panel */}
          <InsightsPanel />
        </div>
      </div>

      {/* Scenario Simulator */}
      <div className="mt-8">
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