"""
Authentication routes for PULSO MVP.
Handles user signup, login, and logout with JWT tokens.
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext
import jwt

from ..database import get_db
from ..models import User
from ..config import settings

logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ============================================================================
# Schemas
# ============================================================================

class SignupRequest(BaseModel):
    """Request schema for user signup."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(
        ...,
        min_length=8,
        max_length=255,
        description="Password (minimum 8 characters)"
    )
    full_name: Optional[str] = Field(
        default=None,
        max_length=255,
        description="User's full name"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "SecurePassword123",
                "full_name": "Juan Pérez",
            }
        }


class LoginRequest(BaseModel):
    """Request schema for user login."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "SecurePassword123",
            }
        }


class AuthResponse(BaseModel):
    """Response schema for auth endpoints."""
    id: int = Field(..., description="User ID")
    email: str = Field(..., description="User email")
    full_name: Optional[str] = Field(..., description="User's full name")
    token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "email": "user@example.com",
                "full_name": "Juan Pérez",
                "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
                "token_type": "bearer",
                "expires_in": 86400,
            }
        }


class LogoutResponse(BaseModel):
    """Response schema for logout."""
    ok: bool = Field(..., description="Logout success status")
    message: str = Field(..., description="Logout message")


# ============================================================================
# Helper Functions
# ============================================================================

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    Args:
        password: Plain text password

    Returns:
        str: Hashed password
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.

    Args:
        plain_password: Plain text password
        hashed_password: Hashed password

    Returns:
        bool: True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_jwt_token(user_id: int, expires_delta: Optional[timedelta] = None) -> tuple[str, int]:
    """
    Create JWT token for user.

    Args:
        user_id: User ID to encode in token
        expires_delta: Token expiration time delta

    Returns:
        tuple: (token, expires_in_seconds)

    Raises:
        Exception: If token creation fails
    """
    if expires_delta is None:
        expires_delta = timedelta(hours=settings.jwt_expiration_hours)

    expire = datetime.now(timezone.utc) + expires_delta
    expires_in = int(expires_delta.total_seconds())

    payload = {
        "sub": str(user_id),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "access",
    }

    try:
        token = jwt.encode(
            payload,
            settings.jwt_secret,
            algorithm=settings.jwt_algorithm,
        )
        return token, expires_in
    except Exception as e:
        logger.error(f"Error creating JWT token: {str(e)}")
        raise


def verify_jwt_token(token: str) -> Optional[int]:
    """
    Verify and decode JWT token.

    Args:
        token: JWT token string

    Returns:
        int: User ID from token payload, or None if invalid

    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
        user_id: int = int(payload.get("sub"))
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID",
            )
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.JWTError as e:
        logger.warning(f"JWT validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


# ============================================================================
# Routes
# ============================================================================

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    request: SignupRequest,
    db: Session = Depends(get_db),
):
    """
    User signup endpoint.
    Creates a new user account and returns JWT token.

    Args:
        request: Signup request with email, password, full_name
        db: Database session

    Returns:
        AuthResponse: User info and JWT token

    Raises:
        HTTPException: If email already exists (409)
        HTTPException: If validation fails (422)
    """
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(
            User.email == request.email.lower()
        ).first()

        if existing_user:
            logger.warning(f"Signup attempt with existing email: {request.email}")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        # Hash password
        password_hash = hash_password(request.password)

        # Create user
        new_user = User(
            email=request.email.lower(),
            password_hash=password_hash,
            full_name=request.full_name,
            is_active=True,
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        logger.info(f"New user created: {new_user.email} (ID: {new_user.id})")

        # Generate JWT token
        token, expires_in = create_jwt_token(new_user.id)

        return AuthResponse(
            id=new_user.id,
            email=new_user.email,
            full_name=new_user.full_name,
            token=token,
            token_type="bearer",
            expires_in=expires_in,
        )

    except IntegrityError:
        db.rollback()
        logger.error(f"Database integrity error during signup")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error during signup: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating user account",
        )


@router.post("/login", response_model=AuthResponse)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    User login endpoint.
    Authenticates user and returns JWT token.

    Args:
        request: Login request with email and password
        db: Database session

    Returns:
        AuthResponse: User info and JWT token

    Raises:
        HTTPException: If email not found or password invalid (401)
    """
    try:
        # Find user by email
        user = db.query(User).filter(
            User.email == request.email.lower()
        ).first()

        if not user:
            logger.warning(f"Login attempt with non-existent email: {request.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        # Check if user is active
        if not user.is_active:
            logger.warning(f"Login attempt with inactive user: {request.email}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive",
            )

        # Verify password
        if not verify_password(request.password, user.password_hash):
            logger.warning(f"Failed login attempt for: {request.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        logger.info(f"Successful login: {user.email} (ID: {user.id})")

        # Generate JWT token
        token, expires_in = create_jwt_token(user.id)

        return AuthResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            token=token,
            token_type="bearer",
            expires_in=expires_in,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error authenticating user",
        )


@router.post("/logout", response_model=LogoutResponse)
async def logout(
    authorization: Optional[str] = None,
):
    """
    User logout endpoint.
    Validates JWT token and logs out user.

    Note: In MVP, logout is stateless (JWT validation only).
    For Phase 2, consider implementing token blacklist.

    Args:
        authorization: Bearer token from Authorization header

    Returns:
        LogoutResponse: Logout success status

    Raises:
        HTTPException: If token is invalid (401)
    """
    try:
        if not authorization:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authorization header",
            )

        # Extract token from "Bearer <token>"
        try:
            scheme, token = authorization.split()
            if scheme.lower() != "bearer":
                raise ValueError("Invalid authorization scheme")
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header format",
            )

        # Verify token
        user_id = verify_jwt_token(token)

        logger.info(f"User logged out: ID {user_id}")

        return LogoutResponse(
            ok=True,
            message="Logout successful",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during logout: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error during logout",
        )
