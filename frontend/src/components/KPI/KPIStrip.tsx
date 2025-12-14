import React from 'react';
import { useFilters } from '../../contexts/FilterContext';

// Mock hook for KPIs - replace with actual implementation
const useKPIs = (_filters: any) => ({
  data: {
    total_industries: 8,
    avg_adoption: 0.52,
    total_investment: 1250.5,
    top_industry: {
      industry: 'Technology',
      adoption_rate: 0.78
    },
    fastest_growing_industry: {
      industry: 'Healthcare',
      growth_rate: 0.24
    }
  },
  loading: false,
  error: undefined
});


interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;

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
  loading, 
  error, 
  trend 
}) => {
  if (loading) {
    return (
      <div className="kpi-card rounded-lg p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
          </div>
          <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-500 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kpi-card rounded-lg p-6 border-red-200 dark:border-red-800">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium uppercase tracking-wide text-red-600 dark:text-red-400">{title}</span>
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
        <div className="text-red-500 dark:text-red-400 text-sm font-medium">Error</div>
      </div>
    );
  }

  return (
    <div className="kpi-card rounded-lg p-6 group">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium uppercase tracking-wide text-secondary">
          {title}
        </span>
        <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full group-hover:bg-accent-primary transition-colors"></div>
      </div>
      
      <div className="flex items-baseline space-x-3 mb-2">
        <span className="kpi-value text-2xl font-semibold tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {trend && (
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            trend.isPositive 
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      
      {subtitle && (
        <div className="text-sm text-tertiary font-medium">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <KPICard
        title="Industries"
        value={kpis?.total_industries || 0}
        subtitle="Sectors analyzed"
        loading={loading}
        error={error}
      />
      
      <KPICard
        title="Adoption Rate"
        value={kpis?.avg_adoption ? formatPercentage(kpis.avg_adoption) : '0%'}
        subtitle="Average across sectors"
        loading={loading}
        error={error}
        trend={{
          value: 12.5,
          isPositive: true
        }}
      />
      
      <KPICard
        title="Investment"
        value={kpis?.total_investment ? formatCurrency(kpis.total_investment) : '$0M'}
        subtitle="Total funding"
        loading={loading}
        error={error}
        trend={{
          value: 8.3,
          isPositive: true
        }}
      />
      
      <KPICard
        title="Leader"
        value={kpis?.top_industry?.industry || 'N/A'}
        subtitle={kpis?.top_industry?.adoption_rate ? 
          `${formatPercentage(kpis.top_industry.adoption_rate)} rate` : 
          'No data'
        }
        loading={loading}
        error={error}
      />
      
      <KPICard
        title="Growth"
        value={kpis?.fastest_growing_industry?.industry || 'N/A'}
        subtitle={kpis?.fastest_growing_industry?.growth_rate ? 
          `${formatPercentage(kpis.fastest_growing_industry.growth_rate)} YoY` : 
          'No data'
        }
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