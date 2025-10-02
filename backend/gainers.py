from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
import heapq
from typing import List

# Initialize FastAPI application
app = FastAPI()

# Enable CORS for React frontend to allow cross-origin requests
# This is necessary because frontend runs on port 5173 while backend on 8000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend development server
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# List of stock symbols for major companies
companies = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NFLX", "NVDA", "AMD", "INTC", 
             "JPM", "JNJ", "V", "PG", "UNH", "HD", "DIS", "BAC", "VZ", "KO"]

def generate_stock_data():
    """
    Generate random stock data for each company including:
    - Current price between $50 and $500
    - Price change between -$20 and +$20
    - Percentage change calculated based on price change
    - Random trading volume between 1M and 10M
    """
    stocks = []
    for symbol in companies:
        current_price = round(random.uniform(50, 500), 2)
        price_change = round(random.uniform(-20, 20), 2)
        percent_change = round((price_change / (current_price - price_change)) * 100, 2)
        volume = random.randint(1000000, 10000000)
        
        stocks.append({
            "symbol": symbol,
            "current_price": current_price,
            "price_change": price_change,
            "percent_change": percent_change,
            "volume": volume
        })
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
    for stock in stocks:
        if stock["percent_change"] > 0:  # Only consider stocks with positive change
            heapq.heappush(gainers_heap, (stock["percent_change"], stock))
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
    for stock in stocks:
        if stock["percent_change"] < 0:  # Only consider stocks with negative change
            heapq.heappush(losers_heap, (stock["percent_change"], stock))
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
    stocks = generate_stock_data()
    top_gainers = get_top_gainers(stocks, k=10)
    return [stock for _, stock in top_gainers]

@app.get("/api/top-losers") 
async def top_losers():
    """
    API endpoint to get top 10 losing stocks
    Returns:
        List of top 10 stocks with highest negative percentage change
    """
    stocks = generate_stock_data()
    top_losers = get_top_losers(stocks, k=10)
    return [stock for _, stock in top_losers]

@app.get("/")
async def root():
    """
    Root endpoint to verify API is running
    Returns:
        Simple message indicating API status
    """
    return {"message": "Stock API is running!"}