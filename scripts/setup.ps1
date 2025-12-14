# GenAI Adoption Pulse - Development Environment Setup Script (PowerShell)

Write-Host "🚀 Setting up GenAI Adoption Pulse development environment..." -ForegroundColor Green

# Create scripts directory if it doesn't exist
if (!(Test-Path "scripts")) {
    New-Item -ItemType Directory -Path "scripts"
}

# Backend setup
Write-Host "📦 Setting up Python backend..." -ForegroundColor Yellow

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8+ first." -ForegroundColor Red
    exit 1
}

# Create virtual environment
Write-Host "🔧 Creating Python virtual environment..." -ForegroundColor Yellow
Set-Location backend
if (Test-Path "venv") {
    Write-Host "⚠️  Virtual environment already exists. Removing..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force venv
}

python -m venv venv
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create virtual environment" -ForegroundColor Red
    exit 1
}

# Activate virtual environment and install dependencies
Write-Host "📥 Installing Python dependencies..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"
pip install --upgrade pip
pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Python dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend setup complete!" -ForegroundColor Green
Set-Location ..

# Frontend setup
Write-Host "📦 Setting up React frontend..." -ForegroundColor Yellow

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 16+ first." -ForegroundColor Red
    exit 1
}

# Install frontend dependencies
Set-Location frontend
Write-Host "📥 Installing Node.js dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Node.js dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend setup complete!" -ForegroundColor Green
Set-Location ..

Write-Host "🎉 Development environment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start backend: .\scripts\start-backend.ps1" -ForegroundColor White
Write-Host "2. Start frontend: .\scripts\start-frontend.ps1" -ForegroundColor White
Write-Host "3. Open browser: http://localhost:5173" -ForegroundColor White