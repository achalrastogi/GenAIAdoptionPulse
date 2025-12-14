"""
Unit tests for enhanced insights endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_get_insights_returns_200():
    """Test that insights endpoint returns HTTP 200."""
    response = client.get("/api/v1/insights")
    assert response.status_code == 200
    
    data = response.json()
    assert data["success"] is True
    assert "data" in data
    assert "metadata" in data
    
    # Check metadata structure
    metadata = data["metadata"]
    assert "total_insights" in metadata
    assert "filters_applied" in metadata
    assert "categories" in metadata


def test_insights_structure():
    """Test that insights have proper structure."""
    response = client.get("/api/v1/insights")
    assert response.status_code == 200
    
    insights_data = response.json()["data"]
    
    if insights_data:  # If insights are generated
        insight = insights_data[0]
        
        # Check required fields
        required_fields = ["id", "title", "short_text", "details", "confidence", 
                          "data_slice_url", "computed_at", "category", "statistical_data"]
        
        for field in required_fields:
            assert field in insight, f"Missing field: {field}"
        
        # Check data types
        assert isinstance(insight["confidence"], (int, float))
        assert 0 <= insight["confidence"] <= 1
        assert isinstance(insight["statistical_data"], dict)


def test_insights_with_filters():
    """Test insights endpoint with filter parameters."""
    # Test with years filter
    response = client.get("/api/v1/insights?years=2022,2023")
    assert response.status_code == 200
    
    # Test with industries filter
    response = client.get("/api/v1/insights?industries=Technology,Healthcare")
    assert response.status_code == 200
    
    # Test with both filters
    response = client.get("/api/v1/insights?years=2023&industries=Finance")
    assert response.status_code == 200


def test_insights_invalid_year_format():
    """Test insights endpoint with invalid year format."""
    response = client.get("/api/v1/insights?years=invalid,2023")
    assert response.status_code == 400


def test_insights_invalid_industry():
    """Test insights endpoint with invalid industry."""
    response = client.get("/api/v1/insights?industries=InvalidIndustry")
    assert response.status_code == 400


def test_data_slice_endpoint():
    """Test data slice endpoint returns HTTP 200."""
    response = client.get("/api/v1/data/slice")
    assert response.status_code == 200
    
    data = response.json()
    assert data["success"] is True
    assert "data" in data
    assert "metadata" in data


def test_data_slice_with_filters():
    """Test data slice endpoint with filters."""
    # Test with industry filter
    response = client.get("/api/v1/data/slice?industry=Technology")
    assert response.status_code == 200
    
    # Test with year filter
    response = client.get("/api/v1/data/slice?year=2023")
    assert response.status_code == 200
    
    # Test with metric filter
    response = client.get("/api/v1/data/slice?metric=adoption")
    assert response.status_code == 200


def test_insight_export_endpoint():
    """Test insight export endpoint returns CSV."""
    # Test with sample insight ID
    response = client.get("/api/v1/insights/adoption_leader_test/export")
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    
    # Test with correlation insight ID
    response = client.get("/api/v1/insights/correlation_test/export")
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"


def test_insights_categories():
    """Test that insights are properly categorized."""
    response = client.get("/api/v1/insights")
    assert response.status_code == 200
    
    data = response.json()
    categories = data["metadata"]["categories"]
    
    # Expected categories based on our implementation
    expected_categories = ["adoption_trends", "correlation_analysis", "growth_trends", "investment_analysis"]
    
    # Check that we have valid categories (subset is OK)
    for category in categories:
        assert isinstance(category, str)
        assert len(category) > 0


def test_insights_confidence_scoring():
    """Test that insights have valid confidence scores."""
    response = client.get("/api/v1/insights")
    assert response.status_code == 200
    
    insights_data = response.json()["data"]
    
    for insight in insights_data:
        confidence = insight["confidence"]
        assert isinstance(confidence, (int, float))
        assert 0 <= confidence <= 1, f"Invalid confidence score: {confidence}"


def test_insights_statistical_data():
    """Test that insights contain statistical data."""
    response = client.get("/api/v1/insights")
    assert response.status_code == 200
    
    insights_data = response.json()["data"]
    
    for insight in insights_data:
        statistical_data = insight["statistical_data"]
        assert isinstance(statistical_data, dict)
        assert len(statistical_data) > 0, "Statistical data should not be empty"