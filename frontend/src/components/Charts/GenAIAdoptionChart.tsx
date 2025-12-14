import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useGenAIAdoption } from '../../hooks/useAPI';
import { useFilters } from '../../contexts/FilterContext';
import { Card } from '../Layout/Card';

type ChartType = 'bar' | 'line';

interface GenAIAdoptionChartProps {
  className?: string;
  height?: number;
}

export const GenAIAdoptionChart: React.FC<GenAIAdoptionChartProps> = ({
  className,
  height = 400,
}) => {
  const { filters } = useFilters();
  const [chartType, setChartType] = useState<ChartType>('bar');
  
  const { data, loading, error, refetch } = useGenAIAdoption({
    year: filters.year,
    industry: filters.industry,
  });

  const chartData = data?.data || [];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white">{`${data.industry} (${data.year})`}</p>
          <p className="text-blue-600 dark:text-blue-400">
            {`Adoption Rate: ${(data.adoption_rate * 100).toFixed(1)}%`}
          </p>
          <p className="text-green-600 dark:text-green-400">
            {`Investment: $${data.investment_millions}M`}
          </p>
          <p className="text-purple-600 dark:text-purple-400">
            {`Use Cases: ${data.use_cases_count}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Format adoption rate as percentage
  const formatPercentage = (value: number) => `${(value * 100).toFixed(0)}%`;

  // Chart toggle buttons
  const ChartTypeToggle = () => (
    <div className="flex space-x-2 mb-4">
      <button
        onClick={() => setChartType('bar')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          chartType === 'bar'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        Bar Chart
      </button>
      <button
        onClick={() => setChartType('line')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          chartType === 'line'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        Line Chart
      </button>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <Card 
        title="GenAI Adoption by Industry"
        subtitle="Loading adoption data..."
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
        title="GenAI Adoption by Industry"
        subtitle="Error loading data"
        className={className}
      >
        <div className="flex flex-col items-center justify-center space-y-4" style={{ height }}>
          <div className="text-red-500 dark:text-red-400 text-center">
            <p className="font-medium">Failed to load adoption data</p>
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
  if (!chartData.length) {
    return (
      <Card 
        title="GenAI Adoption by Industry"
        subtitle="No data available"
        className={className}
      >
        <div className="flex flex-col items-center justify-center space-y-4" style={{ height }}>
          <div className="text-gray-500 dark:text-gray-400 text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="font-medium">No adoption data found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="GenAI Adoption by Industry"
      subtitle={`Showing ${chartData.length} records • ${chartType === 'bar' ? 'Bar' : 'Line'} view`}
      className={className}
    >
      <ChartTypeToggle />
      
      <ResponsiveContainer width="100%" height={height}>
        {chartType === 'bar' ? (
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="industry" 
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis 
              tickFormatter={formatPercentage}
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="adoption_rate" 
              name="Adoption Rate"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="year" 
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis 
              tickFormatter={formatPercentage}
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="adoption_rate" 
              name="Adoption Rate"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {chartData.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Industries</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatPercentage(
              chartData.reduce((sum, item) => sum + item.adoption_rate, 0) / chartData.length || 0
            )}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Adoption</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            ${Math.round(chartData.reduce((sum, item) => sum + item.investment_millions, 0))}M
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Investment</div>
        </div>
      </div>
    </Card>
  );
};