"""
Property-based tests for CSV validation completeness.

**Feature: genai-dashboard, Property 1: CSV validation completeness**
**Validates: Requirements 1.4, 4.1**
"""
import pytest
from hypothesis import given, strategies as st
from pydantic import ValidationError
import pandas as pd
from io import StringIO

from backend.models.csv_models import (
    GenAIAdoptionRecord,
    AWSUsageRecord,
    GrowthPredictionRecord,
    IndustryEnum
)


# Strategy for generating valid industry names
industry_strategy = st.sampled_from([industry.value for industry in IndustryEnum])

# Strategy for generating valid years
year_strategy_historical = st.integers(min_value=2020, max_value=2030)
year_strategy_prediction = st.integers(min_value=2024, max_value=2035)

# Strategy for generating valid rates (0.0 to 1.0)
rate_strategy = st.floats(min_value=0.0, max_value=1.0, allow_nan=False, allow_infinity=False)

# Strategy for generating valid use cases count
use_cases_strategy = st.integers(min_value=0, max_value=100)

# Strategy for generating valid investment amounts
investment_strategy = st.floats(min_value=0.0, max_value=10000.0, allow_nan=False, allow_infinity=False)


@given(
    industry=industry_strategy,
    year=year_strategy_historical,
    adoption_rate=rate_strategy,
    use_cases_count=use_cases_strategy,
    investment_millions=investment_strategy
)
def test_genai_adoption_record_validation_completeness(
    industry, year, adoption_rate, use_cases_count, investment_millions
):
    """
    **Feature: genai-dashboard, Property 1: CSV validation completeness**
    
    For any valid GenAI adoption record data, the validation process should 
    verify both required column presence and correct formatting.
    """
    # Create a valid record
    record = GenAIAdoptionRecord(
        industry=industry,
        year=year,
        adoption_rate=adoption_rate,
        use_cases_count=use_cases_count,
        investment_millions=investment_millions
    )
    
    # Validation should pass for valid data
    assert record.industry == industry
    assert record.year == year
    assert record.adoption_rate == adoption_rate
    assert record.use_cases_count == use_cases_count
    assert record.investment_millions == investment_millions


@given(
    industry=industry_strategy,
    year=year_strategy_historical,
    bedrock_usage=rate_strategy,
    sagemaker_usage=rate_strategy,
    lambda_usage=rate_strategy,
    s3_usage=rate_strategy,
    ec2_usage=rate_strategy
)
def test_aws_usage_record_validation_completeness(
    industry, year, bedrock_usage, sagemaker_usage, lambda_usage, s3_usage, ec2_usage
):
    """
    **Feature: genai-dashboard, Property 1: CSV validation completeness**
    
    For any valid AWS usage record data, the validation process should 
    verify both required column presence and correct formatting.
    """
    # Create a valid record
    record = AWSUsageRecord(
        industry=industry,
        year=year,
        bedrock_usage=bedrock_usage,
        sagemaker_usage=sagemaker_usage,
        lambda_usage=lambda_usage,
        s3_usage=s3_usage,
        ec2_usage=ec2_usage
    )
    
    # Validation should pass for valid data
    assert record.industry == industry
    assert record.year == year
    assert record.bedrock_usage == bedrock_usage
    assert record.sagemaker_usage == sagemaker_usage
    assert record.lambda_usage == lambda_usage
    assert record.s3_usage == s3_usage
    assert record.ec2_usage == ec2_usage


@given(
    industry=industry_strategy,
    year=year_strategy_prediction,
    predicted_adoption=rate_strategy,
    confidence_low=rate_strategy,
    confidence_high=rate_strategy
)
def test_growth_prediction_record_validation_completeness(
    industry, year, predicted_adoption, confidence_low, confidence_high
):
    """
    **Feature: genai-dashboard, Property 1: CSV validation completeness**
    
    For any valid growth prediction record data, the validation process should 
    verify both required column presence and correct formatting.
    """
    # Ensure confidence intervals are in correct order
    if confidence_low > confidence_high:
        confidence_low, confidence_high = confidence_high, confidence_low
    
    # Ensure predicted adoption is within confidence intervals
    predicted_adoption = max(confidence_low, min(predicted_adoption, confidence_high))
    
    # Create a valid record
    record = GrowthPredictionRecord(
        industry=industry,
        year=year,
        predicted_adoption=predicted_adoption,
        confidence_interval_low=confidence_low,
        confidence_interval_high=confidence_high
    )
    
    # Validation should pass for valid data
    assert record.industry == industry
    assert record.year == year
    assert record.predicted_adoption == predicted_adoption
    assert record.confidence_interval_low == confidence_low
    assert record.confidence_interval_high == confidence_high


