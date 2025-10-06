import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  AlertCircle,
  LineChart as LineChartIcon,
  Calendar,
} from "lucide-react";

const PredictionsTab = ({ selectedStock }) => {
  const [symbol, setSymbol] = useState(selectedStock?.symbol || "AAPL");
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(5);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8002/api/predict?symbol=${symbol}&days=${days}`
      );
      if (!response.ok) throw new Error("Failed to fetch prediction");
      const data = await response.json();
      setPredictionData(data);
    } catch (err) {
      setError(err.message);
      setPredictionData(null);
    } finally {
      setLoading(false);
    }
  };

  // Update symbol when selectedStock changes
  useEffect(() => {
    if (selectedStock?.symbol) {
      setSymbol(selectedStock.symbol);
    }
  }, [selectedStock]);

  // Fetch prediction when symbol or days changes
  useEffect(() => {
    if (symbol) {
      fetchPrediction();
    }
  }, [symbol, days]);

  const getSignalColor = (signal) => {
    const colors = {
      "STRONG BUY": "#10b981",
      BUY: "#34d399",
      HOLD: "#f59e0b",
      SELL: "#f87171",
      "STRONG SELL": "#ef4444",
    };
    return colors[signal] || "#6b7280";
  };

  const getSignalIcon = (signal) => {
    if (signal.includes("BUY")) return <TrendingUp size={24} />;
    if (signal.includes("SELL")) return <TrendingDown size={24} />;
    return <Activity size={24} />;
  };

  const prepareHistoricalWithPrediction = () => {
    if (!predictionData) return [];

    const historical = predictionData.historical_data.dates.map(
      (date, idx) => ({
        date,
        actual: predictionData.historical_data.prices[idx],
        prediction: null,
      })
    );

    const lastDate = new Date(
      predictionData.historical_data.dates[
        predictionData.historical_data.dates.length - 1
      ]
    );

    predictionData.predictions.forEach((pred, idx) => {
      const predDate = new Date(lastDate);
      predDate.setDate(predDate.getDate() + pred.day);
      historical.push({
        date: predDate.toISOString().split("T")[0],
        actual: null,
        prediction: pred.price,
      });
    });

    return historical;
  };

  const prepareIndicatorRadar = () => {
    if (!predictionData) return [];

    const indicators = predictionData.indicators;
    return [
      {
        indicator: "RSI",
        value: indicators.rsi,
        fullMark: 100,
      },
      {
        indicator: "Momentum",
        value: Math.abs(indicators.momentum),
        fullMark: 20,
      },
      {
        indicator: "Volatility",
        value: indicators.volatility,
        fullMark: 10,
      },
      {
        indicator: "Volume Trend",
        value: Math.abs(indicators.volume_trend),
        fullMark: 50,
      },
      {
        indicator: "Trend Score",
        value: (indicators.trend_score + 5) * 10,
        fullMark: 100,
      },
    ];
  };

  const prepareVolumeData = () => {
    if (!predictionData) return [];
    return predictionData.historical_data.dates.slice(-10).map((date, idx) => ({
      date: date.split("-").slice(1).join("/"),
      volume: (
        predictionData.historical_data.volumes[
          predictionData.historical_data.volumes.length - 10 + idx
        ] / 1000000
      ).toFixed(2),
    }));
  };

  return (
    <div className="predictions-tab">
      <div className="predictions-header">
        <h2>
          <LineChartIcon size={28} />
          Stock Price Predictions
        </h2>
        <p>
          Pure data-driven predictions using technical indicators and
          statistical analysis
        </p>
      </div>

      {/* Search Bar */}
      <div className="predictions-search-section">
        <div className="search-controls">
          <input
            type="text"
            className="symbol-input"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Enter stock symbol (e.g., AAPL)"
            onKeyPress={(e) => e.key === "Enter" && fetchPrediction()}
          />
          <select
            className="days-select"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value="3">3 Days</option>
            <option value="5">5 Days</option>
            <option value="7">7 Days</option>
            <option value="10">10 Days</option>
          </select>
          <button
            className="predict-button"
            onClick={fetchPrediction}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Predict"}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={24} />
          <span>{error}</span>
        </div>
      )}

      {predictionData && (
        <>
          {/* Signal Card */}
          <div className="signal-card">
            <div className="signal-header">
              <div className="stock-price-section">
                <h2>{predictionData.symbol}</h2>
                <p className="current-stock-price">
                  ${predictionData.current_price}
                </p>
              </div>

              <div
                className="signal-badge-container"
                style={{
                  backgroundColor: getSignalColor(predictionData.signal) + "22",
                  borderColor: getSignalColor(predictionData.signal),
                }}
              >
                <div style={{ color: getSignalColor(predictionData.signal) }}>
                  {getSignalIcon(predictionData.signal)}
                </div>
                <div className="signal-details">
                  <h4>Signal</h4>
                  <p
                    className="signal-text"
                    style={{ color: getSignalColor(predictionData.signal) }}
                  >
                    {predictionData.signal}
                  </p>
                  <p className="signal-confidence">
                    Confidence: {predictionData.confidence}%
                  </p>
                </div>
              </div>

              <div className="prediction-summary">
                <h4>{days}-Day Prediction</h4>
                <p
                  className="predicted-price"
                  style={{
                    color:
                      predictionData.predictions[
                        predictionData.predictions.length - 1
                      ].change_pct > 0
                        ? "#10b981"
                        : "#ef4444",
                  }}
                >
                  $
                  {
                    predictionData.predictions[
                      predictionData.predictions.length - 1
                    ].price
                  }
                </p>
                <p
                  className="price-change-text"
                  style={{
                    color:
                      predictionData.predictions[
                        predictionData.predictions.length - 1
                      ].change_pct > 0
                        ? "#10b981"
                        : "#ef4444",
                  }}
                >
                  {predictionData.predictions[
                    predictionData.predictions.length - 1
                  ].change_pct > 0
                    ? "+"
                    : ""}
                  {
                    predictionData.predictions[
                      predictionData.predictions.length - 1
                    ].change_pct
                  }
                  %
                </p>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="charts-grid">
            {/* Price Prediction Chart */}
            <div className="chart-card">
              <h3>
                <BarChart3 size={20} />
                Price Forecast
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={prepareHistoricalWithPrediction()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      value.split("-").slice(1).join("/")
                    }
                  />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#2c3e50" }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#3498db"
                    fill="#3498db"
                    fillOpacity={0.3}
                    name="Historical Price"
                  />
                  <Area
                    type="monotone"
                    dataKey="prediction"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                    strokeDasharray="5 5"
                    name="Predicted Price"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Volume Chart */}
            <div className="chart-card">
              <h3>
                <Activity size={20} />
                Trading Volume (Millions)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prepareVolumeData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#2c3e50" }}
                  />
                  <Bar dataKey="volume" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Indicators Section */}
          <div className="indicators-section">
            {/* Technical Indicators */}
            <div className="indicators-card">
              <h3>Technical Indicators</h3>
              <div className="indicators-list">
                {Object.entries(predictionData.indicators).map(
                  ([key, value]) =>
                    value !== null && (
                      <div key={key} className="indicator-item">
                        <span className="indicator-label">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="indicator-value">
                          {typeof value === "number" ? value.toFixed(2) : value}
                        </span>
                      </div>
                    )
                )}
              </div>
            </div>

            {/* Indicator Strength Radar */}
            <div className="indicators-card">
              <h3>Indicator Strength</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={prepareIndicatorRadar()}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="indicator"
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                  />
                  <PolarRadiusAxis stroke="#94a3b8" />
                  <Radar
                    name="Value"
                    dataKey="value"
                    stroke="#3498db"
                    fill="#3498db"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Market Analysis */}
          <div className="market-analysis-section">
            <h3>Market Analysis</h3>
            <div className="analysis-list">
              {predictionData.analysis.map((insight, idx) => (
                <div key={idx} className="analysis-item">
                  {insight}
                </div>
              ))}
            </div>
          </div>

          {/* Predictions Table */}
          <div className="predictions-table-section">
            <h3>
              <Calendar size={20} />
              Day-by-Day Predictions
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table className="predictions-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Predicted Price</th>
                    <th>Change from Current</th>
                    <th>% Change</th>
                  </tr>
                </thead>
                <tbody>
                  {predictionData.predictions.map((pred) => (
                    <tr key={pred.day}>
                      <td className="day-label">Day {pred.day}</td>
                      <td className="price-cell">${pred.price}</td>
                      <td
                        className={`change-cell ${
                          pred.change_pct > 0 ? "positive" : "negative"
                        }`}
                      >
                        $
                        {(pred.price - predictionData.current_price).toFixed(2)}
                      </td>
                      <td>
                        <span
                          className={`percent-badge ${
                            pred.change_pct > 0 ? "positive" : "negative"
                          }`}
                        >
                          {pred.change_pct > 0 ? "+" : ""}
                          {pred.change_pct}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="disclaimer">
            <AlertCircle size={20} />
            <div>
              <p>
                <strong>Investment Disclaimer:</strong> These predictions are
                based on historical data and technical indicators. They do not
                constitute financial advice. Stock markets are inherently
                unpredictable, and past performance does not guarantee future
                results. Always conduct your own research and consult with
                financial advisors before making investment decisions.
              </p>
            </div>
          </div>
        </>
      )}

      {!predictionData && !loading && !error && (
        <div className="predictions-empty-state">
          <BarChart3 size={64} />
          <h3>Enter a stock symbol to get predictions</h3>
          <p>
            Our algorithm analyzes historical data, technical indicators, and
            market trends
          </p>
        </div>
      )}
    </div>
  );
};

export default PredictionsTab;
