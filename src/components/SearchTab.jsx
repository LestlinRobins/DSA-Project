import React, { useState, useEffect, useRef } from "react";
import { Search, TrendingUp, TrendingDown } from "lucide-react";

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
      {/* Search Input */}
      <div className="search-section">
        <div className="search-input-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((company) => (
              <div
                key={company.symbol}
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

      {/* Stock Info + Chart */}
      {stockData && (
        <div className="stock-display-section">
          <div className="stock-info-card">
            <h3>{stockData.symbol}</h3>
            <h4>{stockData.company_name}</h4>
            <div className="price-info">
              <span>${stockData.current_price.toFixed(2)}</span>
              <div className={stockData.change >= 0 ? "positive" : "negative"}>
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
            <div className="stock-metrics">
              <div>
                <label>Volume</label>
                <span>{stockData.volume.toLocaleString()}</span>
              </div>
              <div>
                <label>Market Cap</label>
                <span>${(stockData.market_cap / 1e9).toFixed(2)}B</span>
              </div>
            </div>

            {showVolatilityButton && (
              <button
                className="volatility-button"
                onClick={() =>
                  console.log("Volatility chart for", stockData.symbol)
                }
              >
                View Volatility Chart
              </button>
            )}
          </div>

          <div className="chart-section">
            <h3>📈 Price Chart (3 Months)</h3>
            <div className="simple-chart">
              {chartData.slice(-10).map((point, idx) => (
                <div
                  key={idx}
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
      )}
    </div>
  );
};

export default SearchTab;
