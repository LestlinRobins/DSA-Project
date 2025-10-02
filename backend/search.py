from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd
from datetime import datetime

app = FastAPI()

# This search API allows users to search for companies and get live stock data with timeframe support.
# To do this, we employ different data structures for efficiency:
# 1. Hash Map (Dictionary) for company symbol to name mapping for O(1) lookups.
# 2. Hash Map is also used in the response to store stock data for quick access.
# 3. Lists for storing chart data points, which are efficient for iteration and appending.

# Allow React frontend to access FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace "*" with your frontend URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hash map for companies (single source of truth)
companies = {
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
    "ADANIPORTS.NS": "Adani Ports & SEZ",
    "ASIANPAINT.NS": "Asian Paints Limited",
    "AXISBANK.NS": "Axis Bank Limited",
    "MARUTI.NS": "Maruti Suzuki India Limited",
    "HCLTECH.NS": "HCL Technologies Limited",
}

# Format numbers for display
def format_number(value):
    if value is None:
        return "N/A"
    
    if value >= 1_000_000_000_000:  # Trillions
        return f"${value / 1_000_000_000_000:.2f}T"
    elif value >= 1_000_000_000:  # Billions
        return f"${value / 1_000_000_000:.2f}B"
    elif value >= 1_000_000:  # Millions
        return f"${value / 1_000_000:.2f}M"
    elif value >= 1_000:  # Thousands
        return f"${value / 1_000:.2f}K"
    else:
        return f"${value:.2f}"

def format_volume(value):
    if value is None:
        return "N/A"
    
    if value >= 1_000_000_000:  # Billions
        return f"{value / 1_000_000_000:.2f}B"
    elif value >= 1_000_000:  # Millions
        return f"{value / 1_000_000:.2f}M"
    elif value >= 1_000:  # Thousands
        return f"{value / 1_000:.2f}K"
    else:
        return f"{value:,}"

# Get single stock data
def get_stock_data(symbol: str):
    """
    Get live stock data for a single symbol
    """
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        # Get recent price data
        hist = ticker.history(period="5d")
        if hist.empty:
            raise ValueError("No historical data found")
        
        # Calculate price changes
        current_price = float(hist['Close'].iloc[-1])
        previous_price = float(hist['Close'].iloc[-2]) if len(hist) > 1 else current_price
        change = current_price - previous_price
        change_percent = (change / previous_price * 100) if previous_price != 0 else 0
        
        # Get volume and market cap
        volume = int(hist['Volume'].iloc[-1])
        market_cap = info.get('marketCap')
        if not market_cap and info.get('sharesOutstanding'):
            market_cap = info.get('sharesOutstanding') * current_price
        
        return {
            "symbol": symbol,
            "company_name": companies.get(symbol, f"{symbol} Inc."),
            "current_price": current_price,
            "change": change,
            "change_percent": change_percent,
            "volume": volume,
            "market_cap": market_cap,
            "previous_close": previous_price,
            "day_high": info.get('dayHigh'),
            "day_low": info.get('dayLow'),
            "currency": info.get('currency', 'USD'),
            "market_state": info.get('marketState', 'CLOSED'),
        }
        
    except Exception as e:
        print(f"Error fetching data for {symbol}: {e}")
        return {
            "symbol": symbol,
            "company_name": companies.get(symbol, f"{symbol} Inc."),
            "current_price": None,
            "change": None,
            "change_percent": None,
            "volume": None,
            "market_cap": None,
            "error": str(e)
        }

