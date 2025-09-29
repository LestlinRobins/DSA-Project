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
