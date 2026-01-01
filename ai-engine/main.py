from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import logging
import uvicorn
from datetime import datetime
import asyncio

from models.price_predictor import RWAPricePredictor, RiskScorer, AnomalyDetector
from config import settings

# Configure logging
logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="RWA DEX AI Pricing Engine",
    description="AI-powered pricing and risk analysis for Real World Asset tokens",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != settings.API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    return credentials

# Global model instances
price_predictor = RWAPricePredictor()
risk_scorer = RiskScorer()
anomaly_detector = AnomalyDetector()

# Pydantic models
class AssetData(BaseModel):
    token_address: str
    name: str
    symbol: str
    asset_type: str = Field(..., description="RealEstate, Bond, Invoice, Commodity, Equipment")
    total_asset_value: float = Field(..., gt=0)
    current_price: float = Field(..., gt=0)
    volume_24h: float = Field(default=0, ge=0)
    volume_7d_avg: float = Field(default=0, ge=0)
    price_change_24h: float = Field(default=0)
    price_volatility_30d: float = Field(default=0, ge=0)
    yield_rate: float = Field(default=0, ge=0)
    days_until_maturity: Optional[int] = Field(default=365, gt=0)
    liquidity_reserve0: float = Field(default=0, ge=0)
    liquidity_reserve1: float = Field(default=0, ge=0)
    total_liquidity: float = Field(default=0, ge=0)
    holder_count: int = Field(default=0, ge=0)
    transaction_count_24h: int = Field(default=0, ge=0)
    market_cap: float = Field(default=0, ge=0)
    jurisdiction: str = Field(default="GLOBAL")
    compliance_required: bool = Field(default=True)

class PredictionResponse(BaseModel):
    predicted_price: float
    current_price: float
    confidence_score: float
    price_difference: float
    price_difference_percent: float
    recommendation: str
    reasoning: str
    timestamp: str

class RiskResponse(BaseModel):
    overall_risk_score: float
    risk_category: str
    risk_components: Dict[str, float]
    recommendations: List[str]
    timestamp: str

class PortfolioData(BaseModel):
    assets: List[AssetData]
    total_value: float
    user_risk_tolerance: str = Field(default="medium", pattern="^(low|medium|high)$")

class MarketInsight(BaseModel):
    insight_type: str
    title: str
    description: str
    confidence: float
    relevant_assets: List[str]
    timestamp: str

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_trained": price_predictor.is_trained,
        "version": "1.0.0"
    }