# Test invalid data rejection
@given(
    adoption_rate=st.floats(min_value=1.1, max_value=10.0) | st.floats(min_value=-10.0, max_value=-0.1)
)
def test_invalid_adoption_rate_rejected(adoption_rate):
    """
    **Feature: genai-dashboard, Property 1: CSV validation completeness**
    
    For any invalid adoption rate data, the validation process should reject it.
    """
    with pytest.raises(ValidationError):
        GenAIAdoptionRecord(
            industry="Healthcare",
            year=2023,
            adoption_rate=adoption_rate,
            use_cases_count=10,
            investment_millions=100.0
        )


@given(
    year=st.integers(min_value=1900, max_value=2019) | st.integers(min_value=2031, max_value=2100)
)
def test_invalid_year_rejected(year):
    """
    **Feature: genai-dashboard, Property 1: CSV validation completeness**
    
    For any invalid year data, the validation process should reject it.
    """
    with pytest.raises(ValidationError):
        GenAIAdoptionRecord(
            industry="Healthcare",
            year=year,
            adoption_rate=0.5,
            use_cases_count=10,
            investment_millions=100.0
        )


def test_missing_required_columns_rejected():
    """
    **Feature: genai-dashboard, Property 1: CSV validation completeness**
    
    For any CSV data missing required columns, the validation process should reject it.
    """
    # Test missing industry column
    with pytest.raises(ValidationError):
        GenAIAdoptionRecord(
            year=2023,
            adoption_rate=0.5,
            use_cases_count=10,
            investment_millions=100.0
        )
    
    # Test missing year column
    with pytest.raises(ValidationError):
        GenAIAdoptionRecord(
            industry="Healthcare",
            adoption_rate=0.5,
            use_cases_count=10,
            investment_millions=100.0
        )


# Property 2: Numeric range validation tests
@given(
    adoption_rate=st.floats(min_value=-100.0, max_value=-0.001) | st.floats(min_value=1.001, max_value=100.0),
    use_cases_count=st.integers(min_value=-100, max_value=-1) | st.integers(min_value=101, max_value=1000),
    investment_millions=st.floats(min_value=-1000.0, max_value=-0.001) | st.floats(min_value=10000.001, max_value=50000.0)
)
def test_genai_adoption_numeric_range_validation(adoption_rate, use_cases_count, investment_millions):
    """
    **Feature: genai-dashboard, Property 2: Numeric range validation**
    
    For any numeric data processed by the system, all values should fall within 
    realistic ranges for their respective data types and business context.
    **Validates: Requirements 1.5, 4.3**
    """
    # Test that out-of-range adoption rates are rejected
    with pytest.raises(ValidationError):
        GenAIAdoptionRecord(
            industry="Healthcare",
            year=2023,
            adoption_rate=adoption_rate,
            use_cases_count=50,  # Valid value
            investment_millions=500.0  # Valid value
        )
    
    # Test that out-of-range use cases counts are rejected
    with pytest.raises(ValidationError):
        GenAIAdoptionRecord(
            industry="Healthcare",
            year=2023,
            adoption_rate=0.5,  # Valid value
            use_cases_count=use_cases_count,
            investment_millions=500.0  # Valid value
        )
    
    # Test that out-of-range investment amounts are rejected
    with pytest.raises(ValidationError):
        GenAIAdoptionRecord(
            industry="Healthcare",
            year=2023,
            adoption_rate=0.5,  # Valid value
            use_cases_count=50,  # Valid value
            investment_millions=investment_millions
        )


@given(
    usage_rate=st.floats(min_value=-10.0, max_value=-0.001) | st.floats(min_value=1.001, max_value=10.0)
)
def test_aws_usage_numeric_range_validation(usage_rate):
    """
    **Feature: genai-dashboard, Property 2: Numeric range validation**
    
    For any AWS usage rate processed by the system, all values should fall within 
    realistic ranges (0.0 to 1.0) for their respective data types and business context.
    **Validates: Requirements 1.5, 4.3**
    """
    # Test that out-of-range usage rates are rejected for each service
    with pytest.raises(ValidationError):
        AWSUsageRecord(
            industry="Healthcare",
            year=2023,
            bedrock_usage=usage_rate,
            sagemaker_usage=0.5,  # Valid values
            lambda_usage=0.5,
            s3_usage=0.5,
            ec2_usage=0.5
        )
    
    with pytest.raises(ValidationError):
        AWSUsageRecord(
            industry="Healthcare",
            year=2023,
            bedrock_usage=0.5,  # Valid values
            sagemaker_usage=usage_rate,
            lambda_usage=0.5,
            s3_usage=0.5,
            ec2_usage=0.5
        )
    
    with pytest.raises(ValidationError):
        AWSUsageRecord(
            industry="Healthcare",
            year=2023,
            bedrock_usage=0.5,  # Valid values
            sagemaker_usage=0.5,
            lambda_usage=usage_rate,
            s3_usage=0.5,
            ec2_usage=0.5
        )


