"""
KPI (Key Performance Indicator) service for GenAI Adoption Pulse.

This module provides functions to compute and serve key metrics across the GenAI adoption dataset.
"""
import logging
import statistics
from typing import Dict, Any, List, Optional
from collections import defaultdict
from datetime import datetime

from models.csv_models import GenAIAdoptionRecord, AWSUsageRecord
from services.data_loader import DataLoader

logger = logging.getLogger(__name__)


class KPIService:
    """Service class for computing KPI metrics."""
    
    def __init__(self, data_loader: DataLoader):
        """Initialize KPI service with data loader."""
        self.data_loader = data_loader
        self.logger = logging.getLogger(__name__)
    
    def compute_all_kpis(
        self,
        year_filter: Optional[int] = None,
        industry_filter: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Compute all KPI metrics for the dashboard.
        
        Args:
            year_filter: Optional year filter
            industry_filter: Optional industry filter
            
        Returns:
            Dictionary containing all KPI values
        """
        self.logger.info(f"Computing KPIs with filters: year={year_filter}, industry={industry_filter}")
        
        # Load data
        genai_records, _ = self.data_loader.load_genai_adoption_data()
        aws_records, _ = self.data_loader.load_aws_usage_data()
        
        # Apply filters
        filtered_genai = self._apply_filters(genai_records, year_filter, industry_filter)
        filtered_aws = self._apply_filters(aws_records, year_filter, industry_filter)
        
        # Compute individual KPIs
        kpis = {
            "total_industries": self._compute_total_industries(filtered_genai),
            "avg_adoption": self._compute_avg_adoption(filtered_genai),
            "total_investment": self._compute_total_investment(filtered_genai),
            "top_industry": self._compute_top_industry(filtered_genai),
            "fastest_growing_industry": self._compute_fastest_growing_industry(genai_records, year_filter, industry_filter),
            "computed_at": datetime.utcnow().isoformat(),
            "filters_applied": {
                "year": year_filter,
                "industry": industry_filter
            }
        }
        
        self.logger.info(f"Computed KPIs: {len(kpis)} metrics")
        return kpis
    
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
    
    def _compute_total_industries(self, records: List[GenAIAdoptionRecord]) -> int:
        """Compute total number of unique industries."""
        if not records:
            return 0
        
        unique_industries = set(record.industry.value for record in records)
        return len(unique_industries)
    
    def _compute_avg_adoption(self, records: List[GenAIAdoptionRecord]) -> float:
        """Compute average adoption rate across all records."""
        if not records:
            return 0.0
        
        adoption_rates = [record.adoption_rate for record in records]
        return round(statistics.mean(adoption_rates), 3)
    
    def _compute_total_investment(self, records: List[GenAIAdoptionRecord]) -> float:
        """Compute total investment across all records."""
        if not records:
            return 0.0
        
        total = sum(record.investment_millions for record in records)
        return round(total, 1)
    
    def _compute_top_industry(self, records: List[GenAIAdoptionRecord]) -> Dict[str, Any]:
        """Compute the industry with highest average adoption rate."""
        if not records:
            return {"industry": None, "adoption_rate": 0.0}
        
        # Group by industry
        industry_adoption = defaultdict(list)
        for record in records:
            industry_adoption[record.industry.value].append(record.adoption_rate)
        
        # Calculate averages
        industry_averages = {
            industry: statistics.mean(rates)
            for industry, rates in industry_adoption.items()
        }
        
        # Find top industry
        top_industry = max(industry_averages, key=industry_averages.get)
        top_rate = industry_averages[top_industry]
        
        return {
            "industry": top_industry,
            "adoption_rate": round(top_rate, 3)
        }
    
    def _compute_fastest_growing_industry(
        self,
        all_records: List[GenAIAdoptionRecord],
        year_filter: Optional[int] = None,
        industry_filter: Optional[str] = None
    ) -> Dict[str, Any]:
        """Compute the industry with fastest growth rate."""
        if not all_records:
            return {"industry": None, "growth_rate": 0.0}
        
        # Group by industry and year
        industry_year_data = defaultdict(lambda: defaultdict(list))
        for record in all_records:
            # Apply industry filter if specified
            if industry_filter and record.industry.value != industry_filter:
                continue
            
            industry_year_data[record.industry.value][record.year].append(record.adoption_rate)
        
        # Calculate growth rates
        industry_growth_rates = {}
        for industry, year_data in industry_year_data.items():
            years = sorted(year_data.keys())
            if len(years) < 2:
                continue
            
            # Calculate year-over-year growth
            growth_rates = []
            for i in range(1, len(years)):
                prev_year = years[i-1]
                curr_year = years[i]
                
                # Apply year filter if specified (only include growth ending in that year)
                if year_filter and curr_year != year_filter:
                    continue
                
                prev_avg = statistics.mean(year_data[prev_year])
                curr_avg = statistics.mean(year_data[curr_year])
                
                if prev_avg > 0:
                    growth_rate = (curr_avg - prev_avg) / prev_avg
                    growth_rates.append(growth_rate)
            
            if growth_rates:
                industry_growth_rates[industry] = statistics.mean(growth_rates)
        
        if not industry_growth_rates:
            return {"industry": None, "growth_rate": 0.0}
        
        # Find fastest growing industry
        fastest_industry = max(industry_growth_rates, key=industry_growth_rates.get)
        fastest_rate = industry_growth_rates[fastest_industry]
        
        return {
            "industry": fastest_industry,
            "growth_rate": round(fastest_rate, 3)
        }


# Convenience function for direct usage
def compute_kpis(
    year_filter: Optional[int] = None,
    industry_filter: Optional[str] = None
) -> Dict[str, Any]:
    """Compute KPIs using default data loader."""
    data_loader = DataLoader("../data")
    kpi_service = KPIService(data_loader)
    return kpi_service.compute_all_kpis(year_filter, industry_filter)