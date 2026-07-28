"""
Database configuration and session management for PULSO MVP.
Connects to PostgreSQL using SQLAlchemy ORM.
"""

from sqlalchemy import create_engine, event, pool
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.exc import SQLAlchemyError
from typing import Generator
import logging

from .config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Database URL validation
if not settings.database_url:
    raise ValueError("DATABASE_URL environment variable is not set")

# Create engine with connection pooling
engine = create_engine(
    settings.database_url,
    # Connection pooling settings
    poolclass=pool.QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,  # Recycle connections after 1 hour
    pool_pre_ping=True,  # Test connections before using them
    echo=settings.debug,  # Log SQL queries in debug mode
    connect_args={
        "connect_timeout": 10,
        "application_name": "pulso_backend",
    },
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)

# Declarative base for ORM models
Base = declarative_base()


# Event listeners for connection pooling
@event.listens_for(engine, "connect")
def receive_connect(dbapi_conn, connection_record):
    """Configure connection parameters when a new connection is created."""
    dbapi_conn.isolation_level = None  # Autocommit mode


@event.listens_for(engine, "engine_disposed")
def receive_engine_disposed(engine):
    """Log when engine connections are disposed."""
    logger.info("Database engine connections disposed")


def get_db() -> Generator[Session, None, None]:
    """
    Dependency for FastAPI to get a database session.

    Usage in routes:
        @app.get("/items")
        async def get_items(db: Session = Depends(get_db)):
            ...

    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        logger.error(f"Database error: {str(e)}")
        db.rollback()
        raise
    except Exception as e:
        logger.error(f"Unexpected error in database session: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize the database by creating all tables.
    Should be called once on application startup.
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except SQLAlchemyError as e:
        logger.error(f"Error creating database tables: {str(e)}")
        raise


def close_db() -> None:
    """
    Close all database connections.
    Should be called on application shutdown.
    """
    try:
        engine.dispose()
        logger.info("Database connections closed")
    except SQLAlchemyError as e:
        logger.error(f"Error closing database connections: {str(e)}")
        raise


async def health_check() -> bool:
    """
    Check database connectivity.

    Returns:
        bool: True if database is accessible, False otherwise
    """
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        return False