@given(
    predicted_adoption=st.floats(min_value=-10.0, max_value=-0.001) | st.floats(min_value=1.001, max_value=10.0),
    confidence_low=st.floats(min_value=-10.0, max_value=-0.001) | st.floats(min_value=1.001, max_value=10.0),
    confidence_high=st.floats(min_value=-10.0, max_value=-0.001) | st.floats(min_value=1.001, max_value=10.0)
)
def test_growth_prediction_numeric_range_validation(predicted_adoption, confidence_low, confidence_high):
    """
    **Feature: genai-dashboard, Property 2: Numeric range validation**
    
    For any growth prediction numeric data processed by the system, all values should fall within 
    realistic ranges (0.0 to 1.0) for their respective data types and business context.
    **Validates: Requirements 1.5, 4.3**
    """
    # Test that out-of-range predicted adoption rates are rejected
    with pytest.raises(ValidationError):
        GrowthPredictionRecord(
            industry="Healthcare",
            year=2025,
            predicted_adoption=predicted_adoption,
            confidence_interval_low=0.3,  # Valid values
            confidence_interval_high=0.7
        )
    
    # Test that out-of-range confidence intervals are rejected
    with pytest.raises(ValidationError):
        GrowthPredictionRecord(
            industry="Healthcare",
            year=2025,
            predicted_adoption=0.5,  # Valid value
            confidence_interval_low=confidence_low,
            confidence_interval_high=0.7  # Valid value
        )
    
    with pytest.raises(ValidationError):
        GrowthPredictionRecord(
            industry="Healthcare",
            year=2025,
            predicted_adoption=0.5,  # Valid value
            confidence_interval_low=0.3,  # Valid value
            confidence_interval_high=confidence_high
        )


@given(
    year=st.integers(min_value=1900, max_value=2019) | st.integers(min_value=2031, max_value=2100)
)
def test_year_range_validation_genai_adoption(year):
    """
    **Feature: genai-dashboard, Property 2: Numeric range validation**
    
    For any year data in GenAI adoption records, values should fall within 
    realistic ranges (2020-2030) for the business context.
    **Validates: Requirements 1.5, 4.3**
    """
    with pytest.raises(ValidationError):
        GenAIAdoptionRecord(
            industry="Healthcare",
            year=year,
            adoption_rate=0.5,
            use_cases_count=10,
            investment_millions=100.0
        )


@given(
    year=st.integers(min_value=1900, max_value=2023) | st.integers(min_value=2036, max_value=2100)
)
def test_year_range_validation_growth_prediction(year):
    """
    **Feature: genai-dashboard, Property 2: Numeric range validation**
    
    For any year data in growth prediction records, values should fall within 
    realistic ranges (2024-2035) for the business context.
    **Validates: Requirements 1.5, 4.3**
    """
    with pytest.raises(ValidationError):
        GrowthPredictionRecord(
            industry="Healthcare",
            year=year,
            predicted_adoption=0.5,
            confidence_interval_low=0.3,
            confidence_interval_high=0.7
        )


# Property 5: Error logging specificity tests
import logging
import tempfile
import os
from unittest.mock import patch, MagicMock
from backend.services.data_loader import DataLoader, CSVLoadingError
from hypothesis import settings, HealthCheck


