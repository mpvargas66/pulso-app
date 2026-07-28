"""
Analysis routes for PULSO MVP.
Handles salary analysis creation, retrieval, and management.
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models import User, Analysis, Profile
from ..schemas import AnalysisInput, AnalysisOutput
from ..services.pesaje import PesajeMotor
from ..services.claude_api import claude_service
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
# Routes
# ============================================================================

@router.post("/analyses", response_model=AnalysisOutput, status_code=status.HTTP_201_CREATED)
async def create_analysis(
    analysis_input: AnalysisInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new salary analysis.
    Calculates profile weight, finds benchmarks, and generates recommendations.

    Args:
        analysis_input: Analysis input data
        current_user: Authenticated user
        db: Database session

    Returns:
        AnalysisOutput: Analysis results

    Raises:
        HTTPException: If analysis creation fails
    """
    try:
        # Initialize Pesaje motor
        pesaje_motor = PesajeMotor(db)

        # Step 1: Prepare form data
        form_data = {
            "titulo_cargo": analysis_input.titulo_cargo,
            "años_experiencia": analysis_input.años_experiencia,
            "años_en_cargo_actual": analysis_input.años_en_cargo_actual,
            "liderazgo": analysis_input.liderazgo,
            "competencias": analysis_input.competencias,
            "educacion": analysis_input.educacion,
            "industria": analysis_input.industria,
            "tamaño_empresa": analysis_input.tamaño_empresa,
            "region": analysis_input.region,
        }

        # Step 2: Calculate profile weight
        peso = pesaje_motor.calcular_peso(form_data)
        logger.info(f"Calculated weight for user {current_user.id}: {peso}")

        # Step 3: Find benchmark
        benchmark = pesaje_motor.buscar_benchmark(
            peso=peso,
            industria=analysis_input.industria,
            tamaño=analysis_input.tamaño_empresa,
        )

        if not benchmark:
            logger.warning(f"No benchmark found for peso={peso}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No salary benchmark found for your profile",
            )

        p50_usd = benchmark.get("p50_usd", analysis_input.salario_actual_usd)

        # Step 4: Calculate salary gap
        brecha_pct = (
            (analysis_input.salario_actual_usd - p50_usd) / p50_usd * 100
        )

        # Step 5: Generate recommendations (Claude API)
        recomendaciones = claude_service.generar_recomendaciones(
            peso=peso,
            brecha=brecha_pct,
            cargo=analysis_input.titulo_cargo,
        )

        # Step 6: Create Profile record
        profile = Profile(
            user_id=current_user.id,
            titulo_cargo=analysis_input.titulo_cargo,
            años_experiencia=analysis_input.años_experiencia,
            años_en_cargo_actual=analysis_input.años_en_cargo_actual,
            liderazgo=analysis_input.liderazgo,
            competencias_json=analysis_input.competencias,
            educacion=analysis_input.educacion,
            industria=analysis_input.industria,
            tamaño_empresa=analysis_input.tamaño_empresa,
            region=analysis_input.region,
            peso_calculado=peso,
        )

        db.add(profile)
        db.flush()  # Get profile ID without committing

        # Step 7: Create Analysis record
        analysis = Analysis(
            user_id=current_user.id,
            profile_id=profile.id,
            salario_actual_usd=analysis_input.salario_actual_usd,
            peso_persona=peso,
            p50_usd=p50_usd,
            brecha_pct=brecha_pct,
            recomendaciones=recomendaciones,
        )

        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        logger.info(f"Analysis created: ID {analysis.id} for user {current_user.id}")

        # Step 8: Return response
        return AnalysisOutput(
            id=analysis.id,
            peso=peso,
            p50_usd=p50_usd,
            salario_actual_usd=analysis_input.salario_actual_usd,
            brecha_pct=round(brecha_pct, 2),
            recomendaciones=recomendaciones,
            created_at=analysis.created_at,
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating analysis for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating analysis",
        )


@router.get("/analyses/{analysis_id}", response_model=AnalysisOutput)
async def get_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get a specific analysis by ID.
    Validates that the analysis belongs to the current user.

    Args:
        analysis_id: Analysis ID
        current_user: Authenticated user
        db: Database session

    Returns:
        AnalysisOutput: Analysis data

    Raises:
        HTTPException: If analysis not found or access denied
    """
    try:
        analysis = db.query(Analysis).filter(
            Analysis.id == analysis_id,
            Analysis.user_id == current_user.id,
        ).first()

        if not analysis:
            logger.warning(
                f"Analysis {analysis_id} not found for user {current_user.id}"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found",
            )

        return AnalysisOutput(
            id=analysis.id,
            peso=analysis.peso_persona,
            p50_usd=analysis.p50_usd,
            salario_actual_usd=analysis.salario_actual_usd,
            brecha_pct=round(analysis.brecha_pct, 2),
            recomendaciones=analysis.recomendaciones,
            created_at=analysis.created_at,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving analysis {analysis_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving analysis",
        )


@router.get("/analyses")
async def list_analyses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
):
    """
    Get user's analysis history with pagination.

    Args:
        current_user: Authenticated user
        db: Database session
        page: Page number (1-indexed)
        page_size: Number of items per page

    Returns:
        dict: Paginated analyses list

    Raises:
        HTTPException: If query fails
    """
    try:
        # Calculate offset
        skip = (page - 1) * page_size

        # Get total count
        total = db.query(Analysis).filter(
            Analysis.user_id == current_user.id
        ).count()

        # Get paginated results
        analyses = db.query(Analysis).filter(
            Analysis.user_id == current_user.id
        ).order_by(
            desc(Analysis.created_at)
        ).offset(skip).limit(page_size).all()

        logger.info(
            f"Retrieved {len(analyses)} analyses for user {current_user.id}"
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": (total + page_size - 1) // page_size,
            "items": [
                AnalysisOutput(
                    id=analysis.id,
                    peso=analysis.peso_persona,
                    p50_usd=analysis.p50_usd,
                    salario_actual_usd=analysis.salario_actual_usd,
                    brecha_pct=round(analysis.brecha_pct, 2),
                    recomendaciones=analysis.recomendaciones,
                    created_at=analysis.created_at,
                )
                for analysis in analyses
            ],
        }

    except Exception as e:
        logger.error(f"Error listing analyses for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving analyses",
        )


@router.delete("/analyses/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete a specific analysis.
    Validates that the analysis belongs to the current user.

    Args:
        analysis_id: Analysis ID
        current_user: Authenticated user
        db: Database session

    Raises:
        HTTPException: If analysis not found or access denied
    """
    try:
        analysis = db.query(Analysis).filter(
            Analysis.id == analysis_id,
            Analysis.user_id == current_user.id,
        ).first()

        if not analysis:
            logger.warning(
                f"Analysis {analysis_id} not found for user {current_user.id}"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found",
            )

        # Delete associated profile if it has no other analyses
        profile = analysis.profile
        db.delete(analysis)

        # Check if profile has other analyses
        other_analyses = db.query(Analysis).filter(
            Analysis.profile_id == profile.id
        ).count()

        if other_analyses == 0:
            db.delete(profile)

        db.commit()

        logger.info(f"Analysis {analysis_id} deleted for user {current_user.id}")

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting analysis {analysis_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting analysis",
        )
