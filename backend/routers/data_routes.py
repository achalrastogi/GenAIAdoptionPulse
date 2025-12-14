from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from services.data_loader import DataLoader, CSVLoadingError
from services.data_processor import DataProcessor
from utils.error_handlers import (
    validate_year_parameter,
    validate_industry_parameter,
    validate_year_range_parameter,
    create_success_response,
    DataNotFoundError,
    DataProcessingError
)
from models.api_models import DataResponse, CorrelationResponse, InsightsResponse

router = APIRouter(prefix="/api/v1", tags=["data"])

# Initialize services
data_loader = DataLoader("../data")  # Data directory is at root level
data_processor = DataProcessor()

@router.get("/genai-adoption", response_model=DataResponse)
async def get_genai_adoption(
    year: Optional[int] = Query(None, description="Filter by specific year"),
    industry: Optional[str] = Query(None, description="Filter by specific industry")
):
    """Get GenAI adoption data by industry and year"""
    try:
        # Validate parameters
        if year is not None:
            validate_year_parameter(year)
        
        # Load data
        records, metadata = data_loader.load_genai_adoption_data()
        
        # Validate industry parameter against available industries
        if industry is not None:
            available_industries = metadata.industries
            validate_industry_parameter(industry, available_industries)
        
        # Transform to JSON with filters
        json_data = data_processor.transform_genai_adoption_to_json(
            records, year_filter=year, industry_filter=industry
        )
        
        # Check if any data was found
        if not json_data:
            raise DataNotFoundError(
                f"No GenAI adoption data found for the specified filters (year: {year}, industry: {industry})"
            )
        
        response_metadata = {
            "total_records": len(json_data),
            "source_file": metadata.filename,
            "available_years": list(range(metadata.date_range[0], metadata.date_range[1] + 1)) if metadata.date_range else [],
            "available_industries": metadata.industries,
            "filters_applied": {
                "year": year,
                "industry": industry
            }
        }
        
        return create_success_response(json_data, response_metadata)
        
    except (CSVLoadingError, DataNotFoundError, DataProcessingError) as e:
        # Re-raise known exceptions to be handled by exception handlers
        raise e
    except Exception as e:
        raise DataProcessingError(f"Unexpected error processing GenAI adoption data: {str(e)}")

@router.get("/aws-usage", response_model=DataResponse)
async def get_aws_usage(
    year: Optional[int] = Query(None, description="Filter by specific year"),
    industry: Optional[str] = Query(None, description="Filter by specific industry")
):
    """Get AWS service usage data by industry"""
    try:
        # Validate parameters
        if year is not None:
            validate_year_parameter(year)
        
        # Load data
        records, metadata = data_loader.load_aws_usage_data()
        
        # Validate industry parameter against available industries
        if industry is not None:
            available_industries = metadata.industries
            validate_industry_parameter(industry, available_industries)
        
        # Transform to JSON with filters
        json_data = data_processor.transform_aws_usage_to_json(
            records, year_filter=year, industry_filter=industry
        )
        
        # Check if any data was found
        if not json_data:
            raise DataNotFoundError(
                f"No AWS usage data found for the specified filters (year: {year}, industry: {industry})"
            )
        
        response_metadata = {
            "total_records": len(json_data),
            "source_file": metadata.filename,
            "available_years": list(range(metadata.date_range[0], metadata.date_range[1] + 1)) if metadata.date_range else [],
            "available_industries": metadata.industries,
            "filters_applied": {
                "year": year,
                "industry": industry
            }
        }
        
        return create_success_response(json_data, response_metadata)
        
    except (CSVLoadingError, DataNotFoundError, DataProcessingError) as e:
        # Re-raise known exceptions to be handled by exception handlers
        raise e
    except Exception as e:
        raise DataProcessingError(f"Unexpected error processing AWS usage data: {str(e)}")

@router.get("/growth-predictions", response_model=DataResponse)
async def get_growth_predictions(
    year_range: Optional[str] = Query(None, description="Filter by year range (e.g., '2024-2026')")
):
    """Get GenAI growth prediction data"""
    try:
        # Load data
        records, metadata = data_loader.load_growth_prediction_data()
        
        # Parse and validate year range if provided
        year_range_tuple = None
        if year_range:
            start_year, end_year = validate_year_range_parameter(year_range)
            year_range_tuple = (start_year, end_year)
        
        # Transform to JSON with filters
        json_data = data_processor.transform_growth_predictions_to_json(
            records, year_range=year_range_tuple
        )
        
        # Check if any data was found
        if not json_data:
            raise DataNotFoundError(
                f"No growth prediction data found for the specified year range: {year_range}"
            )
        
        response_metadata = {
            "total_records": len(json_data),
            "source_file": metadata.filename,
            "available_years": list(range(metadata.date_range[0], metadata.date_range[1] + 1)) if metadata.date_range else [],
            "available_industries": metadata.industries,
            "filters_applied": {
                "year_range": year_range
            }
        }
        
        return create_success_response(json_data, response_metadata)
        
    except (CSVLoadingError, DataNotFoundError, DataProcessingError) as e:
        # Re-raise known exceptions to be handled by exception handlers
        raise e
    except Exception as e:
        raise DataProcessingError(f"Unexpected error processing growth prediction data: {str(e)}")

