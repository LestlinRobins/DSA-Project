import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Activity,
  Eye,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const SearchTab = ({ selectedStock, onStockSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [showVolatilityButton, setShowVolatilityButton] = useState(false);
  const [chartPeriod, setChartPeriod] = useState("3M"); // Default to 3 months

  const API_BASE = "http://127.0.0.1:8001";
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

  // Fetch stock + chart data with current period
  const handleStockSelection = async (stock) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/stock/${stock.symbol}?period=${chartPeriod}`
      );
      const data = await res.json();

      setStockData(data.stock_data);

      // Format chart data for Recharts with proper date formatting
      const formattedChartData = data.chart_data.map((item, index) => ({
        ...item,
        formattedDate: new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        shortDate: new Date(item.date).toLocaleDateString("en-US", {
          month: "numeric",
          day: "numeric",
        }),
      }));

      setChartData(formattedChartData);
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

  // Fetch chart data when period changes
  const handlePeriodChange = async (newPeriod) => {
    if (!stockData) return; // No stock selected yet

    setChartPeriod(newPeriod);
    setLoading(true);

    try {
      // Fetch new chart data for the selected period
      const res = await fetch(
        `${API_BASE}/chart/${stockData.symbol}?period=${newPeriod}`
      );
      const data = await res.json();

      // Format chart data for Recharts
      const formattedChartData = data.chart_data.map((item, index) => ({
        ...item,
        formattedDate: new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        shortDate: new Date(item.date).toLocaleDateString("en-US", {
          month: "numeric",
          day: "numeric",
        }),
      }));

      setChartData(formattedChartData);
    } catch (err) {
      console.error("Error fetching chart data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Custom tooltip component for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="recharts-tooltip">
          <div className="tooltip-header">
            <p className="tooltip-date">{data.date}</p>
          </div>
          <div className="tooltip-content">
            <p className="tooltip-price">
              <span className="tooltip-label">Close:</span>
              <span className="tooltip-value">${data.close.toFixed(2)}</span>
            </p>
            <p className="tooltip-range">
              <span className="tooltip-label">High:</span>
              <span className="tooltip-value">${data.high.toFixed(2)}</span>
            </p>
            <p className="tooltip-range">
              <span className="tooltip-label">Low:</span>
              <span className="tooltip-value">${data.low.toFixed(2)}</span>
            </p>
            <p className="tooltip-volume">
              <span className="tooltip-label">Volume:</span>
              <span className="tooltip-value">
                {data.volume.toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
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

          {/* Enhanced Chart Section with Recharts */}
          <div className="chart-section">
            <div className="chart-header">
              <div className="chart-title">
                <BarChart3 size={24} />
                <h3>Price Chart</h3>
              </div>

              {/* Time Period Controls */}
              <div className="chart-period-controls">
                <div className="period-buttons">
                  {["1D", "1W", "1M", "3M", "6M", "1Y"].map((period) => (
                    <button
                      key={period}
                      className={`period-button ${
                        chartPeriod === period ? "active" : ""
                      }`}
                      onClick={() => handlePeriodChange(period)}
                      disabled={loading}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="chart-container">
              {chartData.length > 0 ? (
                <div className="recharts-container">
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart
                      data={chartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 20,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="colorClose"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3498db"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3498db"
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8eef5" />
                      <XAxis
                        dataKey="shortDate"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 12,
                          fill: "#7f8c8d",
                        }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 12,
                          fill: "#7f8c8d",
                        }}
                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="close"
                        stroke="#3498db"
                        strokeWidth={3}
                        fill="url(#colorClose)"
                        dot={false}
                        activeDot={{
                          r: 6,
                          fill: "#3498db",
                          stroke: "#fff",
                          strokeWidth: 2,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="chart-loading">
                  <BarChart3 size={48} className="loading-icon" />
                  <p>Loading chart data...</p>
                </div>
              )}

              <div className="chart-info">
                <div className="price-range">
                  <span className="range-label">Period Range:</span>
                  <span className="range-values">
                    {chartData.length > 0 && (
                      <>
                        ${Math.min(...chartData.map((p) => p.close)).toFixed(2)}{" "}
                        - $
                        {Math.max(...chartData.map((p) => p.close)).toFixed(2)}
                      </>
                    )}
                  </span>
                </div>
                <div className="chart-period-info">
                  <Calendar size={16} />
                  <span>
                    {chartPeriod} view • {chartData.length} data points
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
