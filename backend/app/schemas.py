"""
Pydantic schemas for request/response validation and serialization.
"""

from pydantic import BaseModel, Field, EmailStr, field_validator
from datetime import datetime
from typing import Optional, List, Generic, TypeVar

T = TypeVar('T')


# ============================================================================
# Analysis Schemas
# ============================================================================

class AnalysisInput(BaseModel):
    """
    Input schema for salary analysis request.
    Validates and documents the required data for analysis.
    """
    titulo_cargo: str = Field(
        ...,
        min_length=2,
        max_length=255,
        description="Job title (e.g., Senior Backend Engineer)"
    )
    años_experiencia: int = Field(
        ...,
        ge=0,
        le=70,
        description="Total years of professional experience"
    )
    años_en_cargo_actual: int = Field(
        default=0,
        ge=0,
        le=70,
        description="Years in current role"
    )
    liderazgo: int = Field(
        default=0,
        ge=0,
        le=500,
        description="Number of people leading"
    )
    competencias: List[str] = Field(
        default=[],
        description="Technical skills (e.g., ['Python', 'PostgreSQL', 'AWS'])"
    )
    educacion: str = Field(
        ...,
        description="Education type (CS Degree, Bootcamp, Self-taught)"
    )
    industria: str = Field(
        ...,
        description="Industry (FinTech, SaaS, Large Corp, Startup)"
    )
    tamaño_empresa: str = Field(
        ...,
        description="Company size (1-50, 50-500, 500-5k, 5k+)"
    )
    region: str = Field(
        ...,
        description="Region (Santiago, Regiones)"
    )
    salario_actual_usd: float = Field(
        ...,
        gt=0,
        description="Current salary in USD"
    )

    @field_validator("competencias")
    @classmethod
    def validate_competencias(cls, v: List[str]) -> List[str]:
        """Ensure competencias is a list and not empty if provided."""
        if not isinstance(v, list):
            raise ValueError("competencias debe ser una lista")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "titulo_cargo": "Senior Backend Engineer",
                "años_experiencia": 8,
                "años_en_cargo_actual": 2,
                "liderazgo": 3,
                "competencias": ["Python", "PostgreSQL", "AWS"],
                "educacion": "CS Degree",
                "industria": "SaaS",
                "tamaño_empresa": "50-500",
                "region": "Santiago",
                "salario_actual_usd": 85000,
            }
        }


class AnalysisOutput(BaseModel):
    """
    Output schema for salary analysis results.
    """
    id: int = Field(..., description="Analysis ID")
    peso: float = Field(
        ...,
        ge=0,
        le=1000,
        description="Calculated profile weight/score (0-1000)"
    )
    p50_usd: float = Field(
        ...,
        gt=0,
        description="Market median salary (P50) in USD"
    )
    salario_actual_usd: float = Field(
        ...,
        gt=0,
        description="User's current salary in USD"
    )
    brecha_pct: float = Field(
        ...,
        description="Salary gap percentage (positive = earning more than market)"
    )
    recomendaciones: Optional[str] = Field(
        default=None,
        description="AI-generated personalized recommendations"
    )
    created_at: datetime = Field(
        ...,
        description="Analysis creation timestamp"
    )

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "peso": 680,
                "p50_usd": 80000,
                "salario_actual_usd": 85000,
                "brecha_pct": 6.25,
                "recomendaciones": "Tu perfil es fuerte. Considera negociar mayores beneficios.",
                "created_at": "2024-01-15T10:30:00Z",
            }
        }


# ============================================================================
# User Schemas
# ============================================================================

class UserBase(BaseModel):
    """Base user information."""
    email: EmailStr = Field(..., description="User email address")
    full_name: Optional[str] = Field(
        default=None,
        max_length=255,
        description="User's full name"
    )


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str = Field(
        ...,
        min_length=8,
        max_length=255,
        description="Password (minimum 8 characters)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "full_name": "Juan Pérez",
                "password": "SecurePassword123",
            }
        }


class UserResponse(UserBase):
    """Schema for user response."""
    id: int = Field(..., description="User ID")
    plan: str = Field(..., description="Subscription plan (free, pro, enterprise)")
    is_active: bool = Field(..., description="Whether user account is active")
    created_at: datetime = Field(..., description="Account creation timestamp")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "email": "user@example.com",
                "full_name": "Juan Pérez",
                "plan": "pro",
                "is_active": True,
                "created_at": "2024-01-01T00:00:00Z",
            }
        }


# ============================================================================
# Profile Schemas
# ============================================================================

class ProfileBase(BaseModel):
    """Base profile information."""
    titulo_cargo: str = Field(..., description="Job title")
    años_experiencia: int = Field(..., description="Total years of experience")
    educacion: str = Field(..., description="Education type")
    industria: str = Field(..., description="Industry")
    tamaño_empresa: str = Field(..., description="Company size")
    region: str = Field(..., description="Region")


class ProfileCreate(ProfileBase):
    """Schema for creating a new profile."""
    años_en_cargo_actual: int = Field(
        default=0,
        description="Years in current role"
    )
    liderazgo: int = Field(
        default=0,
        description="Number of people leading"
    )
    competencias: List[str] = Field(
        default=[],
        description="Technical skills"
    )


class ProfileResponse(ProfileBase):
    """Schema for profile response."""
    id: int = Field(..., description="Profile ID")
    user_id: int = Field(..., description="Associated user ID")
    peso_calculado: Optional[float] = Field(
        default=None,
        description="Calculated profile weight (0-1000)"
    )
    años_en_cargo_actual: int = Field(..., description="Years in current role")
    liderazgo: int = Field(..., description="Number of people leading")
    competencias: Optional[List[str]] = Field(
        default=None,
        description="Technical skills"
    )
    created_at: datetime = Field(..., description="Profile creation timestamp")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "titulo_cargo": "Senior Backend Engineer",
                "años_experiencia": 8,
                "años_en_cargo_actual": 2,
                "liderazgo": 3,
                "competencias": ["Python", "PostgreSQL", "AWS"],
                "educacion": "CS Degree",
                "industria": "SaaS",
                "tamaño_empresa": "50-500",
                "region": "Santiago",
                "peso_calculado": 680,
                "created_at": "2024-01-15T10:00:00Z",
            }
        }


# ============================================================================
# Error Schemas
# ============================================================================

class ErrorResponse(BaseModel):
    """Generic error response schema."""
    status_code: int = Field(..., description="HTTP status code")
    detail: str = Field(..., description="Error message")
    error_code: Optional[str] = Field(
        default=None,
        description="Internal error code for debugging"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "status_code": 400,
                "detail": "Invalid input data",
                "error_code": "INVALID_INPUT",
            }
        }


# ============================================================================
# Pagination Schemas
# ============================================================================

class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response schema."""
    total: int = Field(..., description="Total number of items")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Items per page")
    items: List = Field(..., description="Items in current page")