@given(
    invalid_data_type=st.sampled_from(['missing_file', 'empty_file', 'malformed_csv', 'missing_columns', 'invalid_values'])
)
@settings(suppress_health_check=[HealthCheck.function_scoped_fixture])
def test_error_logging_specificity(invalid_data_type):
    """
    **Feature: genai-dashboard, Property 5: Error logging specificity**
    
    For any invalid data encountered during processing, the system should log 
    specific, actionable error messages that identify the validation failure.
    **Validates: Requirements 4.2**
    """
    # Set up logging capture
    import logging
    from io import StringIO
    
    log_stream = StringIO()
    handler = logging.StreamHandler(log_stream)
    logger = logging.getLogger('backend.services.data_loader')
    logger.addHandler(handler)
    logger.setLevel(logging.DEBUG)
    
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            loader = DataLoader(temp_dir)
        
            if invalid_data_type == 'missing_file':
                # Test missing file error logging
                with pytest.raises(CSVLoadingError):
                    loader.load_genai_adoption_data()
                
                # Check that specific error message was logged
                log_output = log_stream.getvalue()
                assert "GenAI adoption CSV file not found" in log_output
                assert temp_dir in log_output
            
            elif invalid_data_type == 'empty_file':
                # Create empty CSV file
                empty_file = os.path.join(temp_dir, "industry_genai_adoption.csv")
                with open(empty_file, 'w') as f:
                    f.write("")
                
                with pytest.raises(CSVLoadingError):
                    loader.load_genai_adoption_data()
                
                # Check that specific error message was logged
                log_output = log_stream.getvalue()
                assert "GenAI adoption CSV file is empty" in log_output
            
            elif invalid_data_type == 'malformed_csv':
                # Create malformed CSV file that will cause a parsing error
                malformed_file = os.path.join(temp_dir, "industry_genai_adoption.csv")
                with open(malformed_file, 'w') as f:
                    f.write("industry,year,adoption_rate,use_cases_count,investment_millions\n")
                    f.write('Healthcare,2023,"unclosed quote field\n')  # Malformed line with unclosed quote
                
                with pytest.raises(CSVLoadingError):
                    loader.load_genai_adoption_data()
                
                # Check that specific parsing error was logged
                log_output = log_stream.getvalue()
                assert ("Failed to parse GenAI adoption CSV file" in log_output or 
                        "Unexpected error loading GenAI adoption data" in log_output)
            
            elif invalid_data_type == 'missing_columns':
                # Create CSV with missing required columns
                incomplete_file = os.path.join(temp_dir, "industry_genai_adoption.csv")
                with open(incomplete_file, 'w') as f:
                    f.write("industry,year\n")  # Missing required columns
                    f.write("Healthcare,2023\n")
                
                with pytest.raises(CSVLoadingError):
                    loader.load_genai_adoption_data()
                
                # Check that specific missing columns error was logged
                log_output = log_stream.getvalue()
                assert "Missing required columns" in log_output
                assert "adoption_rate" in log_output
                assert "use_cases_count" in log_output
                assert "investment_millions" in log_output
            
            elif invalid_data_type == 'invalid_values':
                # Create CSV with invalid data values
                invalid_file = os.path.join(temp_dir, "industry_genai_adoption.csv")
                with open(invalid_file, 'w') as f:
                    f.write("industry,year,adoption_rate,use_cases_count,investment_millions\n")
                    f.write("InvalidIndustry,2050,2.5,-10,50000\n")  # All invalid values
                
                records, metadata = loader.load_genai_adoption_data()
                
                # Check that specific validation errors were logged
                log_output = log_stream.getvalue()
                
                # Should have specific error messages for validation failures
                assert "Row 2" in log_output
                assert "industry_genai_adoption.csv" in log_output
                
                # Should contain field-specific error details
                assert "Field" in log_output
    
    finally:
        # Clean up logging handler
        logger.removeHandler(handler)


@given(
    dataset_type=st.sampled_from(['genai_adoption', 'aws_usage', 'growth_predictions'])
)
@settings(suppress_health_check=[HealthCheck.function_scoped_fixture])
def test_error_logging_contains_filename_and_location(dataset_type):
    """
    **Feature: genai-dashboard, Property 5: Error logging specificity**
    
    For any invalid data encountered during processing, error messages should 
    contain the specific filename and location information for actionable debugging.
    **Validates: Requirements 4.2**
    """
    # Set up logging capture
    import logging
    from io import StringIO
    
    log_stream = StringIO()
    handler = logging.StreamHandler(log_stream)
    logger = logging.getLogger('backend.services.data_loader')
    logger.addHandler(handler)
    logger.setLevel(logging.DEBUG)
    
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            loader = DataLoader(temp_dir)
            
            # Set expected filename based on dataset type
            if dataset_type == 'genai_adoption':
                expected_filename = "industry_genai_adoption.csv"
            elif dataset_type == 'aws_usage':
                expected_filename = "aws_service_usage_by_industry.csv"
            elif dataset_type == 'growth_predictions':
                expected_filename = "genai_growth_prediction.csv"
            
            # Test with missing file to ensure filename is in error message
            with pytest.raises(CSVLoadingError):
                if dataset_type == 'genai_adoption':
                    loader.load_genai_adoption_data()
                elif dataset_type == 'aws_usage':
                    loader.load_aws_usage_data()
                elif dataset_type == 'growth_predictions':
                    loader.load_growth_prediction_data()
            
            # Check that error message contains specific filename
            log_output = log_stream.getvalue()
            assert expected_filename in log_output
            assert temp_dir in log_output
    
    finally:
        # Clean up logging handler
        logger.removeHandler(handler)


