# predictions_service.py
# FastAPI backend for simple, data-only stock predictions (no ML/AI).
# Uses moving averages, momentum, and volatility to estimate next prices.

# Data Structures Used:
# 1. Lists - Used extensively for storing historical prices, moving averages, and predictions
# 2. Pydantic Models (PricePoint, PredictRequest, PredictResponse) - Custom data structures for request/response handling
# 3. Tuples - Used in parse_history function for date-price pairs
# 4. Dictionaries (implicit in FastAPI's middleware configuration)

# Algorithms Used:
# 1. Moving Average (Time Complexity: O(n) for initialization, O(1) for updates)
#    - Simple moving average calculation for trend analysis
# 2. Standard Deviation (Time Complexity: O(n))
#    - Used for volatility calculation
# 3. Percentage Change Calculation (Time Complexity: O(n))
#    - Used for momentum analysis
# 4. Sorting (Time Complexity: O(n log n))
#    - Used in parse_history to sort data chronologically
# 5. Moving Average Crossover Strategy
#    - Technical analysis algorithm combining short and long-term trends
# 6. Linear Projection with Dampening
#    - Custom algorithm for price prediction using trend, momentum, and volatility

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import math
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Stock Prediction Service (Data-Only)")

# --- CORS Middleware Setup ---
# This allows the React frontend to communicate with this backend.
origins = [
    "http://localhost:3000",
    "http://localhost:5173", # Default Vite Port
    # Add any other origins if your frontend runs on a different port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Pydantic Data Models
# -----------------------------

class PricePoint(BaseModel):
    """Represents a single data point of a stock's closing price."""
    date: str  # e.g., "2025-09-30"
    close: float


class PredictRequest(BaseModel):
    """The structure of the request body for the /predict endpoint."""
    history: List[PricePoint]
    horizon: Optional[int] = 30  # Number of future days to predict


class PredictResponse(BaseModel):
    """The structure of the response sent back to the frontend."""
    predictions: List[PricePoint]
    explanation: str


# -----------------------------
# Helper & Logic Functions
# -----------------------------

def parse_history(history: List[PricePoint]):
    """Converts date strings to datetime objects and sorts the data chronologically."""
    parsed = []
    for p in history:
        try:
            d = datetime.fromisoformat(p.date)
            parsed.append((d, float(p.close)))
        except Exception as e:
            raise ValueError(f"Invalid date format for '{p.date}': {e}")
    parsed.sort(key=lambda x: x[0]) # Sort by date to ensure correctness
    return parsed


def moving_average(values: List[float], window: int) -> float:
    """Calculates the simple moving average for a given window."""
    if not values: return 0.0
    window = min(window, len(values))
    return sum(values[-window:]) / window


def stddev(values: List[float]) -> float:
    """Calculates the standard deviation of a list of numbers."""
    if len(values) < 2: return 0.0
    mean = sum(values) / len(values)
    variance = sum((x - mean) ** 2 for x in values) / (len(values) - 1)
    return math.sqrt(variance)


def pct_changes(values: List[float]) -> List[float]:
    """Calculates the daily percentage changes from a list of prices."""
    return [(values[i] - values[i-1]) / values[i-1] for i in range(1, len(values)) if values[i-1] != 0]


def generate_predictions(dates: List[datetime], closes: List[float], horizon: int):
    """
    Predicts future prices using a rule-based algorithm.
    Insight: Combines trend (moving averages), momentum (recent changes), 
    and volatility to make a conservative projection.
    """
    if len(closes) < 20:
        raise ValueError("Insufficient historical data. At least 20 data points are required.")

    # 1. Trend Insight: Use moving average crossover as a market direction signal.
    short_ma = moving_average(closes, 10)
    long_ma = moving_average(closes, 20)
    trend_signal = 1.0 if short_ma > long_ma else -1.0 # 1 for uptrend, -1 for downtrend

    # 2. Momentum & Volatility Insight
    changes = pct_changes(closes)
    recent_momentum = sum(changes[-5:]) / 5 if len(changes) >= 5 else (sum(changes) / len(changes) if changes else 0.0)
    volatility = stddev(changes) if changes else 0.0

    # 3. Projection Logic
    # Start with the most recent price.
    last_date = dates[-1]
    current_price = closes[-1]
    predictions = []
    
    # Dampen the prediction step to avoid unrealistic growth/decline.
    # Higher volatility leads to more conservative (smaller) daily steps.
    dampening_factor = 1 / (1 + volatility * 10)
    daily_step = recent_momentum * dampening_factor * trend_signal

    for i in range(1, horizon + 1):
        # Project the next day's price
        next_price = current_price * (1 + daily_step)
        
        # Gently pull the prediction towards the long-term average to prevent runaway values
        next_price = next_price * 0.95 + long_ma * 0.05
        
        current_price = next_price
        predicted_date = last_date + timedelta(days=i)
        predictions.append(
            PricePoint(date=predicted_date.date().isoformat(), close=round(current_price, 2))
        )
    
    explanation = (
        f"Prediction based on a {'BULLISH' if trend_signal > 0 else 'BEARISH'} trend signal "
        f"(10-day MA: ${round(short_ma, 2)} vs 20-day MA: ${round(long_ma, 2)}). "
        f"Projected using recent momentum, adjusted for volatility of {round(volatility * 100, 2)}%."
    )

    return predictions, explanation


# -----------------------------
# API Endpoint
# -----------------------------

@app.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest):
    """Handles the prediction request from the frontend."""
    try:
        if not req.history:
            raise HTTPException(status_code=400, detail="History data cannot be empty.")
        
        parsed = parse_history(req.history)
        dates, closes = zip(*parsed) # Unzip into two lists
        
        preds, explanation = generate_predictions(list(dates), list(closes), req.horizon)
        
        return PredictResponse(predictions=preds, explanation=explanation)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected server error occurred: {e}")

# To run locally:
# 1. pip install fastapi "uvicorn[standard]" pydantic
# 2. uvicorn predictions_service:app --reload --port 8000
