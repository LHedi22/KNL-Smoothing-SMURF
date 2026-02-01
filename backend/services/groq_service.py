import logging
import asyncio
import hashlib
from typing import Dict, List, Any, Optional
from groq import Groq
from core.config import settings
from utils.cache import get_cache

logger = logging.getLogger(__name__)

class GroqService:
    
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_MODEL
        self.cache = get_cache() if settings.REDIS_ENABLED else None
    
    def generate_explanation(self, 
                           shap_payload: Dict[str, Any],
                           risk_score_smoothed: float,
                           fraud_detected: bool,
                           decision: str) -> str:
        
        cache_key = self._get_cache_key(shap_payload, risk_score_smoothed, fraud_detected)
        
        if self.cache:
            cached = self.cache.get(cache_key)
            if cached:
                logger.info("Using cached banker explanation")
                return cached
        
        try:
            explanation = self._call_groq(
                shap_payload, 
                risk_score_smoothed, 
                fraud_detected, 
                decision
            )
            
            if self.cache:
                self.cache.set(cache_key, explanation, ex=3600)
            
            return explanation
        except Exception as e:
            logger.error(f"Groq API call failed: {e}")
            return self._fallback_explanation(shap_payload, risk_score_smoothed, fraud_detected, decision)
    
    def _call_groq(self, 
                   shap_payload: Dict[str, Any],
                   risk_score_smoothed: float,
                   fraud_detected: bool,
                   decision: str,
                   max_retries: int = 3) -> str:
        
        prompt = self._build_prompt(shap_payload, risk_score_smoothed, fraud_detected, decision)
        
        for attempt in range(max_retries):
            try:
                message = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a banker's assistant. Provide clear, factual explanations of credit risk decisions in 120-180 words."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    temperature=0.3,
                    max_tokens=200,
                    timeout=settings.REQUEST_TIMEOUT_SECONDS
                )
                
                return message.choices[0].message.content.strip()
            except Exception as e:
                logger.warning(f"Groq attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    asyncio.sleep(2 ** attempt)
                else:
                    raise
    
    def _build_prompt(self, 
                     shap_payload: Dict[str, Any],
                     risk_score_smoothed: float,
                     fraud_detected: bool,
                     decision: str) -> str:
        
        top_factors = []
        for contrib in shap_payload.get('top_positive_contributors', [])[:3]:
            top_factors.append(f"- {contrib['feature']}: {contrib['feature_value']:.2f}")
        
        for contrib in shap_payload.get('top_negative_contributors', [])[:2]:
            top_factors.append(f"- {contrib['feature']}: {contrib['feature_value']:.2f}")
        
        factors_text = "\n".join(top_factors) if top_factors else "- No specific factors identified"
        
        fraud_text = "FRAUD ALERT: Potential fraud detected. " if fraud_detected else ""
        
        prompt = f"""Explain this loan decision for a banker:

Risk Score: {risk_score_smoothed:.1%}
Decision: {decision}
{fraud_text}
Top Contributing Factors:
{factors_text}

Provide a brief, professional explanation suitable for review by a loan officer. Include key factors and risk assessment."""
        
        return prompt
    
    def _fallback_explanation(self,
                            shap_payload: Dict[str, Any],
                            risk_score_smoothed: float,
                            fraud_detected: bool,
                            decision: str) -> str:
        
        factors = []
        for contrib in shap_payload.get('top_positive_contributors', [])[:2]:
            factors.append(f"{contrib['feature']}")
        for contrib in shap_payload.get('top_negative_contributors', [])[:2]:
            factors.append(f"{contrib['feature']}")
        
        factors_str = ", ".join(factors) if factors else "multiple factors"
        
        fraud_note = "Fraud risk detected. " if fraud_detected else ""
        
        return f"{fraud_note}Decision: {decision}. Risk score: {risk_score_smoothed:.1%}. Primary factors: {factors_str}. Review recommended before final approval."
    
    def _get_cache_key(self, shap_payload: Dict[str, Any], risk_score: float, fraud: bool) -> str:
        key_data = f"{risk_score}_{fraud}_{len(shap_payload.get('top_positive_contributors', []))}"
        return f"explanation:{hashlib.md5(key_data.encode()).hexdigest()}"