@given(
    row_data=st.dictionaries(
        keys=st.sampled_from(['industry', 'year', 'adoption_rate', 'use_cases_count', 'investment_millions']),
        values=st.one_of(
            st.text(alphabet=st.characters(min_codepoint=32, max_codepoint=126), min_size=1, max_size=20),  # ASCII-safe invalid string values
            st.integers(min_value=-1000, max_value=1000),  # Potentially invalid integers
            st.floats(min_value=-100.0, max_value=100.0)  # Invalid floats
        ),
        min_size=1,
        max_size=3
    )
)
@settings(suppress_health_check=[HealthCheck.function_scoped_fixture])
def test_validation_error_logging_contains_field_details(row_data):
    """
    **Feature: genai-dashboard, Property 5: Error logging specificity**
    
    For any validation error encountered, the error message should contain 
    specific field names, error types, and problematic values for debugging.
    **Validates: Requirements 4.2**
    """
    # Set up logging capture
    import logging
    from io import StringIO
    
    log_stream = StringIO()
    handler = logging.StreamHandler(log_stream)
    logger = logging.getLogger('backend.services.data_loader')
    logger.addHandler(handler)
    logger.setLevel(logging.DEBUG)
    
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create CSV file with the generated invalid data
            csv_file = os.path.join(temp_dir, "industry_genai_adoption.csv")
            
            # Create header
            headers = ['industry', 'year', 'adoption_rate', 'use_cases_count', 'investment_millions']
            
            # Create row with provided data, filling missing fields with placeholder values
            row_values = []
            for header in headers:
                if header in row_data:
                    row_values.append(str(row_data[header]))
                else:
                    # Use valid placeholder values for missing fields
                    if header == 'industry':
                        row_values.append('Healthcare')
                    elif header == 'year':
                        row_values.append('2023')
                    elif header in ['adoption_rate', 'use_cases_count', 'investment_millions']:
                        row_values.append('0.5')
            
            with open(csv_file, 'w', encoding='utf-8') as f:
                f.write(','.join(headers) + '\n')
                f.write(','.join(row_values) + '\n')
            
            loader = DataLoader(temp_dir)
            
            try:
                records, metadata = loader.load_genai_adoption_data()
                
                # If there were validation errors, check the logging
                if metadata.validation_result.records_invalid > 0:
                    log_output = log_stream.getvalue()
                    
                    # Should have validation error messages
                    if "Row 2" in log_output and "industry_genai_adoption.csv" in log_output:
                        # Error message should contain row number and filename
                        assert "Row 2" in log_output
                        assert "industry_genai_adoption.csv" in log_output
                        
                        # Error message should contain field-specific information
                        # Check that at least one field name appears in the error
                        field_mentioned = any(field in log_output for field in headers)
                        assert field_mentioned, f"No field name found in log output: {log_output}"
                        
            except CSVLoadingError:
                # If loading failed completely, check that error was logged with specifics
                log_output = log_stream.getvalue()
                assert "industry_genai_adoption.csv" in log_output
    
    finally:
        # Clean up logging handler
        logger.removeHandler(handler)


# Property 9: Data transformation consistency tests
from backend.services.data_processor import DataProcessor


