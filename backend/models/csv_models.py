"""
Pydantic models for CSV data validation and schema definition.
"""
from typing import List
from pydantic import BaseModel, Field, validator
from enum import Enum


class IndustryEnum(str, Enum):
    """Valid industry types."""
    HEALTHCARE = "Healthcare"
    FINANCE = "Finance"
    MANUFACTURING = "Manufacturing"
    TECHNOLOGY = "Technology"
    RETAIL = "Retail"
    EDUCATION = "Education"
    ENERGY = "Energy"
    TRANSPORTATION = "Transportation"


class GenAIAdoptionRecord(BaseModel):
    """Model for GenAI adoption data records."""
    industry: IndustryEnum
    year: int = Field(..., ge=2020, le=2030, description="Year must be between 2020 and 2030")
    adoption_rate: float = Field(..., ge=0.0, le=1.0, description="Adoption rate must be between 0 and 1")
    use_cases_count: int = Field(..., ge=0, le=100, description="Use cases count must be between 0 and 100")
    investment_millions: float = Field(..., ge=0.0, le=10000.0, description="Investment must be between 0 and 10,000 million")

    @validator('adoption_rate')
    def validate_adoption_rate(cls, v):
        """Validate adoption rate is a reasonable percentage."""
        if not 0.0 <= v <= 1.0:
            raise ValueError('Adoption rate must be between 0.0 and 1.0')
        return v

    @validator('use_cases_count')
    def validate_use_cases_count(cls, v):
        """Validate use cases count is reasonable."""
        if v < 0 or v > 100:
            raise ValueError('Use cases count must be between 0 and 100')
        return v

    @validator('investment_millions')
    def validate_investment(cls, v):
        """Validate investment amount is reasonable."""
        if v < 0 or v > 10000:
            raise ValueError('Investment must be between 0 and 10,000 million')
        return v


class AWSUsageRecord(BaseModel):
    """Model for AWS service usage data records."""
    industry: IndustryEnum
    year: int = Field(..., ge=2020, le=2030, description="Year must be between 2020 and 2030")
    bedrock_usage: float = Field(..., ge=0.0, le=1.0, description="Bedrock usage must be between 0 and 1")
    sagemaker_usage: float = Field(..., ge=0.0, le=1.0, description="SageMaker usage must be between 0 and 1")
    lambda_usage: float = Field(..., ge=0.0, le=1.0, description="Lambda usage must be between 0 and 1")
    s3_usage: float = Field(..., ge=0.0, le=1.0, description="S3 usage must be between 0 and 1")
    ec2_usage: float = Field(..., ge=0.0, le=1.0, description="EC2 usage must be between 0 and 1")

    @validator('bedrock_usage', 'sagemaker_usage', 'lambda_usage', 's3_usage', 'ec2_usage')
    def validate_usage_rates(cls, v):
        """Validate all usage rates are between 0 and 1."""
        if not 0.0 <= v <= 1.0:
            raise ValueError('Usage rates must be between 0.0 and 1.0')
        return v


class GrowthPredictionRecord(BaseModel):
    """Model for GenAI growth prediction data records."""
    industry: IndustryEnum
    year: int = Field(..., ge=2024, le=2035, description="Prediction year must be between 2024 and 2035")
    predicted_adoption: float = Field(..., ge=0.0, le=1.0, description="Predicted adoption must be between 0 and 1")
    confidence_interval_low: float = Field(..., ge=0.0, le=1.0, description="Low confidence interval must be between 0 and 1")
    confidence_interval_high: float = Field(..., ge=0.0, le=1.0, description="High confidence interval must be between 0 and 1")

    @validator('predicted_adoption', 'confidence_interval_low', 'confidence_interval_high')
    def validate_prediction_rates(cls, v):
        """Validate all prediction rates are between 0 and 1."""
        if not 0.0 <= v <= 1.0:
            raise ValueError('Prediction rates must be between 0.0 and 1.0')
        return v

    @validator('confidence_interval_high')
    def validate_confidence_interval_order(cls, v, values):
        """Validate that high confidence interval is greater than or equal to low."""
        if 'confidence_interval_low' in values and v < values['confidence_interval_low']:
            raise ValueError('High confidence interval must be greater than or equal to low confidence interval')
        return v

    @validator('predicted_adoption')
    def validate_prediction_within_confidence(cls, v, values):
        """Validate that predicted adoption is within confidence intervals."""
        if 'confidence_interval_low' in values and 'confidence_interval_high' in values:
            if not values['confidence_interval_low'] <= v <= values['confidence_interval_high']:
                raise ValueError('Predicted adoption must be within confidence intervals')
        return v


class CSVValidationResult(BaseModel):
    """Result of CSV validation process."""
    is_valid: bool
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    records_processed: int = 0
    records_valid: int = 0
    records_invalid: int = 0


class DatasetMetadata(BaseModel):
    """Metadata for a loaded dataset."""
    filename: str
    record_count: int
    columns: List[str]
    date_range: tuple[int, int] = None
    industries: List[str] = Field(default_factory=list)
    validation_result: CSVValidationResult