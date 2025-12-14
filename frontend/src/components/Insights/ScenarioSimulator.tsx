import React, { useState, useMemo } from 'react';
import { Card } from '../Layout/Card';

interface ScenarioSimulatorProps {
  className?: string;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ className }) => {
  const [investmentLevel, setInvestmentLevel] = useState(100); // Million dollars
  const [timeHorizon, setTimeHorizon] = useState(2); // Years
  const [industryFocus, setIndustryFocus] = useState('Technology');

  // Simple linear model for projections
  const projections = useMemo(() => {
    const baseAdoption = 0.45; // 45% base adoption
    const investmentMultiplier = investmentLevel / 100; // Normalize to 100M baseline
    const timeMultiplier = timeHorizon * 0.15; // 15% growth per year
    const industryMultiplier = industryFocus === 'Technology' ? 1.2 : 
                              industryFocus === 'Finance' ? 1.1 : 
                              industryFocus === 'Healthcare' ? 1.0 : 0.9;

    const projectedAdoption = Math.min(0.95, baseAdoption * investmentMultiplier * (1 + timeMultiplier) * industryMultiplier);
    const projectedROI = (projectedAdoption - baseAdoption) * investmentLevel * 2.5; // Simplified ROI calculation
    const riskFactor = Math.max(0.1, 1 - (investmentLevel / 200) - (timeHorizon * 0.05));

    return {
      adoption: projectedAdoption,
      roi: projectedROI,
      risk: riskFactor,
      useCases: Math.round(projectedAdoption * 25), // Estimated use cases
      timeToBreakeven: Math.max(0.5, 3 - (investmentLevel / 100))
    };
  }, [investmentLevel, timeHorizon, industryFocus]);

  const industries = ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail'];

  return (
    <Card 
      title="Scenario Simulator" 
      subtitle="Model GenAI adoption outcomes"
      className={className}
    >
      <div className="space-y-6">
        {/* Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Investment Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Investment Level
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={investmentLevel}
                onChange={(e) => setInvestmentLevel(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>$10M</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  ${investmentLevel}M
                </span>
                <span>$500M</span>
              </div>
            </div>
          </div>

          {/* Time Horizon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Horizon
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>1 Year</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {timeHorizon} Years
                </span>
                <span>5 Years</span>
              </div>
            </div>
          </div>

          {/* Industry Focus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Industry Focus
            </label>
            <select
              value={industryFocus}
              onChange={(e) => setIndustryFocus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition-colors duration-200"
            >
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Projections Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Projected Adoption */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Projected Adoption
              </span>
              <span className="text-blue-600 dark:text-blue-400">📈</span>
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {(projections.adoption * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              +{((projections.adoption - 0.45) * 100).toFixed(1)}% from baseline
            </div>
          </div>

          {/* Projected ROI */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Projected ROI
              </span>
              <span className="text-green-600 dark:text-green-400">💰</span>
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              ${projections.roi.toFixed(1)}M
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              {((projections.roi / investmentLevel) * 100).toFixed(0)}% return
            </div>
          </div>

          {/* Risk Factor */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Risk Factor
              </span>
              <span className="text-orange-600 dark:text-orange-400">⚠️</span>
            </div>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {(projections.risk * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              {projections.risk < 0.3 ? 'Low' : projections.risk < 0.6 ? 'Medium' : 'High'} risk
            </div>
          </div>

          {/* Use Cases */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Estimated Use Cases
              </span>
              <span className="text-purple-600 dark:text-purple-400">🎯</span>
            </div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {projections.useCases}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Breakeven: {projections.timeToBreakeven.toFixed(1)} years
            </div>
          </div>
        </div>

        {/* Scenario Summary */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Scenario Summary
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            With a <strong>${investmentLevel}M investment</strong> in <strong>{industryFocus}</strong> over{' '}
            <strong>{timeHorizon} years</strong>, the model projects a GenAI adoption rate of{' '}
            <strong>{(projections.adoption * 100).toFixed(1)}%</strong> with an estimated ROI of{' '}
            <strong>${projections.roi.toFixed(1)}M</strong>. The scenario carries a{' '}
            <strong>{projections.risk < 0.3 ? 'low' : projections.risk < 0.6 ? 'medium' : 'high'} risk profile</strong>{' '}
            and could support approximately <strong>{projections.useCases} use cases</strong>.
          </p>
        </div>

        {/* Model Disclaimer */}
        <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-4">
          <p>
            <strong>Note:</strong> This is a simplified linear model for demonstration purposes. 
            Actual outcomes may vary significantly based on market conditions, execution quality, 
            and external factors not captured in this simulation.
          </p>
        </div>
      </div>
    </Card>
  );
};