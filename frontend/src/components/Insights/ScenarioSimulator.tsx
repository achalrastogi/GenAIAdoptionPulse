import React, { useState, useMemo } from 'react';


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
    <div className={`scenario-simulator p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">
          Scenario Simulator
        </h2>
        <p className="text-amber-100 leading-relaxed">
          Model GenAI adoption outcomes with interactive parameters
        </p>
      </div>

      <div className="space-y-6">
        {/* Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Investment Level */}
          <div>
            <label className="block text-sm font-medium text-amber-100 mb-2">
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
              <div className="flex justify-between text-xs text-amber-200">
                <span>$10M</span>
                <span className="font-medium text-white bg-amber-600/30 px-2 py-1 rounded">
                  ${investmentLevel}M
                </span>
                <span>$500M</span>
              </div>
            </div>
          </div>

          {/* Time Horizon */}
          <div>
            <label className="block text-sm font-medium text-amber-100 mb-2">
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
              <div className="flex justify-between text-xs text-amber-200">
                <span>1 Year</span>
                <span className="font-medium text-white bg-amber-600/30 px-2 py-1 rounded">
                  {timeHorizon} Years
                </span>
                <span>5 Years</span>
              </div>
            </div>
          </div>

          {/* Industry Focus */}
          <div>
            <label className="block text-sm font-medium text-amber-100 mb-2">
              Industry Focus
            </label>
            <select
              value={industryFocus}
              onChange={(e) => setIndustryFocus(e.target.value)}
              className="w-full px-3 py-2 border border-amber-300/30 rounded-md 
                         bg-white/90 backdrop-blur-sm text-gray-900
                         focus:ring-2 focus:ring-amber-400 focus:border-amber-400
                         transition-all duration-200 shadow-sm"
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
          <div className="scenario-card rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Projected Adoption
              </span>
              <span className="text-amber-600">📈</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {(projections.adoption * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-amber-700 mt-1">
              +{((projections.adoption - 0.45) * 100).toFixed(1)}% from baseline
            </div>
          </div>

          {/* Projected ROI */}
          <div className="scenario-card rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Projected ROI
              </span>
              <span className="text-amber-600">💰</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${projections.roi.toFixed(1)}M
            </div>
            <div className="text-xs text-amber-700 mt-1">
              {((projections.roi / investmentLevel) * 100).toFixed(0)}% return
            </div>
          </div>

          {/* Risk Factor */}
          <div className="scenario-card rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Risk Factor
              </span>
              <span className="text-amber-600">⚠️</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {(projections.risk * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-amber-700 mt-1">
              {projections.risk < 0.3 ? 'Low' : projections.risk < 0.6 ? 'Medium' : 'High'} risk
            </div>
          </div>

          {/* Use Cases */}
          <div className="scenario-card rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Estimated Use Cases
              </span>
              <span className="text-amber-600">🎯</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {projections.useCases}
            </div>
            <div className="text-xs text-amber-700 mt-1">
              Breakeven: {projections.timeToBreakeven.toFixed(1)} years
            </div>
          </div>
        </div>

        {/* Scenario Summary */}
        <div className="scenario-card rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Scenario Summary
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed">
            With a <strong>${investmentLevel}M investment</strong> in <strong>{industryFocus}</strong> over{' '}
            <strong>{timeHorizon} years</strong>, the model projects a GenAI adoption rate of{' '}
            <strong>{(projections.adoption * 100).toFixed(1)}%</strong> with an estimated ROI of{' '}
            <strong>${projections.roi.toFixed(1)}M</strong>. The scenario carries a{' '}
            <strong>{projections.risk < 0.3 ? 'low' : projections.risk < 0.6 ? 'medium' : 'high'} risk profile</strong>{' '}
            and could support approximately <strong>{projections.useCases} use cases</strong>.
          </p>
        </div>

        {/* Model Disclaimer */}
        <div className="text-xs text-amber-200 border-t border-amber-300/30 pt-4">
          <p>
            <strong>Note:</strong> This is a simplified linear model for demonstration purposes. 
            Actual outcomes may vary significantly based on market conditions, execution quality, 
            and external factors not captured in this simulation.
          </p>
        </div>
      </div>
    </div>
  );
};