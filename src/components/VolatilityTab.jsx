import React, { useState, useEffect } from "react";
import { Activity, TrendingUp, TrendingDown, AlertTriangle, BarChart3, Target } from "lucide-react";

const VolatilityTab = ({ searchedSymbol, selectedStock }) => {
  const [volatilityData, setVolatilityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("1M");
  const [rankingData, setRankingData] = useState(null);
  const [loadingRankings, setLoadingRankings] = useState(false);

  // Load volatility data when symbol changes
  useEffect(() => {
    if (searchedSymbol) {
      loadVolatilityData(searchedSymbol, timeRange);
    }
  }, [searchedSymbol, timeRange]);

  // Load volatility rankings on component mount and time range change
  useEffect(() => {
    loadVolatilityRankings();
  }, [timeRange]);

  const loadVolatilityData = async (symbol, range) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8001/api/volatility/${symbol}?time_range=${range}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      
      const data = await response.json();
      setVolatilityData(data);
    } catch (error) {
      console.error("Error loading volatility data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadVolatilityRankings = async () => {
    setLoadingRankings(true);
    try {
      const response = await fetch(
        `http://localhost:8001/api/volatility-ranking?time_range=${timeRange}&limit=5`
      );
      if (response.ok) {
        const data = await response.json();
        setRankingData(data);
      }
    } catch (error) {
      console.error("Error loading rankings:", error);
    } finally {
      setLoadingRankings(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#6b7280';
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
          ) : error ? (
            <div className="error-display">
              <AlertTriangle size={48} color="#ef4444" />
              <h3>Error Loading Data</h3>
              <p>{error}</p>
              <button 
                className="retry-button"
                onClick={() => loadVolatilityData(searchedSymbol, timeRange)}
              >
                Try Again
              </button>
            </div>
          ) : volatilityData ? (
            <div className="volatility-display">
              {/* Main Volatility Card */}
              <div className="main-volatility-card">
                <div className="stock-header">
                  <div className="stock-info">
                    <h2>{volatilityData.company_name}</h2>
                    <span className="stock-symbol">{volatilityData.symbol}</span>
                    <span className="current-price">${volatilityData.current_price}</span>
                  </div>
                  <div className="volatility-badge">
                    <span className="volatility-percentage">{volatilityData.historical_volatility}%</span>
                    <span className="volatility-label">Annual Volatility</span>
                  </div>
                </div>
                
                <div className="risk-indicator">
                  <span 
                    className={`risk-badge risk-${volatilityData.risk_level.toLowerCase()}`}
                    style={{ backgroundColor: getRiskColor(volatilityData.risk_level) }}
                  >
                    {volatilityData.risk_level} Risk
                  </span>
                  <span className="data-info">
                    Based on {volatilityData.data_period} • Updated: {volatilityData.last_updated}
                  </span>
                </div>
              </div>

              {/* Volatility Metrics Grid */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <BarChart3 size={24} color="#3b82f6" />
                  <div className="metric-content">
                    <span className="metric-value">{volatilityData.avg_volatility}%</span>
                    <span className="metric-label">Average Volatility</span>
                  </div>
                </div>
                <div className="metric-card">
                  <TrendingUp size={24} color="#ef4444" />
                  <div className="metric-content">
                    <span className="metric-value">{volatilityData.max_volatility}%</span>
                    <span className="metric-label">Maximum Volatility</span>
                  </div>
                </div>
                <div className="metric-card">
                  <TrendingDown size={24} color="#22c55e" />
                  <div className="metric-content">
                    <span className="metric-value">{volatilityData.min_volatility}%</span>
                    <span className="metric-label">Minimum Volatility</span>
                  </div>
                </div>
                <div className="metric-card">
                  <Target size={24} color="#8b5cf6" />
                  <div className="metric-content">
                    <span className="metric-value">
                      {(volatilityData.max_volatility - volatilityData.min_volatility).toFixed(2)}%
                    </span>
                    <span className="metric-label">Volatility Range</span>
                  </div>
                </div>
              </div>

              {/* Volatility Chart */}
              <div className="volatility-chart-section">
                <h3>📈 Rolling Volatility Chart ({timeRange})</h3>
                <div className="chart-container">
                  {volatilityData.data_points?.length > 0 ? (
                    <div className="volatility-chart">
                      <div className="chart-bars">
                        {volatilityData.data_points.slice(-20).map((point, index) => {
                          const height = Math.max((point.volatility / volatilityData.max_volatility) * 100, 5);
                          return (
                            <div key={index} className="chart-bar-container">
                              <div
                                className="chart-bar"
                                style={{
                                  height: `${height}%`,
                                  backgroundColor: getRiskColor(
                                    point.volatility > 30 ? 'high' :
                                    point.volatility > 15 ? 'medium' : 'low'
                                  )
                                }}
                                title={`${point.date}: ${point.volatility}%`}
                              />
                              <span className="bar-label">{point.volatility}%</span>
                              <span className="date-label">
                                {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="no-chart-data">
                      <p>Insufficient data for volatility chart</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Market Volatility Rankings */}
              <div className="volatility-rankings">
                <h3>🏆 Market Volatility Rankings ({timeRange})</h3>
                {loadingRankings ? (
                  <div className="rankings-loading">Loading rankings...</div>
                ) : rankingData ? (
                  <div className="rankings-container">
                    <div className="ranking-section">
                      <h4>🔥 Most Volatile</h4>
                      <div className="ranking-list">
                        {rankingData.most_volatile.map((stock, index) => (
                          <div key={stock.symbol} className="ranking-item high-volatility">
                            <span className="rank">#{index + 1}</span>
                            <div className="stock-details">
                              <span className="symbol">{stock.symbol}</span>
                              <span className="company">{stock.company_name}</span>
                            </div>
                            <div className="volatility-info">
                              <span className="volatility-value">{stock.volatility}%</span>
                              <span className={`risk-tag risk-${stock.risk_level.toLowerCase()}`}>
                                {stock.risk_level}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="ranking-section">
                      <h4>🛡️ Most Stable</h4>
                      <div className="ranking-list">
                        {rankingData.least_volatile.map((stock, index) => (
                          <div key={stock.symbol} className="ranking-item low-volatility">
                            <span className="rank">#{index + 1}</span>
                            <div className="stock-details">
                              <span className="symbol">{stock.symbol}</span>
                              <span className="company">{stock.company_name}</span>
                            </div>
                            <div className="volatility-info">
                              <span className="volatility-value">{stock.volatility}%</span>
                              <span className={`risk-tag risk-${stock.risk_level.toLowerCase()}`}>
                                {stock.risk_level}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Volatility Education */}
      <div className="volatility-education">
        <h3>� Understanding Volatility</h3>
        <div className="education-grid">
          <div className="education-card">
            <h4>What is Volatility?</h4>
            <p>
              Volatility measures how much a stock's price moves up and down over time. 
              Higher volatility means larger price swings, indicating higher risk and potential reward.
            </p>
          </div>
          <div className="education-card">
            <h4>Risk Levels</h4>
            <div className="risk-levels">
              <div className="risk-example">
                <span className="risk-badge risk-low">Low Risk</span>
                <span>&lt; 15% - Stable, conservative investments</span>
              </div>
              <div className="risk-example">
                <span className="risk-badge risk-medium">Medium Risk</span>
                <span>15-30% - Balanced risk-reward profile</span>
              </div>
              <div className="risk-example">
                <span className="risk-badge risk-high">High Risk</span>
                <span>&gt; 30% - High potential returns with high risk</span>
              </div>
            </div>
          </div>
          <div className="education-card">
            <h4>Investment Implications</h4>
            <p>
              Use volatility to assess investment risk. Low volatility stocks are suitable 
              for conservative portfolios, while high volatility stocks may offer growth 
              opportunities for risk-tolerant investors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolatilityTab;
