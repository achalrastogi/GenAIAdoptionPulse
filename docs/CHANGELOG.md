# Changelog

All notable changes to GenAI Adoption Pulse will be documented in this file.

## [Unreleased] - 2024-12-14

### Added - Insights Engine Enhancement
- **Start Time**: 2024-12-14 13:10:00 UTC
- **Intent**: Implement comprehensive insights engine with advanced analytics, KPI dashboard, and enhanced UI/UX features

#### Backend Enhancements
- New KPI computation endpoints for total_industries, avg_adoption, total_investment, top_industry, fastest_growing_industry
- Enhanced `/api/insights` endpoint with filter parameters and structured insight objects
- Advanced synthetic insight logic with Pearson correlation, p-value, Cohen's d effect size
- Caching system for insight results with 10-minute TTL
- Data export endpoint `/api/insights/{id}/export` for CSV downloads
- Comprehensive unit tests for new endpoints

#### Frontend Enhancements
- Top KPI strip with five interactive cards
- Insights Composer panel with tabbed interface (Key Findings, Top Industries, Growth Trends, Recommendations, Statistics)
- Expandable insight cards with details, mini charts, and confidence badges
- Microcharts integration for sparklines and mini bars
- Industry Profile Drawer with adoption metrics and AI recommendations
- Scenario Simulator UI with projection capabilities
- Enhanced UI polish: hover tooltips, regression lines, export functionality

#### Infrastructure
- Environment setup scripts and Makefile targets
- Smoke tests for dashboard reliability
- Screenshot documentation for verification

### Changed
- Enhanced existing insight generation with statistical rigor
- Improved data visualization with interactive elements
- Upgraded caching and performance optimizations

### Technical Details
- Statistical analysis using Pearson correlation coefficients
- Effect size calculations using Cohen's d
- Confidence scoring based on sample size and statistical significance
- Deterministic AI recommendation generation (no external API calls)