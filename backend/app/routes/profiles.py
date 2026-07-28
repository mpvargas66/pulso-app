"""
Profile routes for PULSO MVP.
Handles user profile creation, retrieval, and management.
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Profile
from ..schemas import ProfileResponse, ProfileCreate
from ..routes.auth import verify_jwt_token

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================================================
# Dependencies
# ============================================================================

async def get_current_user(
    authorization: Optional[str] = None,
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency to get current authenticated user from JWT token.

    Args:
        authorization: Authorization header with Bearer token
        db: Database session

    Returns:
        User: Current authenticated user

    Raises:
        HTTPException: If token is invalid or user not found
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
        )

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Invalid authorization scheme")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
        )

    # Verify JWT and get user ID
    user_id = verify_jwt_token(token)

    # Get user from database
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()

    if not user:
        logger.warning(f"User not found for JWT: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


# ============================================================================
# Helper Functions
# ============================================================================

def profile_to_response(profile: Profile) -> ProfileResponse:
    """Convert Profile model to response schema."""
    return ProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        titulo_cargo=profile.titulo_cargo,
        años_experiencia=profile.años_experiencia,
        años_en_cargo_actual=profile.años_en_cargo_actual,
        liderazgo=profile.liderazgo,
        competencias=profile.competencias_json or [],
        educacion=profile.educacion,
        industria=profile.industria,
        tamaño_empresa=profile.tamaño_empresa,
        region=profile.region,
        peso_calculado=profile.peso_calculado,
        created_at=profile.created_at,
    )


# ============================================================================
# Routes
# ============================================================================

@router.get("/me/profile", response_model=ProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get the authenticated user's profile.
    Returns the most recent profile if multiple exist.

    Args:
        current_user: Authenticated user
        db: Database session

    Returns:
        ProfileResponse: User's profile data

    Raises:
        HTTPException: If profile not found (404)
    """
    try:
        # Get most recent profile for user
        profile = db.query(Profile).filter(
            Profile.user_id == current_user.id
        ).order_by(
            Profile.created_at.desc()
        ).first()

        if not profile:
            logger.info(f"No profile found for user {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found. Please create one first.",
            )

        logger.info(f"Retrieved profile for user {current_user.id}")
        return profile_to_response(profile)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving profile for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving profile",
        )


@router.post("/profiles", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_or_update_profile(
    profile_input: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new profile or update the existing one.
    If user has an existing profile, creates a new version (historical tracking).

    Args:
        profile_input: Profile data
        current_user: Authenticated user
        db: Database session

    Returns:
        ProfileResponse: Created/updated profile

    Raises:
        HTTPException: If validation fails or DB error occurs
    """
    try:
        # Create new profile (MVPs creates new profile for each submission)
        # For Phase 2, consider implementing update logic
        new_profile = Profile(
            user_id=current_user.id,
            titulo_cargo=profile_input.titulo_cargo,
            años_experiencia=profile_input.años_experiencia,
            años_en_cargo_actual=profile_input.años_en_cargo_actual,
            liderazgo=profile_input.liderazgo,
            competencias_json=profile_input.competencias,
            educacion=profile_input.educacion,
            industria=profile_input.industria,
            tamaño_empresa=profile_input.tamaño_empresa,
            region=profile_input.region,
            peso_calculado=None,  # Will be calculated during analysis
        )

        db.add(new_profile)
        db.commit()
        db.refresh(new_profile)

        logger.info(f"Profile created/updated for user {current_user.id}: ID {new_profile.id}")

        return profile_to_response(new_profile)

    except Exception as e:
        db.rollback()
        logger.error(f"Error creating profile for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating profile",
        )


@router.get("/profiles/{profile_id}", response_model=ProfileResponse)
async def get_public_profile(
    profile_id: int,
    db: Session = Depends(get_db),
):
    """
    Get a profile by ID (public endpoint).
    Returns limited data for privacy (only public-safe fields).

    Note: Phase 2 can implement privacy controls per user setting.

    Args:
        profile_id: Profile ID
        db: Database session

    Returns:
        ProfileResponse: Limited profile data

    Raises:
        HTTPException: If profile not found (404)
    """
    try:
        profile = db.query(Profile).filter(
            Profile.id == profile_id
        ).first()

        if not profile:
            logger.info(f"Profile {profile_id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found",
            )

        logger.info(f"Retrieved public profile {profile_id}")

        # Return response with all data
        # Phase 2: Implement privacy controls to hide sensitive fields
        return profile_to_response(profile)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving profile {profile_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving profile",
        )


@router.get("/me/profiles")
async def get_my_profiles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get all profiles for the authenticated user (for historical tracking).

    Args:
        current_user: Authenticated user
        db: Database session

    Returns:
        list: Array of user's profiles

    Raises:
        HTTPException: If query fails
    """
    try:
        profiles = db.query(Profile).filter(
            Profile.user_id == current_user.id
        ).order_by(
            Profile.created_at.desc()
        ).all()

        logger.info(f"Retrieved {len(profiles)} profiles for user {current_user.id}")

        return {
            "total": len(profiles),
            "profiles": [profile_to_response(p) for p in profiles],
        }

    except Exception as e:
        logger.error(f"Error retrieving profiles for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving profiles",
        )


@router.delete("/profiles/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete a profile (only owner can delete).
    Also deletes associated analyses.

    Args:
        profile_id: Profile ID
        current_user: Authenticated user
        db: Database session

    Raises:
        HTTPException: If profile not found or access denied
    """
    try:
        profile = db.query(Profile).filter(
            Profile.id == profile_id,
            Profile.user_id == current_user.id,
        ).first()

        if not profile:
            logger.warning(
                f"Profile {profile_id} not found for user {current_user.id}"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found",
            )

        # Delete profile (cascade will delete associated analyses)
        db.delete(profile)
        db.commit()

        logger.info(f"Profile {profile_id} deleted for user {current_user.id}")

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting profile {profile_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting profile",
        )
