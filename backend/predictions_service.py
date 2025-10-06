from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import yfinance as yf
import numpy as np
from datetime import datetime
import statistics
import uvicorn

app = FastAPI(
    title="Stock Prediction API",
    description="Pure data-driven stock prediction using technical indicators",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Response Models
class Prediction(BaseModel):
    day: int
    price: float
    change_pct: float

class Indicators(BaseModel):
    sma_20: Optional[float]
    sma_50: Optional[float]
    ema_20: Optional[float]
    rsi: float
    momentum: float
    volatility: float
    trend_score: int
    support: Optional[float]
    resistance: Optional[float]
    volume_trend: float

class HistoricalData(BaseModel):
    dates: List[str]
    prices: List[float]
    volumes: List[int]

class PredictionResponse(BaseModel):
    symbol: str
    current_price: float
    predictions: List[Prediction]
    signal: str
    confidence: float
    indicators: Indicators
    historical_data: HistoricalData
    analysis: List[str]

class CompareRequest(BaseModel):
    symbols: List[str]

class CompareResponse(BaseModel):
    symbol: str
    signal: str
    confidence: float
    predicted_change: float

class StockPredictor:
    """Pure data-driven stock prediction using statistical methods"""
    
    def __init__(self):
        self.cache = {}
    
    def calculate_sma(self, prices: List[float], period: int) -> Optional[float]:
        """Simple Moving Average"""
        if len(prices) < period:
            return None
        return sum(prices[-period:]) / period
    
    def calculate_ema(self, prices: List[float], period: int) -> Optional[float]:
        """Exponential Moving Average"""
        if len(prices) < period:
            return None
        multiplier = 2 / (period + 1)
        ema = sum(prices[:period]) / period
        for price in prices[period:]:
            ema = (price * multiplier) + (ema * (1 - multiplier))
        return ema
    
    def calculate_rsi(self, prices: List[float], period: int = 14) -> float:
        """Relative Strength Index"""
        if len(prices) < period + 1:
            return 50
        
        deltas = [prices[i] - prices[i-1] for i in range(1, len(prices))]
        gains = [d if d > 0 else 0 for d in deltas[-period:]]
        losses = [-d if d < 0 else 0 for d in deltas[-period:]]
        
        avg_gain = sum(gains) / period
        avg_loss = sum(losses) / period
        
        if avg_loss == 0:
            return 100
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def calculate_momentum(self, prices: List[float], period: int = 10) -> float:
        """Price Momentum"""
        if len(prices) < period:
            return 0
        return ((prices[-1] - prices[-period]) / prices[-period]) * 100
    
    def calculate_volatility(self, prices: List[float], period: int = 20) -> float:
        """Historical Volatility (Standard Deviation)"""
        if len(prices) < period:
            return 0
        returns = [(prices[i] - prices[i-1]) / prices[i-1] for i in range(-period+1, 0)]
        if len(returns) <= 1:
            return 0
        return statistics.stdev(returns) * 100
    
    def detect_support_resistance(self, prices: List[float], window: int = 20):
        """Identify support and resistance levels"""
        if len(prices) < window:
            return None, None
        
        recent = prices[-window:]
        support = min(recent)
        resistance = max(recent)
        return support, resistance
    
    def trend_analysis(self, prices: List[float], short: int = 20, medium: int = 50, long: int = 200):
        """Analyze trend using multiple timeframes"""
        sma_short = self.calculate_sma(prices, short) if len(prices) >= short else None
        sma_medium = self.calculate_sma(prices, medium) if len(prices) >= medium else None
        sma_long = self.calculate_sma(prices, long) if len(prices) >= long else None
        
        current_price = prices[-1]
        trend_score = 0
        
        if sma_short:
            trend_score += 1 if current_price > sma_short else -1
        if sma_medium:
            trend_score += 1 if current_price > sma_medium else -1
        if sma_long:
            trend_score += 1 if current_price > sma_long else -1
            
        if sma_short and sma_medium:
            trend_score += 1 if sma_short > sma_medium else -1
        if sma_medium and sma_long:
            trend_score += 1 if sma_medium > sma_long else -1
        
        return trend_score, sma_short, sma_medium, sma_long
    
    def predict_price(self, symbol: str, days_ahead: int = 5) -> Optional[PredictionResponse]:
        """Main prediction logic using pure data insights"""
        try:
            print(f"Fetching data for {symbol}...")
            
            # Fetch historical data
            stock = yf.Ticker(symbol)
            hist = stock.history(period="1y")
            
            if hist.empty:
                print(f"No data found for {symbol}")
                return None
            
            prices = hist['Close'].tolist()
            volumes = hist['Volume'].tolist()
            dates = hist.index.tolist()
            
            print(f"Retrieved {len(prices)} days of data")
            
            current_price = prices[-1]
            
            # Calculate indicators
            sma_20 = self.calculate_sma(prices, 20)
            sma_50 = self.calculate_sma(prices, 50)
            ema_20 = self.calculate_ema(prices, 20)
            rsi = self.calculate_rsi(prices)
            momentum = self.calculate_momentum(prices)
            volatility = self.calculate_volatility(prices)
            trend_score, _, _, _ = self.trend_analysis(prices)
            support, resistance = self.detect_support_resistance(prices)
            
            # Volume trend
            avg_volume = sum(volumes[-20:]) / 20 if len(volumes) >= 20 else sum(volumes) / len(volumes)
            volume_trend = (volumes[-1] - avg_volume) / avg_volume * 100
            
            # Prediction logic based on multiple factors
            prediction_factors = []
            
            # 1. Moving Average Crossover
            if sma_20 and sma_50:
                ma_signal = (sma_20 - sma_50) / sma_50 * 100
                prediction_factors.append(ma_signal * 0.2)
            
            # 2. RSI Signal
            if rsi < 30:
                prediction_factors.append(2)  # Oversold - likely to rise
            elif rsi > 70:
                prediction_factors.append(-2)  # Overbought - likely to fall
            else:
                prediction_factors.append(0)
            
            # 3. Momentum
            prediction_factors.append(momentum * 0.1)
            
            # 4. Trend Score
            prediction_factors.append(trend_score * 0.5)
            
            # 5. Volume Analysis
            if volume_trend > 20:
                prediction_factors.append(1)  # High volume suggests strength
            elif volume_trend < -20:
                prediction_factors.append(-0.5)
            else:
                prediction_factors.append(0)
            
            # Calculate weighted prediction
            prediction_score = sum(prediction_factors)
            
            # Convert score to percentage change
            predicted_change_pct = np.tanh(prediction_score / 5) * volatility * 0.3
            
            # Generate predictions for next N days
            predictions = []
            cumulative_change = 0
            
            for day in range(1, days_ahead + 1):
                decay_factor = 0.9 ** (day - 1)
                day_change = predicted_change_pct * decay_factor / days_ahead
                cumulative_change += day_change
                predicted_price = current_price * (1 + cumulative_change / 100)
                predictions.append(Prediction(
                    day=day,
                    price=round(predicted_price, 2),
                    change_pct=round(cumulative_change, 2)
                ))
            
            # Determine signal
            if prediction_score > 2:
                signal = "STRONG BUY"
                confidence = min(80, 60 + abs(prediction_score) * 5)
            elif prediction_score > 0.5:
                signal = "BUY"
                confidence = min(70, 50 + abs(prediction_score) * 5)
            elif prediction_score < -2:
                signal = "STRONG SELL"
                confidence = min(80, 60 + abs(prediction_score) * 5)
            elif prediction_score < -0.5:
                signal = "SELL"
                confidence = min(70, 50 + abs(prediction_score) * 5)
            else:
                signal = "HOLD"
                confidence = 50
            
            print(f"Prediction complete for {symbol}: {signal}")
            
            return PredictionResponse(
                symbol=symbol,
                current_price=round(current_price, 2),
                predictions=predictions,
                signal=signal,
                confidence=round(confidence, 1),
                indicators=Indicators(
                    sma_20=round(sma_20, 2) if sma_20 else None,
                    sma_50=round(sma_50, 2) if sma_50 else None,
                    ema_20=round(ema_20, 2) if ema_20 else None,
                    rsi=round(rsi, 2),
                    momentum=round(momentum, 2),
                    volatility=round(volatility, 2),
                    trend_score=trend_score,
                    support=round(support, 2) if support else None,
                    resistance=round(resistance, 2) if resistance else None,
                    volume_trend=round(volume_trend, 2)
                ),
                historical_data=HistoricalData(
                    dates=[d.strftime('%Y-%m-%d') for d in dates[-60:]],
                    prices=[round(p, 2) for p in prices[-60:]],
                    volumes=[int(v) for v in volumes[-60:]]
                ),
                analysis=self.generate_analysis(rsi, momentum, trend_score, volume_trend, prediction_score)
            )
            
        except Exception as e:
            print(f"Error predicting {symbol}: {str(e)}")
            import traceback
            traceback.print_exc()
            return None
    
    def generate_analysis(self, rsi: float, momentum: float, trend_score: int, 
                         volume_trend: float, prediction_score: float) -> List[str]:
        """Generate human-readable analysis"""
        analysis = []
        
        if rsi < 30:
            analysis.append("Stock is oversold (RSI < 30), potential buying opportunity.")
        elif rsi > 70:
            analysis.append("Stock is overbought (RSI > 70), may face correction.")
        else:
            analysis.append(f"RSI at {rsi:.1f} indicates neutral momentum.")
        
        if trend_score >= 3:
            analysis.append("Strong uptrend detected across multiple timeframes.")
        elif trend_score <= -3:
            analysis.append("Strong downtrend detected across multiple timeframes.")
        else:
            analysis.append("Mixed trend signals, market consolidation possible.")
        
        if momentum > 5:
            analysis.append("Strong positive momentum suggests continued upward movement.")
        elif momentum < -5:
            analysis.append("Negative momentum indicates downward pressure.")
        
        if volume_trend > 20:
            analysis.append("High volume confirms price movement strength.")
        elif volume_trend < -20:
            analysis.append("Low volume suggests weak conviction in current trend.")
        
        return analysis

# Initialize predictor
predictor = StockPredictor()

# API Endpoints
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Stock Prediction API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health",
            "predict": "/api/predict?symbol=AAPL&days=5",
            "compare": "/api/compare",
            "docs": "/docs"
        }
    }

