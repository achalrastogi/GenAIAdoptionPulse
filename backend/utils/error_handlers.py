"""
Error handling utilities for the GenAI Dashboard API.

This module provides custom exception handlers and error response utilities.
"""
import logging
from typing import Dict, Any, List
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from models.api_models import ErrorResponse, ValidationErrorResponse, ErrorDetail
from services.data_loader import CSVLoadingError

logger = logging.getLogger(__name__)


class APIError(Exception):
    """Base exception for API errors."""
    
    def __init__(self, message: str, status_code: int = 500, details: List[ErrorDetail] = None):
        self.message = message
        self.status_code = status_code
        self.details = details or []
        super().__init__(self.message)


class DataNotFoundError(APIError):
    """Exception for when requested data is not found."""
    
    def __init__(self, message: str = "Requested data not found", details: List[ErrorDetail] = None):
        super().__init__(message, status_code=404, details=details)


class DataValidationError(APIError):
    """Exception for data validation failures."""
    
    def __init__(self, message: str = "Data validation failed", details: List[ErrorDetail] = None):
        super().__init__(message, status_code=422, details=details)


class DataProcessingError(APIError):
    """Exception for data processing failures."""
    
    def __init__(self, message: str = "Data processing failed", details: List[ErrorDetail] = None):
        super().__init__(message, status_code=500, details=details)


async def api_error_handler(request: Request, exc: APIError) -> JSONResponse:
    """Handle custom API errors."""
    logger.error(f"API Error: {exc.message} - Path: {request.url.path}")
    
    error_response = ErrorResponse(
        error="api_error",
        message=exc.message,
        details=exc.details,
        path=str(request.url.path)
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.dict()
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle FastAPI HTTP exceptions."""
    logger.error(f"HTTP Exception: {exc.detail} - Status: {exc.status_code} - Path: {request.url.path}")
    
    error_response = ErrorResponse(
        error="http_error",
        message=exc.detail,
        path=str(request.url.path)
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.dict()
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle request validation errors."""
    logger.error(f"Validation Error: {exc.errors()} - Path: {request.url.path}")
    
    # Extract field names and error details
    details = []
    invalid_fields = []
    
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"])
        message = error["msg"]
        error_type = error["type"]
        
        details.append(ErrorDetail(
            field=field,
            message=message,
            code=error_type
        ))
        invalid_fields.append(field)
    
    error_response = ValidationErrorResponse(
        message="Request validation failed",
        details=details,
        invalid_fields=invalid_fields,
        path=str(request.url.path)
    )
    
    return JSONResponse(
        status_code=422,
        content=error_response.dict()
    )


async def csv_loading_error_handler(request: Request, exc: CSVLoadingError) -> JSONResponse:
    """Handle CSV loading errors."""
    logger.error(f"CSV Loading Error: {str(exc)} - Path: {request.url.path}")
    
    error_response = ErrorResponse(
        error="data_loading_error",
        message=f"Failed to load data: {str(exc)}",
        path=str(request.url.path)
    )
    
    return JSONResponse(
        status_code=500,
        content=error_response.dict()
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unexpected exceptions."""
    logger.error(f"Unexpected Error: {str(exc)} - Path: {request.url.path}", exc_info=True)
    
    error_response = ErrorResponse(
        error="internal_server_error",
        message="An unexpected error occurred. Please try again later.",
        path=str(request.url.path)
    )
    
    return JSONResponse(
        status_code=500,
        content=error_response.dict()
    )


def validate_year_parameter(year: int) -> None:
    """Validate year parameter."""
    current_year = 2023  # In production, use datetime.now().year
    if year < 2020 or year > current_year + 10:
        raise DataValidationError(
            f"Year must be between 2020 and {current_year + 10}",
            details=[ErrorDetail(
                field="year",
                message=f"Year {year} is outside valid range (2020-{current_year + 10})",
                code="invalid_year_range"
            )]
        )


def validate_industry_parameter(industry: str, valid_industries: List[str]) -> None:
    """Validate industry parameter."""
    if industry.lower() not in [ind.lower() for ind in valid_industries]:
        raise DataValidationError(
            f"Invalid industry: {industry}",
            details=[ErrorDetail(
                field="industry",
                message=f"Industry '{industry}' not found. Valid industries: {', '.join(valid_industries)}",
                code="invalid_industry"
            )]
        )


def validate_year_range_parameter(year_range: str) -> tuple:
    """Validate and parse year range parameter."""
    try:
        start_year, end_year = map(int, year_range.split('-'))
        
        if start_year > end_year:
            raise DataValidationError(
                "Start year must be less than or equal to end year",
                details=[ErrorDetail(
                    field="year_range",
                    message=f"Invalid range: {start_year} > {end_year}",
                    code="invalid_year_range_order"
                )]
            )
        
        # Validate individual years
        validate_year_parameter(start_year)
        validate_year_parameter(end_year)
        
        return start_year, end_year
        
    except ValueError:
        raise DataValidationError(
            "Invalid year range format",
            details=[ErrorDetail(
                field="year_range",
                message="Year range must be in format 'YYYY-YYYY' (e.g., '2023-2025')",
                code="invalid_year_range_format"
            )]
        )


def create_success_response(data: Any, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
    """Create a standardized success response."""
    response = {
        "data": data,
        "metadata": metadata or {}
    }
    
    # Add default metadata
    if "timestamp" not in response["metadata"]:
        from datetime import datetime
        response["metadata"]["timestamp"] = datetime.utcnow().isoformat()
    
    return response