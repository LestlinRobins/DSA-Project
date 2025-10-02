import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

const TopGainersLosersTab = () => {
  // State management for component
  const [gainersLosersData, setGainersLosersData] = useState(null); // Stores API response data
  const [loading, setLoading] = useState(false); // Tracks loading state during API calls
  const [activeView, setActiveView] = useState("gainers"); // Controls which tab is visible

  // Effect hook to load data when component mounts
  useEffect(() => {
    loadGainersLosersData();
  }, []);

  // Function to fetch data from backend API
  const loadGainersLosersData = async () => {
    setLoading(true);
    try {
      // Parallel API calls for both gainers and losers data
      const [gainersResponse, losersResponse] = await Promise.all([
        fetch("http://localhost:8000/api/top-gainers"),
        fetch("http://localhost:8000/api/top-losers"),
      ]);

      if (!gainersResponse.ok || !losersResponse.ok) {
        throw new Error(
          `HTTP error! status: ${
            gainersResponse.status || losersResponse.status
          }`
        );
      }

      const gainers = await gainersResponse.json();
      const losers = await losersResponse.json();

      // Handle error responses from backend
      if (gainers.error) {
        console.error("Gainers API error:", gainers.error);
        throw new Error(gainers.error);
      }
      if (losers.error) {
        console.error("Losers API error:", losers.error);
        throw new Error(losers.error);
      }

      // Update state with fetched data
      setGainersLosersData({
        gainers: Array.isArray(gainers) ? gainers : gainers.data || [],
        losers: Array.isArray(losers) ? losers : losers.data || [],
      });
    } catch (error) {
      console.error("Error loading gainers/losers data:", error);
      alert(
        "Failed to load market data. Please try again. Error: " + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // Reusable component for rendering individual stock items
  const StockItem = ({ stock, isGainer }) => (
    <div className={`stock-item ${isGainer ? "gainer" : "loser"}`}>
      {/* Stock symbol and company name */}
      <div className="stock-info">
        <div className="stock-symbol">
          <strong>{stock.symbol}</strong>
          <span className="company-name">{stock.company_name}</span>
        </div>
        <div className="stock-price">
          <span className="current-price">
            ${stock.current_price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Price change and volume information */}
      <div className="stock-change">
        <div className={`change-value ${isGainer ? "positive" : "negative"}`}>
          {isGainer ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>
            ${Math.abs(stock.price_change).toFixed(2)} (
            {Math.abs(stock.percent_change).toFixed(2)}%)
          </span>
        </div>
        <div className="volume">Volume: {stock.volume.toLocaleString()}</div>
      </div>
    </div>
  );

  return (
    <div className="gainers-losers-tab">
      {/* Header section with title and refresh button */}
      <div className="tab-header">
        <h2>Top Gainers & Losers</h2>
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

      {/* Toggle buttons to switch between gainers and losers view */}
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

      {/* Conditional rendering based on loading and data state */}
      {loading ? (
        // Loading spinner while fetching data
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading market data...</p>
        </div>
      ) : gainersLosersData ? (
        // Main content when data is available
        <div className="stocks-list">
          {activeView === "gainers" ? (
            // Gainers section
            <div className="gainers-section">
              <h3>Top Gainers</h3>
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
            // Losers section
            <div className="losers-section">
              <h3>Top Losers</h3>
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
        // Fallback message when no data is available
        <div className="no-data">
          <p>No data available. Click refresh to load market data.</p>
        </div>
      )}
    </div>
  );
};

export default TopGainersLosersTab;
