# Requirements Document

## Introduction

The GenAI Dashboard is a web-based visualization system that correlates GenAI adoption patterns across industries with AWS service usage patterns. The system provides executives and architects with a single-view dashboard to understand AI adoption trends using synthetic but realistic datasets. This initial version establishes the foundation for future expansion with real RAG-based data ingestion.

## Glossary

- **GenAI Dashboard**: The complete web application system consisting of frontend UI and backend API
- **Frontend System**: The React-based user interface component with responsive charts and controls
- **Backend System**: The Python FastAPI service that processes CSV data and provides JSON APIs
- **CSV Data Store**: The collection of synthetic CSV files containing industry and service usage data
- **Virtual Environment**: An isolated Python environment for dependency management
- **Responsive UI**: User interface that adapts to desktop, tablet, and mobile screen sizes
- **Theme System**: A user interface theming system that supports light and dark color schemes

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want the system to automatically load and validate synthetic datasets on startup, so that the dashboard has reliable data available for visualization.

#### Acceptance Criteria

1. WHEN the Backend System starts, THE Backend System SHALL load the industry_genai_adoption.csv file from the data directory
2. WHEN the Backend System starts, THE Backend System SHALL load the aws_service_usage_by_industry.csv file from the data directory  
3. WHEN the Backend System starts, THE Backend System SHALL load the genai_growth_prediction.csv file from the data directory
4. WHEN the Backend System loads any CSV file, THE Backend System SHALL validate that all required columns exist
5. WHEN the Backend System loads any CSV file, THE Backend System SHALL validate that numeric values are within expected ranges

### Requirement 2

**User Story:** As an executive, I want to view a comprehensive dashboard with multiple visualizations, so that I can understand GenAI adoption patterns and AWS service correlations at a glance.

#### Acceptance Criteria

1. WHEN a user opens the dashboard, THE Frontend System SHALL display a bar chart showing GenAI adoption by industry
2. WHEN a user opens the dashboard, THE Frontend System SHALL display a line chart showing GenAI adoption trends over time
3. WHEN a user opens the dashboard, THE Frontend System SHALL display a heatmap showing AWS service usage by industry
4. WHEN a user opens the dashboard, THE Frontend System SHALL display a correlation panel comparing GenAI adoption with AWS service usage
5. WHEN a user opens the dashboard, THE Frontend System SHALL display an insights panel with key findings from the CSV data

### Requirement 3

**User Story:** As a business analyst, I want to filter and interact with the dashboard data, so that I can focus on specific time periods or industries of interest.

#### Acceptance Criteria

1. WHEN a user selects a different year filter, THE Frontend System SHALL update all visualizations to show data for the selected year
2. WHEN a user selects a different industry filter, THE Frontend System SHALL update all visualizations to show data for the selected industry
3. WHEN a user changes any filter, THE Frontend System SHALL maintain visual consistency across all charts and panels
4. WHEN a user applies filters, THE Frontend System SHALL update the insights panel to reflect the filtered data

### Requirement 4

**User Story:** As a data consumer, I want the system to ensure data quality and integrity, so that I can trust the visualizations and insights presented.

#### Acceptance Criteria

1. WHEN the Backend System validates CSV files, THE Backend System SHALL verify that CSV formatting is correct
2. WHEN the Backend System encounters invalid data, THE Backend System SHALL log specific validation errors
3. WHEN the Backend System processes numeric data, THE Backend System SHALL ensure values fall within realistic ranges for their data type
4. WHEN the Backend System serves data via API, THE Backend System SHALL provide properly formatted JSON responses

### Requirement 5

**User Story:** As a developer, I want the backend to use proper dependency isolation, so that the project doesn't interfere with other Python projects on the system.

#### Acceptance Criteria

1. WHEN installing backend dependencies, THE Backend System SHALL use a Python virtual environment
2. WHEN setting up the project, THE Backend System SHALL provide scripts to create and activate the virtual environment
3. WHEN running the backend, THE Backend System SHALL operate entirely within the virtual environment
4. WHEN the Backend System installs packages, THE Backend System SHALL prevent global package installation

### Requirement 6

**User Story:** As a user on any device, I want the dashboard to work seamlessly across different screen sizes, so that I can access insights whether I'm on desktop, tablet, or mobile.

#### Acceptance Criteria

1. WHEN a user accesses the dashboard on desktop, THE Frontend System SHALL display all visualizations in an optimal multi-column layout
2. WHEN a user accesses the dashboard on tablet, THE Frontend System SHALL adapt the layout to fit tablet screen dimensions
3. WHEN a user accesses the dashboard on mobile, THE Frontend System SHALL stack visualizations vertically for optimal mobile viewing
4. WHEN the screen size changes, THE Frontend System SHALL dynamically adjust chart sizes and layout without losing functionality
5. WHEN displaying charts on any device, THE Frontend System SHALL maintain readability of labels and data points

### Requirement 7

**User Story:** As a system integrator, I want clean APIs and data structures, so that the system can be easily extended with real data sources in future iterations.

#### Acceptance Criteria

1. WHEN the Backend System exposes data via API, THE Backend System SHALL provide RESTful endpoints for each dataset
2. WHEN the Backend System serves data, THE Backend System SHALL return consistent JSON schema across all endpoints
3. WHEN the Frontend System requests data, THE Frontend System SHALL handle API responses gracefully including error states
4. WHEN the Backend System processes CSV data, THE Backend System SHALL transform it into normalized JSON structures suitable for visualization libraries

### Requirement 8

**User Story:** As a user, I want to switch between light and dark themes, so that I can customize the dashboard appearance to match my preferences and working environment.

#### Acceptance Criteria

1. WHEN a user opens the dashboard, THE Frontend System SHALL display a theme toggle control in the header
2. WHEN a user clicks the theme toggle, THE Frontend System SHALL switch between light and dark color schemes
3. WHEN the theme changes, THE Frontend System SHALL update all UI components including charts, panels, and controls to match the selected theme
4. WHEN a user selects a theme, THE Frontend System SHALL persist the theme preference in local storage
5. WHEN a user returns to the dashboard, THE Frontend System SHALL restore the previously selected theme from local storage