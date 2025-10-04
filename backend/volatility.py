from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd
import numpy as np
from typing import List, Dict
from datetime import datetime, timedelta
import math

# Initialize FastAPI application
app = FastAPI(title="Stock Volatility API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Company symbols (consistent with other backend files)
COMPANIES = {
    "AAPL": "Apple Inc.",
    "MSFT": "Microsoft Corporation", 
    "GOOGL": "Alphabet Inc.",
    "AMZN": "Amazon.com Inc.",
    "TSLA": "Tesla Inc.",
    "META": "Meta Platforms Inc.",
    "NVDA": "NVIDIA Corporation",
    "JPM": "JPMorgan Chase & Co.",
    "JNJ": "Johnson & Johnson",
    "V": "Visa Inc.",
    "BRK-B": "Berkshire Hathaway Inc.",
    "UNH": "UnitedHealth Group Incorporated",
    "XOM": "Exxon Mobil Corporation",
    "WMT": "Walmart Inc.",
    "PG": "The Procter & Gamble Company",
    "RELIANCE.NS": "Reliance Industries Limited",
    "TCS.NS": "Tata Consultancy Services Limited",
    "HDFCBANK.NS": "HDFC Bank Limited",
    "INFY.NS": "Infosys Limited",
    "ICICIBANK.NS": "ICICI Bank Limited",
    "INTC": "Intel Corporation"
}

def calculate_returns(prices: pd.Series) -> pd.Series:
    """Calculate daily returns from price series"""
    return prices.pct_change().dropna()

def calculate_volatility(returns: pd.Series, trading_days: int = 252) -> float:
    """Calculate annualized volatility using standard deviation"""
    if len(returns) < 2:
        return 0.0
    daily_vol = returns.std()
    annual_vol = daily_vol * math.sqrt(trading_days)
    return round(annual_vol * 100, 2)

def calculate_rolling_volatility(returns: pd.Series, window: int = 21) -> pd.Series:
    """Calculate rolling volatility"""
    return returns.rolling(window=window).std() * math.sqrt(252) * 100

def get_risk_level(volatility: float) -> str:
    """Categorize risk level based on volatility"""
    if volatility >= 30:
        return "High"
    elif volatility >= 15:
        return "Medium"
    else:
        return "Low"

def get_time_period(time_range: str) -> str:
    """Convert time range to yfinance period"""
    period_map = {
        "1W": "5d",
        "1M": "1mo", 
        "3M": "3mo",
        "6M": "6mo",
        "1Y": "1y"
    }
    return period_map.get(time_range, "1mo")

@app.get("/")
async def root():
    """API health check"""
    return {"message": "Volatility API is running!", "status": "active"}

@app.get("/api/volatility/{symbol}")
async def get_volatility_data(symbol: str, time_range: str = "1M"):
    """Get volatility analysis for a specific stock"""
    try:
        symbol = symbol.upper()
        period = get_time_period(time_range)
        
        # Fetch stock data
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period)
        
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No data found for symbol {symbol}")
        
        # Calculate volatility metrics
        closing_prices = hist['Close']
        returns = calculate_returns(closing_prices)
        
        if len(returns) < 2:
            raise HTTPException(status_code=400, detail=f"Insufficient data for {symbol}")
        
        historical_volatility = calculate_volatility(returns)
        
        # Calculate rolling volatility for chart
        rolling_vol = calculate_rolling_volatility(returns, window=min(21, len(returns)))
        
        # Create data points for visualization
        data_points = []
        if not rolling_vol.empty:
            for date, vol in rolling_vol.dropna().items():
                data_points.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "volatility": round(vol, 2)
                })
        
        # Calculate statistics
        max_vol = round(rolling_vol.max(), 2) if not rolling_vol.empty else historical_volatility
        min_vol = round(rolling_vol.min(), 2) if not rolling_vol.empty else historical_volatility
        avg_vol = round(rolling_vol.mean(), 2) if not rolling_vol.empty else historical_volatility
        
        # Get current price and company info
        current_price = round(float(closing_prices.iloc[-1]), 2)
        company_name = COMPANIES.get(symbol, symbol)
        
        return {
            "symbol": symbol,
            "company_name": company_name,
            "current_price": current_price,
            "timeRange": time_range,
            "historical_volatility": historical_volatility,
            "avg_volatility": avg_vol,
            "max_volatility": max_vol,
            "min_volatility": min_vol,
            "risk_level": get_risk_level(historical_volatility),
            "data_points": data_points,
            "data_period": f"{len(hist)} trading days",
            "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating volatility: {str(e)}")

@app.get("/api/volatility-ranking")
async def get_volatility_ranking(time_range: str = "1M", limit: int = 10):
    """Get stocks ranked by volatility"""
    try:
        all_volatilities = []
        
        for symbol in COMPANIES.keys():
            try:
                period = get_time_period(time_range)
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period=period)
                
                if not hist.empty and len(hist) > 5:
                    closing_prices = hist['Close']
                    returns = calculate_returns(closing_prices)
                    volatility = calculate_volatility(returns)
                    
                    all_volatilities.append({
                        "symbol": symbol,
                        "company_name": COMPANIES[symbol],
                        "volatility": volatility,
                        "risk_level": get_risk_level(volatility),
                        "current_price": round(float(closing_prices.iloc[-1]), 2)
                    })
            except Exception as e:
                print(f"Error processing {symbol}: {e}")
                continue
        
        # Sort by volatility
        most_volatile = sorted(all_volatilities, key=lambda x: x["volatility"], reverse=True)[:limit]
        least_volatile = sorted(all_volatilities, key=lambda x: x["volatility"])[:limit]
        
        return {
            "time_range": time_range,
            "most_volatile": most_volatile,
            "least_volatile": least_volatile,
            "total_analyzed": len(all_volatilities)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating rankings: {str(e)}")

@app.get("/api/volatility-compare")
async def compare_volatility(symbols: str, time_range: str = "1M"):
    """Compare volatility between multiple stocks"""
    try:
        symbol_list = [s.strip().upper() for s in symbols.split(",")]
        comparisons = []
        
        for symbol in symbol_list:
            try:
                volatility_response = await get_volatility_data(symbol, time_range)
                comparisons.append(volatility_response)
            except Exception as e:
                print(f"Error processing {symbol}: {e}")
                continue
        
        # Sort by volatility for comparison
        comparisons.sort(key=lambda x: x["historical_volatility"], reverse=True)
        
        return {
            "symbols": symbol_list,
            "time_range": time_range,
            "comparisons": comparisons,
            "count": len(comparisons)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error comparing volatilities: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)