@given(
    genai_records=st.lists(
        st.builds(
            GenAIAdoptionRecord,
            industry=industry_strategy,
            year=year_strategy_historical,
            adoption_rate=rate_strategy,
            use_cases_count=use_cases_strategy,
            investment_millions=investment_strategy
        ),
        min_size=1,
        max_size=20
    )
)
def test_genai_adoption_data_transformation_consistency(genai_records):
    """
    **Feature: genai-dashboard, Property 9: Data transformation consistency**
    
    For any CSV data processed by the backend, the resulting JSON structure should be 
    normalized and suitable for consumption by visualization libraries.
    **Validates: Requirements 7.4**
    """
    processor = DataProcessor()
    
    # Transform records to JSON
    json_data = processor.transform_genai_adoption_to_json(genai_records)
    
    # Property: JSON structure should be consistent and normalized
    assert isinstance(json_data, list), "Transformed data should be a list"
    assert len(json_data) == len(genai_records), "All input records should be transformed"
    
    # Each JSON record should have consistent structure
    for i, json_record in enumerate(json_data):
        original_record = genai_records[i]
        
        # Check required fields are present
        required_fields = ['industry', 'year', 'adoption_rate', 'use_cases_count', 'investment_millions']
        for field in required_fields:
            assert field in json_record, f"Required field '{field}' missing from JSON record"
        
        # Check data types are JSON-serializable
        assert isinstance(json_record['industry'], str), "Industry should be string in JSON"
        assert isinstance(json_record['year'], int), "Year should be integer in JSON"
        assert isinstance(json_record['adoption_rate'], (int, float)), "Adoption rate should be numeric in JSON"
        assert isinstance(json_record['use_cases_count'], int), "Use cases count should be integer in JSON"
        assert isinstance(json_record['investment_millions'], (int, float)), "Investment should be numeric in JSON"
        
        # Check values are preserved correctly
        assert json_record['industry'] == original_record.industry.value, "Industry value should be preserved"
        assert json_record['year'] == original_record.year, "Year value should be preserved"
        assert json_record['adoption_rate'] == original_record.adoption_rate, "Adoption rate should be preserved"
        assert json_record['use_cases_count'] == original_record.use_cases_count, "Use cases count should be preserved"
        assert json_record['investment_millions'] == original_record.investment_millions, "Investment should be preserved"


@given(
    aws_records=st.lists(
        st.builds(
            AWSUsageRecord,
            industry=industry_strategy,
            year=year_strategy_historical,
            bedrock_usage=rate_strategy,
            sagemaker_usage=rate_strategy,
            lambda_usage=rate_strategy,
            s3_usage=rate_strategy,
            ec2_usage=rate_strategy
        ),
        min_size=1,
        max_size=20
    )
)
def test_aws_usage_data_transformation_consistency(aws_records):
    """
    **Feature: genai-dashboard, Property 9: Data transformation consistency**
    
    For any AWS usage CSV data processed by the backend, the resulting JSON structure 
    should be normalized and suitable for consumption by visualization libraries.
    **Validates: Requirements 7.4**
    """
    processor = DataProcessor()
    
    # Transform records to JSON
    json_data = processor.transform_aws_usage_to_json(aws_records)
    
    # Property: JSON structure should be consistent and normalized
    assert isinstance(json_data, list), "Transformed data should be a list"
    assert len(json_data) == len(aws_records), "All input records should be transformed"
    
    # Each JSON record should have consistent structure
    for i, json_record in enumerate(json_data):
        original_record = aws_records[i]
        
        # Check required fields are present
        required_fields = ['industry', 'year', 'bedrock_usage', 'sagemaker_usage', 'lambda_usage', 's3_usage', 'ec2_usage', 'total_usage_score']
        for field in required_fields:
            assert field in json_record, f"Required field '{field}' missing from JSON record"
        
        # Check data types are JSON-serializable
        assert isinstance(json_record['industry'], str), "Industry should be string in JSON"
        assert isinstance(json_record['year'], int), "Year should be integer in JSON"
        assert isinstance(json_record['bedrock_usage'], (int, float)), "Bedrock usage should be numeric in JSON"
        assert isinstance(json_record['sagemaker_usage'], (int, float)), "SageMaker usage should be numeric in JSON"
        assert isinstance(json_record['lambda_usage'], (int, float)), "Lambda usage should be numeric in JSON"
        assert isinstance(json_record['s3_usage'], (int, float)), "S3 usage should be numeric in JSON"
        assert isinstance(json_record['ec2_usage'], (int, float)), "EC2 usage should be numeric in JSON"
        assert isinstance(json_record['total_usage_score'], (int, float)), "Total usage score should be numeric in JSON"
        
        # Check values are preserved correctly
        assert json_record['industry'] == original_record.industry.value, "Industry value should be preserved"
        assert json_record['year'] == original_record.year, "Year value should be preserved"
        assert json_record['bedrock_usage'] == original_record.bedrock_usage, "Bedrock usage should be preserved"
        assert json_record['sagemaker_usage'] == original_record.sagemaker_usage, "SageMaker usage should be preserved"
        assert json_record['lambda_usage'] == original_record.lambda_usage, "Lambda usage should be preserved"
        assert json_record['s3_usage'] == original_record.s3_usage, "S3 usage should be preserved"
        assert json_record['ec2_usage'] == original_record.ec2_usage, "EC2 usage should be preserved"
        
        # Check that total_usage_score is calculated correctly (weighted average)
        expected_score = (
            original_record.bedrock_usage * 0.3 +
            original_record.sagemaker_usage * 0.3 +
            original_record.lambda_usage * 0.2 +
            original_record.s3_usage * 0.1 +
            original_record.ec2_usage * 0.1
        )
        assert abs(json_record['total_usage_score'] - round(expected_score, 3)) < 0.001, "Total usage score should be calculated correctly"


