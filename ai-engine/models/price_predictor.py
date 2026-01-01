import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import joblib
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.preprocessing import StandardScaler
import logging
from config import settings

logger = logging.getLogger(__name__)

class RWAPricePredictor:
    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        self.scaler = StandardScaler()
        self.feature_columns: List[str] = []
        self.is_trained: bool = False
        self.last_trained: Optional[datetime] = None
        self.feature_importance: Dict[str, float] = {}
        
    def prepare_features(self, asset_data: Dict) -> np.ndarray:
        """Extract and engineer features from asset data"""
        features = []
        
        # Asset characteristics
        features.extend([
            asset_data.get('total_asset_value', 0),
            asset_data.get('yield_rate', 0),
            asset_data.get('days_until_maturity', 365),
            asset_data.get('asset_type_encoded', 0),  # Encoded asset type
        ])
        
        # Market data
        features.extend([
            asset_data.get('current_price', 100),
            asset_data.get('volume_24h', 0),
            asset_data.get('volume_7d_avg', 0),
            asset_data.get('price_change_24h', 0),
            asset_data.get('price_volatility_30d', 0),
        ])
        
        # Liquidity metrics
        features.extend([
            asset_data.get('liquidity_reserve0', 0),
            asset_data.get('liquidity_reserve1', 0),
            asset_data.get('total_liquidity', 0),
            asset_data.get('liquidity_depth', 0),
        ])
        
        # Market indicators
        features.extend([
            asset_data.get('holder_count', 0),
            asset_data.get('transaction_count_24h', 0),
            asset_data.get('market_cap', 0),
            asset_data.get('trading_pairs_count', 1),
        ])
        
        # Time-based features
        now = datetime.now()
        features.extend([
            now.hour,
            now.weekday(),
            now.day,
            asset_data.get('time_since_launch_days', 0),
        ])
        
        # Technical indicators
        features.extend([
            asset_data.get('rsi', 50),
            asset_data.get('moving_avg_ratio_7d', 1),
            asset_data.get('moving_avg_ratio_30d', 1),
            asset_data.get('bollinger_position', 0.5),
        ])
        
        return np.array(features).reshape(1, -1)
    
    def generate_feature_names(self) -> List[str]:
        """Generate feature column names"""
        return [
            # Asset characteristics
            'total_asset_value', 'yield_rate', 'days_until_maturity', 'asset_type_encoded',
            
            # Market data
            'current_price', 'volume_24h', 'volume_7d_avg', 'price_change_24h', 'price_volatility_30d',
            
            # Liquidity metrics
            'liquidity_reserve0', 'liquidity_reserve1', 'total_liquidity', 'liquidity_depth',
            
            # Market indicators
            'holder_count', 'transaction_count_24h', 'market_cap', 'trading_pairs_count',
            
            # Time-based features
            'hour', 'weekday', 'day', 'time_since_launch_days',
            
            # Technical indicators
            'rsi', 'moving_avg_ratio_7d', 'moving_avg_ratio_30d', 'bollinger_position'
        ]
    
    def train(self, training_data: List[Dict]) -> Dict:
        """Train the model on historical data"""
        try:
            if len(training_data) < settings.MIN_TRAINING_SAMPLES:
                raise ValueError(f"Insufficient training data. Need at least {settings.MIN_TRAINING_SAMPLES} samples")
            
            # Prepare features and targets
            X = []
            y = []
            
            for data_point in training_data:
                features = self.prepare_features(data_point)
                X.append(features.flatten())
                y.append(data_point['target_price'])
            
            X = np.array(X)
            y = np.array(y)
            
            # Store feature names
            self.feature_columns = self.generate_feature_names()
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model
            self.model.fit(X_train_scaled, y_train)
            
            # Make predictions
            y_pred = self.model.predict(X_test_scaled)
            
            # Calculate metrics
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            # Cross-validation
            cv_scores = cross_val_score(
                self.model, X_train_scaled, y_train, 
                cv=5, scoring='neg_mean_squared_error'
            )
            cv_rmse = np.sqrt(-cv_scores.mean())
            
            # Feature importance
            self.feature_importance = dict(zip(
                self.feature_columns,
                self.model.feature_importances_
            ))
            
            self.is_trained = True
            self.last_trained = datetime.now()
            
            metrics = {
                'rmse': float(rmse),
                'mae': float(mae),
                'r2_score': float(r2),
                'cv_rmse': float(cv_rmse),
                'training_samples': len(training_data),
                'test_samples': len(X_test),
                'feature_importance': self.feature_importance
            }
            
            logger.info(f"Model trained successfully. RMSE: {rmse:.4f}, R2: {r2:.4f}")
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error training model: {str(e)}")
            raise
    
    def predict(self, asset_data: Dict) -> Tuple[float, float]:
        """Predict fair value for an asset"""
        if not self.is_trained:
            raise ValueError("Model is not trained yet")
        
        try:
            features = self.prepare_features(asset_data)
            features_scaled = self.scaler.transform(features)
            
            # Get prediction from base model
            predicted_price = self.model.predict(features_scaled)[0]
            
            # Calculate confidence score based on feature similarity to training data
            confidence_score = self.calculate_confidence(features_scaled)
            
            return float(predicted_price), float(confidence_score)
            
        except Exception as e:
            logger.error(f"Error making prediction: {str(e)}")
            raise
    
    def calculate_confidence(self, features: np.ndarray) -> float:
        """Calculate confidence score based on prediction variance"""
        try:
            # Use individual tree predictions to calculate variance
            tree_predictions = [
                tree.predict(features)[0] 
                for tree in self.model.estimators_
            ]
            
            variance = np.var(tree_predictions)
            mean_pred = np.mean(tree_predictions)
            
            # Convert variance to confidence (lower variance = higher confidence)
            # Normalize to 0-1 range
            coefficient_of_variation = np.sqrt(variance) / abs(mean_pred) if mean_pred != 0 else 1
            confidence = max(0, min(1, 1 - coefficient_of_variation))
            
            return confidence
            
        except Exception as e:
            logger.error(f"Error calculating confidence: {str(e)}")
            return 0.5  # Return neutral confidence on error
    
    def get_feature_importance(self) -> Dict[str, float]:
        """Get feature importance from trained model"""
        if not self.is_trained:
            return {}
        return self.feature_importance
    
    def save_model(self, filepath: str) -> None:
        """Save trained model to file"""
        if not self.is_trained:
            raise ValueError("Cannot save untrained model")
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_columns': self.feature_columns,
            'last_trained': self.last_trained,
            'feature_importance': self.feature_importance
        }
        
        joblib.dump(model_data, filepath)
        logger.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str) -> None:
        """Load trained model from file"""
        try:
            model_data = joblib.load(filepath)
            
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.feature_columns = model_data['feature_columns']
            self.last_trained = model_data['last_trained']
            self.feature_importance = model_data['feature_importance']
            self.is_trained = True
            
            logger.info(f"Model loaded from {filepath}")
            
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise


