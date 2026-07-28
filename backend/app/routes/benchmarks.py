"""
Benchmarks routes for PULSO MVP.
Provides salary market data for comparison and analysis.
"""

import logging
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from ..database import get_db
from ..models import SalaryBenchmark
from ..config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================================================
# Schemas
# ============================================================================

class BenchmarkItemResponse:
    """Response item for benchmark search."""

    def __init__(self, benchmark: SalaryBenchmark):
        self.id = benchmark.id
        self.cargo_nombre = benchmark.cargo_nombre
        self.p50_usd = benchmark.p50_usd
        self.p25_usd = benchmark.p25_usd
        self.p75_usd = benchmark.p75_usd
        self.p90_usd = benchmark.p90_usd
        self.peso = benchmark.peso
        self.industria = benchmark.industria
        self.tamaño_empresa = benchmark.tamaño_empresa
        self.region = benchmark.region
        self.sample_size = benchmark.sample_size

    def dict(self):
        return {
            "id": self.id,
            "cargo_nombre": self.cargo_nombre,
            "p50_usd": self.p50_usd,
            "p25_usd": self.p25_usd,
            "p75_usd": self.p75_usd,
            "p90_usd": self.p90_usd,
            "peso": self.peso,
            "industria": self.industria,
            "tamaño_empresa": self.tamaño_empresa,
            "region": self.region,
            "sample_size": self.sample_size,
        }


# ============================================================================
# Routes
# ============================================================================

@router.get("")
async def get_benchmarks(
    cargo: str = Query(
        ...,
        min_length=1,
        max_length=255,
        description="Job title to search for",
    ),
    industria: Optional[str] = Query(
        None,
        max_length=100,
        description="Filter by industry (FinTech, SaaS, Large Corp, Startup)",
    ),
    tamaño: Optional[str] = Query(
        None,
        max_length=50,
        description="Filter by company size (1-50, 50-500, 500-5k, 5k+)",
    ),
    region: Optional[str] = Query(
        None,
        max_length=100,
        description="Filter by region (Santiago, Regiones)",
    ),
    db: Session = Depends(get_db),
):
    """
    Search for salary benchmarks by job title with optional filters.

    Query Parameters:
        cargo (required): Job title to search for (e.g., "Senior Backend Engineer")
        industria (optional): Industry filter
        tamaño (optional): Company size filter
        region (optional): Region filter

    Returns:
        dict: Benchmark search results with metadata

    Example:
        GET /benchmarks?cargo=Senior%20Backend%20Engineer&industria=SaaS&tamaño=50-500
    """
    try:
        # Build base query with partial matching on cargo_nombre
        query = db.query(SalaryBenchmark).filter(
            SalaryBenchmark.cargo_nombre.ilike(f"%{cargo}%")
        )

        # Add optional filters
        if industria:
            query = query.filter(SalaryBenchmark.industria == industria)

        if tamaño:
            query = query.filter(SalaryBenchmark.tamaño_empresa == tamaño)

        if region:
            query = query.filter(SalaryBenchmark.region == region)

        # Execute query and order by sample size (most reliable first)
        benchmarks = query.order_by(
            SalaryBenchmark.sample_size.desc()
        ).all()

        if not benchmarks:
            logger.info(
                f"No benchmarks found for cargo='{cargo}' "
                f"industria={industria} tamaño={tamaño}"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No benchmarks found for the given criteria",
            )

        logger.info(f"Found {len(benchmarks)} benchmarks for cargo='{cargo}'")

        # Calculate statistics
        salaries = [b.p50_usd for b in benchmarks]
        avg_salary = sum(salaries) / len(salaries) if salaries else 0
        min_salary = min(salaries) if salaries else 0
        max_salary = max(salaries) if salaries else 0

        return {
            "search_criteria": {
                "cargo": cargo,
                "industria": industria,
                "tamaño": tamaño,
                "region": region,
            },
            "total": len(benchmarks),
            "statistics": {
                "average_p50": round(avg_salary, 2),
                "min_p50": round(min_salary, 2),
                "max_p50": round(max_salary, 2),
            },
            "benchmarks": [
                {
                    "id": b.id,
                    "cargo_nombre": b.cargo_nombre,
                    "p50_usd": b.p50_usd,
                    "p25_usd": b.p25_usd,
                    "p75_usd": b.p75_usd,
                    "p90_usd": b.p90_usd,
                    "peso": b.peso,
                    "industria": b.industria,
                    "tamaño_empresa": b.tamaño_empresa,
                    "region": b.region,
                    "sample_size": b.sample_size,
                }
                for b in benchmarks
            ],
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching benchmarks: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error searching benchmarks",
        )


