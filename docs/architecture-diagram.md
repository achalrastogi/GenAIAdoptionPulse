# GenAI Adoption Pulse - Architecture Diagram

## System Architecture Overview

```mermaid
graph TB
    subgraph "Local Development Environment"
        subgraph "Data Sources"
            CSV1[industry_genai_adoption.csv]
            CSV2[aws_service_usage_by_industry.csv]
            CSV3[genai_growth_prediction.csv]
        end
        
        subgraph "FastAPI Backend"
            API[FastAPI Server<br/>:8000]
            DL[Data Loader<br/>Service]
            DP[Data Processor<br/>Service]
            IE[Insights Engine<br/>AI Logic]
            KPI[KPI Service]
        end
        
        subgraph "Processing Pipeline"
            CORR[Correlation Analysis]
            STAT[Statistical Processing]
            PRED[Predictive Analytics]
            EXPORT[JSON Export<br/>Generator]
        end
    end
    
    subgraph "Static Assets"
        JSON1[genai-adoption-data.json]
        JSON2[aws-usage-data.json]
        JSON3[insights-data.json]
        JSON4[kpi-data.json]
    end
    
    subgraph "GitHub Pages Deployment"
        subgraph "React Frontend"
            APP[React App<br/>TypeScript + Vite]
            DASH[Interactive Dashboard]
            CHARTS[Recharts Visualizations]
            THEME[Theme System]
            FILTER[Filter Components]
        end
        
        subgraph "Static Hosting"
            GHP[GitHub Pages<br/>Static Site]
            CDN[GitHub CDN<br/>Global Distribution]
        end
    end
    
    subgraph "User Experience"
        BROWSER[Web Browser]
        MOBILE[Mobile Device]
    end

    %% Data Flow
    CSV1 --> DL
    CSV2 --> DL
    CSV3 --> DL
    
    DL --> DP
    DP --> IE
    DP --> KPI
    
    IE --> CORR
    IE --> STAT
    IE --> PRED
    
    CORR --> EXPORT
    STAT --> EXPORT
    PRED --> EXPORT
    KPI --> EXPORT
    
    EXPORT --> JSON1
    EXPORT --> JSON2
    EXPORT --> JSON3
    EXPORT --> JSON4
    
    JSON1 --> APP
    JSON2 --> APP
    JSON3 --> APP
    JSON4 --> APP
    
    APP --> DASH
    DASH --> CHARTS
    DASH --> THEME
    DASH --> FILTER
    
    APP --> GHP
    GHP --> CDN
    
    CDN --> BROWSER
    CDN --> MOBILE

    %% Styling
    classDef dataSource fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef processing fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef static fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef frontend fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef hosting fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    classDef user fill:#fff8e1,stroke:#f57f17,stroke-width:2px

    class CSV1,CSV2,CSV3 dataSource
    class API,DL,DP,IE,KPI backend
    class CORR,STAT,PRED,EXPORT processing
    class JSON1,JSON2,JSON3,JSON4 static
    class APP,DASH,CHARTS,THEME,FILTER frontend
    class GHP,CDN hosting
    class BROWSER,MOBILE user
```

## Architecture Components

### 1. Data Sources Layer
- **CSV Files**: Raw industry data, AWS usage metrics, and growth predictions
- **Local Storage**: File-based data management for development and processing

### 2. FastAPI Backend (Local Processing)
- **Data Loader Service**: CSV parsing and validation
- **Data Processor Service**: Data transformation and aggregation
- **Insights Engine**: AI-powered correlation analysis and trend detection
- **KPI Service**: Key performance indicator calculations

### 3. Processing Pipeline
- **Correlation Analysis**: Statistical relationships between GenAI adoption and AWS usage
- **Statistical Processing**: Confidence scoring and effect size calculations
- **Predictive Analytics**: Growth forecasting and trend analysis
- **JSON Export**: Static data generation for frontend consumption

### 4. Static Assets
- **Pre-generated JSON**: Processed data exported as static files
- **Optimized Payloads**: Structured data ready for frontend consumption
- **Version Control**: JSON files committed to repository

### 5. React Frontend
- **Interactive Dashboard**: Real-time visualizations using Recharts
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Theme System**: Light/dark mode support
- **Filter Components**: Industry and year-based data filtering

### 6. GitHub Pages Hosting
- **Static Site Deployment**: Automated deployment from repository
- **Global CDN**: GitHub's content delivery network
- **HTTPS Support**: Secure content delivery
- **Custom Domain**: Optional custom domain configuration

## Data Flow Process

1. **Data Ingestion**: CSV files loaded and validated by FastAPI backend
2. **Processing**: AI logic generates insights, correlations, and predictions
3. **Export**: Processed data exported as static JSON files
4. **Build**: React frontend built with embedded JSON data
5. **Deploy**: Static site deployed to GitHub Pages
6. **Serve**: Users access dashboard through GitHub's CDN

## Key Benefits

- **Zero Runtime Costs**: No server infrastructure required
- **High Performance**: Pre-processed data and CDN delivery
- **Scalability**: GitHub Pages handles traffic automatically
- **Reliability**: Static hosting with 99.9% uptime
- **Security**: No backend attack surface in production
- **Simplicity**: Single repository deployment workflow

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Data Processing | FastAPI + Python | Local data processing and AI logic |
| Frontend | React + TypeScript | Interactive dashboard |
| Build Tool | Vite | Fast development and optimized builds |
| Styling | Tailwind CSS | Responsive design system |
| Charts | Recharts | Data visualization components |
| Hosting | GitHub Pages | Static site hosting and CDN |
| CI/CD | GitHub Actions | Automated build and deployment |

---

*This architecture enables a cost-effective, scalable GenAI analytics dashboard with enterprise-grade performance and reliability.*