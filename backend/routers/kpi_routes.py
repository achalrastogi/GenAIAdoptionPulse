"""
KPI (Key Performance Indicator) API routes for GenAI Adoption Pulse.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from services.data_loader import DataLoader, CSVLoadingError
from services.kpi_service import KPIService
from utils.error_handlers import (
    validate_year_parameter,
    validate_industry_parameter,
    DataNotFoundError,
    DataProcessingError
)

router = APIRouter(prefix="/api/v1", tags=["kpi"])

# Initialize services
data_loader = DataLoader("../data")
kpi_service = KPIService(data_loader)


@router.get("/kpis")
async def get_all_kpis(
    year: Optional[int] = Query(None, description="Filter by specific year"),
    industry: Optional[str] = Query(None, description="Filter by specific industry")
):
    """Get all KPI metrics for the dashboard"""
    try:
        # Validate parameters
        if year is not None:
            validate_year_parameter(year)
        
        if industry is not None:
            # Load metadata to validate industry
            _, metadata = data_loader.load_genai_adoption_data()
            validate_industry_parameter(industry, metadata.industries)
        
        # Compute KPIs
        kpis = kpi_service.compute_all_kpis(year_filter=year, industry_filter=industry)
        
        return {
            "success": True,
            "data": kpis,
            "message": "KPIs computed successfully"
        }
        
    except (CSVLoadingError, DataNotFoundError, DataProcessingError) as e:
        raise e
    except Exception as e:
        raise DataProcessingError(f"Unexpected error computing KPIs: {str(e)}")


@router.get("/kpis/total-industries")
async def get_total_industries(
    year: Optional[int] = Query(None, description="Filter by specific year"),
    industry: Optional[str] = Query(None, description="Filter by specific industry")
):
    """Get total number of unique industries"""
    try:
        if year is not None:
            validate_year_parameter(year)
        
        kpis = kpi_service.compute_all_kpis(year_filter=year, industry_filter=industry)
        
        return {
            "success": True,
            "data": {
                "total_industries": kpis["total_industries"],
                "computed_at": kpis["computed_at"]
            }
        }
        
    except Exception as e:
        raise DataProcessingError(f"Error computing total industries: {str(e)}")


@router.get("/kpis/avg-adoption")
async def get_avg_adoption(
    year: Optional[int] = Query(None, description="Filter by specific year"),
    industry: Optional[str] = Query(None, description="Filter by specific industry")
):
    """Get average adoption rate"""
    try:
        if year is not None:
            validate_year_parameter(year)
        
        kpis = kpi_service.compute_all_kpis(year_filter=year, industry_filter=industry)
        
        return {
            "success": True,
            "data": {
                "avg_adoption": kpis["avg_adoption"],
                "computed_at": kpis["computed_at"]
            }
        }
        
    except Exception as e:
        raise DataProcessingError(f"Error computing average adoption: {str(e)}")


@router.get("/kpis/total-investment")
async def get_total_investment(
    year: Optional[int] = Query(None, description="Filter by specific year"),
    industry: Optional[str] = Query(None, description="Filter by specific industry")
):
    """Get total investment amount"""
    try:
        if year is not None:
            validate_year_parameter(year)
        
        kpis = kpi_service.compute_all_kpis(year_filter=year, industry_filter=industry)
        
        return {
            "success": True,
            "data": {
                "total_investment": kpis["total_investment"],
                "computed_at": kpis["computed_at"]
            }
        }
        
    except Exception as e:
        raise DataProcessingError(f"Error computing total investment: {str(e)}")


@router.get("/kpis/top-industry")
async def get_top_industry(
    year: Optional[int] = Query(None, description="Filter by specific year"),
    industry: Optional[str] = Query(None, description="Filter by specific industry")
):
    """Get top performing industry"""
    try:
        if year is not None:
            validate_year_parameter(year)
        
        kpis = kpi_service.compute_all_kpis(year_filter=year, industry_filter=industry)
        
        return {
            "success": True,
            "data": {
                "top_industry": kpis["top_industry"],
                "computed_at": kpis["computed_at"]
            }
        }
        
    except Exception as e:
        raise DataProcessingError(f"Error computing top industry: {str(e)}")


@router.get("/kpis/fastest-growing")
async def get_fastest_growing_industry(
    year: Optional[int] = Query(None, description="Filter by specific year"),
    industry: Optional[str] = Query(None, description="Filter by specific industry")
):
    """Get fastest growing industry"""
    try:
        if year is not None:
            validate_year_parameter(year)
        
        kpis = kpi_service.compute_all_kpis(year_filter=year, industry_filter=industry)
        
        return {
            "success": True,
            "data": {
                "fastest_growing_industry": kpis["fastest_growing_industry"],
                "computed_at": kpis["computed_at"]
            }
        }
        
    except Exception as e:
        raise DataProcessingError(f"Error computing fastest growing industry: {str(e)}")