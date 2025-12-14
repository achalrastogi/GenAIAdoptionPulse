"""
API response models for the GenAI Dashboard.

This module defines Pydantic models for API responses, error handling,
and data validation.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class ErrorDetail(BaseModel):
    """Model for detailed error information."""
    field: Optional[str] = Field(None, description="Field that caused the error")
    message: str = Field(..., description="Error message")
    code: Optional[str] = Field(None, description="Error code")


class ErrorResponse(BaseModel):
    """Standard error response model."""
    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Human-readable error message")
    details: Optional[List[ErrorDetail]] = Field(None, description="Detailed error information")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat(), description="Error timestamp")
    path: Optional[str] = Field(None, description="API path that caused the error")


class ValidationErrorResponse(ErrorResponse):
    """Error response for validation failures."""
    error: str = Field(default="validation_error", description="Error type")
    invalid_fields: List[str] = Field(default_factory=list, description="List of invalid fields")


class DataResponse(BaseModel):
    """Generic data response wrapper."""
    data: List[Dict[str, Any]] = Field(..., description="Response data")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Response metadata")


class CorrelationResponse(BaseModel):
    """Response model for correlation analysis."""
    correlation_coefficient: float = Field(..., description="Pearson correlation coefficient")
    data_points: List[Dict[str, Any]] = Field(..., description="Data points used in analysis")
    statistical_significance: float = Field(..., description="Statistical significance (p-value)")
    sample_size: int = Field(..., description="Number of data points analyzed")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Analysis metadata")


class InsightsResponse(BaseModel):
    """Response model for generated insights."""
    key_findings: List[str] = Field(..., description="Key findings from data analysis")
    top_industries: List[Dict[str, Any]] = Field(..., description="Top performing industries")
    growth_trends: List[str] = Field(..., description="Growth trend insights")
    recommendations: List[str] = Field(..., description="Strategic recommendations")
    summary_statistics: Dict[str, Any] = Field(..., description="Summary statistics")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Insights metadata")


class HealthResponse(BaseModel):
    """Response model for health check."""
    status: str = Field(..., description="Service status")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat(), description="Health check timestamp")
    version: str = Field(default="1.0.0", description="API version")
    dependencies: Dict[str, str] = Field(default_factory=dict, description="Dependency status")