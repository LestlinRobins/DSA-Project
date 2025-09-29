import React, { useState, useEffect } from "react";
import { Activity, TrendingUp } from "lucide-react";

const VolatilityTab = ({ searchedSymbol, selectedStock }) => {
  const [volatilityData, setVolatilityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("1M");

  // Mock volatility calculation function
  const calculateVolatility = (symbol, range) => {
    // Dummy volatility data - team can implement real calculation
    const mockData = {
      symbol: symbol,
      volatility: (Math.random() * 50 + 10).toFixed(2), // Random volatility between 10-60%
      timeRange: range,
      dataPoints: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        volatility: (Math.random() * 40 + 5).toFixed(2),
      })),
      riskLevel:
        Math.random() > 0.5 ? "High" : Math.random() > 0.3 ? "Medium" : "Low",
    };
    return mockData;
  };

  // Load volatility data when symbol changes
  useEffect(() => {
    if (searchedSymbol) {
      loadVolatilityData(searchedSymbol, timeRange);
    }
  }, [searchedSymbol, timeRange]);

  const loadVolatilityData = async (symbol, range) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const data = calculateVolatility(symbol, range);
      setVolatilityData(data);
    } catch (error) {
      console.error("Error loading volatility data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="volatility-tab">
      <h2>📊 Volatility Analysis</h2>
      <p className="tab-description">
        Analyze historical volatility patterns and risk metrics
      </p>

      {!searchedSymbol ? (
        <div className="no-symbol-message">
          <Activity size={48} className="icon" />
          <h3>No Symbol Selected</h3>
          <p>
            Please search for a stock symbol in the "Search & Charts" tab first.
          </p>
          <div className="instruction-steps">
            <p>Steps:</p>
            <ol>
              <li>Go to "Search & Charts" tab</li>
              <li>Search for a company</li>
              <li>Click "View Volatility" button</li>
              <li>Return to this tab to see volatility analysis</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="volatility-content">
          {/* Time Range Selector */}
          <div className="time-range-selector">
            <label>Time Range:</label>
            <div className="range-buttons">
              {["1W", "1M", "3M", "6M", "1Y"].map((range) => (
                <button
                  key={range}
                  className={`range-button ${
                    timeRange === range ? "active" : ""
                  }`}
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Calculating volatility for {searchedSymbol}...</p>
            </div>
          ) : volatilityData ? (
            <div className="volatility-display">
              {/* Volatility Summary */}
              <div className="volatility-summary">
                <div className="volatility-card">
                  <h3>{volatilityData.symbol}</h3>
                  <div className="volatility-metric">
                    <span className="volatility-value">
                      {volatilityData.volatility}%
                    </span>
                    <span className="volatility-label">
                      Historical Volatility
                    </span>
                  </div>
                  <div
                    className={`risk-level ${volatilityData.riskLevel.toLowerCase()}`}
                  >
                    Risk Level: {volatilityData.riskLevel}
                  </div>
                </div>
              </div>

              {/* Volatility Chart */}
              <div className="volatility-chart-section">
                <h3>📈 Volatility Chart ({timeRange})</h3>
                <div className="dummy-volatility-chart">
                  <div className="chart-placeholder">
                    <p>📊 Volatility Chart Component</p>
                    <p>Data Points: {volatilityData.dataPoints.length}</p>
                    <p>
                      Team can implement advanced volatility visualization here
                    </p>

                    {/* Simple dummy volatility visualization */}
                    <div className="volatility-bars">
                      {volatilityData.dataPoints
                        .slice(-10)
                        .map((point, index) => (
                          <div key={index} className="volatility-bar">
                            <div
                              className="bar"
                              style={{
                                height: `${point.volatility * 2}px`,
                                backgroundColor:
                                  point.volatility > 25
                                    ? "#ff4444"
                                    : point.volatility > 15
                                    ? "#ffaa00"
                                    : "#44ff44",
                              }}
                            />
                            <span className="bar-value">
                              {point.volatility}%
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Volatility Metrics */}
              <div className="volatility-metrics">
                <h4>📋 Volatility Metrics</h4>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <label>Average Volatility</label>
                    <span>{volatilityData.volatility}%</span>
                  </div>
                  <div className="metric-card">
                    <label>Max Volatility</label>
                    <span>
                      {(parseFloat(volatilityData.volatility) * 1.5).toFixed(2)}
                      %
                    </span>
                  </div>
                  <div className="metric-card">
                    <label>Min Volatility</label>
                    <span>
                      {(parseFloat(volatilityData.volatility) * 0.5).toFixed(2)}
                      %
                    </span>
                  </div>
                  <div className="metric-card">
                    <label>Volatility Trend</label>
                    <span className="trend">
                      <TrendingUp size={16} /> Increasing
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Development Notes */}
      <div className="development-notes">
        <h4>🛠️ Development Notes</h4>
        <ul>
          <li>
            Implement real volatility calculations using historical price data
          </li>
          <li>Add statistical measures (Standard deviation, Beta, etc.)</li>
          <li>Create interactive volatility charts with hover details</li>
          <li>Add volatility comparison with market indices</li>
          <li>Implement volatility alerts and notifications</li>
        </ul>
      </div>
    </div>
  );
};

export default VolatilityTab;
