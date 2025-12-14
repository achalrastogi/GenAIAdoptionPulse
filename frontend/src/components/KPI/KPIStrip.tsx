import React from 'react';
import { useKPIs } from '../../hooks/useKPIs';
import { useFilters } from '../../contexts/FilterContext';
import { Card } from '../Layout/Card';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  loading?: boolean;
  error?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  loading, 
  error, 
  trend 
}) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-16 mb-1"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-700 p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-red-600 dark:text-red-400">{title}</span>
          <span className="text-lg">⚠️</span>
        </div>
        <div className="text-red-500 dark:text-red-400 text-sm">Error loading data</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</span>
        <span className="text-lg">{icon}</span>
      </div>
      
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {trend && (
          <span className={`text-sm font-medium ${
            trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      
      {subtitle && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export const KPIStrip: React.FC = () => {
  const { filters } = useFilters();
  const { data: kpis, loading, error } = useKPIs({
    year: filters.year,
    industry: filters.industry,
  });

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatCurrency = (value: number) => `$${value.toFixed(1)}M`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <KPICard
        title="Total Industries"
        value={kpis?.total_industries || 0}
        subtitle="Analyzed sectors"
        icon="🏢"
        loading={loading}
        error={error}
      />
      
      <KPICard
        title="Average Adoption"
        value={kpis?.avg_adoption ? formatPercentage(kpis.avg_adoption) : '0%'}
        subtitle="Across all industries"
        icon="📈"
        loading={loading}
        error={error}
        trend={{
          value: 12.5,
          isPositive: true
        }}
      />
      
      <KPICard
        title="Total Investment"
        value={kpis?.total_investment ? formatCurrency(kpis.total_investment) : '$0M'}
        subtitle="GenAI funding"
        icon="💰"
        loading={loading}
        error={error}
        trend={{
          value: 8.3,
          isPositive: true
        }}
      />
      
      <KPICard
        title="Top Industry"
        value={kpis?.top_industry?.industry || 'N/A'}
        subtitle={kpis?.top_industry?.adoption_rate ? 
          `${formatPercentage(kpis.top_industry.adoption_rate)} adoption` : 
          'No data'
        }
        icon="🏆"
        loading={loading}
        error={error}
      />
      
      <KPICard
        title="Fastest Growing"
        value={kpis?.fastest_growing_industry?.industry || 'N/A'}
        subtitle={kpis?.fastest_growing_industry?.growth_rate ? 
          `${formatPercentage(kpis.fastest_growing_industry.growth_rate)} growth` : 
          'No data'
        }
        icon="🚀"
        loading={loading}
        error={error}
        trend={{
          value: 15.7,
          isPositive: true
        }}
      />
    </div>
  );
};