@router.get("/{benchmark_id}")
async def get_benchmark(
    benchmark_id: int,
    db: Session = Depends(get_db),
):
    """
    Get a specific benchmark by ID.

    Args:
        benchmark_id: Benchmark ID
        db: Database session

    Returns:
        dict: Benchmark details

    Raises:
        HTTPException: If benchmark not found (404)
    """
    try:
        benchmark = db.query(SalaryBenchmark).filter(
            SalaryBenchmark.id == benchmark_id
        ).first()

        if not benchmark:
            logger.info(f"Benchmark {benchmark_id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Benchmark not found",
            )

        logger.info(f"Retrieved benchmark {benchmark_id}")

        return {
            "id": benchmark.id,
            "cargo_nombre": benchmark.cargo_nombre,
            "p50_usd": benchmark.p50_usd,
            "p25_usd": benchmark.p25_usd,
            "p75_usd": benchmark.p75_usd,
            "p90_usd": benchmark.p90_usd,
            "peso": benchmark.peso,
            "industria": benchmark.industria,
            "tamaño_empresa": benchmark.tamaño_empresa,
            "region": benchmark.region,
            "sample_size": benchmark.sample_size,
            "created_at": benchmark.created_at.isoformat(),
            "updated_at": benchmark.updated_at.isoformat(),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving benchmark {benchmark_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving benchmark",
        )


@router.get("/search/byindustry")
async def search_by_industry(
    industria: str = Query(
        ...,
        description="Industry to search for",
    ),
    db: Session = Depends(get_db),
):
    """
    Get all benchmarks for a specific industry.

    Args:
        industria: Industry name
        db: Database session

    Returns:
        dict: Benchmarks grouped by company size and job title

    Raises:
        HTTPException: If no benchmarks found
    """
    try:
        benchmarks = db.query(SalaryBenchmark).filter(
            SalaryBenchmark.industria == industria
        ).order_by(
            SalaryBenchmark.p50_usd.desc()
        ).all()

        if not benchmarks:
            logger.info(f"No benchmarks found for industry: {industria}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No benchmarks found for industry: {industria}",
            )

        # Group by tamaño_empresa
        by_size = {}
        for b in benchmarks:
            size = b.tamaño_empresa
            if size not in by_size:
                by_size[size] = []
            by_size[size].append({
                "cargo_nombre": b.cargo_nombre,
                "p50_usd": b.p50_usd,
                "peso": b.peso,
                "sample_size": b.sample_size,
            })

        logger.info(f"Found {len(benchmarks)} benchmarks for industry: {industria}")

        return {
            "industria": industria,
            "total": len(benchmarks),
            "by_company_size": by_size,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching benchmarks by industry: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error searching benchmarks",
        )


@router.get("/industries/list")
async def list_industries(
    db: Session = Depends(get_db),
):
    """
    Get list of all unique industries in benchmarks.

    Args:
        db: Database session

    Returns:
        dict: List of industries and count of benchmarks per industry
    """
    try:
        industries = db.query(
            SalaryBenchmark.industria,
            func.count(SalaryBenchmark.id).label("count"),
        ).group_by(
            SalaryBenchmark.industria
        ).order_by(
            func.count(SalaryBenchmark.id).desc()
        ).all()

        if not industries:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No industries found in benchmarks",
            )

        logger.info(f"Retrieved {len(industries)} industries")

        return {
            "total": len(industries),
            "industries": [
                {
                    "name": industry[0],
                    "benchmark_count": industry[1],
                }
                for industry in industries
            ],
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving industries: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving industries",
        )
