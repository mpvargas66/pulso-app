"""
Configuration management for PULSO MVP backend.
Loads environment variables from .env.local using Pydantic Settings.
"""

from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Supports .env.local file for local development.
    """

    # ========================================================================
    # Database Configuration
    # ========================================================================
    database_url: str = "postgresql://user:password@localhost:5432/pulso"
    """PostgreSQL connection string (DSN format)"""

    db_echo: bool = False
    """Log SQL queries when True (debug mode)"""

    db_pool_size: int = 10
    """Database connection pool size"""

    db_max_overflow: int = 20
    """Maximum overflow connections beyond pool_size"""

    # ========================================================================
    # API Configuration
    # ========================================================================
    api_url: str = "http://localhost:8000"
    """Backend API URL (for documentation and CORS)"""

    frontend_url: str = "http://localhost:3000"
    """Frontend application URL (for CORS)"""

    api_title: str = "PULSO API"
    """API title for documentation"""

    api_version: str = "0.1.0"
    """API version"""

    # ========================================================================
    # Security Configuration
    # ========================================================================
    jwt_secret: str = "your-secret-key-change-in-production"
    """JWT secret key for signing tokens (CHANGE IN PRODUCTION!)"""

    jwt_algorithm: str = "HS256"
    """JWT algorithm (HS256, RS256, etc)"""

    jwt_expiration_hours: int = 24
    """JWT token expiration time in hours"""

    # ========================================================================
    # API Keys and External Services
    # ========================================================================
    claude_api_key: str = ""
    """Anthropic Claude API key for salary analysis"""

    # ========================================================================
    # Application Environment
    # ========================================================================
    debug: bool = False
    """Debug mode (log SQL, show errors, etc)"""

    environment: str = "development"
    """Environment (development, staging, production)"""

    log_level: str = "INFO"
    """Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)"""

    # ========================================================================
    # CORS Configuration
    # ========================================================================
    cors_origins: list[str] = ["http://localhost:3000"]
    """Allowed CORS origins"""

    cors_allow_credentials: bool = True
    """Allow credentials in CORS requests"""

    cors_allow_methods: list[str] = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    """Allowed HTTP methods for CORS"""

    cors_allow_headers: list[str] = ["*"]
    """Allowed headers for CORS"""

    # ========================================================================
    # Application Settings
    # ========================================================================
    app_name: str = "PULSO MVP"
    """Application name"""

    workers: int = 4
    """Number of worker processes for production"""

    timeout: int = 60
    """Request timeout in seconds"""

    class Config:
        """Pydantic configuration."""
        env_file = ".env.local"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"

    def __init__(self, **kwargs):
        """Initialize settings and validate them."""
        super().__init__(**kwargs)
        self._validate_settings()

    def _validate_settings(self) -> None:
        """Validate critical settings."""
        if not self.database_url:
            raise ValueError("DATABASE_URL is required")

        if not self.claude_api_key:
            raise ValueError("CLAUDE_API_KEY is required")

        if self.environment == "production":
            if self.jwt_secret == "your-secret-key-change-in-production":
                raise ValueError("JWT_SECRET must be changed in production")
            if self.debug:
                raise ValueError("Debug mode must be disabled in production")

    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.environment == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development."""
        return self.environment == "development"

    @property
    def is_testing(self) -> bool:
        """Check if running in testing."""
        return self.environment == "testing"


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Uses LRU cache to avoid reloading settings multiple times.

    Returns:
        Settings: Cached settings instance
    """
    return Settings()


# Create global settings instance
settings = get_settings()


# Export for convenience
__all__ = ["Settings", "settings", "get_settings"]
