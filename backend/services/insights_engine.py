"""
Advanced Insights Engine for GenAI Adoption Pulse.

This module implements sophisticated statistical analysis and insight generation
with confidence scoring, effect size calculations, and caching.
"""
import logging
import statistics
import hashlib
import json
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from collections import defaultdict
import math

from models.csv_models import GenAIAdoptionRecord, AWSUsageRecord
from services.data_loader import DataLoader

logger = logging.getLogger(__name__)


@dataclass
class InsightObject:
    """Structured insight object with statistical rigor."""
    id: str
    title: str
    short_text: str
    details: str
    confidence: float
    data_slice_url: str
    computed_at: str
    category: str
    statistical_data: Dict[str, Any]


class InsightCache:
    """Simple in-memory cache for insights with TTL."""
    
    def __init__(self, ttl_minutes: int = 10):
        self.cache = {}
        self.ttl_minutes = ttl_minutes
    
    def _generate_key(self, filters: Dict[str, Any]) -> str:
        """Generate cache key from filters."""
        filter_str = json.dumps(filters, sort_keys=True)
        return hashlib.md5(filter_str.encode()).hexdigest()
    
    def get(self, filters: Dict[str, Any]) -> Optional[List[InsightObject]]:
        """Get cached insights if not expired."""
        key = self._generate_key(filters)
        if key in self.cache:
            insights, timestamp = self.cache[key]
            if datetime.utcnow() - timestamp < timedelta(minutes=self.ttl_minutes):
                return insights
            else:
                del self.cache[key]
        return None
    
    def set(self, filters: Dict[str, Any], insights: List[InsightObject]):
        """Cache insights with timestamp."""
        key = self._generate_key(filters)
        self.cache[key] = (insights, datetime.utcnow())
    
    def clear(self):
        """Clear all cached insights."""
        self.cache.clear()


