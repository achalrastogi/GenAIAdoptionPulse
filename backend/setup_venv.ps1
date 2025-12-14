# PowerShell script to set up virtual environment
Write-Host "Creating Python virtual environment..." -ForegroundColor Green
python -m venv venv

Write-Host "Activating virtual environment..." -ForegroundColor Green
& ".\venv\Scripts\Activate.ps1"

Write-Host "Installing dependencies..." -ForegroundColor Green
pip install -r requirements.txt

Write-Host "Virtual environment setup complete!" -ForegroundColor Green
Write-Host "To activate the environment, run: .\venv\Scripts\Activate.ps1" -ForegroundColor Yellow