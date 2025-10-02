from fastapi import APIRouter
from typing import Dict, List

# Create a router for prediction
router = APIRouter()

# -----------------------
# Data Structures
# -----------------------

# HashMap (dictionary) for stock -> prices
price_history: Dict[str, List[float]] = {
    "AAPL": [101, 103, 105, 104, 107, 110, 112, 111, 115, 118],
    "TSLA": [220, 225, 230, 228, 235, 240, 238, 242, 245, 250]
}

# -----------------------
# Algorithms
# -----------------------

def moving_average(prices: List[float], window: int = 3) -> float:
    """Compute simple moving average of last 'window' values."""
    if len(prices) < window:
        return sum(prices) / len(prices)
    return sum(prices[-window:]) / window

def linear_trend_prediction(prices: List[float]) -> float:
    """Compute next price using slope of last 2 values."""
    n = len(prices)
    if n < 2:
        return prices[-1]
    x1, y1 = n-2, prices[-2]
    x2, y2 = n-1, prices[-1]
    slope = (y2 - y1) / (x2 - x1)
    return y2 + slope

def predict_next_price(prices: List[float], window: int = 3) -> float:
    """Blend moving average + trend prediction."""
    ma = moving_average(prices, window)
    trend = linear_trend_prediction(prices)
    return round((ma + trend) / 2, 2)

# -----------------------
# Endpoint
# -----------------------

@router.get("/predict/{symbol}")
def predict(symbol: str):
    symbol = symbol.upper()
    if symbol not in price_history:
        return {"error": "Stock symbol not found"}

    prices = price_history[symbol]
    prediction = predict_next_price(prices)

    return {
        "symbol": symbol,
        "last_price": prices[-1],
        "predicted_price": prediction,
        "history": prices  # send raw values for frontend rendering
    }