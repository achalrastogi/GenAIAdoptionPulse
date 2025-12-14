import React, { useState } from 'react';
import { useEnhancedInsights } from '../../hooks/useEnhancedInsights';
import { useFilters } from '../../contexts/FilterContext';
import { Card } from '../Layout/Card';

interface InsightCardProps {
  insight: {
    id: string;
    title: string;
    short_text: string;
    details: string;
    confidence: number;
    category: string;
    statistical_data: any;
    data_slice_url: string;
  };
  isExpanded: boolean;
  onToggle: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, isExpanded, onToggle }) => {
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return { label: 'High', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
    if (confidence >= 0.5) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
    return { label: 'Low', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
  };

  const confidenceBadge = getConfidenceBadge(insight.confidence);

  const handleExport = () => {
    // Create export URL
    const exportUrl = `http://localhost:8000/api/v1/insights/${insight.id}/export`;
    window.open(exportUrl, '_blank');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {insight.title}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${confidenceBadge.color}`}>
                {confidenceBadge.label}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {insight.short_text}
            </p>
          </div>
          <div className="ml-4">
            <span className="text-gray-400 dark:text-gray-500">
              {isExpanded ? '▼' : '▶'}
            </span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
          <div className="pt-4 space-y-4">
            {/* Detailed Description */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Detailed Analysis
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {insight.details}
              </p>
            </div>

            {/* Mini Chart Placeholder */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Data Visualization
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-24 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-8 bg-blue-400 rounded"></div>
                  <div className="w-2 h-12 bg-blue-500 rounded"></div>
                  <div className="w-2 h-6 bg-blue-300 rounded"></div>
                  <div className="w-2 h-10 bg-blue-600 rounded"></div>
                  <div className="w-2 h-4 bg-blue-400 rounded"></div>
                </div>
                <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                  Mini Chart ({insight.category})
                </span>
              </div>
            </div>

            {/* Statistical Data */}
            {insight.statistical_data && Object.keys(insight.statistical_data).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Statistical Details
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(insight.statistical_data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400 capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {typeof value === 'number' ? value.toFixed(3) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Confidence: {(insight.confidence * 100).toFixed(1)}%</span>
                <span>•</span>
                <span className="capitalize">{insight.category.replace(/_/g, ' ')}</span>
              </div>
              <button
                onClick={handleExport}
                className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-700 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

type InsightTab = 'all' | 'adoption_trends' | 'correlation_analysis' | 'growth_trends' | 'investment_analysis';

export const InsightsComposer: React.FC = () => {
  const { filters } = useFilters();
  const [activeTab, setActiveTab] = useState<InsightTab>('all');
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());

  // Convert filters to the format expected by enhanced insights
  const enhancedFilters = {
    years: filters.year ? [filters.year] : undefined,
    industries: filters.industry ? [filters.industry] : undefined,
  };

  const { data, loading, error } = useEnhancedInsights(enhancedFilters);

  const insights = data?.data || [];
  const categories = data?.metadata?.categories || [];

  const tabs = [
    { id: 'all' as InsightTab, label: 'All Insights', icon: '📊' },
    { id: 'adoption_trends' as InsightTab, label: 'Adoption', icon: '📈' },
    { id: 'correlation_analysis' as InsightTab, label: 'Correlation', icon: '🔗' },
    { id: 'growth_trends' as InsightTab, label: 'Growth', icon: '🚀' },
    { id: 'investment_analysis' as InsightTab, label: 'Investment', icon: '💰' },
  ];

  const filteredInsights = activeTab === 'all' 
    ? insights 
    : insights.filter((insight: any) => insight.category === activeTab);

  const toggleInsight = (insightId: string) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(insightId)) {
      newExpanded.delete(insightId);
    } else {
      newExpanded.add(insightId);
    }
    setExpandedInsights(newExpanded);
  };

  if (loading) {
    return (
      <Card title="Insights Composer" subtitle="Loading insights...">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-600 rounded-lg h-20"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Insights Composer" subtitle="Error loading insights">
        <div className="text-center py-8">
          <div className="text-red-500 dark:text-red-400 mb-2">⚠️</div>
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="Insights Composer" 
      subtitle={`${filteredInsights.length} insights generated`}
    >
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-md transition-colors
                ${activeTab === tab.id
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Insights List */}
        <div className="space-y-2">
          {filteredInsights.length > 0 ? (
            filteredInsights.map((insight: any) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                isExpanded={expandedInsights.has(insight.id)}
                onToggle={() => toggleInsight(insight.id)}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-gray-500 dark:text-gray-400">
                No insights available for the selected filters
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Try adjusting your year or industry filters
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        {filteredInsights.length > 0 && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                Showing {filteredInsights.length} of {insights.length} insights
              </span>
              <span>
                Categories: {categories.join(', ')}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};