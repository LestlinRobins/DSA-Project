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
    allow_origins=["*"],
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
    
    def calculate_macd(self, prices: List[float]) -> tuple:
        """Moving Average Convergence Divergence"""
        if len(prices) < 26:
            return 0, 0, 0
        
        ema_12 = self.calculate_ema(prices, 12)
        ema_26 = self.calculate_ema(prices, 26)
        
        if ema_12 is None or ema_26 is None:
            return 0, 0, 0
        
        macd_line = ema_12 - ema_26
        
        # Calculate signal line (9-day EMA of MACD)
        macd_values = []
        for i in range(26, len(prices)):
            temp_ema12 = self.calculate_ema(prices[:i+1], 12)
            temp_ema26 = self.calculate_ema(prices[:i+1], 26)
            if temp_ema12 and temp_ema26:
                macd_values.append(temp_ema12 - temp_ema26)
        
        signal_line = self.calculate_ema(macd_values, 9) if len(macd_values) >= 9 else 0
        histogram = macd_line - signal_line if signal_line else 0
        
        return macd_line, signal_line, histogram
    
    def calculate_bollinger_bands(self, prices: List[float], period: int = 20) -> tuple:
        """Bollinger Bands"""
        if len(prices) < period:
            return None, None, None
        
        sma = self.calculate_sma(prices, period)
        if sma is None:
            return None, None, None
        
        recent_prices = prices[-period:]
        std_dev = statistics.stdev(recent_prices)
        
        upper_band = sma + (2 * std_dev)
        lower_band = sma - (2 * std_dev)
        
        return upper_band, sma, lower_band
    
    def detect_support_resistance(self, prices: List[float], window: int = 20):
        """Identify support and resistance levels"""
        if len(prices) < window:
            return None, None
        
        recent = prices[-window:]
        support = min(recent)
        resistance = max(recent)
        return support, resistance
    
    def calculate_trend_strength(self, prices: List[float]) -> float:
        """Calculate trend strength using linear regression"""
        if len(prices) < 20:
            return 0
        
        recent_prices = prices[-20:]
        x = np.arange(len(recent_prices))
        y = np.array(recent_prices)
        
        # Linear regression
        coeffs = np.polyfit(x, y, 1)
        slope = coeffs[0]
        
        # Normalize slope by price level
        avg_price = np.mean(y)
        normalized_slope = (slope / avg_price) * 100
        
        return normalized_slope
    
    def predict_price(self, symbol: str, days_ahead: int = 5) -> Optional[PredictionResponse]:
        """Main prediction logic using pure data insights"""
        try:
            print(f"\n{'='*50}")
            print(f"Analyzing {symbol}...")
            print(f"{'='*50}")
            
            # Fetch historical data
            stock = yf.Ticker(symbol)
            hist = stock.history(period="1y")
            
            if hist.empty:
                print(f"❌ No data found for {symbol}")
                return None
            
            prices = hist['Close'].tolist()
            volumes = hist['Volume'].tolist()
            dates = hist.index.tolist()
            
            current_price = prices[-1]
            print(f"📊 Current Price: ${current_price:.2f}")
            print(f"📅 Data Points: {len(prices)} days")
            
            # Calculate all indicators
            sma_20 = self.calculate_sma(prices, 20)
            sma_50 = self.calculate_sma(prices, 50)
            sma_200 = self.calculate_sma(prices, 200)
            ema_20 = self.calculate_ema(prices, 20)
            rsi = self.calculate_rsi(prices)
            momentum = self.calculate_momentum(prices, 10)
            momentum_long = self.calculate_momentum(prices, 20)
            volatility = self.calculate_volatility(prices)
            
            macd_line, signal_line, macd_histogram = self.calculate_macd(prices)
            upper_bb, middle_bb, lower_bb = self.calculate_bollinger_bands(prices)
            support, resistance = self.detect_support_resistance(prices)
            trend_strength = self.calculate_trend_strength(prices)
            
            # Volume analysis
            avg_volume = sum(volumes[-20:]) / 20 if len(volumes) >= 20 else sum(volumes) / len(volumes)
            volume_trend = (volumes[-1] - avg_volume) / avg_volume * 100
            
            # Recent price action (last 5 days)
            recent_change = ((prices[-1] - prices[-5]) / prices[-5]) * 100 if len(prices) >= 5 else 0
            
            print(f"\n📈 Technical Indicators:")
            print(f"  RSI: {rsi:.2f}")
            print(f"  Momentum (10d): {momentum:.2f}%")
            print(f"  Volatility: {volatility:.2f}%")
            print(f"  Trend Strength: {trend_strength:.2f}")
            print(f"  Volume Trend: {volume_trend:.2f}%")
            
            # Build prediction based on multiple factors
            prediction_components = {}
            
            # 1. RSI Signal (30% weight)
            if rsi < 30:
                rsi_signal = 3.0  # Strong oversold
            elif rsi < 40:
                rsi_signal = 1.5
            elif rsi > 70:
                rsi_signal = -3.0  # Strong overbought
            elif rsi > 60:
                rsi_signal = -1.5
            else:
                rsi_signal = 0
            prediction_components['rsi'] = rsi_signal * 0.30
            
            # 2. Moving Average Crossovers (25% weight)
            ma_signal = 0
            if sma_20 and sma_50:
                crossover_strength = ((sma_20 - sma_50) / sma_50) * 100
                ma_signal = np.tanh(crossover_strength / 2) * 3
            prediction_components['ma_crossover'] = ma_signal * 0.25
            
            # 3. Momentum (20% weight)
            momentum_signal = np.tanh(momentum / 10) * 3
            prediction_components['momentum'] = momentum_signal * 0.20
            
            # 4. MACD Signal (15% weight)
            macd_signal = 0
            if macd_histogram > 0:
                macd_signal = min(2, abs(macd_histogram) * 10)
            else:
                macd_signal = -min(2, abs(macd_histogram) * 10)
            prediction_components['macd'] = macd_signal * 0.15
            
            # 5. Bollinger Band Position (10% weight)
            bb_signal = 0
            if upper_bb and lower_bb:
                bb_position = (current_price - lower_bb) / (upper_bb - lower_bb)
                if bb_position < 0.2:
                    bb_signal = 2  # Near lower band - oversold
                elif bb_position > 0.8:
                    bb_signal = -2  # Near upper band - overbought
            prediction_components['bollinger'] = bb_signal * 0.10
            
            # Calculate total prediction score
            prediction_score = sum(prediction_components.values())
            
            print(f"\n🎯 Prediction Components:")
            for component, value in prediction_components.items():
                print(f"  {component}: {value:+.3f}")
            print(f"  TOTAL SCORE: {prediction_score:+.3f}")
            
            # Convert to percentage change - use volatility as base
            # Higher volatility = larger potential moves
            base_change = prediction_score * (volatility / 5)
            
            # Add momentum influence
            momentum_influence = momentum * 0.1
            
            # Calculate daily change rate
            daily_change_rate = (base_change + momentum_influence) / days_ahead
            
            print(f"\n📊 Prediction Metrics:")
            print(f"  Base Change: {base_change:.3f}%")
            print(f"  Daily Rate: {daily_change_rate:.3f}%")
            
            # Generate predictions with compound effect
            predictions = []
            cumulative_change = 0
            
            for day in range(1, days_ahead + 1):
                # Add some randomness based on volatility (±20% of daily change)
                random_factor = np.random.uniform(-0.2, 0.2) * volatility * 0.1
                
                # Progressive change with slight acceleration/deceleration
                day_factor = 1 + (day / days_ahead) * 0.2  # Days further out have slightly more movement
                
                day_change = daily_change_rate * day_factor + random_factor
                cumulative_change += day_change
                
                predicted_price = current_price * (1 + cumulative_change / 100)
                
                predictions.append(Prediction(
                    day=day,
                    price=round(predicted_price, 2),
                    change_pct=round(cumulative_change, 2)
                ))
                
                print(f"  Day {day}: ${predicted_price:.2f} ({cumulative_change:+.2f}%)")
            
            # Determine signal and confidence
            abs_score = abs(prediction_score)
            
            if prediction_score > 1.5:
                signal = "STRONG BUY"
                confidence = min(85, 55 + abs_score * 10)
            elif prediction_score > 0.5:
                signal = "BUY"
                confidence = min(75, 50 + abs_score * 8)
            elif prediction_score < -1.5:
                signal = "STRONG SELL"
                confidence = min(85, 55 + abs_score * 10)
            elif prediction_score < -0.5:
                signal = "SELL"
                confidence = min(75, 50 + abs_score * 8)
            else:
                signal = "HOLD"
                confidence = 50 + abs_score * 5
            
            # Adjust confidence based on volatility (high volatility = lower confidence)
            if volatility > 5:
                confidence *= 0.85
            elif volatility > 3:
                confidence *= 0.92
            
            print(f"\n✅ Signal: {signal} (Confidence: {confidence:.1f}%)")
            
            # Calculate trend score for display
            trend_score = 0
            if sma_20: trend_score += 1 if current_price > sma_20 else -1
            if sma_50: trend_score += 1 if current_price > sma_50 else -1
            if sma_200: trend_score += 1 if current_price > sma_200 else -1
            if sma_20 and sma_50: trend_score += 1 if sma_20 > sma_50 else -1
            if sma_50 and sma_200: trend_score += 1 if sma_50 > sma_200 else -1
            
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
                analysis=self.generate_analysis(rsi, momentum, trend_score, volume_trend, 
                                                prediction_score, volatility, macd_histogram)
            )
            
        except Exception as e:
            print(f"❌ Error predicting {symbol}: {str(e)}")
            import traceback
            traceback.print_exc()
            return None
    
    def generate_analysis(self, rsi: float, momentum: float, trend_score: int, 
                         volume_trend: float, prediction_score: float, 
                         volatility: float, macd_histogram: float) -> List[str]:
        """Generate human-readable analysis"""
        analysis = []
        
        # RSI Analysis
        if rsi < 30:
            analysis.append(f"📉 Stock is oversold (RSI: {rsi:.1f}). This often signals a potential buying opportunity as selling pressure may be exhausted.")
        elif rsi > 70:
            analysis.append(f"📈 Stock is overbought (RSI: {rsi:.1f}). This suggests the stock may be due for a price correction or consolidation.")
        else:
            analysis.append(f"⚖️ RSI at {rsi:.1f} indicates neutral territory. The stock is neither overbought nor oversold.")
        
        # Trend Analysis
        if trend_score >= 3:
            analysis.append("🚀 Strong bullish trend confirmed across multiple moving averages. Momentum is on the upside.")
        elif trend_score <= -3:
            analysis.append("📉 Strong bearish trend detected. Multiple moving averages suggest downward momentum.")
        elif trend_score > 0:
            analysis.append("↗️ Mild bullish bias detected, but trend is not strongly confirmed.")
        elif trend_score < 0:
            analysis.append("↘️ Mild bearish bias detected, but trend is not strongly confirmed.")
        else:
            analysis.append("↔️ Stock is in consolidation. No clear directional trend in moving averages.")
        
        # Momentum Analysis
        if momentum > 5:
            analysis.append(f"⚡ Strong positive momentum ({momentum:.1f}%) suggests continued upward price action in the near term.")
        elif momentum < -5:
            analysis.append(f"⚡ Strong negative momentum ({momentum:.1f}%) indicates bearish pressure and potential further decline.")
        elif abs(momentum) < 2:
            analysis.append("😴 Low momentum suggests the stock is range-bound or consolidating.")
        
        # Volume Analysis
        if volume_trend > 30:
            analysis.append("📊 Significantly higher trading volume confirms strong market interest and validates current price movement.")
        elif volume_trend < -30:
            analysis.append("📊 Lower trading volume suggests weak conviction in the current trend. Be cautious of potential reversals.")
        
        # Volatility Warning
        if volatility > 5:
            analysis.append(f"⚠️ High volatility ({volatility:.1f}%) detected. Expect larger price swings and increased risk.")
        elif volatility < 1.5:
            analysis.append("😌 Low volatility indicates stable, predictable price action with reduced risk.")
        
        # MACD insight
        if macd_histogram > 0.5:
            analysis.append("📈 MACD shows bullish momentum building. The trend is strengthening to the upside.")
        elif macd_histogram < -0.5:
            analysis.append("📉 MACD shows bearish momentum. Selling pressure is increasing.")
        
        return analysis

# Initialize predictor
predictor = StockPredictor()

# API Endpoints
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Stock Prediction API",
        "version": "2.0.0",
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
    symbols = request.symbols[:5]
    
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
    print("🚀 Stock Prediction FastAPI Server v2.0 Starting...")
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