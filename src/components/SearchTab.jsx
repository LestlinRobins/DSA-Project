import React, { useState } from "react";
import { Search, TrendingUp, TrendingDown } from "lucide-react";

const SearchTab = ({ selectedStock, onStockSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [showVolatilityButton, setShowVolatilityButton] = useState(false);

  // Mock companies data
  const mockCompanies = [
    { symbol: "AAPL", company: "Apple Inc." },
    { symbol: "MSFT", company: "Microsoft Corporation" },
    { symbol: "GOOGL", company: "Alphabet Inc." },
    { symbol: "AMZN", company: "Amazon.com Inc." },
    { symbol: "TSLA", company: "Tesla Inc." },
    { symbol: "META", company: "Meta Platforms Inc." },
    { symbol: "NVDA", company: "NVIDIA Corporation" },
    { symbol: "JPM", company: "JPMorgan Chase & Co." },
    { symbol: "JNJ", company: "Johnson & Johnson" },
    { symbol: "V", company: "Visa Inc." },
  ];

  // Generate mock stock data
  const generateMockStockData = (symbol) => {
    const basePrice = 100 + Math.random() * 200;
    const change = (Math.random() - 0.5) * 10;
    const changePercent = (change / basePrice) * 100;

    return {
      symbol: symbol,
      company_name:
        mockCompanies.find((c) => c.symbol === symbol)?.company ||
        `${symbol} Inc.`,
      current_price: basePrice,
      change: change,
      change_percent: changePercent,
      volume: Math.floor(Math.random() * 10000000 + 1000000),
      market_cap: basePrice * Math.random() * 1000000000,
    };
  };

  // Generate mock chart data
  const generateMockChartData = () => {
    const data = [];
    let price = 100 + Math.random() * 100;

    for (let i = 0; i < 90; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (90 - i));

      price += (Math.random() - 0.5) * 5;
      data.push({
        date: date.toISOString().split("T")[0],
        close: parseFloat(price.toFixed(2)),
        open: parseFloat((price + (Math.random() - 0.5) * 2).toFixed(2)),
        high: parseFloat((price + Math.random() * 3).toFixed(2)),
        low: parseFloat((price - Math.random() * 3).toFixed(2)),
      });
    }
    return data;
  };

  // Handle company search with mock data
  const handleSearch = (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const filtered = mockCompanies.filter(
        (company) =>
          company.company.toLowerCase().includes(query.toLowerCase()) ||
          company.symbol.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 10));
      setLoading(false);
    }, 300);
  };

  // Handle stock selection with mock data
  const handleStockSelection = (stock) => {
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const mockStock = generateMockStockData(stock.symbol);
      const mockChart = generateMockChartData();

      setStockData(mockStock);
      setChartData(mockChart);
      setShowVolatilityButton(true);
      setSearchResults([]);
      setSearchQuery("");
      onStockSelect(stock);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="search-tab">
      {/* Search Section */}
      <div className="search-section">
        <h2>🔍 Company Search</h2>
        <p className="tab-description">
          Search for companies and view their stock price charts
        </p>

        <div className="search-input-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search for companies (e.g., Apple, Microsoft, Tesla)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            className="search-input"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((company, index) => (
              <div
                key={index}
                className="search-result-item"
                onClick={() => handleStockSelection(company)}
              >
                <div className="company-info">
                  <strong>{company.symbol}</strong>
                  <span>{company.company}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading stock data...</p>
        </div>
      )}

      {/* Stock Information and Chart */}
      {stockData && (
        <div className="stock-display-section">
          {/* Stock Info Card */}
          <div className="stock-info-card">
            <div className="stock-header">
              <h3>{stockData.symbol}</h3>
              <h4>{stockData.company_name}</h4>
            </div>

            <div className="price-info">
              <div className="current-price">
                <span className="price">
                  ${stockData.current_price.toFixed(2)}
                </span>
                <div
                  className={`change ${
                    stockData.change >= 0 ? "positive" : "negative"
                  }`}
                >
                  {stockData.change >= 0 ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  <span>
                    ${Math.abs(stockData.change).toFixed(2)} (
                    {stockData.change_percent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="stock-metrics">
              <div className="metric">
                <label>Volume</label>
                <span>{stockData.volume.toLocaleString()}</span>
              </div>
              {stockData.market_cap && (
                <div className="metric">
                  <label>Market Cap</label>
                  <span>${(stockData.market_cap / 1e9).toFixed(2)}B</span>
                </div>
              )}
            </div>

            {/* Volatility Button */}
            {showVolatilityButton && (
              <div className="volatility-button-container">
                <button
                  className="volatility-button"
                  onClick={() => {
                    // This would switch to volatility tab
                    // Parent component should handle this
                    console.log(
                      "Switch to volatility tab for",
                      stockData.symbol
                    );
                  }}
                >
                  View Volatility Chart
                </button>
              </div>
            )}
          </div>

          {/* Price Chart */}
          <div className="chart-section">
            <h3>📈 Price Chart (3 Months)</h3>
            <div className="dummy-chart">
              {/* Dummy chart placeholder - team can implement actual chart */}
              <div className="chart-placeholder">
                <p>📊 Price Chart Component</p>
                <p>Data Points: {chartData.length}</p>
                <p>Team can implement Recharts/Chart.js here</p>

                {/* Simple dummy visualization */}
                <div className="simple-chart">
                  {chartData.slice(-10).map((point, index) => (
                    <div
                      key={index}
                      className="chart-bar"
                      style={{
                        height: `${
                          (point.close /
                            Math.max(...chartData.map((p) => p.close))) *
                          100
                        }px`,
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions for Team */}
      <div className="development-notes">
        <h4>🛠️ Development Notes</h4>
        <ul>
          <li>Implement proper charting library (Recharts/Chart.js)</li>
          <li>Add more advanced search features</li>
          <li>Implement caching for better performance</li>
          <li>Add error handling and retry mechanisms</li>
        </ul>
      </div>
    </div>
  );
};

export default SearchTab;
