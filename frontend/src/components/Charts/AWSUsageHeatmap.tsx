import React, { useMemo } from 'react';
import { useAWSUsage } from '../../hooks/useAPI';
import { useFilters } from '../../contexts/FilterContext';
import { Card } from '../Layout/Card';

interface AWSUsageHeatmapProps {
  className?: string;
  height?: number;
}

interface HeatmapCell {
  industry: string;
  service: string;
  value: number;
  displayValue: string;
}

const AWS_SERVICES = [
  { key: 'bedrock_usage', name: 'Bedrock', color: '#ff6b6b' },
  { key: 'sagemaker_usage', name: 'SageMaker', color: '#4ecdc4' },
  { key: 'lambda_usage', name: 'Lambda', color: '#45b7d1' },
  { key: 's3_usage', name: 'S3', color: '#96ceb4' },
  { key: 'ec2_usage', name: 'EC2', color: '#feca57' },
];

export const AWSUsageHeatmap: React.FC<AWSUsageHeatmapProps> = ({
  className,
  height = 400,
}) => {
  const { filters } = useFilters();
  
  const { data, loading, error, refetch } = useAWSUsage({
    year: filters.year,
    industry: filters.industry,
  });

  const rawData = data?.data || [];

  // Transform data for heatmap
  const heatmapData = useMemo(() => {
    const cells: HeatmapCell[] = [];
    
    rawData.forEach((record) => {
      AWS_SERVICES.forEach((service) => {
        const value = record[service.key as keyof typeof record] as number;
        cells.push({
          industry: record.industry,
          service: service.name,
          value: value,
          displayValue: `${(value * 100).toFixed(0)}%`,
        });
      });
    });
    
    return cells;
  }, [rawData]);

  // Get unique industries for grid layout
  const industries = useMemo(() => {
    return Array.from(new Set(rawData.map(record => record.industry)));
  }, [rawData]);

  // Get color intensity based on value
  const getColorIntensity = (value: number): string => {
    const intensity = Math.min(value, 1); // Clamp to 1
    const opacity = 0.1 + (intensity * 0.8); // Range from 0.1 to 0.9
    return `rgba(59, 130, 246, ${opacity})`; // Blue with varying opacity
  };

  // Get text color based on background intensity
  const getTextColor = (value: number): string => {
    return value > 0.6 ? 'text-white' : 'text-gray-900 dark:text-gray-100';
  };

  // Loading state
  if (loading) {
    return (
      <Card 
        title="AWS Service Usage Heatmap"
        subtitle="Loading usage data..."
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
        title="AWS Service Usage Heatmap"
        subtitle="Error loading data"
        className={className}
      >
        <div className="flex flex-col items-center justify-center space-y-4" style={{ height }}>
          <div className="text-red-500 dark:text-red-400 text-center">
            <p className="font-medium">Failed to load AWS usage data</p>
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
  if (!rawData.length) {
    return (
      <Card 
        title="AWS Service Usage Heatmap"
        subtitle="No data available"
        className={className}
      >
        <div className="flex flex-col items-center justify-center space-y-4" style={{ height }}>
          <div className="text-gray-500 dark:text-gray-400 text-center">
            <div className="text-4xl mb-2">🔥</div>
            <p className="font-medium">No usage data found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="AWS Service Usage Heatmap"
      subtitle={`Service utilization across ${industries.length} industries`}
      className={className}
    >
      <div className="space-y-4">
        {/* Legend */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Usage Intensity</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Low</span>
            <div className="flex space-x-1">
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((intensity) => (
                <div
                  key={intensity}
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: getColorIntensity(intensity) }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">High</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header row with service names */}
            <div className="grid grid-cols-6 gap-1 mb-2">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 p-2">
                Industry
              </div>
              {AWS_SERVICES.map((service) => (
                <div
                  key={service.key}
                  className="text-xs font-medium text-gray-600 dark:text-gray-400 p-2 text-center"
                >
                  {service.name}
                </div>
              ))}
            </div>

            {/* Data rows */}
            {industries.map((industry) => (
              <div key={industry} className="grid grid-cols-6 gap-1 mb-1">
                {/* Industry name */}
                <div className="text-xs font-medium text-gray-900 dark:text-gray-100 p-2 truncate">
                  {industry}
                </div>
                
                {/* Service usage cells */}
                {AWS_SERVICES.map((service) => {
                  const cell = heatmapData.find(
                    (c) => c.industry === industry && c.service === service.name
                  );
                  const value = cell?.value || 0;
                  
                  return (
                    <div
                      key={`${industry}-${service.key}`}
                      className={`
                        relative p-2 text-xs font-medium text-center rounded cursor-pointer
                        transition-all duration-200 hover:scale-105 hover:shadow-md
                        ${getTextColor(value)}
                      `}
                      style={{ backgroundColor: getColorIntensity(value) }}
                      title={`${industry} - ${service.name}: ${cell?.displayValue || '0%'}`}
                      data-tooltip={`${industry} uses ${service.name} at ${cell?.displayValue || '0%'} capacity. Click for detailed breakdown.`}
                    >
                      {cell?.displayValue || '0%'}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Export Controls */}
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => {
              // Export as PNG (simplified - would need html2canvas in real implementation)
              console.log('Exporting heatmap as PNG...');
            }}
            className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            📷 PNG
          </button>
          <button
            onClick={() => {
              // Export as CSV
              const csvContent = "data:text/csv;charset=utf-8," + 
                "Industry,Service,Usage\n" +
                heatmapData.map(cell => `${cell.industry},${cell.service},${cell.value}`).join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "aws_usage_heatmap.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            📊 CSV
          </button>
        </div>

        {/* Summary Statistics */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {AWS_SERVICES.map((service) => {
            const serviceData = heatmapData.filter(cell => cell.service === service.name);
            const avgUsage = serviceData.length > 0 
              ? serviceData.reduce((sum, cell) => sum + cell.value, 0) / serviceData.length 
              : 0;
            
            return (
              <div key={service.key} className="text-center">
                <div 
                  className="text-lg font-bold"
                  style={{ color: service.color }}
                >
                  {(avgUsage * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {service.name} Avg
                </div>
              </div>
            );
          })}
        </div>

        {/* Service Descriptions */}
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p><strong>Bedrock:</strong> Generative AI foundation models</p>
          <p><strong>SageMaker:</strong> Machine learning platform</p>
          <p><strong>Lambda:</strong> Serverless compute functions</p>
          <p><strong>S3:</strong> Object storage service</p>
          <p><strong>EC2:</strong> Virtual compute instances</p>
        </div>
      </div>
    </Card>
  );
};