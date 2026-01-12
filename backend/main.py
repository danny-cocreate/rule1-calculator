"""
FastAPI Backend for Fisher Research

Main application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from .routes import fisher

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title='Fisher Research API',
    description='API for Fisher research using Scuttlebutt methodology',
    version='1.0.0'
)

# CORS configuration
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Include routers
app.include_router(fisher.router)


@app.get('/')
async def root():
    """Root endpoint."""
    return {
        'message': 'Fisher Research API',
        'version': '1.0.0',
        'docs': '/docs'
    }


@app.get('/health')
async def health():
    """Health check endpoint."""
    return {'status': 'healthy'}


if __name__ == '__main__':
    import uvicorn
    
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 8000))
    
    uvicorn.run(
        'backend.main:app',
        host=host,
        port=port,
        reload=True
    )
