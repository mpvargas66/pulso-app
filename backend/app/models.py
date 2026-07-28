"""
SQLAlchemy models for PULSO MVP.
Defines database schema for users, profiles, analyses, and benchmarks.
"""

from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Boolean, JSON, ForeignKey, Index, Text
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .database import Base


class User(Base):
    """
    User account model.
    Stores user authentication and account information.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    plan = Column(String(50), default="free", nullable=False)  # free, pro, enterprise
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    profiles = relationship("Profile", back_populates="user", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_user_email_active", "email", "is_active"),
        Index("idx_user_created_at", "created_at"),
    )


class Profile(Base):
    """
    User profile model.
    Stores professional profile information for salary analysis.
    """
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Professional information
    titulo_cargo = Column(String(255), nullable=False)  # Job title
    años_experiencia = Column(Integer, nullable=False)  # Total years of experience
    años_en_cargo_actual = Column(Integer, default=0, nullable=False)  # Years in current role
    liderazgo = Column(Integer, default=0, nullable=False)  # Number of people leading

    # Competencies stored as JSON
    competencias_json = Column(JSON, nullable=True)  # e.g., ["Python", "PostgreSQL", "AWS"]

    # Education and career
    educacion = Column(String(100), nullable=False)  # e.g., "CS Degree", "Bootcamp", "Self-taught"
    industria = Column(String(100), nullable=False)  # e.g., "FinTech", "SaaS", "Large Corp"
    tamaño_empresa = Column(String(50), nullable=False)  # e.g., "1-50", "50-500", "500-5k", "5k+"
    region = Column(String(100), nullable=False)  # e.g., "Santiago", "Regiones"

    # Calculated metrics
    peso_calculado = Column(Float, nullable=True, default=None)  # Profile weight/score (0-1000)

    # Metadata
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="profiles")
    analyses = relationship("Analysis", back_populates="profile", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_profile_user_id", "user_id"),
        Index("idx_profile_created_at", "created_at"),
        Index("idx_profile_industria_tamaño", "industria", "tamaño_empresa"),
    )


class Analysis(Base):
    """
    Salary analysis results model.
    Stores the output of salary analysis for each profile.
    """
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)

    # User's current salary
    salario_actual_usd = Column(Float, nullable=False)

    # Profile-based score (0-1000)
    peso_persona = Column(Float, nullable=False)

    # Market data
    p50_usd = Column(Float, nullable=False)  # Market median salary
    brecha_pct = Column(Float, nullable=False)  # Salary gap percentage

    # AI-generated recommendations
    recomendaciones = Column(Text, nullable=True)  # Personalized recommendations

    # Metadata
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="analyses")
    profile = relationship("Profile", back_populates="analyses")

    __table_args__ = (
        Index("idx_analysis_user_id", "user_id"),
        Index("idx_analysis_profile_id", "profile_id"),
        Index("idx_analysis_created_at", "created_at"),
    )


class SalaryBenchmark(Base):
    """
    Salary benchmark data model.
    Stores market salary data for different roles and market segments.
    Used for comparison and analysis.
    """
    __tablename__ = "salary_benchmarks"

    id = Column(Integer, primary_key=True, index=True)

    # Job and market information
    cargo_nombre = Column(String(255), nullable=False, index=True)
    industria = Column(String(100), nullable=False)
    tamaño_empresa = Column(String(50), nullable=False)
    region = Column(String(100), nullable=False)

    # Salary metrics (in USD)
    p50_usd = Column(Float, nullable=False)  # Median salary
    p25_usd = Column(Float, nullable=True)  # 25th percentile
    p75_usd = Column(Float, nullable=True)  # 75th percentile
    p90_usd = Column(Float, nullable=True)  # 90th percentile

    # Profile weight/score for this benchmark
    peso = Column(Float, nullable=False)  # Average profile weight for this segment

    # Sample data
    sample_size = Column(Integer, default=0)  # Number of data points

    # Metadata
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    __table_args__ = (
        Index("idx_benchmark_cargo", "cargo_nombre"),
        Index("idx_benchmark_industria_tamaño_region", "industria", "tamaño_empresa", "region"),
        Index("idx_benchmark_created_at", "created_at"),
    )


class FactorWeights(Base):
    """
    Factor weights configuration model.
    Stores the weights/coefficients used in the salary analysis algorithm.
    Allows version control of algorithm parameters.
    """
    __tablename__ = "factor_weights"

    id = Column(Integer, primary_key=True, index=True)

    # Factor information
    factor_name = Column(String(255), nullable=False)  # e.g., "experience", "skills", "leadership"
    weight = Column(Float, nullable=False)  # Weight/coefficient for this factor (0.0-1.0)

    # Version control
    version = Column(Integer, default=1, nullable=False)  # Algorithm version

    # Metadata
    description = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    __table_args__ = (
        Index("idx_factor_name_version", "factor_name", "version"),
        Index("idx_factor_created_at", "created_at"),
    )

