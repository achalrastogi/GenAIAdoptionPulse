# Start GenAI Adoption Pulse Backend Server

Write-Host "🚀 Starting GenAI Adoption Pulse backend server..." -ForegroundColor Green

# Check if virtual environment exists
if (!(Test-Path "backend\venv")) {
    Write-Host "❌ Virtual environment not found. Run .\scripts\setup.ps1 first." -ForegroundColor Red
    exit 1
}

# Change to backend directory and activate virtual environment
Set-Location backend
& "venv\Scripts\Activate.ps1"

# Check if requirements are installed
try {
    python -c "import fastapi, uvicorn, pandas" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Dependencies missing. Installing..." -ForegroundColor Yellow
        pip install -r requirements.txt
    }
} catch {
    Write-Host "⚠️  Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

Write-Host "🔥 Backend server starting on http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 API documentation available at http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
python main.py