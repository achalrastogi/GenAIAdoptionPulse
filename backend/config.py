import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent

# Data directory (relative to project root)
DATA_DIR = BASE_DIR.parent / "data"

# API Configuration
API_V1_PREFIX = "/api/v1"
PROJECT_NAME = "GenAI Dashboard API"
VERSION = "1.0.0"

# CORS Configuration
ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
]

# CSV File paths
CSV_FILES = {
    "genai_adoption": DATA_DIR / "industry_genai_adoption.csv",
    "aws_usage": DATA_DIR / "aws_service_usage_by_industry.csv",
    "growth_predictions": DATA_DIR / "genai_growth_prediction.csv"
}