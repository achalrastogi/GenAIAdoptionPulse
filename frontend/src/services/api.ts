import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';
const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;

// Types for API responses
export interface APIResponse<T> {
  data: T;
  metadata: {
    total_records?: number;
    source_file?: string;
    filters_applied?: Record<string, any>;
    timestamp?: string;
    [key: string]: any;
  };
}

export interface GenAIAdoptionRecord {
  industry: string;
  year: number;
  adoption_rate: number;
  use_cases_count: number;
  investment_millions: number;
}

export interface AWSUsageRecord {
  industry: string;
  year: number;
  bedrock_usage: number;
  sagemaker_usage: number;
  lambda_usage: number;
  s3_usage: number;
  ec2_usage: number;
  total_usage_score: number;
}

export interface GrowthPredictionRecord {
  industry: string;
  year: number;
  predicted_adoption: number;
  confidence_interval_low: number;
  confidence_interval_high: number;
  confidence_range: number;
}

export interface CorrelationData {
  correlation_coefficient: number;
  data_points: Array<{
    industry: string;
    year: number;
    genai_adoption: number;
    aws_usage_score: number;
    investment_millions: number;
    use_cases_count: number;
  }>;
  statistical_significance: number;
  sample_size: number;
  metadata: Record<string, any>;
}

export interface InsightsData {
  key_findings: string[];
  top_industries: Array<{
    industry: string;
    avg_adoption_rate: number;
    total_investment_millions: number;
    avg_aws_usage_score: number;
    composite_score: number;
  }>;
  growth_trends: string[];
  recommendations: string[];
  summary_statistics: Record<string, any>;
  metadata: Record<string, any>;
}

export interface APIError {
  error: string;
  message: string;
  details?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
  timestamp: string;
  path?: string;
}

// Create axios instance with default configuration
const createAPIClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor for logging
  client.interceptors.request.use(
    (config) => {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error('API Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log(`API Response: ${response.status} ${response.config.url}`);
      return response;
    },
    (error: AxiosError<APIError>) => {
      console.error('API Response Error:', error.response?.data || error.message);
      return Promise.reject(error);
    }
  );

  return client;
};

// Retry logic for failed requests
const retryRequest = async <T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  retries: number = MAX_RETRIES
): Promise<AxiosResponse<T>> => {
  try {
    return await requestFn();
  } catch (error) {
    if (retries > 0 && isRetryableError(error as AxiosError)) {
      console.log(`Retrying request... ${MAX_RETRIES - retries + 1}/${MAX_RETRIES}`);
      await delay(1000 * (MAX_RETRIES - retries + 1)); // Exponential backoff
      return retryRequest(requestFn, retries - 1);
    }
    throw error;
  }
};

// Check if error is retryable
const isRetryableError = (error: AxiosError): boolean => {
  if (!error.response) {
    // Network errors are retryable
    return true;
  }
  
  const status = error.response.status;
  // Retry on server errors (5xx) and rate limiting (429)
  return status >= 500 || status === 429;
};

// Utility function for delays
const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// API Client class
class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = createAPIClient();
  }

  // GenAI Adoption API
  async getGenAIAdoption(filters?: {
    year?: number;
    industry?: string;
  }): Promise<APIResponse<GenAIAdoptionRecord[]>> {
    const response = await retryRequest(() =>
      this.client.get<APIResponse<GenAIAdoptionRecord[]>>('/genai-adoption', {
        params: filters,
      })
    );
    return response.data;
  }

  // AWS Usage API
  async getAWSUsage(filters?: {
    year?: number;
    industry?: string;
  }): Promise<APIResponse<AWSUsageRecord[]>> {
    const response = await retryRequest(() =>
      this.client.get<APIResponse<AWSUsageRecord[]>>('/aws-usage', {
        params: filters,
      })
    );
    return response.data;
  }

  // Growth Predictions API
  async getGrowthPredictions(filters?: {
    year_range?: string;
  }): Promise<APIResponse<GrowthPredictionRecord[]>> {
    const response = await retryRequest(() =>
      this.client.get<APIResponse<GrowthPredictionRecord[]>>('/growth-predictions', {
        params: filters,
      })
    );
    return response.data;
  }

  // Correlation Analysis API
  async getCorrelationData(filters?: {
    year?: number;
  }): Promise<CorrelationData> {
    const response = await retryRequest(() =>
      this.client.get<CorrelationData>('/correlation-data', {
        params: filters,
      })
    );
    return response.data;
  }

  // Insights API
  async getInsights(filters?: {
    year?: number;
    industry?: string;
  }): Promise<InsightsData> {
    const response = await retryRequest(() =>
      this.client.get<InsightsData>('/insights', {
        params: filters,
      })
    );
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.client.get<{ status: string }>('/health');
    return response.data;
  }
}

// Create singleton instance
export const apiClient = new APIClient();

// Error handling utilities
export const handleAPIError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<APIError>;
    
    if (axiosError.response?.data) {
      const apiError = axiosError.response.data;
      return apiError.message || 'An API error occurred';
    }
    
    if (axiosError.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.';
    }
    
    if (axiosError.code === 'ERR_NETWORK') {
      return 'Network error. Please check your connection.';
    }
    
    return axiosError.message || 'An unexpected error occurred';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};

// Validation utilities
export const validateFilters = (filters: Record<string, any>): string[] => {
  const errors: string[] = [];
  
  if (filters.year && (filters.year < 2020 || filters.year > 2030)) {
    errors.push('Year must be between 2020 and 2030');
  }
  
  if (filters.year_range) {
    const yearRangePattern = /^\d{4}-\d{4}$/;
    if (!yearRangePattern.test(filters.year_range)) {
      errors.push('Year range must be in format YYYY-YYYY');
    } else {
      const [startYear, endYear] = filters.year_range.split('-').map(Number);
      if (startYear > endYear) {
        errors.push('Start year must be less than or equal to end year');
      }
    }
  }
  
  return errors;
};

// Export default instance for convenience
export default apiClient;