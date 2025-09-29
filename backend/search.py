# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import random
from datetime import datetime, timedelta

app = FastAPI()

# Allow React frontend to access FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace "*" with your frontend URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hash map for companies
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
}

# Generate mock stock data
def generate_stock_data(symbol: str):
    base_price = 100 + random.random() * 200
    change = (random.random() - 0.5) * 10
    change_percent = (change / base_price) * 100

    return {
        "symbol": symbol,
        "company_name": companies.get(symbol, f"{symbol} Inc."),
        "current_price": base_price,
        "change": change,
        "change_percent": change_percent,
        "volume": random.randint(1_000_000, 10_000_000),
        "market_cap": base_price * random.random() * 1_000_000_000,
    }

# Generate mock chart data
def generate_chart_data():
    data = []
    price = 100 + random.random() * 100
    for i in range(90):
        date = datetime.now() - timedelta(days=(90 - i))
        price += (random.random() - 0.5) * 5
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "open": round(price + (random.random() - 0.5) * 2, 2),
            "close": round(price, 2),
            "high": round(price + random.random() * 3, 2),
            "low": round(price - random.random() * 3, 2),
        })
    return data

# Search endpoint
@app.get("/search")
def search(query: str):
    query = query.lower()
    results = [
        {"symbol": symbol, "company": name}
        for symbol, name in companies.items()
        if query in symbol.lower() or query in name.lower()
    ]
    return results[:10]

# Stock endpoint
@app.get("/stock/{symbol}")
def get_stock(symbol: str):
    stock_data = generate_stock_data(symbol)
    chart_data = generate_chart_data()
    return {"stock_data": stock_data, "chart_data": chart_data}
