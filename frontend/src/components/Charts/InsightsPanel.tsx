import React, { useState } from 'react';
import { useInsights } from '../../hooks/useAPI';
import { useFilters } from '../../contexts/FilterContext';
import { Card } from '../Layout/Card';

interface InsightsPanelProps {
  className?: string;
  height?: number;
}

type InsightTab = 'findings' | 'industries' | 'trends' | 'recommendations' | 'stats';

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  className,
  height = 400,
}) => {
  const { filters } = useFilters();
  const [activeTab, setActiveTab] = useState<InsightTab>('findings');
  
  const { data, loading, error, refetch } = useInsights({
    year: filters.year,
    industry: filters.industry,
  });

  const tabs = [
    { id: 'findings' as InsightTab, label: 'Key Findings', icon: '🔍' },
    { id: 'industries' as InsightTab, label: 'Top Industries', icon: '🏆' },
    { id: 'trends' as InsightTab, label: 'Growth Trends', icon: '📈' },
    { id: 'recommendations' as InsightTab, label: 'Recommendations', icon: '💡' },
    { id: 'stats' as InsightTab, label: 'Statistics', icon: '📊' },
  ];

  // Loading state
  if (loading) {
    return (
      <Card 
        title="AI-Generated Insights"
        subtitle="Analyzing data patterns..."
        className={className}
      >
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card 
        title="AI-Generated Insights"
        subtitle="Error loading insights"
        className={className}
      >
        <div className="flex flex-col items-center justify-center space-y-4" style={{ height }}>
          <div className="text-red-500 dark:text-red-400 text-center">
            <p className="font-medium">Failed to load insights</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  // Empty state
  if (!data) {
    return (
      <Card 
        title="AI-Generated Insights"
        subtitle="No insights available"
        className={className}
      >
        <div className="flex flex-col items-center justify-center space-y-4" style={{ height }}>
          <div className="text-gray-500 dark:text-gray-400 text-center">
            <div className="text-4xl mb-2">💡</div>
            <p className="font-medium">No insights generated</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        </div>
      </Card>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'findings':
        return (
          <div className="space-y-3">
            {data.key_findings.length > 0 ? (
              data.key_findings.map((finding, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-l-4 border-accent-primary shadow-sm"
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 dark:text-blue-400 text-lg">
                      {index + 1}.
                    </span>
                    <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                      {finding}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <div className="text-2xl mb-2">🔍</div>
                <p>No key findings available for current filters</p>
              </div>
            )}
          </div>
        );

      case 'industries':
        return (
          <div className="space-y-3">
            {data.top_industries.length > 0 ? (
              data.top_industries.map((industry, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-900 dark:text-green-100">
                      #{index + 1} {industry.industry}
                    </h4>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {(industry.composite_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Adoption:</span>
                      <div className="font-medium text-green-700 dark:text-green-300">
                        {(industry.avg_adoption_rate * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Investment:</span>
                      <div className="font-medium text-green-700 dark:text-green-300">
                        ${industry.total_investment_millions}M
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">AWS Usage:</span>
                      <div className="font-medium text-green-700 dark:text-green-300">
                        {(industry.avg_aws_usage_score * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <div className="text-2xl mb-2">🏆</div>
                <p>No industry rankings available</p>
              </div>
            )}
          </div>
        );

      case 'trends':
        return (
          <div className="space-y-3">
            {data.growth_trends.length > 0 ? (
              data.growth_trends.map((trend, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border-l-4 border-purple-400 shadow-sm"
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-purple-600 dark:text-purple-400 text-lg">
                      📈
                    </span>
                    <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed">
                      {trend}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <div className="text-2xl mb-2">📈</div>
                <p>No growth trends identified</p>
              </div>
            )}
          </div>
        );

      case 'recommendations':
        return (
          <div className="space-y-3">
            {data.recommendations.length > 0 ? (
              data.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border-l-4 border-orange-400 shadow-sm"
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-orange-600 dark:text-orange-400 text-lg">
                      💡
                    </span>
                    <p className="text-sm text-orange-800 dark:text-orange-200 leading-relaxed">
                      {recommendation}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <div className="text-2xl mb-2">💡</div>
                <p>No recommendations available</p>
              </div>
            )}
          </div>
        );

      case 'stats':
        return (
          <div className="space-y-4">
            {data.summary_statistics.genai && (
              <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-700 dark:to-gray-600 rounded-lg shadow-sm border border-accent-muted/10">
                <h4 className="font-medium text-primary mb-3">
                  GenAI Statistics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total Records:</span>
                    <div className="font-bold text-blue-600 dark:text-blue-400">
                      {data.summary_statistics.genai.total_records}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Avg Adoption:</span>
                    <div className="font-bold text-green-600 dark:text-green-400">
                      {(data.summary_statistics.genai.avg_adoption_rate * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Median Adoption:</span>
                    <div className="font-bold text-purple-600 dark:text-purple-400">
                      {(data.summary_statistics.genai.median_adoption_rate * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total Investment:</span>
                    <div className="font-bold text-orange-600 dark:text-orange-400">
                      ${data.summary_statistics.genai.total_investment_millions}M
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Avg Use Cases:</span>
                    <div className="font-bold text-red-600 dark:text-red-400">
                      {data.summary_statistics.genai.avg_use_cases}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Industries:</span>
                    <div className="font-bold text-indigo-600 dark:text-indigo-400">
                      {data.summary_statistics.genai.unique_industries}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {data.summary_statistics.aws && (
              <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-600 dark:to-gray-700 rounded-lg shadow-sm border border-accent-muted/10">
                <h4 className="font-medium text-primary mb-3">
                  AWS Usage Statistics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total Records:</span>
                    <div className="font-bold text-blue-600 dark:text-blue-400">
                      {data.summary_statistics.aws.total_records}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Avg Usage Score:</span>
                    <div className="font-bold text-green-600 dark:text-green-400">
                      {(data.summary_statistics.aws.avg_usage_score * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Median Usage:</span>
                    <div className="font-bold text-purple-600 dark:text-purple-400">
                      {(data.summary_statistics.aws.median_usage_score * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card 
      title="AI-Generated Insights"
      subtitle={`Analysis based on current filters • Generated ${new Date(data.metadata.generated_at).toLocaleDateString()}`}
      variant="insights"
      className={className}
    >
      <div className="space-y-4">
        {/* Enhanced Tab Navigation */}
        <div className="flex flex-wrap gap-1 p-1 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-inner">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-white to-gray-50 dark:from-gray-600 dark:to-gray-700 text-primary shadow-sm border border-accent-muted/20'
                  : 'text-secondary hover:text-primary hover:bg-white/50 dark:hover:bg-gray-600/50'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div 
          className="overflow-y-auto"
          style={{ height: height - 120 }}
        >
          {renderTabContent()}
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              Filters: {filters.year ? `Year ${filters.year}` : 'All Years'} • {filters.industry || 'All Industries'}
            </span>
            <span>
              Last updated: {new Date(data.metadata.generated_at).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};