# Price prediction endpoint
@app.post("/api/ai/predict-price", response_model=PredictionResponse)
async def predict_price(
    asset: AssetData,
    credentials: HTTPAuthorizationCredentials = Depends(verify_api_key)
):
    """Predict fair value for an RWA token"""
    try:
        if not price_predictor.is_trained:
            # For demo purposes, use a simple heuristic
            predicted_price = asset.current_price * (1 + (asset.yield_rate / 10000))
            confidence = 0.7
        else:
            predicted_price, confidence = price_predictor.predict(asset.dict())
        
        price_diff = predicted_price - asset.current_price
        price_diff_percent = (price_diff / asset.current_price) * 100
        
        # Generate recommendation
        if price_diff_percent > 5:
            recommendation = "BUY"
            reasoning = f"AI model predicts asset is undervalued by {price_diff_percent:.2f}%. " \
                       f"Factors: yield rate ({asset.yield_rate} bps), liquidity, market conditions."
        elif price_diff_percent < -5:
            recommendation = "SELL"
            reasoning = f"AI model predicts asset is overvalued by {abs(price_diff_percent):.2f}%. " \
                       f"Consider taking profits or reducing exposure."
        else:
            recommendation = "HOLD"
            reasoning = f"Asset appears fairly valued (difference: {price_diff_percent:.2f}%). " \
                       f"Current market price aligns with AI valuation model."
        
        return PredictionResponse(
            predicted_price=predicted_price,
            current_price=asset.current_price,
            confidence_score=confidence,
            price_difference=price_diff,
            price_difference_percent=price_diff_percent,
            recommendation=recommendation,
            reasoning=reasoning,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error in price prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# Risk scoring endpoint
@app.post("/api/ai/risk-score", response_model=RiskResponse)
async def calculate_risk_score(
    asset: AssetData,
    credentials: HTTPAuthorizationCredentials = Depends(verify_api_key)
):
    """Calculate comprehensive risk score for an asset"""
    try:
        risk_analysis = risk_scorer.calculate_risk_score(asset.dict())
        
        # Generate recommendations based on risk level
        recommendations = []
        
        if risk_analysis['overall_risk_score'] > 70:
            recommendations.extend([
                "High risk asset - consider small position sizes",
                "Monitor liquidity and volume closely",
                "Set strict stop-loss levels"
            ])
        elif risk_analysis['overall_risk_score'] > 40:
            recommendations.extend([
                "Medium risk asset - suitable for balanced portfolios",
                "Consider dollar-cost averaging for entry",
                "Monitor fundamental factors"
            ])
        else:
            recommendations.extend([
                "Low risk asset - suitable for conservative portfolios",
                "Good candidate for larger allocations",
                "Focus on yield optimization"
            ])
        
        # Add specific recommendations based on risk components
        if risk_analysis['risk_components']['liquidity_risk'] > 60:
            recommendations.append("Low liquidity detected - be cautious with large orders")
        
        if risk_analysis['risk_components']['volatility_risk'] > 50:
            recommendations.append("High volatility - consider volatility-adjusted position sizing")
        
        return RiskResponse(
            overall_risk_score=risk_analysis['overall_risk_score'],
            risk_category=risk_analysis['risk_category'],
            risk_components=risk_analysis['risk_components'],
            recommendations=recommendations,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error in risk calculation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Risk calculation failed: {str(e)}")

# Portfolio analysis endpoint
@app.post("/api/ai/portfolio-analysis")
async def analyze_portfolio(
    portfolio: PortfolioData,
    credentials: HTTPAuthorizationCredentials = Depends(verify_api_key)
):
    """Analyze entire portfolio and suggest optimizations"""
    try:
        portfolio_analysis = {
            "total_assets": len(portfolio.assets),
            "total_value": portfolio.total_value,
            "risk_metrics": {},
            "diversification_score": 0.0,
            "recommendations": [],
            "rebalancing_suggestions": []
        }
        
        # Calculate portfolio risk metrics
        risk_scores = []
        asset_types = []
        jurisdictions = []
        
        for asset in portfolio.assets:
            risk_data = risk_scorer.calculate_risk_score(asset.dict())
            risk_scores.append(risk_data['overall_risk_score'])
            asset_types.append(asset.asset_type)
            jurisdictions.append(asset.jurisdiction)
        
        # Portfolio-level risk calculation
        portfolio_risk = sum(risk_scores) / len(risk_scores) if risk_scores else 50
        
        # Diversification analysis
        unique_types = len(set(asset_types))
        unique_jurisdictions = len(set(jurisdictions))
        
        diversification_score = min(1.0, (unique_types / 5.0) * 0.6 + (unique_jurisdictions / 5.0) * 0.4)
        
        portfolio_analysis.update({
            "risk_metrics": {
                "portfolio_risk_score": round(portfolio_risk, 2),
                "risk_level": "High" if portfolio_risk > 60 else "Medium" if portfolio_risk > 30 else "Low",
                "volatility_estimate": round(np.mean([asset.price_volatility_30d for asset in portfolio.assets]), 4)
            },
            "diversification_score": round(diversification_score, 2),
        })
        
        # Generate recommendations
        recommendations = []
        
        if diversification_score < 0.5:
            recommendations.append("Portfolio lacks diversification - consider adding different asset types")
        
        if portfolio_risk > 70 and portfolio.user_risk_tolerance == "low":
            recommendations.append("Portfolio risk too high for stated risk tolerance - consider rebalancing")
        
        if len(portfolio.assets) < 5:
            recommendations.append("Consider adding more assets to improve diversification")
        
        # Asset type concentration check
        type_counts = {}
        for asset_type in asset_types:
            type_counts[asset_type] = type_counts.get(asset_type, 0) + 1
        
        max_concentration = max(type_counts.values()) / len(portfolio.assets)
        if max_concentration > 0.6:
            recommendations.append(f"High concentration in {max(type_counts, key=type_counts.get)} assets")
        
        portfolio_analysis["recommendations"] = recommendations
        portfolio_analysis["timestamp"] = datetime.now().isoformat()
        
        return portfolio_analysis
        
    except Exception as e:
        logger.error(f"Error in portfolio analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Portfolio analysis failed: {str(e)}")

# Market insights endpoint
@app.get("/api/ai/market-insights")
async def get_market_insights(
    credentials: HTTPAuthorizationCredentials = Depends(verify_api_key)
):
    """Get AI-generated market insights and trends"""
    try:
        # Generate mock insights for demo
        insights = [
            MarketInsight(
                insight_type="trend",
                title="Real Estate RWAs Showing Strong Performance",
                description="Real estate-backed tokens have outperformed other asset classes by 12% this month, driven by institutional adoption and favorable regulatory developments.",
                confidence=0.85,
                relevant_assets=["RWRE001", "RWRE002"],
                timestamp=datetime.now().isoformat()
            ),
            MarketInsight(
                insight_type="risk",
                title="Increased Volatility in Invoice-Based Assets",
                description="Invoice factoring tokens showing 30% higher volatility than historical average. Recommend careful position sizing.",
                confidence=0.78,
                relevant_assets=["RWINV001"],
                timestamp=datetime.now().isoformat()
            ),
            MarketInsight(
                insight_type="opportunity",
                title="Arbitrage Opportunity in Cross-Chain Liquidity",
                description="Price discrepancies detected between Mantle and Ethereum markets for similar RWA tokens. Potential for arbitrage.",
                confidence=0.72,
                relevant_assets=["RWBOND001"],
                timestamp=datetime.now().isoformat()
            )
        ]
        
        return {
            "insights": insights,
            "market_summary": {
                "total_tvl_change_24h": 5.2,
                "average_apy": 8.4,
                "trending_asset_type": "RealEstate",
                "market_sentiment": "Bullish"
            },
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating market insights: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Market insights failed: {str(e)}")

# Anomaly detection endpoint
@app.post("/api/ai/detect-anomaly")
async def detect_anomaly(
    asset: AssetData,
    credentials: HTTPAuthorizationCredentials = Depends(verify_api_key)
):
    """Detect unusual patterns in asset data"""
    try:
        anomaly_result = anomaly_detector.detect_anomaly(asset.dict())
        
        return {
            **anomaly_result,
            "asset_address": asset.token_address,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in anomaly detection: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")

# Training endpoint (admin only)
@app.post("/api/ai/train-model")
async def train_model(
    training_data: List[Dict[str, Any]],
    credentials: HTTPAuthorizationCredentials = Depends(verify_api_key)
):
    """Train the AI models with new data"""
    try:
        if len(training_data) < settings.MIN_TRAINING_SAMPLES:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient training data. Need at least {settings.MIN_TRAINING_SAMPLES} samples"
            )
        
        # Train price prediction model
        training_metrics = price_predictor.train(training_data)
        
        # Extract normal data for anomaly detection
        normal_data = [data for data in training_data if not data.get('is_anomaly', False)]
        
        if len(normal_data) > 50:  # Need sufficient normal samples
            anomaly_detector.train(normal_data)
        
        return {
            "status": "success",
            "training_metrics": training_metrics,
            "models_trained": ["price_predictor", "anomaly_detector"],
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error training models: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Model training failed: {str(e)}")

# Model status endpoint
@app.get("/api/ai/model-status")
async def get_model_status(
    credentials: HTTPAuthorizationCredentials = Depends(verify_api_key)
):
    """Get current model training status and performance"""
    try:
        status = {
            "price_predictor": {
                "is_trained": price_predictor.is_trained,
                "last_trained": price_predictor.last_trained.isoformat() if price_predictor.last_trained else None,
                "feature_importance": price_predictor.get_feature_importance()
            },
            "anomaly_detector": {
                "is_trained": anomaly_detector.is_trained
            },
            "system": {
                "uptime": datetime.now().isoformat(),
                "version": "1.0.0"
            }
        }
        
        return status
        
    except Exception as e:
        logger.error(f"Error getting model status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True,
        log_level=settings.LOG_LEVEL.lower()
    )