"""
Unit tests for KPI endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_get_all_kpis_returns_200():
    """Test that KPI endpoint returns HTTP 200."""
    response = client.get("/api/v1/kpis")
    assert response.status_code == 200
    
    data = response.json()
    assert data["success"] is True
    assert "data" in data
    
    kpi_data = data["data"]
    assert "total_industries" in kpi_data
    assert "avg_adoption" in kpi_data
    assert "total_investment" in kpi_data
    assert "top_industry" in kpi_data
    assert "fastest_growing_industry" in kpi_data


def test_kpi_values_are_numeric():
    """Test that KPI values exist and are numeric."""
    response = client.get("/api/v1/kpis")
    assert response.status_code == 200
    
    kpi_data = response.json()["data"]
    
    # Test numeric values
    assert isinstance(kpi_data["total_industries"], int)
    assert kpi_data["total_industries"] >= 0
    
    assert isinstance(kpi_data["avg_adoption"], (int, float))
    assert 0 <= kpi_data["avg_adoption"] <= 1
    
    assert isinstance(kpi_data["total_investment"], (int, float))
    assert kpi_data["total_investment"] >= 0
    
    # Test structured values
    assert isinstance(kpi_data["top_industry"], dict)
    assert "industry" in kpi_data["top_industry"]
    assert "adoption_rate" in kpi_data["top_industry"]
    
    assert isinstance(kpi_data["fastest_growing_industry"], dict)
    assert "industry" in kpi_data["fastest_growing_industry"]
    assert "growth_rate" in kpi_data["fastest_growing_industry"]


def test_individual_kpi_endpoints():
    """Test individual KPI endpoints return HTTP 200."""
    endpoints = [
        "/api/v1/kpis/total-industries",
        "/api/v1/kpis/avg-adoption",
        "/api/v1/kpis/total-investment",
        "/api/v1/kpis/top-industry",
        "/api/v1/kpis/fastest-growing"
    ]
    
    for endpoint in endpoints:
        response = client.get(endpoint)
        assert response.status_code == 200, f"Endpoint {endpoint} failed"
        
        data = response.json()
        assert data["success"] is True
        assert "data" in data


def test_kpi_with_filters():
    """Test KPI endpoints with filter parameters."""
    # Test with year filter
    response = client.get("/api/v1/kpis?year=2023")
    assert response.status_code == 200
    
    # Test with industry filter
    response = client.get("/api/v1/kpis?industry=Technology")
    assert response.status_code == 200
    
    # Test with both filters
    response = client.get("/api/v1/kpis?year=2023&industry=Healthcare")
    assert response.status_code == 200


def test_kpi_invalid_year():
    """Test KPI endpoint with invalid year parameter."""
    response = client.get("/api/v1/kpis?year=1999")
    assert response.status_code == 400  # Should return validation error


def test_kpi_invalid_industry():
    """Test KPI endpoint with invalid industry parameter."""
    response = client.get("/api/v1/kpis?industry=InvalidIndustry")
    assert response.status_code == 400  # Should return validation error