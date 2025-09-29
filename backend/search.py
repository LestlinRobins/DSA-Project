# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import random
from datetime import datetime, timedelta
import yfinance as yf

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
  "BRK-B": "Berkshire Hathaway Inc.",
  "UNH": "UnitedHealth Group Incorporated",
  "XOM": "Exxon Mobil Corporation",
  "WMT": "Walmart Inc.",
  "PG": "The Procter & Gamble Company",
  "AZN": "AstraZeneca PLC",
  "SHEL": "Shell plc",
  "HSBC": "HSBC Holdings plc",
  "DGE": "Diageo plc",
  "RIO": "Rio Tinto plc",
  "ULVR.L": "Unilever PLC",
  "GSK.L": "GSK plc",
  "7203.T": "Toyota Motor Corporation",
  "6758.T": "Sony Group Corporation",
  "9984.T": "SoftBank Group Corp.",
  "9432.T": "Nippon Telegraph and Telephone Corporation",
  "8306.T": "Mitsubishi UFJ Financial Group, Inc.",
  "0700.HK": "Tencent Holdings Limited",
  "9988.HK": "Alibaba Group Holding Limited",
  "1299.HK": "AIA Group Limited",
  "0941.HK": "China Mobile Limited",
  "3690.HK": "Meituan",
  "RY.TO": "Royal Bank of Canada",
  "TD.TO": "The Toronto-Dominion Bank",
  "ENB.TO": "Enbridge Inc.",
  "SHOP.TO": "Shopify Inc.",
  "CNR.TO": "Canadian National Railway Company",
  "CBA.AX": "Commonwealth Bank of Australia",
  "BHP.AX": "BHP Group Limited",
  "CSL.AX": "CSL Limited",
  "NAB.AX": "National Australia Bank Limited",
  "WES.AX": "Wesfarmers Limited",
  "SAP.DE": "SAP SE",
  "SIE.DE": "Siemens AG",
  "VOW3.DE": "Volkswagen AG",
  "MBG.DE": "Mercedes-Benz Group AG",
  "ALV.DE": "Allianz SE",
  "NOVN.SW": "Novartis AG",
  "ROG.SW": "Roche Holding AG",
  "NESN.SW": "Nestlé S.A.",
  "UBSG.SW": "UBS Group AG",
  "ZURN.SW": "Zurich Insurance Group AG",
  "RELIANCE.NS": "Reliance Industries Limited",
  "TCS.NS": "Tata Consultancy Services Limited",
  "HDFCBANK.NS": "HDFC Bank Limited",
  "INFY.NS": "Infosys Limited",
  "ICICIBANK.NS": "ICICI Bank Limited",
  "HINDUNILVR.NS": "Hindustan Unilever Limited",
  "KOTAKBANK.NS": "Kotak Mahindra Bank",
  "LT.NS": "Larsen & Toubro Limited",
  "SBIN.NS": "State Bank of India",
  "BAJFINANCE.NS": "Bajaj Finance Limited",
  "BAJAJFINSV.NS": "Bajaj Finserv Limited",
  "ADANIPORTS.NS": "Adani Ports & SEZ",
  "ASIANPAINT.NS": "Asian Paints Limited",
  "AXISBANK.NS": "Axis Bank Limited",
  "MARUTI.NS": "Maruti Suzuki India Limited",
  "HCLTECH.NS": "HCL Technologies Limited",
  "WIPRO.NS": "Wipro Limited",
  "TATAMOTORS.NS": "Tata Motors Limited",
  "HDFC.NS": "Housing Development Finance Corporation",
  "ITC.NS": "ITC Limited",
  "M&M.NS": "Mahindra & Mahindra Limited",
  "ULTRACEMCO.NS": "UltraTech Cement Limited",
  "NTPC.NS": "NTPC Limited",
  "ONGC.NS": "Oil and Natural Gas Corporation",
  "TECHM.NS": "Tech Mahindra Limited",
  "POWERGRID.NS": "Power Grid Corporation of India",
  "SUNPHARMA.NS": "Sun Pharmaceutical Industries",
  "DIVISLAB.NS": "Divi's Laboratories",
  "DRREDDY.NS": "Dr. Reddy's Laboratories",
  "TATACONSUM.NS": "Tata Consumer Products Limited",
  "HDFCLIFE.NS": "HDFC Life Insurance Company",
  "JSWSTEEL.NS": "JSW Steel Limited",
  "TATASTEEL.NS": "Tata Steel Limited",
  "HINDALCO.NS": "Hindalco Industries Limited",
  "ADANIGREEN.NS": "Adani Green Energy Limited",
  "ADANIPOWER.NS": "Adani Power Limited",
  "MC.PA": "LVMH Moët Hennessy Louis Vuitton SE",
  "OR.PA": "L'Oréal S.A.",
  "TTE.PA": "TotalEnergies SE",
  "ASML.AS": "ASML Holding N.V.",
  "005930.KS": "Samsung Electronics Co., Ltd.",
  "2330.TW": "Taiwan Semiconductor Manufacturing Company Limited",
  "VALE3.SA": "Vale S.A.",
  "PETR4.SA": "Petróleo Brasileiro S.A. - Petrobras",
  "600519.SS": "Kweichow Moutai Co., Ltd.",
  "601398.SS": "Industrial and Commercial Bank of China Limited"
}

