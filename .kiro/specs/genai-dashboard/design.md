# Design Document

## Overview

The GenAI Dashboard is a full-stack web application that visualizes synthetic data about GenAI adoption across industries and correlates it with AWS service usage patterns. The system follows a clean separation between a React frontend for visualization and a Python FastAPI backend for data processing and API services.

The architecture prioritizes simplicity, responsiveness, and extensibility to support future integration with real data sources through RAG-based ingestion. The current iteration focuses on establishing solid foundations with synthetic but realistic datasets.

## Architecture

The system follows a traditional client-server architecture with clear separation of concerns:

```
┌─────────────────┐    HTTP/JSON    ┌─────────────────┐
│   React Frontend │ ◄──────────────► │ FastAPI Backend │
│   (Port 5173)   │                 │   (Port 8000)   │
└─────────────────┘                 └─────────────────┘
                                            │
                                            ▼
                                    ┌─────────────────┐
                                    │   CSV Data      │
                                    │   Store (/data) │
                                    └─────────────────┘
```

**Frontend Architecture:**
- React 18 with Vite for fast development and building
- Tailwind CSS for responsive styling and component design
- Recharts library for interactive data visualizations
- Axios for HTTP client communication with backend APIs

**Backend Architecture:**
- FastAPI framework for high-performance async API development
- Pandas for CSV data processing and transformation
- Pydantic models for data validation and serialization
- Python virtual environment for dependency isolation

## Components and Interfaces

### Frontend Components

**Dashboard Layout Component**
- Responsive grid container that adapts to screen sizes
- Manages overall layout state and filter propagation
- Coordinates updates across all visualization components

**Chart Components**
- `GenAIAdoptionChart`: Bar/line chart showing adoption rates by industry
- `AWSServiceHeatmap`: Heatmap visualization of service usage patterns
- `CorrelationPanel`: Scatter plot or correlation matrix display
- `InsightsPanel`: Text-based summary of key findings and trends

**Filter Components**
- `YearFilter`: Dropdown or slider for year selection
- `IndustryFilter`: Multi-select dropdown for industry filtering
- `FilterControls`: Container component managing filter state

**Theme Components**
- `ThemeProvider`: Context provider for theme state management
- `ThemeToggle`: Button component for switching between light and dark themes
- `useTheme`: Custom hook for accessing and updating theme state

### Backend Components

**API Layer**
- `main.py`: FastAPI application setup and route definitions
- `routers/`: Modular route handlers for different data endpoints
- `middleware/`: CORS and error handling middleware

**Data Layer**
- `models/`: Pydantic models for request/response validation
- `services/data_loader.py`: CSV loading and validation logic
- `services/data_processor.py`: Data transformation and aggregation
- `utils/validators.py`: Custom validation functions for CSV data

**Configuration**
- `config.py`: Application settings and environment variables
- `requirements.txt`: Python dependencies specification
- Virtual environment setup scripts

### API Interface Specification

**Base URL:** `http://localhost:8000/api/v1`

**Endpoints:**

```
GET /genai-adoption
- Returns: GenAI adoption data by industry and year
- Query params: year (optional), industry (optional)
- Response: JSON array of adoption records

GET /aws-usage
- Returns: AWS service usage data by industry
- Query params: year (optional), industry (optional)  
- Response: JSON array of usage records

GET /growth-predictions
- Returns: GenAI growth prediction data
- Query params: year_range (optional)
- Response: JSON array of prediction records

GET /correlation-data
- Returns: Correlation analysis between GenAI adoption and AWS usage
- Query params: year (optional)
- Response: JSON object with correlation coefficients and data points

GET /insights
- Returns: Generated insights and key findings
- Query params: year (optional), industry (optional)
- Response: JSON object with insights text and metrics
```

## Data Models

### CSV Data Schemas

**industry_genai_adoption.csv**
```
industry,year,adoption_rate,use_cases_count,investment_millions
Healthcare,2023,0.45,12,150.5
Finance,2023,0.62,18,280.3
Manufacturing,2023,0.38,8,95.2
...
```

**aws_service_usage_by_industry.csv**
```
industry,year,bedrock_usage,sagemaker_usage,lambda_usage,s3_usage,ec2_usage
Healthcare,2023,0.35,0.58,0.82,0.95,0.71
Finance,2023,0.48,0.73,0.89,0.98,0.85
...
```

**genai_growth_prediction.csv**
```
industry,year,predicted_adoption,confidence_interval_low,confidence_interval_high
Healthcare,2024,0.52,0.48,0.56
Healthcare,2025,0.61,0.55,0.67
...
```

### API Response Models

**GenAI Adoption Record**
```typescript
interface GenAIAdoptionRecord {
  industry: string;
  year: number;
  adoption_rate: number;
  use_cases_count: number;
  investment_millions: number;
}
```

**AWS Usage Record**
```typescript
interface AWSUsageRecord {
  industry: string;
  year: number;
  bedrock_usage: number;
  sagemaker_usage: number;
  lambda_usage: number;
  s3_usage: number;
  ec2_usage: number;
}
```

**Correlation Data**
```typescript
interface CorrelationData {
  correlation_coefficient: number;
  data_points: Array<{
    industry: string;
    genai_adoption: number;
    aws_usage_score: number;
  }>;
  statistical_significance: number;
}
```

### Theme System Models

**Theme Configuration**
```typescript
interface ThemeConfig {
  mode: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
  };
}

interface ThemeContextType {
  theme: ThemeConfig;
  toggleTheme: () => void;
  setTheme: (mode: 'light' | 'dark') => void;
}
```
## Correct
ness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:

