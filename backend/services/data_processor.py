"""
Data processing and transformation service.

This module provides functions to transform CSV data into API-ready JSON structures,
perform correlation analysis, and generate insights based on data patterns.
"""
import logging
import statistics
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from collections import defaultdict

from models.csv_models import (
    GenAIAdoptionRecord,
    AWSUsageRecord,
    GrowthPredictionRecord,
    IndustryEnum
)

# Configure logging
logger = logging.getLogger(__name__)


@dataclass
class CorrelationData:
    """Data structure for correlation analysis results."""
    correlation_coefficient: float
    data_points: List[Dict[str, Any]]
    statistical_significance: float
    sample_size: int


@dataclass
class InsightData:
    """Data structure for generated insights."""
    key_findings: List[str]
    top_industries: List[Dict[str, Any]]
    growth_trends: List[str]
    recommendations: List[str]
    summary_statistics: Dict[str, Any]


class DataProcessor:
    """Service class for processing and transforming CSV data."""
    
    def __init__(self):
        """Initialize the data processor."""
        self.logger = logging.getLogger(__name__)
    
    def transform_genai_adoption_to_json(
        self, 
        records: List[GenAIAdoptionRecord],
        year_filter: Optional[int] = None,
        industry_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Transform GenAI adoption records to API-ready JSON structure.
        
        Args:
            records: List of GenAI adoption records
            year_filter: Optional year filter
            industry_filter: Optional industry filter
            
        Returns:
            List of JSON-serializable dictionaries
        """
        self.logger.info(f"Transforming {len(records)} GenAI adoption records to JSON")
        
        # Apply filters
        filtered_records = self._apply_filters(records, year_filter, industry_filter)
        
        # Transform to JSON structure
        json_data = []
        for record in filtered_records:
            json_record = {
                "industry": record.industry.value,
                "year": record.year,
                "adoption_rate": record.adoption_rate,
                "use_cases_count": record.use_cases_count,
                "investment_millions": record.investment_millions
            }
            json_data.append(json_record)
        
        self.logger.info(f"Transformed {len(json_data)} records after filtering")
        return json_data
    
    def transform_aws_usage_to_json(
        self,
        records: List[AWSUsageRecord],
        year_filter: Optional[int] = None,
        industry_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Transform AWS usage records to API-ready JSON structure.
        
        Args:
            records: List of AWS usage records
            year_filter: Optional year filter
            industry_filter: Optional industry filter
            
        Returns:
            List of JSON-serializable dictionaries
        """
        self.logger.info(f"Transforming {len(records)} AWS usage records to JSON")
        
        # Apply filters
        filtered_records = self._apply_filters(records, year_filter, industry_filter)
        
        # Transform to JSON structure
        json_data = []
        for record in filtered_records:
            json_record = {
                "industry": record.industry.value,
                "year": record.year,
                "bedrock_usage": record.bedrock_usage,
                "sagemaker_usage": record.sagemaker_usage,
                "lambda_usage": record.lambda_usage,
                "s3_usage": record.s3_usage,
                "ec2_usage": record.ec2_usage,
                "total_usage_score": self._calculate_aws_usage_score(record)
            }
            json_data.append(json_record)
        
        self.logger.info(f"Transformed {len(json_data)} records after filtering")
        return json_data
    
    def transform_growth_predictions_to_json(
        self,
        records: List[GrowthPredictionRecord],
        year_range: Optional[Tuple[int, int]] = None,
        industry_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Transform growth prediction records to API-ready JSON structure.
        
        Args:
            records: List of growth prediction records
            year_range: Optional tuple of (start_year, end_year)
            industry_filter: Optional industry filter
            
        Returns:
            List of JSON-serializable dictionaries
        """
        self.logger.info(f"Transforming {len(records)} growth prediction records to JSON")
        
        # Apply filters
        filtered_records = []
        for record in records:
            # Apply industry filter
            if industry_filter and record.industry.value != industry_filter:
                continue
            
            # Apply year range filter
            if year_range and not (year_range[0] <= record.year <= year_range[1]):
                continue
            
            filtered_records.append(record)
        
        # Transform to JSON structure
        json_data = []
        for record in filtered_records:
            json_record = {
                "industry": record.industry.value,
                "year": record.year,
                "predicted_adoption": record.predicted_adoption,
                "confidence_interval_low": record.confidence_interval_low,
                "confidence_interval_high": record.confidence_interval_high,
                "confidence_range": record.confidence_interval_high - record.confidence_interval_low
            }
            json_data.append(json_record)
        
        self.logger.info(f"Transformed {len(json_data)} records after filtering")
        return json_data
    
    def calculate_correlation_analysis(
        self,
        genai_records: List[GenAIAdoptionRecord],
        aws_records: List[AWSUsageRecord],
        year_filter: Optional[int] = None
    ) -> CorrelationData:
        """
        Calculate correlation between GenAI adoption and AWS service usage.
        
        Args:
            genai_records: List of GenAI adoption records
            aws_records: List of AWS usage records
            year_filter: Optional year filter
            
        Returns:
            CorrelationData object with analysis results
        """
        self.logger.info("Calculating correlation analysis between GenAI adoption and AWS usage")
        
        # Create lookup dictionaries for matching records
        genai_lookup = {}
        for record in genai_records:
            if year_filter and record.year != year_filter:
                continue
            key = (record.industry.value, record.year)
            genai_lookup[key] = record
        
        aws_lookup = {}
        for record in aws_records:
            if year_filter and record.year != year_filter:
                continue
            key = (record.industry.value, record.year)
            aws_lookup[key] = record
        
        # Find matching records and extract data points
        data_points = []
        genai_values = []
        aws_values = []
        
        for key in genai_lookup:
            if key in aws_lookup:
                genai_record = genai_lookup[key]
                aws_record = aws_lookup[key]
                
                aws_usage_score = self._calculate_aws_usage_score(aws_record)
                
                data_point = {
                    "industry": genai_record.industry.value,
                    "year": genai_record.year,
                    "genai_adoption": genai_record.adoption_rate,
                    "aws_usage_score": aws_usage_score,
                    "investment_millions": genai_record.investment_millions,
                    "use_cases_count": genai_record.use_cases_count
                }
                
                data_points.append(data_point)
                genai_values.append(genai_record.adoption_rate)
                aws_values.append(aws_usage_score)
        
        # Calculate correlation coefficient
        if len(genai_values) < 2:
            correlation_coefficient = 0.0
            statistical_significance = 0.0
        else:
            correlation_coefficient = self._calculate_pearson_correlation(genai_values, aws_values)
            statistical_significance = self._calculate_statistical_significance(
                correlation_coefficient, len(genai_values)
            )
        
        self.logger.info(f"Correlation analysis complete: r={correlation_coefficient:.3f}, "
                        f"n={len(data_points)}, p={statistical_significance:.3f}")
        
        return CorrelationData(
            correlation_coefficient=correlation_coefficient,
            data_points=data_points,
            statistical_significance=statistical_significance,
            sample_size=len(data_points)
        )
    
    def generate_insights(
        self,
        genai_records: List[GenAIAdoptionRecord],
        aws_records: List[AWSUsageRecord],
        growth_records: List[GrowthPredictionRecord],
        year_filter: Optional[int] = None,
        industry_filter: Optional[str] = None
    ) -> InsightData:
        """
        Generate insights based on data patterns across all datasets.
        
        Args:
            genai_records: List of GenAI adoption records
            aws_records: List of AWS usage records
            growth_records: List of growth prediction records
            year_filter: Optional year filter
            industry_filter: Optional industry filter
            
        Returns:
            InsightData object with generated insights
        """
        self.logger.info("Generating insights from data patterns")
        
        # Apply filters to all datasets
        filtered_genai = self._apply_filters(genai_records, year_filter, industry_filter)
        filtered_aws = self._apply_filters(aws_records, year_filter, industry_filter)
        filtered_growth = []
        for record in growth_records:
            if industry_filter and record.industry.value != industry_filter:
                continue
            if year_filter and record.year != year_filter:
                continue
            filtered_growth.append(record)
        
        # Generate key findings
        key_findings = self._generate_key_findings(filtered_genai, filtered_aws, filtered_growth)
        
        # Identify top industries
        top_industries = self._identify_top_industries(filtered_genai, filtered_aws)
        
        # Generate growth trends
        growth_trends = self._generate_growth_trends(filtered_genai, filtered_growth)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(filtered_genai, filtered_aws, filtered_growth)
        
        # Calculate summary statistics
        summary_statistics = self._calculate_summary_statistics(filtered_genai, filtered_aws)
        
        self.logger.info(f"Generated insights: {len(key_findings)} findings, "
                        f"{len(top_industries)} top industries, {len(growth_trends)} trends")
        
        return InsightData(
            key_findings=key_findings,
            top_industries=top_industries,
            growth_trends=growth_trends,
            recommendations=recommendations,
            summary_statistics=summary_statistics
        )
    
    def _apply_filters(
        self,
        records: List[Any],
        year_filter: Optional[int] = None,
        industry_filter: Optional[str] = None
    ) -> List[Any]:
        """Apply year and industry filters to records."""
        filtered_records = []
        for record in records:
            # Apply year filter
            if year_filter and record.year != year_filter:
                continue
            
            # Apply industry filter
            if industry_filter and record.industry.value != industry_filter:
                continue
            
            filtered_records.append(record)
        
        return filtered_records
    
    def _calculate_aws_usage_score(self, record: AWSUsageRecord) -> float:
        """Calculate a composite AWS usage score from individual service usage."""
        # Weight AI/ML services more heavily for GenAI correlation
        weights = {
            'bedrock_usage': 0.3,
            'sagemaker_usage': 0.3,
            'lambda_usage': 0.2,
            's3_usage': 0.1,
            'ec2_usage': 0.1
        }
        
        score = (
            record.bedrock_usage * weights['bedrock_usage'] +
            record.sagemaker_usage * weights['sagemaker_usage'] +
            record.lambda_usage * weights['lambda_usage'] +
            record.s3_usage * weights['s3_usage'] +
            record.ec2_usage * weights['ec2_usage']
        )
        
        return round(score, 3)
    
    def _calculate_pearson_correlation(self, x_values: List[float], y_values: List[float]) -> float:
        """Calculate Pearson correlation coefficient between two lists of values."""
        if len(x_values) != len(y_values) or len(x_values) < 2:
            return 0.0
        
        n = len(x_values)
        
        # Calculate means
        mean_x = statistics.mean(x_values)
        mean_y = statistics.mean(y_values)
        
        # Calculate correlation coefficient
        numerator = sum((x - mean_x) * (y - mean_y) for x, y in zip(x_values, y_values))
        
        sum_sq_x = sum((x - mean_x) ** 2 for x in x_values)
        sum_sq_y = sum((y - mean_y) ** 2 for y in y_values)
        
        denominator = (sum_sq_x * sum_sq_y) ** 0.5
        
        if denominator == 0:
            return 0.0
        
        correlation = numerator / denominator
        return round(correlation, 3)
    
    def _calculate_statistical_significance(self, correlation: float, sample_size: int) -> float:
        """Calculate approximate statistical significance (p-value) for correlation."""
        if sample_size < 3:
            return 1.0
        
        # Simplified t-test approximation for correlation significance
        # t = r * sqrt((n-2) / (1-r^2))
        if abs(correlation) >= 0.999:  # Avoid division by zero
            return 0.001
        
        t_stat = abs(correlation) * ((sample_size - 2) / (1 - correlation ** 2)) ** 0.5
        
        # Rough approximation of p-value based on t-statistic
        # This is a simplified version - in production, use scipy.stats
        if t_stat > 2.576:  # 99% confidence
            return 0.01
        elif t_stat > 1.96:  # 95% confidence
            return 0.05
        elif t_stat > 1.645:  # 90% confidence
            return 0.10
        else:
            return 0.20
    
    def _generate_key_findings(
        self,
        genai_records: List[GenAIAdoptionRecord],
        aws_records: List[AWSUsageRecord],
        growth_records: List[GrowthPredictionRecord]
    ) -> List[str]:
        """Generate key findings from the data."""
        findings = []
        
        if genai_records:
            # Average adoption rate
            avg_adoption = statistics.mean(record.adoption_rate for record in genai_records)
            findings.append(f"Average GenAI adoption rate across analyzed data: {avg_adoption:.1%}")
            
            # Total investment
            total_investment = sum(record.investment_millions for record in genai_records)
            findings.append(f"Total GenAI investment: ${total_investment:.1f} million")
            
            # Industry with highest adoption
            industry_adoption = defaultdict(list)
            for record in genai_records:
                industry_adoption[record.industry.value].append(record.adoption_rate)
            
            if industry_adoption:
                avg_by_industry = {
                    industry: statistics.mean(rates) 
                    for industry, rates in industry_adoption.items()
                }
                top_industry = max(avg_by_industry, key=avg_by_industry.get)
                top_rate = avg_by_industry[top_industry]
                findings.append(f"{top_industry} leads in GenAI adoption with {top_rate:.1%} average rate")
        
        if aws_records:
            # Most used AWS service
            service_usage = {
                'Bedrock': statistics.mean(record.bedrock_usage for record in aws_records),
                'SageMaker': statistics.mean(record.sagemaker_usage for record in aws_records),
                'Lambda': statistics.mean(record.lambda_usage for record in aws_records),
                'S3': statistics.mean(record.s3_usage for record in aws_records),
                'EC2': statistics.mean(record.ec2_usage for record in aws_records)
            }
            top_service = max(service_usage, key=service_usage.get)
            top_usage = service_usage[top_service]
            findings.append(f"{top_service} is the most utilized AWS service with {top_usage:.1%} average usage")
        
        if growth_records:
            # Future growth prediction
            future_predictions = [record.predicted_adoption for record in growth_records]
            if future_predictions:
                avg_future_adoption = statistics.mean(future_predictions)
                findings.append(f"Predicted future GenAI adoption rate: {avg_future_adoption:.1%}")
        
        return findings
    
    def _identify_top_industries(
        self,
        genai_records: List[GenAIAdoptionRecord],
        aws_records: List[AWSUsageRecord]
    ) -> List[Dict[str, Any]]:
        """Identify top-performing industries based on adoption and usage."""
        industry_data = defaultdict(lambda: {
            'adoption_rates': [],
            'investments': [],
            'aws_scores': []
        })
        
        # Aggregate GenAI data by industry
        for record in genai_records:
            industry = record.industry.value
            industry_data[industry]['adoption_rates'].append(record.adoption_rate)
            industry_data[industry]['investments'].append(record.investment_millions)
        
        # Aggregate AWS data by industry
        for record in aws_records:
            industry = record.industry.value
            aws_score = self._calculate_aws_usage_score(record)
            industry_data[industry]['aws_scores'].append(aws_score)
        
        # Calculate averages and create top industries list
        top_industries = []
        for industry, data in industry_data.items():
            if data['adoption_rates']:  # Only include industries with GenAI data
                avg_adoption = statistics.mean(data['adoption_rates'])
                total_investment = sum(data['investments'])
                avg_aws_score = statistics.mean(data['aws_scores']) if data['aws_scores'] else 0.0
                
                industry_info = {
                    'industry': industry,
                    'avg_adoption_rate': round(avg_adoption, 3),
                    'total_investment_millions': round(total_investment, 1),
                    'avg_aws_usage_score': round(avg_aws_score, 3),
                    'composite_score': round((avg_adoption + avg_aws_score) / 2, 3)
                }
                top_industries.append(industry_info)
        
        # Sort by composite score and return top 5
        top_industries.sort(key=lambda x: x['composite_score'], reverse=True)
        return top_industries[:5]
    
    def _generate_growth_trends(
        self,
        genai_records: List[GenAIAdoptionRecord],
        growth_records: List[GrowthPredictionRecord]
    ) -> List[str]:
        """Generate growth trend insights."""
        trends = []
        
        if genai_records:
            # Year-over-year growth analysis
            year_adoption = defaultdict(list)
            for record in genai_records:
                year_adoption[record.year].append(record.adoption_rate)
            
            if len(year_adoption) > 1:
                years = sorted(year_adoption.keys())
                year_averages = {year: statistics.mean(year_adoption[year]) for year in years}
                
                # Calculate growth rate between first and last year
                first_year, last_year = years[0], years[-1]
                growth_rate = (year_averages[last_year] - year_averages[first_year]) / year_averages[first_year]
                trends.append(f"GenAI adoption grew {growth_rate:.1%} from {first_year} to {last_year}")
        
        if growth_records:
            # Future growth predictions
            future_years = sorted(set(record.year for record in growth_records))
            if future_years:
                latest_year = max(future_years)
                latest_predictions = [
                    record.predicted_adoption for record in growth_records 
                    if record.year == latest_year
                ]
                if latest_predictions:
                    avg_prediction = statistics.mean(latest_predictions)
                    trends.append(f"Projected GenAI adoption for {latest_year}: {avg_prediction:.1%}")
        
        return trends
    
    def _generate_recommendations(
        self,
        genai_records: List[GenAIAdoptionRecord],
        aws_records: List[AWSUsageRecord],
        growth_records: List[GrowthPredictionRecord]
    ) -> List[str]:
        """Generate strategic recommendations based on data patterns."""
        recommendations = []
        
        if genai_records and aws_records:
            # Correlation-based recommendations
            correlation_data = self.calculate_correlation_analysis(genai_records, aws_records)
            
            if correlation_data.correlation_coefficient > 0.5:
                recommendations.append(
                    "Strong positive correlation between GenAI adoption and AWS usage suggests "
                    "cloud infrastructure investment supports AI initiatives"
                )
            elif correlation_data.correlation_coefficient < -0.5:
                recommendations.append(
                    "Negative correlation between GenAI adoption and AWS usage may indicate "
                    "opportunities for cloud migration to support AI workloads"
                )
        
        if genai_records:
            # Investment efficiency recommendations
            investment_per_use_case = []
            for record in genai_records:
                if record.use_cases_count > 0:
                    efficiency = record.investment_millions / record.use_cases_count
                    investment_per_use_case.append(efficiency)
            
            if investment_per_use_case:
                avg_efficiency = statistics.mean(investment_per_use_case)
                recommendations.append(
                    f"Average investment per use case: ${avg_efficiency:.1f}M - "
                    "focus on high-impact use cases for better ROI"
                )
        
        if growth_records:
            # Future planning recommendations
            high_growth_industries = []
            for record in growth_records:
                if record.predicted_adoption > 0.6:  # High adoption threshold
                    high_growth_industries.append(record.industry.value)
            
            if high_growth_industries:
                unique_industries = list(set(high_growth_industries))
                recommendations.append(
                    f"Industries with high growth potential: {', '.join(unique_industries[:3])} - "
                    "consider prioritizing these sectors for GenAI initiatives"
                )
        
        return recommendations
    
    def _calculate_summary_statistics(
        self,
        genai_records: List[GenAIAdoptionRecord],
        aws_records: List[AWSUsageRecord]
    ) -> Dict[str, Any]:
        """Calculate summary statistics across datasets."""
        stats = {}
        
        if genai_records:
            adoption_rates = [record.adoption_rate for record in genai_records]
            investments = [record.investment_millions for record in genai_records]
            use_cases = [record.use_cases_count for record in genai_records]
            
            stats['genai'] = {
                'total_records': len(genai_records),
                'avg_adoption_rate': round(statistics.mean(adoption_rates), 3),
                'median_adoption_rate': round(statistics.median(adoption_rates), 3),
                'total_investment_millions': round(sum(investments), 1),
                'avg_use_cases': round(statistics.mean(use_cases), 1),
                'unique_industries': len(set(record.industry.value for record in genai_records)),
                'year_range': (
                    min(record.year for record in genai_records),
                    max(record.year for record in genai_records)
                )
            }
        
        if aws_records:
            aws_scores = [self._calculate_aws_usage_score(record) for record in aws_records]
            
            stats['aws'] = {
                'total_records': len(aws_records),
                'avg_usage_score': round(statistics.mean(aws_scores), 3),
                'median_usage_score': round(statistics.median(aws_scores), 3),
                'unique_industries': len(set(record.industry.value for record in aws_records)),
                'year_range': (
                    min(record.year for record in aws_records),
                    max(record.year for record in aws_records)
                )
            }
        
        return stats


# Convenience functions for direct usage
def transform_genai_adoption_to_json(
    records: List[GenAIAdoptionRecord],
    year_filter: Optional[int] = None,
    industry_filter: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Transform GenAI adoption records to JSON using default processor."""
    processor = DataProcessor()
    return processor.transform_genai_adoption_to_json(records, year_filter, industry_filter)


def transform_aws_usage_to_json(
    records: List[AWSUsageRecord],
    year_filter: Optional[int] = None,
    industry_filter: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Transform AWS usage records to JSON using default processor."""
    processor = DataProcessor()
    return processor.transform_aws_usage_to_json(records, year_filter, industry_filter)


def calculate_correlation_analysis(
    genai_records: List[GenAIAdoptionRecord],
    aws_records: List[AWSUsageRecord],
    year_filter: Optional[int] = None
) -> CorrelationData:
    """Calculate correlation analysis using default processor."""
    processor = DataProcessor()
    return processor.calculate_correlation_analysis(genai_records, aws_records, year_filter)


def generate_insights(
    genai_records: List[GenAIAdoptionRecord],
    aws_records: List[AWSUsageRecord],
    growth_records: List[GrowthPredictionRecord],
    year_filter: Optional[int] = None,
    industry_filter: Optional[str] = None
) -> InsightData:
    """Generate insights using default processor."""
    processor = DataProcessor()
    return processor.generate_insights(genai_records, aws_records, growth_records, year_filter, industry_filter)