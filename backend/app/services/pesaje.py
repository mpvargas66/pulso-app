"""
Pesaje (weighing/analysis) service.
Calculates profile weight (peso) based on multiple factors using a weighting algorithm.
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional, Dict, Any
import logging
from decimal import Decimal

from ..models import FactorWeights, SalaryBenchmark
from ..config import settings

logger = logging.getLogger(__name__)


class PesajeMotor:
    """
    Engine for calculating salary profile weight (peso) based on professional factors.
    Implements multi-factor weighting algorithm for career-stage assessment.
    """

    def __init__(self, db: Session):
        """
        Initialize Pesaje motor with database session.

        Args:
            db: SQLAlchemy database session
        """
        self.db = db
        self._weights_cache: Optional[Dict[str, float]] = None

    def calcular_peso(self, form_data: Dict[str, Any]) -> float:
        """
        Calculate profile weight (peso) based on 8 professional factors.

        Args:
            form_data: Dictionary containing:
                - competencias: List of technical skills
                - titulo_cargo: Job title
                - liderazgo: Number of people leading
                - años_experiencia: Total years of experience
                - industria: Industry name
                - tamaño_empresa: Company size
                - educacion: Education type

        Returns:
            float: Normalized weight score (0-1000)
        """
        try:
            # Extract data
            competencias = form_data.get("competencias", [])
            titulo_cargo = form_data.get("titulo_cargo", "")
            liderazgo = form_data.get("liderazgo", 0)
            años_experiencia = form_data.get("años_experiencia", 0)
            industria = form_data.get("industria", "")
            tamaño_empresa = form_data.get("tamaño_empresa", "")
            educacion = form_data.get("educacion", "")

            # Get factor weights from database
            weights = self.get_weights_from_db()

            # Calculate 8 factors (0-100 scale)
            factor_scores = {
                "complejidad_intelectual": self._complejidad_intelectual(
                    competencias, titulo_cargo
                ),
                "liderazgo": self._liderazgo(liderazgo),
                "autonomia": self._autonomia(años_experiencia),
                "seniority": self._seniority(años_experiencia),
                "mercado": self._mercado(industria),
                "impacto": self._impacto(liderazgo),
                "contexto": self._contexto(tamaño_empresa),
                "educacion": self._educacion(educacion),
            }

            logger.debug(f"Factor scores: {factor_scores}")

            # Calculate weighted sum
            peso_raw = sum(
                factor_scores.get(factor, 0) * weights.get(factor, 0)
                for factor in factor_scores.keys()
            )

            # Normalize to 0-1000 scale
            peso_normalizado = self._normalizar_peso(peso_raw)

            logger.info(f"Calculated peso: {peso_normalizado}")
            return peso_normalizado

        except Exception as e:
            logger.error(f"Error calculating peso: {str(e)}")
            raise

    def get_weights_from_db(self) -> Dict[str, float]:
        """
        Retrieve factor weights from database.
        Uses caching to avoid repeated queries.

        Returns:
            dict: {factor_name: weight_value}
        """
        if self._weights_cache is not None:
            return self._weights_cache

        try:
            weights_records = self.db.query(FactorWeights).filter(
                FactorWeights.version == 1  # Get current version
            ).all()

            if not weights_records:
                logger.warning("No factor weights found in database, using defaults")
                return self._get_default_weights()

            weights = {record.factor_name: record.weight for record in weights_records}
            self._weights_cache = weights

            logger.debug(f"Loaded weights from DB: {weights}")
            return weights

        except Exception as e:
            logger.error(f"Error loading weights from DB: {str(e)}")
            return self._get_default_weights()

    def buscar_benchmark(
        self, peso: float, industria: str, tamaño: str
    ) -> Optional[Dict[str, Any]]:
        """
        Find salary benchmark matching profile weight and market segment.

        Args:
            peso: Profile weight (0-1000)
            industria: Industry name
            tamaño: Company size

        Returns:
            dict: Benchmark data including p50_usd, or None if not found
        """
        try:
            # Calculate weight tolerance (±5%)
            peso_min = peso * 0.95
            peso_max = peso * 1.05

            # Query benchmarks with filters
            benchmark = self.db.query(SalaryBenchmark).filter(
                and_(
                    SalaryBenchmark.peso >= peso_min,
                    SalaryBenchmark.peso <= peso_max,
                    SalaryBenchmark.industria == industria,
                    SalaryBenchmark.tamaño_empresa == tamaño,
                )
            ).order_by(SalaryBenchmark.sample_size.desc()).first()

            # Fallback: search by industry only if no exact match
            if not benchmark:
                benchmark = self.db.query(SalaryBenchmark).filter(
                    and_(
                        SalaryBenchmark.peso >= peso_min,
                        SalaryBenchmark.peso <= peso_max,
                        SalaryBenchmark.industria == industria,
                    )
                ).order_by(SalaryBenchmark.sample_size.desc()).first()

            # Fallback: search by weight only
            if not benchmark:
                benchmark = self.db.query(SalaryBenchmark).filter(
                    and_(
                        SalaryBenchmark.peso >= peso_min,
                        SalaryBenchmark.peso <= peso_max,
                    )
                ).order_by(SalaryBenchmark.sample_size.desc()).first()

            if benchmark:
                logger.info(f"Found benchmark for peso={peso}: {benchmark.cargo_nombre}")
                return {
                    "id": benchmark.id,
                    "cargo_nombre": benchmark.cargo_nombre,
                    "p50_usd": benchmark.p50_usd,
                    "p25_usd": benchmark.p25_usd,
                    "p75_usd": benchmark.p75_usd,
                    "p90_usd": benchmark.p90_usd,
                    "industria": benchmark.industria,
                    "tamaño_empresa": benchmark.tamaño_empresa,
                    "region": benchmark.region,
                    "sample_size": benchmark.sample_size,
                }
            else:
                logger.warning(f"No benchmark found for peso={peso}")
                return None

        except Exception as e:
            logger.error(f"Error searching benchmark: {str(e)}")
            return None

    # ========================================================================
    # Private Factor Calculation Methods
    # ========================================================================

    @staticmethod
    def _complejidad_intelectual(competencias: list, titulo: str) -> float:
        """Calculate intellectual complexity (0-100)."""
        base_score = 30

        # Bonus por número de competencias
        base_score += min(len(competencias) * 5, 30)

        # Bonus por palabras clave en título
        senior_keywords = ["senior", "lead", "principal", "architect", "staff"]
        if any(kw in titulo.lower() for kw in senior_keywords):
            base_score += 20

        return min(base_score, 100)

    @staticmethod
    def _liderazgo(personas: int) -> float:
        """Calculate leadership factor (0-85)."""
        return min(personas * 17, 85)

    @staticmethod
    def _autonomia(años: int) -> float:
        """Calculate autonomy factor (0-70)."""
        return 40 if años >= 5 else 25

    @staticmethod
    def _seniority(años: int) -> float:
        """Calculate seniority level (0-100)."""
        if años < 2:
            return 25  # Junior
        elif años < 5:
            return 45  # Mid-level
        elif años < 10:
            return 70  # Senior
        else:
            return 90  # Staff

    @staticmethod
    def _mercado(industria: str) -> float:
        """Calculate market factor based on industry (0-60)."""
        market_values = {
            "FinTech": 50,
            "SaaS": 45,
            "Large Corp": 30,
            "Startup": 40,
        }
        return market_values.get(industria, 35)

    @staticmethod
    def _impacto(liderazgo: int) -> float:
        """Calculate impact factor (0-75)."""
        return 50 if liderazgo > 0 else 20

    @staticmethod
    def _contexto(tamaño: str) -> float:
        """Calculate context factor based on company size (0-50)."""
        size_values = {
            "1-50": 25,
            "50-500": 35,
            "500-5k": 42,
            "5k+": 50,
        }
        return size_values.get(tamaño, 30)

    @staticmethod
    def _educacion(educacion: str) -> float:
        """Calculate education factor (0-40)."""
        education_values = {
            "CS Degree": 25,
            "Carrera en CS": 25,
            "Bootcamp": 15,
            "Self-taught": 10,
            "Autodidacta": 10,
        }
        return education_values.get(educacion, 10)

    @staticmethod
    def _normalizar_peso(peso_raw: float) -> float:
        """
        Normalize weight to 0-1000 scale.

        Args:
            peso_raw: Raw weight from factor sum

        Returns:
            float: Normalized weight (0-1000)
        """
        # Assuming max raw weight is 800-900, scale to 1000
        normalized = (peso_raw / 8.0) * 1000  # 8 factors, ~100 avg each
        return min(max(normalized, 0), 1000)  # Clamp to 0-1000

    @staticmethod
    def _get_default_weights() -> Dict[str, float]:
        """Get default factor weights if database is empty."""
        return {
            "complejidad_intelectual": 0.15,
            "liderazgo": 0.12,
            "autonomia": 0.10,
            "seniority": 0.20,
            "mercado": 0.12,
            "impacto": 0.10,
            "contexto": 0.10,
            "educacion": 0.11,
        }