class InsightsEngine:
    """Advanced insights engine with statistical analysis."""
    
    def __init__(self, data_loader: DataLoader):
        """Initialize insights engine."""
        self.data_loader = data_loader
        self.cache = InsightCache(ttl_minutes=10)
        self.logger = logging.getLogger(__name__)
    
    def generate_insights(
        self,
        years: Optional[List[int]] = None,
        industries: Optional[List[str]] = None
    ) -> List[InsightObject]:
        """
        Generate comprehensive insights with statistical analysis.
        
        Args:
            years: Optional list of years to filter
            industries: Optional list of industries to filter
            
        Returns:
            List of structured insight objects
        """
        filters = {"years": years, "industries": industries}
        
        # Check cache first
        cached_insights = self.cache.get(filters)
        if cached_insights:
            self.logger.info("Returning cached insights")
            return cached_insights
        
        self.logger.info(f"Generating insights with filters: {filters}")
        
        # Load and filter data
        genai_records, _ = self.data_loader.load_genai_adoption_data()
        aws_records, _ = self.data_loader.load_aws_usage_data()
        
        filtered_genai = self._apply_filters(genai_records, years, industries)
        filtered_aws = self._apply_filters(aws_records, years, industries)
        
        # Generate different types of insights
        insights = []
        insights.extend(self._generate_adoption_insights(filtered_genai))
        insights.extend(self._generate_correlation_insights(filtered_genai, filtered_aws))
        insights.extend(self._generate_growth_insights(genai_records, years, industries))
        insights.extend(self._generate_investment_insights(filtered_genai))
        
        # Cache results
        self.cache.set(filters, insights)
        
        self.logger.info(f"Generated {len(insights)} insights")
        return insights
    
    def _apply_filters(
        self,
        records: List[Any],
        years: Optional[List[int]] = None,
        industries: Optional[List[str]] = None
    ) -> List[Any]:
        """Apply year and industry filters to records."""
        filtered_records = []
        for record in records:
            # Apply year filter
            if years and record.year not in years:
                continue
            
            # Apply industry filter
            if industries and record.industry.value not in industries:
                continue
            
            filtered_records.append(record)
        
        return filtered_records
    
    def _calculate_pearson_correlation(self, x_values: List[float], y_values: List[float]) -> Tuple[float, float, int]:
        """Calculate Pearson correlation with p-value and sample size."""
        if len(x_values) != len(y_values) or len(x_values) < 2:
            return 0.0, 1.0, 0
        
        n = len(x_values)
        
        # Calculate correlation coefficient
        mean_x = statistics.mean(x_values)
        mean_y = statistics.mean(y_values)
        
        numerator = sum((x - mean_x) * (y - mean_y) for x, y in zip(x_values, y_values))
        sum_sq_x = sum((x - mean_x) ** 2 for x in x_values)
        sum_sq_y = sum((y - mean_y) ** 2 for y in y_values)
        
        denominator = (sum_sq_x * sum_sq_y) ** 0.5
        
        if denominator == 0:
            return 0.0, 1.0, n
        
        correlation = numerator / denominator
        
        # Calculate approximate p-value using t-distribution
        if abs(correlation) >= 0.999:
            p_value = 0.001
        else:
            t_stat = abs(correlation) * ((n - 2) / (1 - correlation ** 2)) ** 0.5
            # Simplified p-value approximation
            if t_stat > 2.576:
                p_value = 0.01
            elif t_stat > 1.96:
                p_value = 0.05
            elif t_stat > 1.645:
                p_value = 0.10
            else:
                p_value = 0.20
        
        return round(correlation, 3), p_value, n
    
    def _calculate_cohens_d(self, group1: List[float], group2: List[float]) -> float:
        """Calculate Cohen's d effect size."""
        if not group1 or not group2:
            return 0.0
        
        mean1 = statistics.mean(group1)
        mean2 = statistics.mean(group2)
        
        # Calculate pooled standard deviation
        if len(group1) == 1 and len(group2) == 1:
            return 0.0
        
        var1 = statistics.variance(group1) if len(group1) > 1 else 0
        var2 = statistics.variance(group2) if len(group2) > 1 else 0
        
        pooled_std = math.sqrt(((len(group1) - 1) * var1 + (len(group2) - 1) * var2) / (len(group1) + len(group2) - 2))
        
        if pooled_std == 0:
            return 0.0
        
        cohens_d = (mean1 - mean2) / pooled_std
        return round(cohens_d, 3)
    
    def _calculate_confidence(self, p_value: float, n: int, cohens_d: float) -> float:
        """Calculate confidence score using the specified formula."""
        effect_size_multiplier = 1.0 + (abs(cohens_d) / 2)
        confidence = min(0.95, (1 - p_value) * (n / 100) * effect_size_multiplier)
        return round(confidence, 3)
    
    def _generate_data_slice_url(self, filters: Dict[str, Any]) -> str:
        """Generate data slice URL for drill-down analysis."""
        params = []
        if filters.get("industry"):
            params.append(f"industry={filters['industry']}")
        if filters.get("year"):
            params.append(f"year={filters['year']}")
        if filters.get("metric"):
            params.append(f"metric={filters['metric']}")
        
        query_string = "&".join(params)
        return f"/api/data/slice?{query_string}" if query_string else "/api/data/slice"
    
    def _generate_adoption_insights(self, records: List[GenAIAdoptionRecord]) -> List[InsightObject]:
        """Generate insights about adoption patterns."""
        insights = []
        
        if not records:
            return insights
        
        # High adoption industries insight
        industry_adoption = defaultdict(list)
        for record in records:
            industry_adoption[record.industry.value].append(record.adoption_rate)
        
        industry_averages = {
            industry: statistics.mean(rates)
            for industry, rates in industry_adoption.items()
        }
        
        high_adoption_industries = [
            industry for industry, rate in industry_averages.items()
            if rate > 0.6
        ]
        
        if high_adoption_industries:
            top_industry = max(industry_averages, key=industry_averages.get)
            top_rate = industry_averages[top_industry]
            
            # Calculate confidence based on sample size
            sample_size = len(industry_adoption[top_industry])
            confidence = min(0.95, sample_size / 10)  # Simple confidence based on sample size
            
            insight = InsightObject(
                id=f"adoption_leader_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                title="Industry Leadership in GenAI Adoption",
                short_text=f"{top_industry} leads with {top_rate:.1%} adoption rate",
                details=f"{top_industry} demonstrates the highest GenAI adoption rate at {top_rate:.1%}, "
                       f"significantly outpacing industry averages. This leadership position indicates "
                       f"mature AI infrastructure and strategic commitment to generative AI technologies.",
                confidence=confidence,
                data_slice_url=self._generate_data_slice_url({"industry": top_industry, "metric": "adoption"}),
                computed_at=datetime.utcnow().isoformat(),
                category="adoption_trends",
                statistical_data={
                    "adoption_rate": top_rate,
                    "sample_size": sample_size,
                    "industry_count": len(industry_averages)
                }
            )
            insights.append(insight)
        
        return insights
    
    def _generate_correlation_insights(
        self,
        genai_records: List[GenAIAdoptionRecord],
        aws_records: List[AWSUsageRecord]
    ) -> List[InsightObject]:
        """Generate correlation insights between GenAI adoption and AWS usage."""
        insights = []
        
        if not genai_records or not aws_records:
            return insights
        
        # Match records by industry and year
        genai_lookup = {}
        for record in genai_records:
            key = (record.industry.value, record.year)
            genai_lookup[key] = record
        
        aws_lookup = {}
        for record in aws_records:
            key = (record.industry.value, record.year)
            aws_lookup[key] = record
        
        # Extract matching data points
        genai_values = []
        aws_values = []
        
        for key in genai_lookup:
            if key in aws_lookup:
                genai_values.append(genai_lookup[key].adoption_rate)
                # Calculate AWS usage score
                aws_record = aws_lookup[key]
                aws_score = (aws_record.bedrock_usage * 0.3 + 
                           aws_record.sagemaker_usage * 0.3 +
                           aws_record.lambda_usage * 0.2 +
                           aws_record.s3_usage * 0.1 +
                           aws_record.ec2_usage * 0.1)
                aws_values.append(aws_score)
        
        if len(genai_values) >= 3:  # Minimum sample size for correlation
            correlation, p_value, n = self._calculate_pearson_correlation(genai_values, aws_values)
            
            # Calculate effect size (treating correlation as effect size proxy)
            cohens_d = abs(correlation)  # Simplified for correlation analysis
            confidence = self._calculate_confidence(p_value, n, cohens_d)
            
            if abs(correlation) > 0.3:  # Meaningful correlation threshold
                correlation_strength = "strong" if abs(correlation) > 0.7 else "moderate"
                direction = "positive" if correlation > 0 else "negative"
                
                insight = InsightObject(
                    id=f"correlation_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                    title=f"GenAI-AWS Usage Correlation Analysis",
                    short_text=f"{correlation_strength.title()} {direction} correlation detected (r={correlation})",
                    details=f"Statistical analysis reveals a {correlation_strength} {direction} correlation "
                           f"(r={correlation}, p={p_value:.3f}) between GenAI adoption rates and AWS service usage. "
                           f"This suggests that {'higher' if correlation > 0 else 'lower'} cloud infrastructure "
                           f"utilization is associated with {'increased' if correlation > 0 else 'decreased'} "
                           f"GenAI adoption across industries.",
                    confidence=confidence,
                    data_slice_url=self._generate_data_slice_url({"metric": "correlation"}),
                    computed_at=datetime.utcnow().isoformat(),
                    category="correlation_analysis",
                    statistical_data={
                        "correlation_coefficient": correlation,
                        "p_value": p_value,
                        "sample_size": n,
                        "cohens_d": cohens_d,
                        "effect_size": "large" if abs(correlation) > 0.7 else "medium" if abs(correlation) > 0.3 else "small"
                    }
                )
                insights.append(insight)
        
        return insights
    
    def _generate_growth_insights(
        self,
        all_records: List[GenAIAdoptionRecord],
        years: Optional[List[int]] = None,
        industries: Optional[List[str]] = None
    ) -> List[InsightObject]:
        """Generate growth trend insights."""
        insights = []
        
        if not all_records:
            return insights
        
        # Group by industry and calculate growth rates
        industry_year_data = defaultdict(lambda: defaultdict(list))
        for record in all_records:
            if industries and record.industry.value not in industries:
                continue
            if years and record.year not in years:
                continue
            
            industry_year_data[record.industry.value][record.year].append(record.adoption_rate)
        
        # Calculate growth rates
        industry_growth_rates = {}
        for industry, year_data in industry_year_data.items():
            years_sorted = sorted(year_data.keys())
            if len(years_sorted) < 2:
                continue
            
            growth_rates = []
            for i in range(1, len(years_sorted)):
                prev_year = years_sorted[i-1]
                curr_year = years_sorted[i]
                
                prev_avg = statistics.mean(year_data[prev_year])
                curr_avg = statistics.mean(year_data[curr_year])
                
                if prev_avg > 0:
                    growth_rate = (curr_avg - prev_avg) / prev_avg
                    growth_rates.append(growth_rate)
            
            if growth_rates:
                avg_growth = statistics.mean(growth_rates)
                industry_growth_rates[industry] = avg_growth
        
        if industry_growth_rates:
            # Find fastest growing industry
            fastest_industry = max(industry_growth_rates, key=industry_growth_rates.get)
            fastest_rate = industry_growth_rates[fastest_industry]
            
            if fastest_rate > 0.1:  # 10% growth threshold
                sample_size = len(industry_year_data[fastest_industry])
                confidence = min(0.9, sample_size / 5)  # Confidence based on data points
                
                insight = InsightObject(
                    id=f"growth_leader_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                    title="Fastest Growing Industry Identified",
                    short_text=f"{fastest_industry} shows {fastest_rate:.1%} average growth rate",
                    details=f"{fastest_industry} demonstrates the highest growth trajectory with an average "
                           f"year-over-year growth rate of {fastest_rate:.1%}. This accelerated adoption "
                           f"indicates strong market momentum and suggests significant investment opportunities "
                           f"in GenAI technologies within this sector.",
                    confidence=confidence,
                    data_slice_url=self._generate_data_slice_url({"industry": fastest_industry, "metric": "growth"}),
                    computed_at=datetime.utcnow().isoformat(),
                    category="growth_trends",
                    statistical_data={
                        "growth_rate": fastest_rate,
                        "sample_size": sample_size,
                        "years_analyzed": len(industry_year_data[fastest_industry])
                    }
                )
                insights.append(insight)
        
        return insights
    
    def _generate_investment_insights(self, records: List[GenAIAdoptionRecord]) -> List[InsightObject]:
        """Generate investment efficiency insights."""
        insights = []
        
        if not records:
            return insights
        
        # Calculate investment per use case ratios
        investment_efficiency = []
        for record in records:
            if record.use_cases_count > 0:
                efficiency = record.investment_millions / record.use_cases_count
                investment_efficiency.append((record.industry.value, efficiency, record.investment_millions))
        
        if investment_efficiency:
            # Find most efficient industry
            industry_efficiency = defaultdict(list)
            for industry, efficiency, investment in investment_efficiency:
                industry_efficiency[industry].append(efficiency)
            
            industry_avg_efficiency = {
                industry: statistics.mean(efficiencies)
                for industry, efficiencies in industry_efficiency.items()
            }
            
            most_efficient = min(industry_avg_efficiency, key=industry_avg_efficiency.get)
            efficiency_value = industry_avg_efficiency[most_efficient]
            
            sample_size = len(industry_efficiency[most_efficient])
            confidence = min(0.85, sample_size / 8)
            
            insight = InsightObject(
                id=f"investment_efficiency_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                title="Investment Efficiency Leader",
                short_text=f"{most_efficient} shows highest ROI at ${efficiency_value:.1f}M per use case",
                details=f"{most_efficient} demonstrates the most efficient GenAI investment strategy with "
                       f"an average of ${efficiency_value:.1f}M per use case. This efficiency suggests "
                       f"optimized resource allocation and strategic focus on high-impact AI applications.",
                confidence=confidence,
                data_slice_url=self._generate_data_slice_url({"industry": most_efficient, "metric": "investment"}),
                computed_at=datetime.utcnow().isoformat(),
                category="investment_analysis",
                statistical_data={
                    "efficiency_ratio": efficiency_value,
                    "sample_size": sample_size,
                    "total_industries": len(industry_avg_efficiency)
                }
            )
            insights.append(insight)
        
        return insights


# Convenience function for direct usage
def generate_insights(
    years: Optional[List[int]] = None,
    industries: Optional[List[str]] = None
) -> List[InsightObject]:
    """Generate insights using default data loader."""
    data_loader = DataLoader("../data")
    insights_engine = InsightsEngine(data_loader)
    return insights_engine.generate_insights(years, industries)