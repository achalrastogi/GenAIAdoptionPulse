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
                  className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400"
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
                  className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
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
                  className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-400"
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
                  className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-400"
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
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
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
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
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
      className={className}
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