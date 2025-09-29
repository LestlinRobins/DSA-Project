import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

const TopGainersLosersTab = () => {
  const [gainersLosersData, setGainersLosersData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState("gainers"); // "gainers" or "losers"

  // Mock data generator for top gainers and losers
  const generateMockData = () => {
    const companies = [
      "AAPL",
      "MSFT",
      "GOOGL",
      "AMZN",
      "TSLA",
      "META",
      "NFLX",
      "NVDA",
      "AMD",
      "INTC",
      "JPM",
      "JNJ",
      "V",
      "PG",
      "UNH",
      "HD",
      "DIS",
      "BAC",
      "VZ",
      "KO",
    ];

    const gainers = [];
    const losers = [];

    for (let i = 0; i < 10; i++) {
      // Generate gainers
      gainers.push({
        symbol: companies[Math.floor(Math.random() * companies.length)],
        company: `${
          companies[Math.floor(Math.random() * companies.length)]
        } Inc.`,
        currentPrice: (Math.random() * 200 + 50).toFixed(2),
        change: (Math.random() * 20 + 1).toFixed(2),
        changePercent: (Math.random() * 15 + 1).toFixed(2),
        volume: Math.floor(Math.random() * 10000000 + 1000000),
      });

      // Generate losers
      losers.push({
        symbol: companies[Math.floor(Math.random() * companies.length)],
        company: `${
          companies[Math.floor(Math.random() * companies.length)]
        } Corp.`,
        currentPrice: (Math.random() * 150 + 30).toFixed(2),
        change: -(Math.random() * 15 + 1).toFixed(2),
        changePercent: -(Math.random() * 12 + 1).toFixed(2),
        volume: Math.floor(Math.random() * 8000000 + 500000),
      });
    }

    // Sort gainers by change percent (descending)
    gainers.sort(
      (a, b) => parseFloat(b.changePercent) - parseFloat(a.changePercent)
    );

    // Sort losers by change percent (ascending)
    losers.sort(
      (a, b) => parseFloat(a.changePercent) - parseFloat(b.changePercent)
    );

    return { gainers, losers };
  };

  // Load data on component mount
  useEffect(() => {
    loadGainersLosersData();
  }, []);

  const loadGainersLosersData = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const data = generateMockData();
      setGainersLosersData(data);
    } catch (error) {
      console.error("Error loading gainers/losers data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StockItem = ({ stock, isGainer }) => (
    <div className={`stock-item ${isGainer ? "gainer" : "loser"}`}>
      <div className="stock-info">
        <div className="stock-symbol">
          <strong>{stock.symbol}</strong>
          <span className="company-name">{stock.company}</span>
        </div>
        <div className="stock-price">
          <span className="current-price">${stock.currentPrice}</span>
        </div>
      </div>

      <div className="stock-change">
        <div className={`change-value ${isGainer ? "positive" : "negative"}`}>
          {isGainer ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>
            ${Math.abs(stock.change)} ({Math.abs(stock.changePercent)}%)
          </span>
        </div>
        <div className="volume">Volume: {stock.volume.toLocaleString()}</div>
      </div>
    </div>
  );

  return (
    <div className="gainers-losers-tab">
      <div className="tab-header">
        <h2>🏆 Top Gainers & Losers</h2>
        <p className="tab-description">
          Real-time top performing and declining stocks of the day
        </p>

        <button
          className="refresh-button"
          onClick={loadGainersLosersData}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spinning" : ""} />
          Refresh Data
        </button>
      </div>

      {/* View Toggle */}
      <div className="view-toggle">
        <button
          className={`toggle-button ${
            activeView === "gainers" ? "active" : ""
          }`}
          onClick={() => setActiveView("gainers")}
        >
          <TrendingUp size={16} />
          Top Gainers
        </button>
        <button
          className={`toggle-button ${activeView === "losers" ? "active" : ""}`}
          onClick={() => setActiveView("losers")}
        >
          <TrendingDown size={16} />
          Top Losers
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading market data...</p>
        </div>
      ) : gainersLosersData ? (
        <div className="stocks-list">
          {activeView === "gainers" ? (
            <div className="gainers-section">
              <h3>📈 Top Gainers</h3>
              <div className="stocks-container">
                {gainersLosersData.gainers.map((stock, index) => (
                  <div key={index} className="stock-rank-item">
                    <span className="rank">#{index + 1}</span>
                    <StockItem stock={stock} isGainer={true} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="losers-section">
              <h3>📉 Top Losers</h3>
              <div className="stocks-container">
                {gainersLosersData.losers.map((stock, index) => (
                  <div key={index} className="stock-rank-item">
                    <span className="rank">#{index + 1}</span>
                    <StockItem stock={stock} isGainer={false} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="no-data">
          <p>No data available. Click refresh to load market data.</p>
        </div>
      )}

      {/* Market Summary */}
      {gainersLosersData && (
        <div className="market-summary">
          <h4>📊 Market Summary</h4>
          <div className="summary-stats">
            <div className="stat-card positive">
              <label>Total Gainers</label>
              <span>{gainersLosersData.gainers.length}</span>
            </div>
            <div className="stat-card negative">
              <label>Total Losers</label>
              <span>{gainersLosersData.losers.length}</span>
            </div>
            <div className="stat-card neutral">
              <label>Avg Gain</label>
              <span>
                +
                {(
                  gainersLosersData.gainers.reduce(
                    (acc, stock) => acc + parseFloat(stock.changePercent),
                    0
                  ) / gainersLosersData.gainers.length
                ).toFixed(2)}
                %
              </span>
            </div>
            <div className="stat-card neutral">
              <label>Avg Loss</label>
              <span>
                {(
                  gainersLosersData.losers.reduce(
                    (acc, stock) => acc + parseFloat(stock.changePercent),
                    0
                  ) / gainersLosersData.losers.length
                ).toFixed(2)}
                %
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Development Notes */}
      <div className="development-notes">
        <h4>🛠️ Development Notes</h4>
        <ul>
          <li>
            Connect to real-time market data APIs (Alpha Vantage, IEX Cloud)
          </li>
          <li>Add filtering options (by sector, market cap, volume)</li>
          <li>Implement real-time updates with WebSocket connections</li>
          <li>Add detailed stock information modal on click</li>
          <li>Include pre-market and after-hours data</li>
          <li>Add export functionality for market data</li>
        </ul>
      </div>
    </div>
  );
};

export default TopGainersLosersTab;
