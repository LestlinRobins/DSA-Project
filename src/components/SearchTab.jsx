import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Activity,
  Eye,
} from "lucide-react";

const SearchTab = ({ selectedStock, onStockSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [showVolatilityButton, setShowVolatilityButton] = useState(false);

  const API_BASE = "http://127.0.0.1:8000";
  const debounceRef = useRef(null);

  // Autocomplete: fetch search results from backend
  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // Debounce API calls
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/search?query=${query}`);
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300); // wait 300ms after user stops typing
  };

  // Fetch stock + chart data
  const handleStockSelection = async (stock) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/stock/${stock.symbol}`);
      const data = await res.json();

      setStockData(data.stock_data);
      setChartData(data.chart_data);
      setShowVolatilityButton(true);
      setSearchResults([]);
      setSearchQuery(stock.symbol); // show selected symbol in input
      onStockSelect(stock);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-tab">
      {/* Enhanced Search Header */}
      <div className="search-header">
        <h2>Stock Search & Analysis</h2>
        <p>Find and analyze your favorite stocks with real-time data</p>
      </div>

      {/* Enhanced Search Input */}
      <div className="search-section">
        <div className="search-input-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search companies or symbols (e.g., AAPL, Apple)..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          {loading && <div className="loading-spinner"></div>}
        </div>

        {/* Enhanced Search Results */}
        {searchResults.length > 0 && (
          <div className="search-results">
            <div className="results-header">
              <span>Found {searchResults.length} matches</span>
            </div>
            {searchResults.map((company) => (
              <div
                key={company.symbol}
                className="search-result-item"
                onClick={() => handleStockSelection(company)}
              >
                <div className="company-info">
                  <div className="symbol-badge">{company.symbol}</div>
                  <div className="company-details">
                    <span className="company-name">{company.company}</span>
                  </div>
                </div>
                <div className="select-arrow">→</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Stock Display */}
      {stockData && (
        <div className="stock-display-section">
          <div className="stock-info-card">
            <div className="stock-header">
              <div className="stock-title">
                <h3>{stockData.symbol}</h3>
                <h4>{stockData.company_name}</h4>
              </div>
              <div className="stock-status">
                <span className="live-indicator">● LIVE</span>
              </div>
            </div>

            <div className="price-section">
              <div className="current-price">
                <div className="price-display">
                  <DollarSign size={24} />
                  <span className="price">
                    {stockData.current_price.toFixed(2)}
                  </span>
                </div>
                <div
                  className={`change ${
                    stockData.change >= 0 ? "positive" : "negative"
                  }`}
                >
                  {stockData.change >= 0 ? (
                    <TrendingUp size={18} />
                  ) : (
                    <TrendingDown size={18} />
                  )}
                  <span className="change-value">
                    {stockData.change >= 0 ? "+" : ""}
                    {stockData.change.toFixed(2)}
                  </span>
                  <span className="change-percent">
                    ({stockData.change >= 0 ? "+" : ""}
                    {stockData.change_percent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="stock-metrics">
              <div className="metric-card">
                <div className="metric-icon">
                  <BarChart3 size={20} />
                </div>
                <div className="metric-info">
                  <label>Volume</label>
                  <span className="metric-value">
                    {stockData.volume.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">
                  <DollarSign size={20} />
                </div>
                <div className="metric-info">
                  <label>Market Cap</label>
                  <span className="metric-value">
                    ${(stockData.market_cap / 1e9).toFixed(2)}B
                  </span>
                </div>
              </div>
            </div>

            {showVolatilityButton && (
              <div className="action-section">
                <button
                  className="volatility-button"
                  onClick={() =>
                    console.log("Volatility chart for", stockData.symbol)
                  }
                >
                  <Activity size={18} />
                  <span>View Volatility Analysis</span>
                </button>
              </div>
            )}
          </div>

          {/* Enhanced Chart Section */}
          <div className="chart-section">
            <div className="chart-header">
              <div className="chart-title">
                <BarChart3 size={24} />
                <h3>Price Chart (3 Months)</h3>
              </div>
              <div className="chart-period">
                <span>Last 90 days</span>
              </div>
            </div>

            <div className="chart-container">
              <div className="simple-chart">
                {chartData.slice(-20).map((point, idx) => {
                  const maxPrice = Math.max(
                    ...chartData.slice(-20).map((p) => p.close)
                  );
                  const minPrice = Math.min(
                    ...chartData.slice(-20).map((p) => p.close)
                  );
                  const height =
                    ((point.close - minPrice) / (maxPrice - minPrice)) * 150 +
                    20;

                  return (
                    <div
                      key={idx}
                      className="chart-bar"
                      style={{ height: `${height}px` }}
                      title={`${point.date}: $${point.close.toFixed(2)}`}
                    >
                      <div className="bar-tooltip">
                        ${point.close.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="chart-info">
                <div className="price-range">
                  <span className="range-label">Range:</span>
                  <span className="range-values">
                    $
                    {Math.min(
                      ...chartData.slice(-20).map((p) => p.close)
                    ).toFixed(2)}{" "}
                    - $
                    {Math.max(
                      ...chartData.slice(-20).map((p) => p.close)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!stockData && !loading && (
        <div className="empty-state">
          <Search size={64} className="empty-icon" />
          <h3>Start Your Stock Analysis</h3>
          <p>
            Search for any company or stock symbol to view detailed market data
            and charts
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchTab;
