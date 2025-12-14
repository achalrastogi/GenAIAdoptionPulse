"""
Enhanced Insights API routes for GenAI Adoption Pulse.
"""
from fastapi import APIRouter, HTTPException, Query, Response
from typing import Optional, List
import csv
import io
from services.data_loader import DataLoader, CSVLoadingError
from services.insights_engine import InsightsEngine, InsightObject
from utils.error_handlers import (
    validate_year_parameter,
    validate_industry_parameter,
    DataNotFoundError,
    DataProcessingError
)

router = APIRouter(prefix="/api/v1", tags=["insights"])

# Initialize services
data_loader = DataLoader("../data")
insights_engine = InsightsEngine(data_loader)


@router.get("/insights")
async def get_insights(
    years: Optional[str] = Query(None, description="Comma-separated list of years (e.g., '2022,2023')"),
    industries: Optional[str] = Query(None, description="Comma-separated list of industries")
):
    """Get enhanced insights with statistical analysis and confidence scoring"""
    try:
        # Parse filter parameters
        year_list = None
        if years:
            try:
                year_list = [int(year.strip()) for year in years.split(',')]
                for year in year_list:
                    validate_year_parameter(year)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid year format")
        
        industry_list = None
        if industries:
            industry_list = [industry.strip() for industry in industries.split(',')]
            # Validate industries against available data
            _, metadata = data_loader.load_genai_adoption_data()
            for industry in industry_list:
                validate_industry_parameter(industry, metadata.industries)
        
        # Generate insights
        insights = insights_engine.generate_insights(years=year_list, industries=industry_list)
        
        # Convert InsightObject instances to dictionaries
        insights_data = []
        for insight in insights:
            insights_data.append({
                "id": insight.id,
                "title": insight.title,
                "short_text": insight.short_text,
                "details": insight.details,
                "confidence": insight.confidence,
                "data_slice_url": insight.data_slice_url,
                "computed_at": insight.computed_at,
                "category": insight.category,
                "statistical_data": insight.statistical_data
            })
        
        return {
            "success": True,
            "data": insights_data,
            "metadata": {
                "total_insights": len(insights_data),
                "filters_applied": {
                    "years": year_list,
                    "industries": industry_list
                },
                "categories": list(set(insight.category for insight in insights))
            }
        }
        
    except (CSVLoadingError, DataNotFoundError, DataProcessingError) as e:
        raise e
    except Exception as e:
        raise DataProcessingError(f"Unexpected error generating insights: {str(e)}")


@router.get("/insights/{insight_id}/export")
async def export_insight_data(insight_id: str):
    """Export data slice for a specific insight as CSV"""
    try:
        # For this implementation, we'll generate a sample CSV based on the insight ID
        # In a real implementation, this would fetch the actual data slice
        
        # Parse insight metadata from ID (simplified approach)
        if "adoption_leader" in insight_id:
            # Generate adoption data CSV
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write headers
            writer.writerow(["Industry", "Year", "Adoption_Rate", "Investment_Millions", "Use_Cases_Count"])
            
            # Load actual data for export
            genai_records, _ = data_loader.load_genai_adoption_data()
            
            # Write data rows (limit to relevant subset)
            for record in genai_records[:20]:  # Limit for demo
                writer.writerow([
                    record.industry.value,
                    record.year,
                    record.adoption_rate,
                    record.investment_millions,
                    record.use_cases_count
                ])
            
            csv_content = output.getvalue()
            output.close()
            
            return Response(
                content=csv_content,
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=insight_{insight_id}_data.csv"}
            )
        
        elif "correlation" in insight_id:
            # Generate correlation data CSV
            output = io.StringIO()
            writer = csv.writer(output)
            
            writer.writerow(["Industry", "Year", "GenAI_Adoption", "AWS_Usage_Score", "Correlation_Strength"])
            
            # Load and process correlation data
            genai_records, _ = data_loader.load_genai_adoption_data()
            aws_records, _ = data_loader.load_aws_usage_data()
            
            # Match records and export correlation data
            genai_lookup = {(r.industry.value, r.year): r for r in genai_records}
            aws_lookup = {(r.industry.value, r.year): r for r in aws_records}
            
            for key in list(genai_lookup.keys())[:15]:  # Limit for demo
                if key in aws_lookup:
                    genai_record = genai_lookup[key]
                    aws_record = aws_lookup[key]
                    
                    aws_score = (aws_record.bedrock_usage * 0.3 + 
                               aws_record.sagemaker_usage * 0.3 +
                               aws_record.lambda_usage * 0.2 +
                               aws_record.s3_usage * 0.1 +
                               aws_record.ec2_usage * 0.1)
                    
                    writer.writerow([
                        genai_record.industry.value,
                        genai_record.year,
                        genai_record.adoption_rate,
                        aws_score,
                        "Moderate"  # Simplified correlation strength
                    ])
            
            csv_content = output.getvalue()
            output.close()
            
            return Response(
                content=csv_content,
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=insight_{insight_id}_correlation.csv"}
            )
        
        else:
            # Generic data export
            output = io.StringIO()
            writer = csv.writer(output)
            
            writer.writerow(["Insight_ID", "Category", "Export_Type", "Generated_At"])
            writer.writerow([insight_id, "Generic", "Sample_Export", "2024-12-14T13:00:00Z"])
            
            csv_content = output.getvalue()
            output.close()
            
            return Response(
                content=csv_content,
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=insight_{insight_id}_export.csv"}
            )
        
    except Exception as e:
        raise DataProcessingError(f"Error exporting insight data: {str(e)}")


@router.get("/data/slice")
async def get_data_slice(
    industry: Optional[str] = Query(None, description="Filter by industry"),
    year: Optional[int] = Query(None, description="Filter by year"),
    metric: Optional[str] = Query(None, description="Metric type (adoption, correlation, growth, investment)")
):
    """Get data slice for drill-down analysis"""
    try:
        # Validate parameters
        if year is not None:
            validate_year_parameter(year)
        
        if industry is not None:
            _, metadata = data_loader.load_genai_adoption_data()
            validate_industry_parameter(industry, metadata.industries)
        
        # Load and filter data based on metric type
        if metric == "adoption" or metric is None:
            genai_records, _ = data_loader.load_genai_adoption_data()
            
            # Apply filters
            filtered_records = []
            for record in genai_records:
                if year and record.year != year:
                    continue
                if industry and record.industry.value != industry:
                    continue
                filtered_records.append(record)
            
            # Convert to JSON
            data_slice = []
            for record in filtered_records:
                data_slice.append({
                    "industry": record.industry.value,
                    "year": record.year,
                    "adoption_rate": record.adoption_rate,
                    "investment_millions": record.investment_millions,
                    "use_cases_count": record.use_cases_count
                })
            
            return {
                "success": True,
                "data": data_slice,
                "metadata": {
                    "metric": metric or "adoption",
                    "total_records": len(data_slice),
                    "filters": {
                        "industry": industry,
                        "year": year
                    }
                }
            }
        
        else:
            # For other metrics, return placeholder data
            return {
                "success": True,
                "data": [],
                "metadata": {
                    "metric": metric,
                    "total_records": 0,
                    "message": f"Data slice for metric '{metric}' not yet implemented"
                }
            }
        
    except Exception as e:
        raise DataProcessingError(f"Error retrieving data slice: {str(e)}")