class RiskScorer:
    def __init__(self):
        self.weights = {
            'liquidity_risk': settings.LIQUIDITY_WEIGHT,
            'volatility_risk': settings.VOLATILITY_WEIGHT,
            'market_cap_risk': settings.MARKET_CAP_WEIGHT,
            'compliance_risk': settings.COMPLIANCE_WEIGHT,
            'asset_quality_risk': settings.ASSET_QUALITY_WEIGHT
        }
    
    def calculate_risk_score(self, asset_data: Dict) -> Dict:
        """Calculate comprehensive risk score for an asset"""
        try:
            risk_components = {}
            
            # Liquidity Risk (0-100, higher = more risky)
            volume_24h = asset_data.get('volume_24h', 0)
            total_liquidity = asset_data.get('total_liquidity', 0)
            
            if volume_24h == 0 or total_liquidity == 0:
                liquidity_risk = 90  # Very high risk for zero liquidity
            else:
                # Low volume relative to liquidity = high risk
                volume_ratio = volume_24h / total_liquidity
                liquidity_risk = max(0, min(100, 100 - (volume_ratio * 1000)))
            
            risk_components['liquidity_risk'] = liquidity_risk
            
            # Volatility Risk
            volatility_30d = asset_data.get('price_volatility_30d', 0)
            volatility_risk = min(100, volatility_30d * 100)  # Convert to 0-100 scale
            risk_components['volatility_risk'] = volatility_risk
            
            # Market Cap Risk (smaller market cap = higher risk)
            market_cap = asset_data.get('market_cap', 0)
            if market_cap < 1000000:  # < $1M
                market_cap_risk = 80
            elif market_cap < 10000000:  # < $10M
                market_cap_risk = 60
            elif market_cap < 100000000:  # < $100M
                market_cap_risk = 40
            else:
                market_cap_risk = 20
            
            risk_components['market_cap_risk'] = market_cap_risk
            
            # Compliance Risk
            kyc_required = asset_data.get('compliance_required', True)
            jurisdiction = asset_data.get('jurisdiction', 'UNKNOWN')
            
            compliance_risk = 0
            if not kyc_required:
                compliance_risk += 30  # No KYC = higher risk
            if jurisdiction == 'UNKNOWN':
                compliance_risk += 40  # Unknown jurisdiction = high risk
            elif jurisdiction in ['US', 'EU', 'UK', 'CA']:
                compliance_risk += 10  # Regulated jurisdictions = low risk
            else:
                compliance_risk += 25  # Other jurisdictions = medium risk
            
            risk_components['compliance_risk'] = min(100, compliance_risk)
            
            # Asset Quality Risk
            asset_type = asset_data.get('asset_type', 'UNKNOWN')
            yield_rate = asset_data.get('yield_rate', 0)
            
            asset_quality_risk = 0
            
            # Risk by asset type
            type_risk_map = {
                'RealEstate': 30,
                'Bond': 20,
                'Invoice': 40,
                'Commodity': 50,
                'Equipment': 45,
                'UNKNOWN': 80
            }
            asset_quality_risk += type_risk_map.get(asset_type, 80)
            
            # Unusually high yield = higher risk
            if yield_rate > 2000:  # > 20% APY
                asset_quality_risk += 30
            elif yield_rate > 1000:  # > 10% APY
                asset_quality_risk += 15
            
            risk_components['asset_quality_risk'] = min(100, asset_quality_risk)
            
            # Calculate weighted overall risk score
            overall_risk = sum(
                risk_components[component] * self.weights[component]
                for component in risk_components
            )
            
            # Categorize risk
            if overall_risk <= 30:
                risk_category = 'Low'
            elif overall_risk <= 60:
                risk_category = 'Medium'
            else:
                risk_category = 'High'
            
            return {
                'overall_risk_score': round(overall_risk, 2),
                'risk_category': risk_category,
                'risk_components': risk_components,
                'weights_used': self.weights
            }
            
        except Exception as e:
            logger.error(f"Error calculating risk score: {str(e)}")
            return {
                'overall_risk_score': 50.0,
                'risk_category': 'Medium',
                'error': str(e)
            }


