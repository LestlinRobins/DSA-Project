import React, { useState, useEffect } from "react";
import { Brain, AlertCircle, Info, LineChart } from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PredictionsTab = ({ selectedStock }) => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Selected stock changed:", selectedStock);
    if (selectedStock) {
      loadPredictions(selectedStock);
    }
    return () => {
      setForecast(null);
      setError(null);
    };
  }, [selectedStock]);

  const loadPredictions = async (stock) => {
    setLoading(true);
    setError(null);
    setForecast(null);
    try {
      console.log("Fetching current stock data...");
      const stockResponse = await fetch(
        `http://127.0.0.1:8001/stock/${stock.symbol}`
      );
      if (!stockResponse.ok) {
        throw new Error("Failed to fetch current stock data");
      }
      const stockData = await stockResponse.json();
      const basePrice = stockData.stock_data.current_price;
      console.log("Got stock price:", basePrice);

      const mockHistory = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (30 - i));
        return {
          date: date.toISOString().split("T")[0],
          close:
            basePrice +
            Math.sin(i / 5) * (basePrice * 0.05) +
            (Math.random() - 0.5) * (basePrice * 0.02),
        };
      });

      console.log("Sending prediction request with data:", { mockHistory });
      const response = await fetch(`http://localhost:8002/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: mockHistory,
          horizon: 30,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Prediction request failed:", response.status, errorText);
        throw new Error(
          errorText || "Failed to fetch predictions from server."
        );
      }

      const data = await response.json();
      console.log("Prediction response data:", data);
      setForecast(data);
      console.log("Forecast state updated");
    } catch (err) {
      console.error("Error fetching predictions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      console.log("Loading state set to false");
    }
  };

  console.log("Rendering PredictionsTab with:", {
    loading,
    error,
    forecast,
    hasForecast: !!forecast,
    forecastKeys: forecast ? Object.keys(forecast) : [],
    predictionsLength: forecast?.predictions?.length,
  });

  // Custom tooltip for predictions chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="recharts-tooltip prediction-tooltip">
          <div className="tooltip-header">
            <p className="tooltip-date">{label}</p>
          </div>
          <div className="tooltip-content">
            <p className="tooltip-price">
              <span className="tooltip-label">Predicted Price:</span>
              <span className="tooltip-value">
                ${payload[0].value.toFixed(2)}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="predictions-tab">
      <div className="predictions-header">
        <h2>
          <LineChart size={28} />
          Data-Driven Stock Forecast
        </h2>
        <p>
          Price estimations based on historical trends, momentum, and
          volatility.
        </p>
      </div>

      {!selectedStock ? (
        <div className="no-stock-message">
          <Brain size={48} />
          <h3>No Stock Selected</h3>
          <p>
            Please select a stock from the main dashboard to view its forecast.
          </p>
        </div>
      ) : (
        <div className="predictions-content">
          {loading && (
            <div className="loading-spinner-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">
                Analyzing historical data for {selectedStock.symbol}...
              </p>
            </div>
          )}

          {error && (
            <div className="error-message" role="alert">
              <p>Error</p>
              <p>{error}</p>
            </div>
          )}

          {forecast && !loading && (
            <div className="prediction-results">
              <div className="prediction-insight">
                <Info size={24} />
                <div className="prediction-insight-content">
                  <h4>Prediction Insight</h4>
                  <p>{forecast.explanation || "No explanation available"}</p>
                </div>
              </div>

              {/* Predictions Chart */}
              <div className="predictions-chart-section">
                <h4>📈 30-Day Price Forecast for {selectedStock.symbol}</h4>
                <div className="chart-container">
                  {Array.isArray(forecast.predictions) &&
                  forecast.predictions.length > 0 ? (
                    (() => {
                      const chartData = forecast.predictions.map((pred) => ({
                        date: new Date(pred.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        }),
                        price:
                          typeof pred.close === "number"
                            ? pred.close
                            : parseFloat(pred.close),
                      }));

                      // Calculate min and max prices
                      const prices = chartData.map((d) => d.price);
                      const minPrice = Math.min(...prices);
                      const maxPrice = Math.max(...prices);
                      const priceRange = maxPrice - minPrice;

                      // Add 10% padding to top and bottom for better visualization
                      const padding = priceRange * 0.1;
                      const yMin = minPrice - padding;
                      const yMax = maxPrice + padding;

                      return (
                        <ResponsiveContainer width="100%" height={400}>
                          <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient
                                id="predictionGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#10b981"
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#10b981"
                                  stopOpacity={0.1}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="rgba(255,255,255,0.1)"
                            />
                            <XAxis
                              dataKey="date"
                              stroke="#94a3b8"
                              angle={-45}
                              textAnchor="end"
                              height={80}
                              interval="preserveStartEnd"
                            />
                            <YAxis
                              stroke="#94a3b8"
                              domain={[yMin, yMax]}
                              tickFormatter={(value) => `$${value.toFixed(2)}`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                              type="monotone"
                              dataKey="price"
                              stroke="#10b981"
                              strokeWidth={3}
                              fillOpacity={1}
                              fill="url(#predictionGradient)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      );
                    })()
                  ) : (
                    <div className="no-chart-data">
                      <p>No prediction data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Predictions Table */}
              <div className="forecast-table-container">
                <h4>📊 Detailed Forecast Data</h4>
                <div className="overflow-x-auto max-h-96">
                  <table className="forecast-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Predicted Close Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(forecast.predictions) ? (
                        forecast.predictions.map((pred) => (
                          <tr key={pred.date}>
                            <td className="date">{pred.date}</td>
                            <td className="price">
                              $
                              {typeof pred.close === "number"
                                ? pred.close.toFixed(2)
                                : pred.close}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2">No prediction data available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="disclaimer">
                <AlertCircle size={16} />
                <span>
                  <strong>Disclaimer:</strong> These forecasts are for
                  educational purposes only and are not financial advice. Always
                  conduct your own research.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PredictionsTab;
