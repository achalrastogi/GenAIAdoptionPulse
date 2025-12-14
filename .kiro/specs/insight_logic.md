# Insights Engine Logic Specification

## Overview
The Insights Engine provides statistically rigorous analysis of GenAI adoption patterns with confidence scoring and effect size measurements.

## Statistical Methods

### Pearson Correlation Analysis
- Calculate correlation coefficients between GenAI adoption and AWS usage
- Compute p-values for statistical significance testing
- Determine sample size (n) for confidence assessment

### Effect Size Calculation (Cohen's d)
```
Cohen's d = (mean1 - mean2) / pooled_standard_deviation
```
- Small effect: d = 0.2
- Medium effect: d = 0.5  
- Large effect: d = 0.8

### Confidence Formula
```
confidence = min(0.95, (1 - p_value) * (n / 100) * effect_size_multiplier)
```
Where:
- p_value: Statistical significance
- n: Sample size
- effect_size_multiplier: 1.0 + (cohen_d / 2)

## Insight Categories

### 1. Adoption Trends
- Year-over-year growth rates
- Industry leadership analysis
- Investment efficiency metrics

### 2. Correlation Insights
- GenAI adoption vs AWS usage patterns
- Service utilization correlations
- Infrastructure readiness indicators

### 3. Predictive Analytics
- Growth trajectory forecasting
- Market saturation analysis
- Investment opportunity identification

### 4. Comparative Analysis
- Industry benchmarking
- Performance gap analysis
- Best practice identification

## Synthetic Insight Generation Rules

### Deterministic Text Generation
1. **High Adoption Industries** (>60% adoption rate)
   - "Leading the GenAI transformation with {adoption_rate}% adoption"
   - "Demonstrates mature AI infrastructure with ${investment}M investment"

2. **Emerging Industries** (20-60% adoption rate)
   - "Showing strong growth potential with {growth_rate}% year-over-year increase"
   - "Positioned for accelerated adoption in the next 12-18 months"

3. **Early Stage Industries** (<20% adoption rate)
   - "Represents significant untapped opportunity for GenAI initiatives"
   - "Could benefit from infrastructure investment and pilot programs"

### Confidence Scoring
- **High Confidence** (>0.8): Strong statistical evidence with large sample size
- **Medium Confidence** (0.5-0.8): Moderate evidence with adequate sample size
- **Low Confidence** (<0.5): Limited evidence or small sample size

## Data Slice URLs
Format: `/api/data/slice?industry={industry}&year={year}&metric={metric}`
- Enables drill-down analysis
- Supports data export functionality
- Maintains filter context for reproducibility

## Caching Strategy
- Cache key: MD5 hash of filter parameters
- TTL: 10 minutes for real-time responsiveness
- Invalidation: On data updates or manual refresh
- Storage: In-memory cache with LRU eviction

## Export Formats
- CSV: Raw data with metadata headers
- JSON: Structured data with confidence scores
- PNG: Chart visualizations with insights overlay