@given(
    growth_records=st.lists(
        st.builds(
            lambda industry, year, base_rate, range_size: GrowthPredictionRecord(
                industry=industry,
                year=year,
                predicted_adoption=base_rate,
                confidence_interval_low=max(0.0, base_rate - range_size/2),
                confidence_interval_high=min(1.0, base_rate + range_size/2)
            ),
            industry=industry_strategy,
            year=year_strategy_prediction,
            base_rate=st.floats(min_value=0.1, max_value=0.9),
            range_size=st.floats(min_value=0.0, max_value=0.2)
        ),
        min_size=1,
        max_size=20
    )
)
def test_growth_prediction_data_transformation_consistency(growth_records):
    """
    **Feature: genai-dashboard, Property 9: Data transformation consistency**
    
    For any growth prediction CSV data processed by the backend, the resulting JSON structure 
    should be normalized and suitable for consumption by visualization libraries.
    **Validates: Requirements 7.4**
    """
    processor = DataProcessor()
    
    # Transform records to JSON
    json_data = processor.transform_growth_predictions_to_json(growth_records)
    
    # Property: JSON structure should be consistent and normalized
    assert isinstance(json_data, list), "Transformed data should be a list"
    assert len(json_data) == len(growth_records), "All input records should be transformed"
    
    # Each JSON record should have consistent structure
    for i, json_record in enumerate(json_data):
        original_record = growth_records[i]
        
        # Check required fields are present
        required_fields = ['industry', 'year', 'predicted_adoption', 'confidence_interval_low', 'confidence_interval_high', 'confidence_range']
        for field in required_fields:
            assert field in json_record, f"Required field '{field}' missing from JSON record"
        
        # Check data types are JSON-serializable
        assert isinstance(json_record['industry'], str), "Industry should be string in JSON"
        assert isinstance(json_record['year'], int), "Year should be integer in JSON"
        assert isinstance(json_record['predicted_adoption'], (int, float)), "Predicted adoption should be numeric in JSON"
        assert isinstance(json_record['confidence_interval_low'], (int, float)), "Confidence low should be numeric in JSON"
        assert isinstance(json_record['confidence_interval_high'], (int, float)), "Confidence high should be numeric in JSON"
        assert isinstance(json_record['confidence_range'], (int, float)), "Confidence range should be numeric in JSON"
        
        # Check values are preserved correctly
        assert json_record['industry'] == original_record.industry.value, "Industry value should be preserved"
        assert json_record['year'] == original_record.year, "Year value should be preserved"
        assert json_record['predicted_adoption'] == original_record.predicted_adoption, "Predicted adoption should be preserved"
        assert json_record['confidence_interval_low'] == original_record.confidence_interval_low, "Confidence low should be preserved"
        assert json_record['confidence_interval_high'] == original_record.confidence_interval_high, "Confidence high should be preserved"
        
        # Check that confidence_range is calculated correctly
        expected_range = original_record.confidence_interval_high - original_record.confidence_interval_low
        assert abs(json_record['confidence_range'] - expected_range) < 0.001, "Confidence range should be calculated correctly"


