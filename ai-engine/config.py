import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # API Settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = int(os.getenv("AI_PORT", "8001"))
    
    # Redis Settings
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Database Settings
    DATABASE_URL: str = os.getenv("AI_DATABASE_URL", "postgresql://user:password@localhost:5432/rwa_ai")
    
    # Model Settings
    MODEL_CACHE_TTL: int = int(os.getenv("MODEL_CACHE_TTL", "3600"))
    RETRAIN_INTERVAL_HOURS: int = int(os.getenv("RETRAIN_INTERVAL_HOURS", "24"))
    
    # Data Settings
    MIN_TRAINING_SAMPLES: int = int(os.getenv("MIN_TRAINING_SAMPLES", "100"))
    FEATURE_WINDOW_DAYS: int = int(os.getenv("FEATURE_WINDOW_DAYS", "30"))
    
    # API Keys
    API_KEY: str = os.getenv("AI_ENGINE_API_KEY", "dev-key-12345")
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Model Paths
    MODELS_DIR: str = os.getenv("MODELS_DIR", "./models/saved")
    
    # Risk Scoring Weights
    LIQUIDITY_WEIGHT: float = 0.25
    VOLATILITY_WEIGHT: float = 0.20
    MARKET_CAP_WEIGHT: float = 0.15
    COMPLIANCE_WEIGHT: float = 0.15
    ASSET_QUALITY_WEIGHT: float = 0.25

settings = Settings()