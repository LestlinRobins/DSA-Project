from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
import heapq
from typing import List
import yfinance as yf
import pandas as pd

# Initialize FastAPI application
app = FastAPI()

# Enable CORS for React frontend to allow cross-origin requests
# This is necessary because frontend runs on port 5173 while backend on 8000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# List of stock symbols for major companies
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
    "KOTAKBANK.NS": "Kotak Mahindra Bank Limited",
    "LT.NS": "Larsen & Toubro Limited",
    "INTC" : "Intel Corporation"
}

def generate_stock_data():
    """
    Generate real stock data from Yahoo Finance for each company including:
    - Current price from live market data
    - Price change from previous close  
    - Percentage change calculated from actual data
    - Real trading volume from market
    - Actual company name from dictionary
    """
    stocks = []
    for symbol, company_name in companies.items():  # Changed to iterate over dictionary items
        try:
            # Get stock data from Yahoo Finance
            ticker = yf.Ticker(symbol)
            
            # Get recent price data (last 2 days to calculate change)
            hist = ticker.history(period="2d")
            
            if hist.empty or len(hist) < 1:
                print(f"No data available for {symbol}, skipping...")
                continue
                
            # Get current price (last available close)
            current_price = round(float(hist['Close'].iloc[-1]), 2)
            
            # Calculate price change from previous day
            if len(hist) > 1:
                previous_close = float(hist['Close'].iloc[-2])
                price_change = round(current_price - previous_close, 2)
                percent_change = round((price_change / previous_close) * 100, 2)
            else:
                # If only one day of data, assume no change
                price_change = 0.0
                percent_change = 0.0
            
            # Get volume (current day)
            volume = int(hist['Volume'].iloc[-1])
            
            stocks.append({
                "symbol": symbol,
                "company_name": company_name,  # Added actual company name
                "current_price": current_price,
                "price_change": price_change,
                "percent_change": percent_change,
                "volume": volume
            })
            
        except Exception as e:
            print(f"Error fetching data for {symbol}: {e}")
            # Skip this stock if there's an error
            continue
            
    return stocks
def get_top_gainers(stocks, k=5):
    """
    Find top k stocks with highest positive percentage change
    Uses min-heap to efficiently maintain top k elements
    Args:
        stocks: List of stock dictionaries
        k: Number of top gainers to return (default 5)
    Returns:
        Sorted list of top k gainers in descending order
    """
    gainers_heap = []
    for i, stock in enumerate(stocks):
        if stock["percent_change"] > 0:  # Only consider stocks with positive change
            # Use index as tiebreaker to avoid dict comparison
            heapq.heappush(gainers_heap, (stock["percent_change"], i, stock))
            if len(gainers_heap) > k:
                heapq.heappop(gainers_heap)  # Remove smallest if heap exceeds k
    return sorted(gainers_heap, reverse=True)  # Sort in descending order

def get_top_losers(stocks, k=5):
    """
    Find top k stocks with lowest negative percentage change
    Uses min-heap to efficiently maintain top k elements
    Args:
        stocks: List of stock dictionaries
        k: Number of top losers to return (default 5)
    Returns:
        Sorted list of top k losers in ascending order
    """
    losers_heap = []
    for i, stock in enumerate(stocks):
        if stock["percent_change"] < 0:  # Only consider stocks with negative change
            # Use index as tiebreaker to avoid dict comparison
            heapq.heappush(losers_heap, (stock["percent_change"], i, stock))
            if len(losers_heap) > k:
                heapq.heappop(losers_heap)  # Remove smallest absolute loss if heap exceeds k
    return sorted(losers_heap)  # Sort in ascending order (biggest losses first)

@app.get("/api/top-gainers")
async def top_gainers():
    """
    API endpoint to get top 10 gaining stocks
    Returns:
        List of top 10 stocks with highest positive percentage change
    """
    try:
        stocks = generate_stock_data()
        if not stocks:
            return {"error": "No stock data available", "data": []}
        
        top_gainers_data = get_top_gainers(stocks, k=10)
        return [stock for _, _, stock in top_gainers_data]
    except Exception as e:
        print(f"Error in top_gainers endpoint: {e}")
        return {"error": str(e), "data": []}

@app.get("/api/top-losers") 
async def top_losers():
    """
    API endpoint to get top 10 losing stocks
    Returns:
        List of top 10 stocks with highest negative percentage change
    """
    try:
        stocks = generate_stock_data()
        if not stocks:
            return {"error": "No stock data available", "data": []}
        
        top_losers_data = get_top_losers(stocks, k=10)
        return [stock for _, _, stock in top_losers_data]
    except Exception as e:
        print(f"Error in top_losers endpoint: {e}")
        return {"error": str(e), "data": []}

@app.get("/")
async def root():
    """
    Root endpoint to verify API is running
    Returns:
        Simple message indicating API status
    """
    return {"message": "Stock API is running!"}