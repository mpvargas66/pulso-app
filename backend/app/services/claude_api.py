"""
Claude API service for AI-powered recommendations.
Integrates with Anthropic's Claude API for generating personalized salary advice.

Note: MVP Phase 1 uses simple template-based recommendations.
Phase 2 will integrate full Claude API for personalized insights.
"""

import logging
from typing import Optional
from anthropic import Anthropic, APIError, APITimeoutError

from ..config import settings

logger = logging.getLogger(__name__)


class ClaudeAPIService:
    """
    Service for interacting with Anthropic's Claude API.
    Handles recommendation generation for salary analysis.
    """

    def __init__(self):
        """
        Initialize Claude API client with API key from settings.

        Raises:
            ValueError: If CLAUDE_API_KEY is not configured
        """
        if not settings.claude_api_key:
            logger.warning(
                "CLAUDE_API_KEY not configured. Claude features will be disabled."
            )
            self.client = None
        else:
            self.client = Anthropic(api_key=settings.claude_api_key)

    def generar_recomendaciones(
        self, peso: float, brecha: float, cargo: str, timeout: int = 10
    ) -> str:
        """
        Generate personalized salary recommendations using Claude API.

        Args:
            peso: Profile weight score (0-1000)
            brecha: Salary gap percentage
            cargo: Job title
            timeout: API request timeout in seconds

        Returns:
            str: Personalized recommendation text

        Note:
            In MVP Phase 1, returns template-based recommendations.
            Phase 2 will use full Claude API responses.
        """
        # Phase 1: Use template-based recommendations (MVP)
        recommendation = self._generar_recomendacion_template(peso, brecha, cargo)
        logger.info(f"Generated template recommendation for {cargo} (peso={peso})")
        return recommendation

        # Phase 2: Full Claude API integration (commented for reference)
        # if not self.client:
        #     logger.warning("Claude API not configured, using template recommendations")
        #     return self._generar_recomendacion_template(peso, brecha, cargo)
        #
        # return await self._generar_recomendacion_claude(peso, brecha, cargo, timeout)

    async def generar_recomendaciones_async(
        self, peso: float, brecha: float, cargo: str, timeout: int = 10
    ) -> str:
        """
        Async version of generar_recomendaciones for use in async contexts.

        Args:
            peso: Profile weight score (0-1000)
            brecha: Salary gap percentage
            cargo: Job title
            timeout: API request timeout in seconds

        Returns:
            str: Personalized recommendation text
        """
        return self.generar_recomendaciones(peso, brecha, cargo, timeout)

    def _generar_recomendacion_template(
        self, peso: float, brecha: float, cargo: str
    ) -> str:
        """
        Generate template-based recommendations (MVP Phase 1).

        Args:
            peso: Profile weight score (0-1000)
            brecha: Salary gap percentage
            cargo: Job title

        Returns:
            str: Template-based recommendation
        """
        recommendations = []

        # Brecha-based recommendations
        if brecha >= 15:
            recommendations.append(
                "✓ Excelente posición: Ganas más que el mercado. "
                "Mantén tus habilidades actualizadas y considera oportunidades de liderazgo."
            )
        elif brecha >= 5:
            recommendations.append(
                "✓ Buena posición: Tu salario está cerca del mercado. "
                "Enfócate en desarrollar nuevas competencias para diferenciarte."
            )
        elif brecha >= -5:
            recommendations.append(
                "→ En línea con el mercado: Tu salario es competitivo. "
                "Considera negociar beneficios adicionales o crecimiento de carrera."
            )
        elif brecha >= -15:
            recommendations.append(
                "⚠ Oportunidad: Hay espacio para mejorar tu salario. "
                "Documenta tus logros y prepárate para una negociación."
            )
        else:
            recommendations.append(
                "⚠ Brecha significativa: Considera buscar nuevas oportunidades "
                "o negociar una revisión salarial basada en benchmarks de mercado."
            )

        # Weight-based recommendations
        if peso >= 750:
            recommendations.append(
                "Tu perfil es muy fuerte. Podrías tener mayor visibilidad en el mercado "
                "para acceder a posiciones de mayor seniority."
            )
        elif peso >= 650:
            recommendations.append(
                "Perfil sólido. Considera especializarte en áreas de alta demanda "
                "o asumir roles de liderazgo para aumentar tu valor."
            )
        elif peso >= 500:
            recommendations.append(
                "Perfil en desarrollo. Invierte en certificaciones o experiencias "
                "clave para tu industria."
            )
        else:
            recommendations.append(
                "Enfócate en ganar experiencia y construir una base sólida de competencias."
            )

        # Industry-specific hints
        if peso < 600 and brecha < 0:
            recommendations.append(
                "Para mejorar tu posición, considera desarrollar competencias técnicas "
                "en demanda o buscar roles en industrias de mayor valuación."
            )

        return " ".join(recommendations[:2])  # Return top 2 recommendations

    async def _generar_recomendacion_claude(
        self, peso: float, brecha: float, cargo: str, timeout: int
    ) -> str:
        """
        Generate recommendations using Claude API (Phase 2).
        This is prepared for future integration.

        Args:
            peso: Profile weight score (0-1000)
            brecha: Salary gap percentage
            cargo: Job title
            timeout: API request timeout in seconds

        Returns:
            str: Claude-generated recommendation

        Raises:
            APIError: If Claude API call fails
            APITimeoutError: If request times out
        """
        if not self.client:
            return self._generar_recomendacion_template(peso, brecha, cargo)

        try:
            # Prepare prompt for Claude
            prompt = self._preparar_prompt(peso, brecha, cargo)

            # Call Claude API
            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=300,
                messages=[{"role": "user", "content": prompt}],
                timeout=timeout,
            )

            # Extract response text
            recommendation = message.content[0].text
            logger.info(f"Generated Claude recommendation for {cargo}")
            return recommendation

        except APITimeoutError:
            logger.error(f"Claude API timeout for {cargo}")
            return self._generar_recomendacion_template(peso, brecha, cargo)
        except APIError as e:
            logger.error(f"Claude API error: {str(e)}")
            return self._generar_recomendacion_template(peso, brecha, cargo)
        except Exception as e:
            logger.error(f"Unexpected error calling Claude API: {str(e)}")
            return self._generar_recomendacion_template(peso, brecha, cargo)

    @staticmethod
    def _preparar_prompt(peso: float, brecha: float, cargo: str) -> str:
        """
        Prepare prompt for Claude API call.

        Args:
            peso: Profile weight score (0-1000)
            brecha: Salary gap percentage
            cargo: Job title

        Returns:
            str: Formatted prompt for Claude
        """
        prompt = f"""Eres un asesor de carrera especializado en salarios en tecnología.
Un profesional con el siguiente perfil te consulta:

- Cargo: {cargo}
- Peso de perfil: {peso}/1000
- Brecha salarial: {brecha:+.1f}% (comparado con el mercado)

Proporciona UNA sola recomendación concisa (máximo 2 oraciones) y accionable sobre cómo mejorar su posición salarial.
Sé directo y práctico."""

        return prompt

    def health_check(self) -> bool:
        """
        Check if Claude API is properly configured and accessible.

        Returns:
            bool: True if API is configured and working, False otherwise
        """
        if not self.client:
            logger.warning("Claude API client not initialized")
            return False

        try:
            # Try a minimal API call to verify credentials
            # Note: Using models.list() which is a read-only operation
            models = self.client.models.list()
            logger.info("Claude API health check passed")
            return True
        except APIError as e:
            logger.error(f"Claude API health check failed: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error in Claude API health check: {str(e)}")
            return False


# Initialize global service instance
claude_service = ClaudeAPIService()

__all__ = ["ClaudeAPIService", "claude_service"]