@router.get("/correlation-data", response_model=CorrelationResponse)
async def get_correlation_data(
    year: Optional[int] = Query(None, description="Filter by specific year")
):
    """Get correlation analysis between GenAI adoption and AWS usage"""
    try:
        # Validate parameters
        if year is not None:
            validate_year_parameter(year)
        
        # Load both datasets
        genai_records, genai_metadata = data_loader.load_genai_adoption_data()
        aws_records, aws_metadata = data_loader.load_aws_usage_data()
        
        # Check if datasets are available
        if not genai_records:
            raise DataNotFoundError("No GenAI adoption data available for correlation analysis")
        if not aws_records:
            raise DataNotFoundError("No AWS usage data available for correlation analysis")
        
        # Calculate correlation
        correlation_data = data_processor.calculate_correlation_analysis(
            genai_records, aws_records, year_filter=year
        )
        
        # Check if correlation could be calculated
        if correlation_data.sample_size == 0:
            raise DataNotFoundError(
                f"No matching data found for correlation analysis (year filter: {year})"
            )
        
        response_metadata = {
            "year_filter": year,
            "analysis_type": "pearson_correlation",
            "genai_source": genai_metadata.filename,
            "aws_source": aws_metadata.filename,
            "available_years": list(set(
                list(range(genai_metadata.date_range[0], genai_metadata.date_range[1] + 1)) +
                list(range(aws_metadata.date_range[0], aws_metadata.date_range[1] + 1))
            )) if genai_metadata.date_range and aws_metadata.date_range else []
        }
        
        return CorrelationResponse(
            correlation_coefficient=correlation_data.correlation_coefficient,
            data_points=correlation_data.data_points,
            statistical_significance=correlation_data.statistical_significance,
            sample_size=correlation_data.sample_size,
            metadata=response_metadata
        )
        
    except (CSVLoadingError, DataNotFoundError, DataProcessingError) as e:
        # Re-raise known exceptions to be handled by exception handlers
        raise e
    except Exception as e:
        raise DataProcessingError(f"Unexpected error calculating correlation data: {str(e)}")

@router.get("/insights", response_model=InsightsResponse)
async def get_insights(
    year: Optional[int] = Query(None, description="Filter by specific year"),
    industry: Optional[str] = Query(None, description="Filter by specific industry")
):
    """Get generated insights and key findings"""
    try:
        # Validate parameters
        if year is not None:
            validate_year_parameter(year)
        
        # Load all datasets
        genai_records, genai_metadata = data_loader.load_genai_adoption_data()
        aws_records, aws_metadata = data_loader.load_aws_usage_data()
        growth_records, growth_metadata = data_loader.load_growth_prediction_data()
        
        # Validate industry parameter against available industries
        if industry is not None:
            # Get all unique industries from all datasets
            all_industries = list(set(
                genai_metadata.industries + 
                aws_metadata.industries + 
                growth_metadata.industries
            ))
            validate_industry_parameter(industry, all_industries)
        
        # Check if datasets are available
        if not genai_records and not aws_records and not growth_records:
            raise DataNotFoundError("No data available for insights generation")
        
        # Generate insights
        insights = data_processor.generate_insights(
            genai_records, aws_records, growth_records,
            year_filter=year, industry_filter=industry
        )
        
        # Check if insights were generated
        if not insights.key_findings and not insights.top_industries and not insights.growth_trends:
            raise DataNotFoundError(
                f"No insights could be generated for the specified filters (year: {year}, industry: {industry})"
            )
        
        from datetime import datetime
        response_metadata = {
            "filters_applied": {
                "year": year,
                "industry": industry
            },
            "data_sources": {
                "genai_adoption": genai_metadata.filename,
                "aws_usage": aws_metadata.filename,
                "growth_predictions": growth_metadata.filename
            },
            "generated_at": datetime.utcnow().isoformat(),
            "available_industries": list(set(
                genai_metadata.industries + 
                aws_metadata.industries + 
                growth_metadata.industries
            ))
        }
        
        return InsightsResponse(
            key_findings=insights.key_findings,
            top_industries=insights.top_industries,
            growth_trends=insights.growth_trends,
            recommendations=insights.recommendations,
            summary_statistics=insights.summary_statistics,
            metadata=response_metadata
        )
        
    except (CSVLoadingError, DataNotFoundError, DataProcessingError) as e:
        # Re-raise known exceptions to be handled by exception handlers
        raise e
    except Exception as e:
        raise DataProcessingError(f"Unexpected error generating insights: {str(e)}")