class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(
            contamination=0.1,  # Expect 10% anomalies
            random_state=42
        )
        self.is_trained = False
    
    def train(self, normal_data: List[Dict]) -> None:
        """Train anomaly detection model on normal market data"""
        try:
            # Prepare features for anomaly detection
            features = []
            
            for data in normal_data:
                feature_vector = [
                    data.get('volume_24h', 0),
                    data.get('price_change_24h', 0),
                    data.get('price_volatility_30d', 0),
                    data.get('transaction_count_24h', 0),
                    data.get('holder_count', 0),
                    data.get('liquidity_depth', 0)
                ]
                features.append(feature_vector)
            
            X = np.array(features)
            self.model.fit(X)
            self.is_trained = True
            
            logger.info(f"Anomaly detector trained on {len(normal_data)} samples")
            
        except Exception as e:
            logger.error(f"Error training anomaly detector: {str(e)}")
            raise
    
    def detect_anomaly(self, asset_data: Dict) -> Dict:
        """Detect if asset data contains anomalies"""
        if not self.is_trained:
            return {'is_anomaly': False, 'confidence': 0.0, 'error': 'Model not trained'}
        
        try:
            feature_vector = [
                asset_data.get('volume_24h', 0),
                asset_data.get('price_change_24h', 0),
                asset_data.get('price_volatility_30d', 0),
                asset_data.get('transaction_count_24h', 0),
                asset_data.get('holder_count', 0),
                asset_data.get('liquidity_depth', 0)
            ]
            
            X = np.array(feature_vector).reshape(1, -1)
            
            # Predict anomaly (-1 = anomaly, 1 = normal)
            prediction = self.model.predict(X)[0]
            is_anomaly = prediction == -1
            
            # Calculate anomaly score (lower = more anomalous)
            anomaly_score = self.model.score_samples(X)[0]
            confidence = abs(anomaly_score)  # Higher absolute score = higher confidence
            
            return {
                'is_anomaly': is_anomaly,
                'anomaly_score': float(anomaly_score),
                'confidence': float(confidence),
                'risk_level': 'High' if is_anomaly else 'Normal'
            }
            
        except Exception as e:
            logger.error(f"Error detecting anomaly: {str(e)}")
            return {'is_anomaly': False, 'confidence': 0.0, 'error': str(e)}