# Get chart data for single stock with timeframe support
def get_chart_data(symbol: str, period: str = "3mo"):
    try:
        ticker = yf.Ticker(symbol)
        
        # Map frontend periods to yfinance periods
        period_mapping = {
            "1D": "1d",
            "1W": "5d", 
            "1M": "1mo",
            "3M": "3mo",
            "6M": "6mo",
            "1Y": "1y",
            "2Y": "2y",
            "5Y": "5y"
        }
        
        # Use mapped period or default to original period parameter
        yf_period = period_mapping.get(period, period)
        
        # For intraday data (1D), use different interval
        if period == "1D" or yf_period == "1d":
            hist = ticker.history(period="1d", interval="5m")  # 5-minute intervals for 1 day
        else:
            hist = ticker.history(period=yf_period)
        
        if hist.empty:
            return []
        
        chart_data = []
        for date, row in hist.iterrows():
            # Handle timezone-aware datetime for intraday data
            if hasattr(date, 'tz_localize'):
                date_str = date.strftime("%Y-%m-%d %H:%M")
            else:
                date_str = date.strftime("%Y-%m-%d")
                
            chart_data.append({
                "date": date_str,
                "open": round(row['Open'], 2),
                "close": round(row['Close'], 2),
                "high": round(row['High'], 2),
                "low": round(row['Low'], 2),
                "volume": int(row['Volume']) if not pd.isna(row['Volume']) else 0
            })
        
        return chart_data
        
    except Exception as e:
        print(f"Error fetching chart data for {symbol} with period {period}: {e}")
        return []

# API Endpoints

@app.get("/search")
def search_companies(query: str):
    query = query.lower()
    results = []
    
    for symbol, name in companies.items():
        if query in symbol.lower() or query in name.lower():
            results.append({
                "symbol": symbol,
                "company": name
            })
    
    return results[:10]  # Limit to 10 results

@app.get("/stock/{symbol}")
def get_stock_info(symbol: str, period: str = "3M"):
    try:
        symbol = symbol.upper()
        
        # Get stock data
        stock_data = get_stock_data(symbol)
        
        if stock_data["current_price"] is None:
            raise HTTPException(status_code=404, detail=f"Stock data not found for {symbol}")
        
        # Get chart data with specified period
        chart_data = get_chart_data(symbol, period)
        
        # Add formatted values
        stock_data["formatted_market_cap"] = format_number(stock_data["market_cap"])
        stock_data["formatted_volume"] = format_volume(stock_data["volume"])
        
        return {
            "success": True,
            "stock_data": stock_data,
            "chart_data": chart_data,
            "period": period,
            "data_points": len(chart_data),
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in stock endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chart/{symbol}")
def get_chart_info(symbol: str, period: str = "3M"):
    try:
        symbol = symbol.upper()
        
        # Get chart data with specified period
        chart_data = get_chart_data(symbol, period)
        
        if not chart_data:
            raise HTTPException(status_code=404, detail=f"No chart data found for {symbol} with period {period}")
        
        # Calculate some basic statistics
        prices = [item['close'] for item in chart_data]
        price_change = prices[-1] - prices[0] if len(prices) > 1 else 0
        price_change_percent = (price_change / prices[0] * 100) if prices[0] != 0 else 0
        
        return {
            "success": True,
            "symbol": symbol,
            "period": period,
            "chart_data": chart_data,
            "data_points": len(chart_data),
            "period_change": round(price_change, 2),
            "period_change_percent": round(price_change_percent, 2),
            "period_high": round(max(prices), 2),
            "period_low": round(min(prices), 2),
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in chart endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def root():
    """
    API health check and documentation
    """
    return {
        "message": "Stock Analyzer API with Timeframe Support",
        "status": "running",
        "version": "2.0",
        "supported_periods": ["1D", "1W", "1M", "3M", "6M", "1Y", "2Y", "5Y"],
        "endpoints": {
            "search": "/search?query=apple",
            "stock_info": "/stock/AAPL?period=3M",
            "chart_data": "/chart/AAPL?period=1Y",
            "examples": {
                "daily_data": "/stock/AAPL?period=1D",
                "weekly_data": "/stock/AAPL?period=1W", 
                "monthly_data": "/stock/AAPL?period=1M",
                "yearly_data": "/stock/AAPL?period=1Y"
            }
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)