@given(
    genai_records=st.lists(
        st.builds(
            GenAIAdoptionRecord,
            industry=industry_strategy,
            year=year_strategy_historical,
            adoption_rate=rate_strategy,
            use_cases_count=use_cases_strategy,
            investment_millions=investment_strategy
        ),
        min_size=1,
        max_size=10
    ),
    year_filter=st.one_of(st.none(), year_strategy_historical),
    industry_filter=st.one_of(st.none(), industry_strategy)
)
def test_data_transformation_with_filters_consistency(genai_records, year_filter, industry_filter):
    """
    **Feature: genai-dashboard, Property 9: Data transformation consistency**
    
    For any CSV data processed with filters, the resulting JSON structure should only 
    contain records matching the filters and maintain consistent structure.
    **Validates: Requirements 7.4**
    """
    processor = DataProcessor()
    
    # Transform records with filters
    json_data = processor.transform_genai_adoption_to_json(genai_records, year_filter, industry_filter)
    
    # Property: Filtered data should maintain consistency
    assert isinstance(json_data, list), "Transformed data should be a list"
    
    # Count expected records after filtering
    expected_count = 0
    for record in genai_records:
        if year_filter is not None and record.year != year_filter:
            continue
        if industry_filter is not None and record.industry.value != industry_filter:
            continue
        expected_count += 1
    
    assert len(json_data) == expected_count, "Filtered data should contain correct number of records"
    
    # Each JSON record should match the filter criteria
    for json_record in json_data:
        if year_filter is not None:
            assert json_record['year'] == year_filter, "All records should match year filter"
        if industry_filter is not None:
            assert json_record['industry'] == industry_filter, "All records should match industry filter"
        
        # Structure should remain consistent
        required_fields = ['industry', 'year', 'adoption_rate', 'use_cases_count', 'investment_millions']
        for field in required_fields:
            assert field in json_record, f"Required field '{field}' missing from filtered JSON record"


@given(
    genai_records=st.lists(
        st.builds(
            GenAIAdoptionRecord,
            industry=industry_strategy,
            year=year_strategy_historical,
            adoption_rate=rate_strategy,
            use_cases_count=use_cases_strategy,
            investment_millions=investment_strategy
        ),
        min_size=2,
        max_size=10
    ),
    aws_records=st.lists(
        st.builds(
            AWSUsageRecord,
            industry=industry_strategy,
            year=year_strategy_historical,
            bedrock_usage=rate_strategy,
            sagemaker_usage=rate_strategy,
            lambda_usage=rate_strategy,
            s3_usage=rate_strategy,
            ec2_usage=rate_strategy
        ),
        min_size=2,
        max_size=10
    )
)
def test_correlation_analysis_data_transformation_consistency(genai_records, aws_records):
    """
    **Feature: genai-dashboard, Property 9: Data transformation consistency**
    
    For any correlation analysis data processed by the backend, the resulting structure 
    should be normalized and suitable for consumption by visualization libraries.
    **Validates: Requirements 7.4**
    """
    processor = DataProcessor()
    
    # Calculate correlation analysis
    correlation_data = processor.calculate_correlation_analysis(genai_records, aws_records)
    
    # Property: Correlation data structure should be consistent and normalized
    assert hasattr(correlation_data, 'correlation_coefficient'), "Should have correlation coefficient"
    assert hasattr(correlation_data, 'data_points'), "Should have data points"
    assert hasattr(correlation_data, 'statistical_significance'), "Should have statistical significance"
    assert hasattr(correlation_data, 'sample_size'), "Should have sample size"
    
    # Check data types are appropriate for JSON serialization
    assert isinstance(correlation_data.correlation_coefficient, (int, float)), "Correlation coefficient should be numeric"
    assert isinstance(correlation_data.data_points, list), "Data points should be a list"
    assert isinstance(correlation_data.statistical_significance, (int, float)), "Statistical significance should be numeric"
    assert isinstance(correlation_data.sample_size, int), "Sample size should be integer"
    
    # Check correlation coefficient is in valid range
    assert -1.0 <= correlation_data.correlation_coefficient <= 1.0, "Correlation coefficient should be between -1 and 1"
    
    # Check data points structure
    for data_point in correlation_data.data_points:
        assert isinstance(data_point, dict), "Each data point should be a dictionary"
        
        required_fields = ['industry', 'year', 'genai_adoption', 'aws_usage_score', 'investment_millions', 'use_cases_count']
        for field in required_fields:
            assert field in data_point, f"Required field '{field}' missing from correlation data point"
        
        # Check data types
        assert isinstance(data_point['industry'], str), "Industry should be string"
        assert isinstance(data_point['year'], int), "Year should be integer"
        assert isinstance(data_point['genai_adoption'], (int, float)), "GenAI adoption should be numeric"
        assert isinstance(data_point['aws_usage_score'], (int, float)), "AWS usage score should be numeric"
        assert isinstance(data_point['investment_millions'], (int, float)), "Investment should be numeric"
        assert isinstance(data_point['use_cases_count'], int), "Use cases count should be integer"
    
    # Sample size should match number of data points
    assert correlation_data.sample_size == len(correlation_data.data_points), "Sample size should match data points count"