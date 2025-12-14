# Start GenAI Adoption Pulse Frontend Development Server

Write-Host "🚀 Starting GenAI Adoption Pulse frontend server..." -ForegroundColor Green

# Check if node_modules exists
if (!(Test-Path "frontend\node_modules")) {
    Write-Host "❌ Node modules not found. Run .\scripts\setup.ps1 first." -ForegroundColor Red
    exit 1
}

# Change to frontend directory
Set-Location frontend

Write-Host "🔥 Frontend server starting on http://localhost:5173" -ForegroundColor Cyan
Write-Host "🎨 Dashboard will open automatically in your browser" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the development server
npm run dev