- Properties 1.4 and 4.1 both address CSV validation and can be combined into a comprehensive CSV validation property
- Properties 1.5 and 4.3 both address numeric range validation and can be combined
- Properties 3.1 and 3.2 follow the same pattern for different filter types and can be combined into a general filter update property

### Core Properties

**Property 1: CSV validation completeness**
*For any* CSV file loaded by the system, the validation process should verify both required column presence and correct formatting
**Validates: Requirements 1.4, 4.1**

**Property 2: Numeric range validation**
*For any* numeric data processed by the system, all values should fall within realistic ranges for their respective data types and business context
**Validates: Requirements 1.5, 4.3**

**Property 3: Filter propagation consistency**
*For any* filter change (year or industry), all visualizations should update to reflect the same filtered dataset
**Validates: Requirements 3.1, 3.2**

**Property 4: Insights synchronization**
*For any* applied filter combination, the insights panel content should accurately reflect the currently filtered data
**Validates: Requirements 3.4**

**Property 5: Error logging specificity**
*For any* invalid data encountered during processing, the system should log specific, actionable error messages that identify the validation failure
**Validates: Requirements 4.2**

**Property 6: JSON response consistency**
*For any* API endpoint, responses should conform to a consistent JSON schema structure appropriate for the data type being served
**Validates: Requirements 4.4, 7.2**

**Property 7: Responsive layout preservation**
*For any* screen size change, the UI should maintain all functional capabilities while adapting the visual layout appropriately
**Validates: Requirements 6.4**

**Property 8: API error handling resilience**
*For any* API request that results in an error condition, the frontend should handle the error gracefully without breaking the user experience
**Validates: Requirements 7.3**

**Property 9: Data transformation consistency**
*For any* CSV data processed by the backend, the resulting JSON structure should be normalized and suitable for consumption by visualization libraries
**Validates: Requirements 7.4**

**Property 10: Theme persistence consistency**
*For any* theme selection made by the user, the theme preference should be persisted in local storage and restored on subsequent visits
**Validates: Requirements 8.4, 8.5**

**Property 11: Theme propagation completeness**
*For any* theme change, all UI components including charts, panels, and controls should update to reflect the selected theme
**Validates: Requirements 8.3**

## Error Handling

### Backend Error Handling

**CSV Loading Errors**
- File not found: Return HTTP 500 with specific file path in error message
- Malformed CSV: Log parsing errors with line numbers and continue with valid rows
- Missing columns: Reject file loading and return detailed column validation errors
- Invalid data types: Log conversion errors and use default values where appropriate

**API Error Responses**
- 400 Bad Request: Invalid query parameters with specific validation messages
- 404 Not Found: Resource not available with helpful suggestions
- 500 Internal Server Error: Generic server error with correlation ID for debugging
- 422 Unprocessable Entity: Data validation failures with field-specific errors

**Data Validation Errors**
- Out-of-range values: Log warnings and apply data cleaning rules
- Missing required fields: Reject records and continue processing valid data
- Type conversion failures: Log errors and use sensible defaults

### Frontend Error Handling

**API Communication Errors**
- Network failures: Display retry mechanism with exponential backoff
- Timeout errors: Show loading states and allow manual refresh
- Server errors: Display user-friendly error messages with support contact

**Chart Rendering Errors**
- Empty datasets: Show "No data available" placeholder with filter suggestions
- Invalid data formats: Gracefully degrade to simpler chart types
- Rendering failures: Display error boundary with option to reload component

**User Input Validation**
- Invalid filter selections: Prevent submission and show validation hints
- Malformed date ranges: Auto-correct to valid ranges when possible
- Conflicting filter combinations: Show warnings and suggest alternatives

## Testing Strategy

### Unit Testing Approach

**Backend Unit Tests**
- CSV loading and validation functions with various malformed inputs
- Data transformation logic with edge cases (empty data, extreme values)
- API endpoint responses with different query parameter combinations
- Error handling paths with simulated failure conditions

**Frontend Unit Tests**
- Individual chart components with mock data
- Filter component state management and event handling
- API service functions with mocked HTTP responses
- Error boundary components with simulated error conditions

### Property-Based Testing Approach

The system will use **Hypothesis** for Python property-based testing and **fast-check** for JavaScript property-based testing. Each property-based test will run a minimum of 100 iterations to ensure thorough coverage of the input space.

**Backend Property Tests**
- Generate random CSV structures to test validation robustness
- Create various numeric datasets to verify range validation
- Generate malformed data to test error handling consistency
- Test API response schemas with diverse data combinations

**Frontend Property Tests**
- Generate random filter combinations to test UI update consistency
- Create various screen size scenarios to test responsive behavior
- Generate different data shapes to test chart rendering robustness
- Test error handling with random API failure scenarios

**Property Test Configuration**
- Minimum 100 test iterations per property
- Smart generators that create realistic but varied test data
- Shrinking enabled to find minimal failing examples
- Seed-based reproducibility for debugging failed tests

### Integration Testing

**End-to-End Scenarios**
- Complete data flow from CSV loading through API to frontend visualization
- Filter interactions across multiple chart components
- Error propagation from backend validation failures to frontend display
- Responsive behavior across different device simulations

**API Integration Tests**
- Full request-response cycles with real CSV data
- Error handling integration between backend validation and frontend display
- Performance testing with large synthetic datasets
- CORS and security header validation