# Format large numbers for display
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

# Generate real-time stock data
def generate_stock_data(symbol: str):
    # Using yfinance to get real stock data
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        # Get the most recent trading day data
        hist = ticker.history(period="5d")  # Get more days to ensure we have data
        if hist.empty:
            raise ValueError("No historical data found")
        
        # Get latest available price data
        base_price = float(hist['Close'].iloc[-1])
        previous_price = float(hist['Close'].iloc[-2]) if len(hist) > 1 else base_price
        change = base_price - previous_price
        change_percent = (change / previous_price * 100) if previous_price != 0 else 0
        
        # Get live volume (most recent trading day)
        volume = int(hist['Volume'].iloc[-1])
        
        # Get live market cap with multiple fallback options
        market_cap = None
        if 'marketCap' in info and info['marketCap']:
            market_cap = info['marketCap']
        elif 'sharesOutstanding' in info and info['sharesOutstanding']:
            # Calculate market cap = shares outstanding * current price
            shares_outstanding = info['sharesOutstanding']
            market_cap = shares_outstanding * base_price
        
        # Get additional live data
        avg_volume = info.get('averageVolume', volume)  # 10-day average volume
        avg_volume_10days = info.get('averageVolume10days', avg_volume)
        
        # Get live trading session data if available
        regular_market_volume = info.get('regularMarketVolume', volume)
        regular_market_price = info.get('regularMarketPrice', base_price)
        
        # Use the most current data available
        current_volume = regular_market_volume if regular_market_volume else volume
        current_price = regular_market_price if regular_market_price else base_price
        
        print(f"Successfully fetched live data for {symbol}:")
        print(f"  Price: ${current_price:.2f}")
        print(f"  Volume: {format_volume(current_volume)}")
        print(f"  Market Cap: {format_number(market_cap)}")
        print(f"  Change: ${change:.2f} ({change_percent:.2f}%)")
        print(f"  Average Volume: {format_volume(avg_volume)}")
        
    except Exception as e:
        print(f"Error fetching stock data for {symbol}: {e}")
        return {
            "symbol": symbol,
            "company_name": companies.get(symbol, f"{symbol} Inc."),
            "current_price": None,
            "change": None,
            "change_percent": None,
            "volume": None,
            "market_cap": None,
            "avg_volume": None,
        }
    return {
        "symbol": symbol,
        "company_name": companies.get(symbol, f"{symbol} Inc."),
        "current_price": current_price,
        "change": change,
        "change_percent": change_percent,
        "volume": current_volume,
        "market_cap": market_cap,
        "avg_volume": avg_volume,
        "avg_volume_10days": avg_volume_10days,
        "previous_close": previous_price,
        "high_52week": info.get('fiftyTwoWeekHigh'),
        "low_52week": info.get('fiftyTwoWeekLow'),
        "day_high": info.get('dayHigh', info.get('regularMarketDayHigh')),
        "day_low": info.get('dayLow', info.get('regularMarketDayLow')),
        "pe_ratio": info.get('trailingPE'),
        "dividend_yield": info.get('dividendYield'),
        "beta": info.get('beta'),
        "currency": info.get('currency', 'USD'),
        "exchange": info.get('exchange'),
        "market_state": info.get('marketState', 'CLOSED'),
    }

