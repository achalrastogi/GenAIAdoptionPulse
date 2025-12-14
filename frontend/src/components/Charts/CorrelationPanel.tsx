import React, { useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useCorrelationData } from '../../hooks/useAPI';
import { useFilters } from '../../contexts/FilterContext';
import { Card } from '../Layout/Card';

interface CorrelationPanelProps {
  className?: string;
  height?: number;
}

export const CorrelationPanel: React.FC<CorrelationPanelProps> = ({
  className,
  height = 400,
}) => {
  const { filters } = useFilters();
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  
  const { data, loading, error, refetch } = useCorrelationData({
    year: filters.year,
  });

  // Get correlation strength description
  const getCorrelationStrength = (coefficient: number): { strength: string; color: string } => {
    const abs = Math.abs(coefficient);
    if (abs >= 0.8) return { strength: 'Very Strong', color: '#dc2626' };
    if (abs >= 0.6) return { strength: 'Strong', color: '#ea580c' };
    if (abs >= 0.4) return { strength: 'Moderate', color: '#d97706' };
    if (abs >= 0.2) return { strength: 'Weak', color: '#65a30d' };
    return { strength: 'Very Weak', color: '#6b7280' };
  };

  // Get significance level description
  const getSignificanceLevel = (pValue: number): { level: string; color: string } => {
    if (pValue <= 0.01) return { level: 'Highly Significant (p ≤ 0.01)', color: '#dc2626' };
    if (pValue <= 0.05) return { level: 'Significant (p ≤ 0.05)', color: '#ea580c' };
    if (pValue <= 0.10) return { level: 'Marginally Significant (p ≤ 0.10)', color: '#d97706' };
    return { level: 'Not Significant (p > 0.10)', color: '#6b7280' };
  };

  // Custom tooltip for scatter plot
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">
            {data.industry} ({data.year})
          </p>
          <div className="space-y-1 text-sm">
            <p className="text-blue-600 dark:text-blue-400">
              GenAI Adoption: {(data.genai_adoption * 100).toFixed(1)}%
            </p>
            <p className="text-green-600 dark:text-green-400">
              AWS Usage Score: {(data.aws_usage_score * 100).toFixed(1)}%
            </p>
            <p className="text-purple-600 dark:text-purple-400">
              Investment: ${data.investment_millions}M
            </p>
            <p className="text-orange-600 dark:text-orange-400">
              Use Cases: {data.use_cases_count}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Handle point click
  const handlePointClick = (data: any) => {
    setSelectedPoint(data);
  };

  // Loading state
  if (loading) {
    return (
      <Card 
        title="Correlation Analysis"
        subtitle="Loading correlation data..."
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
        title="Correlation Analysis"
        subtitle="Error loading data"
        className={className}
      >
        <div className="flex flex-col items-center justify-center space-y-4" style={{ height }}>
          <div className="text-red-500 dark:text-red-400 text-center">
            <p className="font-medium">Failed to load correlation data</p>
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
  if (!data || !data.data_points.length) {
    return (
      <Card 
        title="Correlation Analysis"
        subtitle="No data available"
        className={className}
      >
        <div className="flex flex-col items-center justify-center space-y-4" style={{ height }}>
          <div className="text-gray-500 dark:text-gray-400 text-center">
            <div className="text-4xl mb-2">📈</div>
            <p className="font-medium">No correlation data found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        </div>
      </Card>
    );
  }

  const correlationStrength = getCorrelationStrength(data.correlation_coefficient);
  const significanceLevel = getSignificanceLevel(data.statistical_significance);

  return (
    <Card 
      title="Correlation Analysis"
      subtitle="GenAI Adoption vs AWS Usage Correlation"
      className={className}
    >
      <div className="space-y-4">
        {/* Correlation Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: correlationStrength.color }}>
              {data.correlation_coefficient.toFixed(3)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Correlation Coefficient
            </div>
            <div className="text-xs mt-1" style={{ color: correlationStrength.color }}>
              {correlationStrength.strength}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.sample_size}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Data Points
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: significanceLevel.color }}>
              p = {data.statistical_significance.toFixed(3)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {significanceLevel.level}
            </div>
          </div>
        </div>

        {/* Scatter Plot */}
        <div style={{ height: height - 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              data={data.data_points}
              margin={{ top: 20, right: 30, bottom: 40, left: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                type="number"
                dataKey="genai_adoption"
                name="GenAI Adoption"
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                label={{ 
                  value: 'GenAI Adoption Rate (%)', 
                  position: 'insideBottom', 
                  offset: -10,
                  style: { textAnchor: 'middle' }
                }}
                tick={{ fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis 
                type="number"
                dataKey="aws_usage_score"
                name="AWS Usage"
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                label={{ 
                  value: 'AWS Usage Score (%)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
                tick={{ fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter 
                name="Industries"
                data={data.data_points}
                fill="#3b82f6"
                onClick={handlePointClick}
              >
                {data.data_points.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={selectedPoint === entry ? "#ef4444" : "#3b82f6"}
                    stroke={selectedPoint === entry ? "#dc2626" : "#2563eb"}
                    strokeWidth={selectedPoint === entry ? 2 : 1}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Selected Point Details */}
        {selectedPoint && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Selected: {selectedPoint.industry} ({selectedPoint.year})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">GenAI Adoption:</span>
                <div className="font-medium text-blue-600 dark:text-blue-400">
                  {(selectedPoint.genai_adoption * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">AWS Usage:</span>
                <div className="font-medium text-green-600 dark:text-green-400">
                  {(selectedPoint.aws_usage_score * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Investment:</span>
                <div className="font-medium text-purple-600 dark:text-purple-400">
                  ${selectedPoint.investment_millions}M
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Use Cases:</span>
                <div className="font-medium text-orange-600 dark:text-orange-400">
                  {selectedPoint.use_cases_count}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interpretation */}
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p>
            <strong>Interpretation:</strong> {' '}
            {data.correlation_coefficient > 0 
              ? 'Positive correlation suggests that higher GenAI adoption tends to coincide with higher AWS usage.'
              : data.correlation_coefficient < 0
              ? 'Negative correlation suggests that higher GenAI adoption tends to coincide with lower AWS usage.'
              : 'No meaningful correlation between GenAI adoption and AWS usage.'
            }
          </p>
          <p>
            <strong>Statistical Significance:</strong> {significanceLevel.level.toLowerCase()}
          </p>
        </div>
      </div>
    </Card>
  );
};