/**
 * Smoke test for Dashboard component
 * Ensures the main dashboard route renders without crashing
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { FilterProvider } from '../contexts/FilterContext';
import { Dashboard } from '../pages/Dashboard';

// Mock the chart components to avoid rendering issues in tests
vi.mock('../components/Charts/GenAIAdoptionChart', () => ({
  GenAIAdoptionChart: () => <div data-testid="genai-chart">GenAI Chart</div>
}));

vi.mock('../components/Charts/AWSUsageHeatmap', () => ({
  AWSUsageHeatmap: () => <div data-testid="aws-heatmap">AWS Heatmap</div>
}));

vi.mock('../components/Charts/CorrelationPanel', () => ({
  CorrelationPanel: () => <div data-testid="correlation-panel">Correlation Panel</div>
}));

vi.mock('../components/Charts/InsightsPanel', () => ({
  InsightsPanel: () => <div data-testid="insights-panel">Insights Panel</div>
}));

vi.mock('../components/KPI/KPIStrip', () => ({
  KPIStrip: () => <div data-testid="kpi-strip">KPI Strip</div>
}));

vi.mock('../components/Insights/InsightsComposer', () => ({
  InsightsComposer: () => <div data-testid="insights-composer">Insights Composer</div>
}));

vi.mock('../components/Insights/ScenarioSimulator', () => ({
  ScenarioSimulator: () => <div data-testid="scenario-simulator">Scenario Simulator</div>
}));

// Mock API hooks to avoid network calls in tests
vi.mock('../hooks/useKPIs', () => ({
  useKPIs: () => ({
    data: null,
    loading: false,
    error: null
  })
}));

vi.mock('../hooks/useEnhancedInsights', () => ({
  useEnhancedInsights: () => ({
    data: null,
    loading: false,
    error: null
  })
}));

const DashboardWrapper: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <FilterProvider>
          <Dashboard />
        </FilterProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Dashboard Smoke Test', () => {
  it('renders without crashing', () => {
    expect(() => {
      render(<DashboardWrapper />);
    }).not.toThrow();
  });

  it('displays the main dashboard title', () => {
    render(<DashboardWrapper />);
    
    expect(screen.getByText('GenAI Adoption Pulse')).toBeInTheDocument();
  });

  it('renders all major dashboard components', () => {
    render(<DashboardWrapper />);
    
    // Check that all major components are present
    expect(screen.getByTestId('kpi-strip')).toBeInTheDocument();
    expect(screen.getByTestId('genai-chart')).toBeInTheDocument();
    expect(screen.getByTestId('aws-heatmap')).toBeInTheDocument();
    expect(screen.getByTestId('correlation-panel')).toBeInTheDocument();
    expect(screen.getByTestId('insights-panel')).toBeInTheDocument();
    expect(screen.getByTestId('insights-composer')).toBeInTheDocument();
    expect(screen.getByTestId('scenario-simulator')).toBeInTheDocument();
  });

  it('renders filter controls', () => {
    render(<DashboardWrapper />);
    
    // Check for filter controls
    expect(screen.getByText('Filters & Controls')).toBeInTheDocument();
  });

  it('has proper layout structure', () => {
    render(<DashboardWrapper />);
    
    // Check that the main container exists
    const dashboard = screen.getByText('GenAI Adoption Pulse').closest('div');
    expect(dashboard).toBeInTheDocument();
  });

  it('renders without console errors', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<DashboardWrapper />);
    
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});