@app.get("/api/health")
async def health():
    """Health check endpoint"""
    return {"status": "running", "message": "Stock Prediction API is active"}

@app.get("/api/predict", response_model=PredictionResponse)
async def predict(
    symbol: str = Query(..., description="Stock symbol (e.g., AAPL)"),
    days: int = Query(5, ge=1, le=30, description="Number of days to predict")
):
    """
    Predict stock price for the specified symbol
    
    - **symbol**: Stock ticker symbol (required)
    - **days**: Number of days ahead to predict (1-30, default: 5)
    """
    symbol = symbol.upper()
    
    print(f"\n=== Prediction Request ===")
    print(f"Symbol: {symbol}, Days: {days}")
    
    result = predictor.predict_price(symbol, days)
    
    if result is None:
        raise HTTPException(
            status_code=404, 
            detail=f"Unable to fetch prediction for {symbol}. Please check if the symbol is valid."
        )
    
    return result

@app.post("/api/compare", response_model=List[CompareResponse])
async def compare_stocks(request: CompareRequest):
    """
    Compare predictions for multiple stocks
    
    - **symbols**: List of stock symbols to compare (max 5)
    """
    symbols = request.symbols[:5]  # Limit to 5 stocks
    
    results = []
    for symbol in symbols:
        prediction = predictor.predict_price(symbol.upper(), 5)
        if prediction:
            results.append(CompareResponse(
                symbol=symbol.upper(),
                signal=prediction.signal,
                confidence=prediction.confidence,
                predicted_change=prediction.predictions[-1].change_pct
            ))
    
    if not results:
        raise HTTPException(
            status_code=404,
            detail="Unable to fetch predictions for any of the provided symbols"
        )
    
    return results

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 Stock Prediction FastAPI Server Starting...")
    print("="*60)
    print(f"📊 Server: http://localhost:8000")
    print(f"📚 API Docs: http://localhost:8000/docs")
    print(f"🔗 Health: http://localhost:8000/api/health")
    print(f"📈 Example: http://localhost:8000/api/predict?symbol=AAPL&days=5")
    print("="*60 + "\n")
    
    uvicorn.run(
        "prediction_service:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )