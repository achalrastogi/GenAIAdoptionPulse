from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from routers.data_routes import router as data_router
from utils.error_handlers import (
    api_error_handler,
    http_exception_handler,
    validation_exception_handler,
    csv_loading_error_handler,
    general_exception_handler,
    APIError
)
from services.data_loader import CSVLoadingError

app = FastAPI(title="GenAI Dashboard API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add exception handlers
app.add_exception_handler(APIError, api_error_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(CSVLoadingError, csv_loading_error_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Include routers
app.include_router(data_router)

@app.get("/")
async def root():
    return {"message": "GenAI Dashboard API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)