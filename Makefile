# GenAI Adoption Pulse - Development Makefile

.PHONY: help setup venv-create venv-activate install-backend install-frontend start-backend start-frontend test clean

# Default target
help:
	@echo "GenAI Adoption Pulse - Development Commands"
	@echo "=========================================="
	@echo ""
	@echo "Setup Commands:"
	@echo "  setup              - Complete development environment setup"
	@echo "  venv-create        - Create Python virtual environment"
	@echo "  install-backend    - Install backend dependencies"
	@echo "  install-frontend   - Install frontend dependencies"
	@echo ""
	@echo "Development Commands:"
	@echo "  start-backend      - Start FastAPI backend server"
	@echo "  start-frontend     - Start React frontend dev server"
	@echo "  test               - Run all tests"
	@echo ""
	@echo "Utility Commands:"
	@echo "  clean              - Clean build artifacts and dependencies"
	@echo ""

# Complete setup
setup: venv-create install-backend install-frontend
	@echo "✅ Development environment setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  make start-backend    # Start backend server"
	@echo "  make start-frontend   # Start frontend server"

# Create Python virtual environment
venv-create:
	@echo "🔧 Creating Python virtual environment..."
	cd backend && python -m venv venv
	@echo "✅ Virtual environment created!"

# Activate virtual environment (for reference - use in shell)
venv-activate:
	@echo "To activate virtual environment, run:"
	@echo "  cd backend && venv\\Scripts\\activate    # Windows"
	@echo "  cd backend && source venv/bin/activate  # Linux/macOS"

# Install backend dependencies
install-backend:
	@echo "📦 Installing backend dependencies..."
	cd backend && venv\\Scripts\\python -m pip install --upgrade pip
	cd backend && venv\\Scripts\\pip install -r requirements.txt
	@echo "✅ Backend dependencies installed!"

# Install frontend dependencies
install-frontend:
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅ Frontend dependencies installed!"

# Start backend server
start-backend:
	@echo "🚀 Starting backend server..."
	@echo "🔥 Server will be available at http://localhost:8000"
	@echo "📚 API docs at http://localhost:8000/docs"
	cd backend && venv\\Scripts\\python main.py

# Start frontend development server
start-frontend:
	@echo "🚀 Starting frontend development server..."
	@echo "🔥 Server will be available at http://localhost:5173"
	cd frontend && npm run dev

# Run tests
test:
	@echo "🧪 Running backend tests..."
	cd backend && venv\\Scripts\\python -m pytest
	@echo "🧪 Running frontend tests..."
	cd frontend && npm test

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	-rmdir /s /q backend\\venv 2>nul
	-rmdir /s /q backend\\__pycache__ 2>nul
	-rmdir /s /q backend\\.pytest_cache 2>nul
	-rmdir /s /q frontend\\node_modules 2>nul
	-rmdir /s /q frontend\\dist 2>nul
	@echo "✅ Clean complete!"

# Development workflow targets
dev-setup: setup
	@echo "🎯 Development environment ready!"
	@echo "Run 'make start-backend' and 'make start-frontend' in separate terminals"

# Quick start (requires setup to be done first)
dev-start:
	@echo "🚀 Quick starting both servers..."
	@echo "Note: Run backend and frontend in separate terminals for better control"
	@echo "Backend: make start-backend"
	@echo "Frontend: make start-frontend"