# Get multiple stocks data efficiently
def get_multiple_stocks_data(symbols: list, max_workers: int = 5):
    """
    Get live data for multiple stocks concurrently
    """
    from concurrent.futures import ThreadPoolExecutor
    import time
    
    start_time = time.time()
    print(f"Fetching live data for {len(symbols)} stocks...")
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        results = list(executor.map(generate_stock_data, symbols))
    
    end_time = time.time()
    print(f"Fetched data for {len(symbols)} stocks in {end_time - start_time:.2f} seconds")
    
    return results

# Generate chart data
def generate_chart_data(symbol: str):
    data = []
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="90d")
        if hist.empty:
            raise ValueError("No data found")
        for date, row in hist.iterrows():
            data.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": round(row['Open'], 2),
                "close": round(row['Close'], 2),
                "high": round(row['High'], 2),
                "low": round(row['Low'], 2),
            })
    except Exception as e:
        print(f"Error fetching chart data: {e}")
    return data

# Enhanced live market data endpoints
@app.get("/api/live-market-data/{symbol}")
async def get_live_market_data(symbol: str):
    """
    Get comprehensive live market data including market cap and volume
    """
    try:
        symbol = symbol.upper()
        stock_data = generate_stock_data(symbol)
        
        if stock_data["current_price"] is None:
            raise HTTPException(status_code=404, detail=f"Stock data not found for symbol: {symbol}")
        
        # Add formatted display values
        stock_data["formatted_market_cap"] = format_number(stock_data["market_cap"])
        stock_data["formatted_volume"] = format_volume(stock_data["volume"])
        stock_data["formatted_avg_volume"] = format_volume(stock_data["avg_volume"])
        
        return {
            "success": True,
            "data": stock_data,
            "timestamp": datetime.now().isoformat(),
            "source": "yfinance_live"
        }
        
    except Exception as e:
        print(f"Error in live market data endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/multiple-stocks/{symbols}")
async def get_multiple_live_data(symbols: str):
    """
    Get live data for multiple stocks (comma-separated symbols)
    Example: /api/multiple-stocks/AAPL,GOOGL,MSFT,TSLA
    """
    try:
        symbol_list = [s.strip().upper() for s in symbols.split(',')]
        
        if len(symbol_list) > 20:  # Limit to prevent overload
            raise HTTPException(status_code=400, detail="Maximum 20 stocks allowed per request")
        
        stocks_data = get_multiple_stocks_data(symbol_list)
        
        # Add formatted values for each stock
        for stock in stocks_data:
            if stock["current_price"]:
                stock["formatted_market_cap"] = format_number(stock["market_cap"])
                stock["formatted_volume"] = format_volume(stock["volume"])
                stock["formatted_avg_volume"] = format_volume(stock["avg_volume"])
        
        return {
            "success": True,
            "data": stocks_data,
            "count": len(stocks_data),
            "timestamp": datetime.now().isoformat(),
            "source": "yfinance_live"
        }
        
    except Exception as e:
        print(f"Error in multiple stocks endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Original endpoints
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
    chart_data = generate_chart_data(symbol)
    return {"stock_data": stock_data, "chart_data": chart_data}
