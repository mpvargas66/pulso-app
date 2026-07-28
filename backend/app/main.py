"""
FastAPI application entry point for PULSO MVP.
Configures middleware, routers, and health checks.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from .config import settings
from .database import init_db, close_db, health_check as db_health_check
from .services.claude_api import claude_service

# Import routers
from .routes import auth, profiles, analyses, benchmarks

# Configure logging
logging.basicConfig(level=settings.log_level)
logger = logging.getLogger(__name__)


# ============================================================================
# Lifespan Events
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application lifecycle events.
    Handles startup and shutdown logic.
    """
    # Startup
    logger.info("Starting PULSO API...")
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise

    # Check Claude API
    if claude_service.health_check():
        logger.info("Claude API is configured and working")
    else:
        logger.warning("Claude API is not available (Phase 2 feature)")

    logger.info(
        f"PULSO API v{settings.api_version} started on {settings.api_url}"
    )

    yield

    # Shutdown
    logger.info("Shutting down PULSO API...")
    try:
        close_db()
        logger.info("Database connections closed")
    except Exception as e:
        logger.error(f"Error closing database: {str(e)}")


# ============================================================================
# Create FastAPI App
# ============================================================================

app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description="API for salary analysis using AI-powered profiling",
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)


# ============================================================================
# CORS Middleware
# ============================================================================

# Define allowed origins
allowed_origins = [
    "http://localhost:3000",  # Local development
    "http://localhost:3001",  # Alternative dev port
    "https://pulso.co",  # Production domain
    "https://www.pulso.co",  # Production www subdomain
]

# Add environment-specific origins
if settings.frontend_url not in allowed_origins:
    allowed_origins.append(settings.frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
    max_age=3600,  # Cache CORS preflight for 1 hour
)

logger.info(f"CORS configured for origins: {', '.join(allowed_origins)}")


# ============================================================================
# Exception Handlers
# ============================================================================

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with detailed response."""
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation error",
            "errors": exc.errors(),
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors."""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error_code": "INTERNAL_ERROR",
        },
    )


# ============================================================================
# Routes
# ============================================================================

# Health Check Endpoint
@app.get("/health", tags=["Health"])
async def health_check_endpoint():
    """
    Health check endpoint.
    Verifies API and database connectivity.

    Returns:
        dict: Status and service information
    """
    db_status = await db_health_check()
    claude_status = claude_service.health_check()

    return {
        "status": "healthy" if db_status else "degraded",
        "api": {
            "name": settings.api_title,
            "version": settings.api_version,
            "environment": settings.environment,
        },
        "services": {
            "database": "ok" if db_status else "error",
            "claude_api": "ok" if claude_status else "unavailable",
        },
    }


# Root endpoint
@app.get("/", tags=["Info"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": settings.api_title,
        "version": settings.api_version,
        "description": "Salary analysis API powered by AI",
        "documentation": f"{settings.api_url}/api/docs",
        "openapi": f"{settings.api_url}/api/openapi.json",
    }


# ============================================================================
# Include Routers
# ============================================================================

# Authentication routes
app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["Authentication"],
)

# Profile routes
app.include_router(
    profiles.router,
    prefix="/api/profiles",
    tags=["Profiles"],
)

# Analysis routes
app.include_router(
    analyses.router,
    prefix="/api",
    tags=["Analysis"],
)

# Benchmark routes
app.include_router(
    benchmarks.router,
    prefix="/api/benchmarks",
    tags=["Benchmarks"],
)

logger.info("All routers configured successfully")


# ============================================================================
# Events
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Log startup event."""
    logger.info("FastAPI startup event")


@app.on_event("shutdown")
async def shutdown_event():
    """Log shutdown event."""
    logger.info("FastAPI shutdown event")


# ============================================================================
# Export
# ============================================================================

__all__ = ["app"]
