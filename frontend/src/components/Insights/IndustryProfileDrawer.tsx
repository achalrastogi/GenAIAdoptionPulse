import React from 'react';

interface IndustryProfileDrawerProps {
  industry: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const IndustryProfileDrawer: React.FC<IndustryProfileDrawerProps> = ({
  industry,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !industry) return null;

  // Mock data for industry profile (in real implementation, this would come from API)
  const industryData = {
    adoptionRate: 0.65,
    topServices: ['Bedrock', 'SageMaker', 'Lambda'],
    recommendations: [
      'Focus on expanding AI use cases in customer service automation',
      'Invest in advanced machine learning capabilities for predictive analytics'
    ]
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {industry} Profile
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Adoption Rate */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                GenAI Adoption
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Current Adoption Rate
                  </span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {(industryData.adoptionRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${industryData.adoptionRate * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Top Services */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Top AWS Services
              </h3>
              <div className="space-y-2">
                {industryData.topServices.map((service, index) => (
                  <div 
                    key={service}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-gray-400 dark:text-gray-500">
                        #{index + 1}
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {service}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < (3 - index) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                AI Recommendations
              </h3>
              <div className="space-y-3">
                {industryData.recommendations.map((recommendation, index) => (
                  <div 
                    key={index}
                    className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-600 dark:text-blue-400 text-lg">
                        💡
                      </span>
                      <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                        {recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    $245M
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Total Investment
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    18
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Use Cases
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    +15%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    YoY Growth
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    #2
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Industry Rank
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              Close Profile
            </button>
          </div>
        </div>
      </div>
    </>
  );
};