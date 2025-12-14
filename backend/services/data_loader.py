"""
CSV data loading and validation service.

This module provides functions to load and validate CSV files containing
GenAI adoption data, AWS service usage data, and growth predictions.
"""
import logging
import pandas as pd
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from pydantic import ValidationError

from models.csv_models import (
    GenAIAdoptionRecord,
    AWSUsageRecord,
    GrowthPredictionRecord,
    CSVValidationResult,
    DatasetMetadata
)

# Configure logging
logger = logging.getLogger(__name__)


class CSVLoadingError(Exception):
    """Custom exception for CSV loading errors."""
    pass


class DataLoader:
    """Service class for loading and validating CSV datasets."""
    
    def __init__(self, data_directory: str = "data"):
        """Initialize the data loader with the data directory path."""
        self.data_directory = Path(data_directory)
        if not self.data_directory.exists():
            raise CSVLoadingError(f"Data directory not found: {self.data_directory}")
    
    def load_genai_adoption_data(self) -> Tuple[List[GenAIAdoptionRecord], DatasetMetadata]:
        """
        Load and validate GenAI adoption data from CSV file.
        
        Returns:
            Tuple of validated records and metadata
            
        Raises:
            CSVLoadingError: If file cannot be loaded or parsed
        """
        filename = "industry_genai_adoption.csv"
        filepath = self.data_directory / filename
        
        logger.info(f"Loading GenAI adoption data from {filepath}")
        
        try:
            # Load CSV file
            df = pd.read_csv(filepath)
            logger.info(f"Successfully loaded CSV file with {len(df)} rows")
            
            # Validate required columns
            required_columns = ['industry', 'year', 'adoption_rate', 'use_cases_count', 'investment_millions']
            self._validate_required_columns(df, required_columns, filename)
            
            # Validate and convert records
            records, validation_result = self._validate_records(df, GenAIAdoptionRecord, filename)
            
            # Create metadata
            metadata = DatasetMetadata(
                filename=filename,
                record_count=len(df),
                columns=df.columns.tolist(),
                date_range=(df['year'].min(), df['year'].max()) if 'year' in df.columns else None,
                industries=df['industry'].unique().tolist() if 'industry' in df.columns else [],
                validation_result=validation_result
            )
            
            logger.info(f"GenAI adoption data loaded: {validation_result.records_valid} valid records, "
                       f"{validation_result.records_invalid} invalid records")
            
            return records, metadata
            
        except FileNotFoundError:
            error_msg = f"GenAI adoption CSV file not found: {filepath}"
            logger.error(error_msg)
            raise CSVLoadingError(error_msg)
        except pd.errors.EmptyDataError:
            error_msg = f"GenAI adoption CSV file is empty: {filepath}"
            logger.error(error_msg)
            raise CSVLoadingError(error_msg)
        except pd.errors.ParserError as e:
            error_msg = f"Failed to parse GenAI adoption CSV file {filepath}: {str(e)}"
            logger.error(error_msg)
            raise CSVLoadingError(error_msg)
        except Exception as e:
            error_msg = f"Unexpected error loading GenAI adoption data: {str(e)}"
            logger.error(error_msg)
            raise CSVLoadingError(error_msg)
    
    def load_aws_usage_data(self) -> Tuple[List[AWSUsageRecord], DatasetMetadata]:
        """
        Load and validate AWS service usage data from CSV file.
        
        Returns:
            Tuple of validated records and metadata
            
        Raises:
            CSVLoadingError: If file cannot be loaded or parsed
        """
        filename = "aws_service_usage_by_industry.csv"
        filepath = self.data_directory / filename
        
        logger.info(f"Loading AWS usage data from {filepath}")
        
        try:
            # Load CSV file
            df = pd.read_csv(filepath)
            logger.info(f"Successfully loaded CSV file with {len(df)} rows")
            
            # Validate required columns
            required_columns = ['industry', 'year', 'bedrock_usage', 'sagemaker_usage', 
                              'lambda_usage', 's3_usage', 'ec2_usage']
            self._validate_required_columns(df, required_columns, filename)
            
            # Validate and convert records
            records, validation_result = self._validate_records(df, AWSUsageRecord, filename)
            
            # Create metadata
            metadata = DatasetMetadata(
                filename=filename,
                record_count=len(df),
                columns=df.columns.tolist(),
                date_range=(df['year'].min(), df['year'].max()) if 'year' in df.columns else None,
                industries=df['industry'].unique().tolist() if 'industry' in df.columns else [],
                validation_result=validation_result
            )
            
            logger.info(f"AWS usage data loaded: {validation_result.records_valid} valid records, "
                       f"{validation_result.records_invalid} invalid records")
            
            return records, metadata
            
        except FileNotFoundError:
            error_msg = f"AWS usage CSV file not found: {filepath}"
            logger.error(error_msg)
            raise CSVLoadingError(error_msg)
        except pd.errors.EmptyDataError:
            error_msg = f"AWS usage CSV file is empty: {filepath}"
            logger.error(error_msg)
            raise CSVLoadingError(error_msg)
        except pd.errors.ParserError as e:
            error_msg = f"Failed to parse AWS usage CSV file {filepath}: {str(e)}"
            logger.error(error_msg)
            raise CSVLoadingError(error_msg)
        except Exception as e:
            error_msg = f"Unexpected error loading AWS usage data: {str(e)}"
            logger.error(error_msg)
            raise CSVLoadingError(error_msg)
    
    def load_growth_prediction_data(self) -> Tuple[List[GrowthPredictionRecord], DatasetMetadata]:
        """
        Load and validate GenAI growth prediction data from CSV file.
        
        Returns:
            Tuple of validated records and metadata
            
        Raises:
            CSVLoadingError: If file cannot be loaded or parsed
        """
        filename = "genai_growth_prediction.csv"
        filepath = self.data_directory / filename
        
        logger.info(f"Loading growth prediction data from {filepath}")
        
        try:
            # Load CSV file
            df = pd.read_csv(filepath)
            logger.info(f"Successfully loaded CSV file with {len(df)} rows")
            
            # Validate required columns
            required_columns = ['industry', 'year', 'predicted_adoption', 
                              'confidence_interval_low', 'confidence_interval_high']
            self._validate_required_columns(df, required_columns, filename)
            
            # Validate and convert records
            records, validation_result = self._validate_records(df, GrowthPredictionRecord, filename)
            
            # Create metadata
            metadata = DatasetMetadata(
                filename=filename,
                record_count=len(df),
                columns=df.columns.tolist(),
                date_range=(df['year'].min(), df['year'].max()) if 'year' in df.columns else None,
                industries=df['industry'].unique().tolist() if 'industry' in df.columns else [],
                validation_result=validation_result
            )
            
            logger.info(f"Growth prediction data loaded: {validation_result.records_valid} valid records, "
                       f"{validation_result.records_invalid} invalid records")
            
            return records, metadata
            
        except FileNotFoundError:
            error_msg = f"Growth prediction CSV file not found: {filepath}"
            logger.error(error_msg)
            raise CSVLoadingError(error_msg)
        except pd.errors.EmptyDataError:
            error_msg = f"Growth prediction CSV file is empty: {filepath}"
            logger.error(error_msg)
            raise CSVLoadingError(error_msg)
        except pd.errors.ParserError as e:
            error_msg = f"Failed to parse growth prediction CSV file {filepath}: {str(e)}"
            logger.error(error_msg)
            raise CSVLoadingError(error_msg)
        except Exception as e:
            error_msg = f"Unexpected error loading growth prediction data: {str(e)}"
            logger.error(error_msg)
            raise CSVLoadingError(error_msg)
    
    def load_all_datasets(self) -> Dict[str, Tuple[List[Any], DatasetMetadata]]:
        """
        Load all CSV datasets and return them in a dictionary.
        
        Returns:
            Dictionary with dataset names as keys and (records, metadata) tuples as values
            
        Raises:
            CSVLoadingError: If any dataset fails to load
        """
        logger.info("Loading all CSV datasets")
        
        datasets = {}
        errors = []
        
        try:
            datasets['genai_adoption'] = self.load_genai_adoption_data()
        except CSVLoadingError as e:
            errors.append(f"GenAI adoption data: {str(e)}")
        
        try:
            datasets['aws_usage'] = self.load_aws_usage_data()
        except CSVLoadingError as e:
            errors.append(f"AWS usage data: {str(e)}")
        
        try:
            datasets['growth_predictions'] = self.load_growth_prediction_data()
        except CSVLoadingError as e:
            errors.append(f"Growth prediction data: {str(e)}")
        
        if errors:
            error_msg = f"Failed to load some datasets: {'; '.join(errors)}"
            logger.error(error_msg)
            raise CSVLoadingError(error_msg)
        
        logger.info(f"Successfully loaded {len(datasets)} datasets")
        return datasets
    
    def _validate_required_columns(self, df: pd.DataFrame, required_columns: List[str], filename: str) -> None:
        """
        Validate that all required columns are present in the DataFrame.
        
        Args:
            df: The DataFrame to validate
            required_columns: List of required column names
            filename: Name of the file being validated (for error messages)
            
        Raises:
            CSVLoadingError: If required columns are missing
        """
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            error_msg = f"Missing required columns in {filename}: {missing_columns}. " \
                       f"Available columns: {df.columns.tolist()}"
            logger.error(error_msg)
            raise CSVLoadingError(error_msg)
    
    def _validate_records(self, df: pd.DataFrame, model_class, filename: str) -> Tuple[List[Any], CSVValidationResult]:
        """
        Validate DataFrame records against a Pydantic model.
        
        Args:
            df: The DataFrame containing records to validate
            model_class: The Pydantic model class to validate against
            filename: Name of the file being validated (for error messages)
            
        Returns:
            Tuple of valid records and validation result
        """
        valid_records = []
        errors = []
        warnings = []
        
        for index, row in df.iterrows():
            try:
                # Convert row to dictionary and create model instance
                record_dict = row.to_dict()
                record = model_class(**record_dict)
                valid_records.append(record)
            except ValidationError as e:
                error_details = []
                for error in e.errors():
                    field = error.get('loc', ['unknown'])[0]
                    message = error.get('msg', 'Unknown validation error')
                    value = error.get('input', 'N/A')
                    error_details.append(f"Field '{field}': {message} (value: {value})")
                
                error_msg = f"Row {index + 2} in {filename}: {'; '.join(error_details)}"
                errors.append(error_msg)
                logger.warning(error_msg)
            except Exception as e:
                error_msg = f"Row {index + 2} in {filename}: Unexpected validation error: {str(e)}"
                errors.append(error_msg)
                logger.warning(error_msg)
        
        validation_result = CSVValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            records_processed=len(df),
            records_valid=len(valid_records),
            records_invalid=len(errors)
        )
        
        return valid_records, validation_result


# Convenience functions for direct usage
def load_genai_adoption_data(data_directory: str = "data") -> Tuple[List[GenAIAdoptionRecord], DatasetMetadata]:
    """Load GenAI adoption data using default data loader."""
    loader = DataLoader(data_directory)
    return loader.load_genai_adoption_data()


def load_aws_usage_data(data_directory: str = "data") -> Tuple[List[AWSUsageRecord], DatasetMetadata]:
    """Load AWS usage data using default data loader."""
    loader = DataLoader(data_directory)
    return loader.load_aws_usage_data()


def load_growth_prediction_data(data_directory: str = "data") -> Tuple[List[GrowthPredictionRecord], DatasetMetadata]:
    """Load growth prediction data using default data loader."""
    loader = DataLoader(data_directory)
    return loader.load_growth_prediction_data()


def load_all_datasets(data_directory: str = "data") -> Dict[str, Tuple[List[Any], DatasetMetadata]]:
    """Load all datasets using default data loader."""
    loader = DataLoader(data_directory)
    return loader.load_all_datasets()