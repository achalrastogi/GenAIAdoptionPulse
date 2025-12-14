# GenAI Adoption Pulse

A comprehensive web-based dashboard that visualizes GenAI adoption trends across industries and correlates them with AWS service usage patterns. This interactive platform provides insights into the pulse of generative AI adoption in the enterprise landscape.

## Project Structure

```
├── frontend/          # React + Vite frontend
├── backend/           # FastAPI backend
├── data/             # CSV datasets
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Set up the Python virtual environment:
   
   **Windows (PowerShell):**
   ```powershell
   .\setup_venv.ps1
   ```
   
   **Windows (Command Prompt):**
   ```cmd
   setup_venv.bat
   ```
   
   **Linux/macOS:**
   ```bash
   chmod +x setup_venv.sh
   ./setup_venv.sh
   ```

3. Activate the virtual environment:
   
   **Windows:**
   ```cmd
   venv\Scripts\activate
   ```
   
   **Linux/macOS:**
   ```bash
   source venv/bin/activate
   ```

4. Run the backend server:
   ```bash
   python main.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Features

### Theme System
- **Light/Dark Mode**: Toggle between light and dark themes
- **System Preference Detection**: Automatically detects system theme preference
- **Persistence**: Theme preference is saved in local storage
- **Responsive**: All components adapt to the selected theme

## Development

- Backend API will be available at: http://localhost:8000
- Frontend will be available at: http://localhost:5173
- API documentation: http://localhost:8000/docs

### Testing

**Frontend Tests:**
```bash
cd frontend
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
```

**Backend Tests:**
```bash
cd backend
# Activate virtual environment first
pytest                # Run all tests
pytest -v             # Run with verbose output
```

## Requirements

- Python 3.8+
- Node.js 16+
- npm or yarn