<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Activity, BarChart3, AlertCircle } from 'lucide-react';
=======
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
>>>>>>> ebe9496c8a56f7bb7762b5cdf26cff4ede81a15b

const PredictionsTab = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(5);

<<<<<<< HEAD
  const fetchPrediction = async () => {
=======
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
>>>>>>> ebe9496c8a56f7bb7762b5cdf26cff4ede81a15b
    setLoading(true);
    setError(null);
    try {
<<<<<<< HEAD
      const response = await fetch(`http://localhost:8000/api/predict?symbol=${symbol}&days=${days}`);
      if (!response.ok) throw new Error('Failed to fetch prediction');
      const data = await response.json();
      setPredictionData(data);
=======
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
>>>>>>> ebe9496c8a56f7bb7762b5cdf26cff4ede81a15b
    } catch (err) {
      setError(err.message);
      setPredictionData(null);
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  useEffect(() => {
    if (symbol) {
      fetchPrediction();
    }
  }, []);

  const getSignalColor = (signal) => {
    const colors = {
      'STRONG BUY': '#10b981',
      'BUY': '#34d399',
      'HOLD': '#f59e0b',
      'SELL': '#f87171',
      'STRONG SELL': '#ef4444'
    };
    return colors[signal] || '#6b7280';
  };

  const getSignalIcon = (signal) => {
    if (signal.includes('BUY')) return <TrendingUp size={24} />;
    if (signal.includes('SELL')) return <TrendingDown size={24} />;
    return <Activity size={24} />;
  };

  const prepareHistoricalWithPrediction = () => {
    if (!predictionData) return [];
    
    const historical = predictionData.historical_data.dates.map((date, idx) => ({
      date,
      actual: predictionData.historical_data.prices[idx],
      prediction: null
    }));

    const lastDate = new Date(predictionData.historical_data.dates[predictionData.historical_data.dates.length - 1]);
    
    predictionData.predictions.forEach((pred, idx) => {
      const predDate = new Date(lastDate);
      predDate.setDate(predDate.getDate() + pred.day);
      historical.push({
        date: predDate.toISOString().split('T')[0],
        actual: null,
        prediction: pred.price
      });
    });

    return historical;
  };

  const prepareIndicatorRadar = () => {
    if (!predictionData) return [];
    
    const indicators = predictionData.indicators;
    return [
      {
        indicator: 'RSI',
        value: indicators.rsi,
        fullMark: 100
      },
      {
        indicator: 'Momentum',
        value: Math.abs(indicators.momentum),
        fullMark: 20
      },
      {
        indicator: 'Volatility',
        value: indicators.volatility,
        fullMark: 10
      },
      {
        indicator: 'Volume Trend',
        value: Math.abs(indicators.volume_trend),
        fullMark: 50
      },
      {
        indicator: 'Trend Score',
        value: (indicators.trend_score + 5) * 10,
        fullMark: 100
      }
    ];
  };

  const prepareVolumeData = () => {
    if (!predictionData) return [];
    
    return predictionData.historical_data.dates.slice(-30).map((date, idx) => ({
      date: date.split('-').slice(1).join('/'),
      volume: predictionData.historical_data.volumes[predictionData.historical_data.volumes.length - 30 + idx] / 1000000
    }));
  };

  return (
    <div style={{ padding: '30px', backgroundColor: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px', color: '#f1f5f9' }}>
          Stock Price Predictions
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '30px', fontSize: '16px' }}>
          Pure data-driven predictions using technical indicators and statistical analysis
=======
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
>>>>>>> ebe9496c8a56f7bb7762b5cdf26cff4ede81a15b
        </p>

        {/* Search Bar */}
        <div style={{ 
          backgroundColor: '#1e293b', 
          padding: '25px', 
          borderRadius: '12px', 
          marginBottom: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Enter stock symbol (e.g., AAPL)"
              style={{
                flex: '1',
                minWidth: '200px',
                padding: '12px 16px',
                fontSize: '16px',
                border: '2px solid #334155',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                color: '#e2e8f0',
                outline: 'none'
              }}
              onKeyPress={(e) => e.key === 'Enter' && fetchPrediction()}
            />
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              style={{
                padding: '12px 16px',
                fontSize: '16px',
                border: '2px solid #334155',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                color: '#e2e8f0',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="3">3 Days</option>
              <option value="5">5 Days</option>
              <option value="7">7 Days</option>
              <option value="10">10 Days</option>
            </select>
            <button
              onClick={fetchPrediction}
              disabled={loading}
              style={{
                padding: '12px 28px',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Analyzing...' : 'Predict'}
            </button>
          </div>
        </div>
<<<<<<< HEAD
=======
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
>>>>>>> ebe9496c8a56f7bb7762b5cdf26cff4ede81a15b

        {error && (
          <div style={{
            backgroundColor: '#7f1d1d',
            border: '2px solid #991b1b',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle size={24} color="#fca5a5" />
            <span style={{ fontSize: '16px', color: '#fca5a5' }}>{error}</span>
          </div>
        )}

        {predictionData && (
          <>
            {/* Signal Card */}
            <div style={{
              backgroundColor: '#1e293b',
              padding: '30px',
              borderRadius: '12px',
              marginBottom: '30px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                    {predictionData.symbol}
                  </h2>
                  <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#60a5fa' }}>
                    ${predictionData.current_price}
                  </p>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '20px 30px',
                  backgroundColor: getSignalColor(predictionData.signal) + '22',
                  borderRadius: '12px',
                  border: `2px solid ${getSignalColor(predictionData.signal)}`
                }}>
                  <div style={{ color: getSignalColor(predictionData.signal) }}>
                    {getSignalIcon(predictionData.signal)}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '2px' }}>Signal</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: getSignalColor(predictionData.signal) }}>
                      {predictionData.signal}
                    </p>
                    <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
                      Confidence: {predictionData.confidence}%
                    </p>
                  </div>
                </div>

                <div style={{
                  padding: '20px 30px',
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: '2px solid #334155'
                }}>
                  <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '5px' }}>
                    {days}-Day Prediction
                  </p>
                  <p style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: predictionData.predictions[predictionData.predictions.length - 1].change_pct > 0 ? '#10b981' : '#ef4444'
                  }}>
                    ${predictionData.predictions[predictionData.predictions.length - 1].price}
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: predictionData.predictions[predictionData.predictions.length - 1].change_pct > 0 ? '#10b981' : '#ef4444'
                  }}>
                    {predictionData.predictions[predictionData.predictions.length - 1].change_pct > 0 ? '+' : ''}
                    {predictionData.predictions[predictionData.predictions.length - 1].change_pct}%
                  </p>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', gap: '30px', marginBottom: '30px' }}>
              {/* Price Prediction Chart */}
              <div style={{
                backgroundColor: '#1e293b',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BarChart3 size={20} color="#60a5fa" />
                  Price Forecast
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={prepareHistoricalWithPrediction()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#94a3b8"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.split('-').slice(1).join('/')}
                    />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#60a5fa" 
                      fill="#60a5fa" 
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
              <div style={{
                backgroundColor: '#1e293b',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Activity size={20} color="#60a5fa" />
                  Trading Volume (Millions)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareVolumeData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#e2e8f0' }}
                    />
                    <Bar dataKey="volume" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Indicators and Analysis */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px', marginBottom: '30px' }}>
              {/* Technical Indicators */}
              <div style={{
                backgroundColor: '#1e293b',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
                  Technical Indicators
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {Object.entries(predictionData.indicators).map(([key, value]) => (
                    value !== null && (
                      <div key={key} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        border: '1px solid #334155'
                      }}>
                        <span style={{ color: '#cbd5e1', fontSize: '14px', textTransform: 'uppercase' }}>
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#60a5fa' }}>
                          {typeof value === 'number' ? value.toFixed(2) : value}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              </div>

<<<<<<< HEAD
              {/* Radar Chart */}
              <div style={{
                backgroundColor: '#1e293b',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
                  Indicator Strength
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={prepareIndicatorRadar()}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="indicator" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis stroke="#94a3b8" />
                    <Radar name="Value" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Analysis Section */}
            <div style={{
              backgroundColor: '#1e293b',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
                Market Analysis
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {predictionData.analysis.map((insight, idx) => (
                  <div key={idx} style={{
                    padding: '16px 20px',
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    borderLeft: '4px solid #3b82f6',
                    fontSize: '15px',
                    color: '#cbd5e1',
                    lineHeight: '1.6'
                  }}>
                    {insight}
                  </div>
                ))}
              </div>
            </div>

            {/* Prediction Table */}
            <div style={{
              backgroundColor: '#1e293b',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
              marginTop: '30px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
                Day-by-Day Predictions
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #334155' }}>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>
                        Day
                      </th>
                      <th style={{ padding: '15px', textAlign: 'right', color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>
                        Predicted Price
                      </th>
                      <th style={{ padding: '15px', textAlign: 'right', color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>
                        Change from Current
                      </th>
                      <th style={{ padding: '15px', textAlign: 'right', color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>
                        % Change
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictionData.predictions.map((pred) => (
                      <tr key={pred.day} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '15px', color: '#e2e8f0', fontSize: '15px' }}>
                          Day {pred.day}
                        </td>
                        <td style={{ padding: '15px', textAlign: 'right', color: '#60a5fa', fontSize: '16px', fontWeight: '600' }}>
                          ${pred.price}
                        </td>
                        <td style={{ 
                          padding: '15px', 
                          textAlign: 'right', 
                          color: pred.change_pct > 0 ? '#10b981' : '#ef4444',
                          fontSize: '15px',
                          fontWeight: '500'
                        }}>
                          ${(pred.price - predictionData.current_price).toFixed(2)}
                        </td>
                        <td style={{ 
                          padding: '15px', 
                          textAlign: 'right',
                          fontSize: '15px',
                          fontWeight: '600'
                        }}>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: pred.change_pct > 0 ? '#10b98122' : '#ef444422',
                            color: pred.change_pct > 0 ? '#10b981' : '#ef4444'
                          }}>
                            {pred.change_pct > 0 ? '+' : ''}{pred.change_pct}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
=======
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
>>>>>>> ebe9496c8a56f7bb7762b5cdf26cff4ede81a15b
              </div>
            </div>

            {/* Disclaimer */}
            <div style={{
              backgroundColor: '#422006',
              border: '2px solid #78350f',
              padding: '20px',
              borderRadius: '12px',
              marginTop: '30px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <AlertCircle size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#fbbf24', marginBottom: '8px' }}>
                  Investment Disclaimer
                </p>
                <p style={{ fontSize: '13px', color: '#fde68a', lineHeight: '1.6' }}>
                  These predictions are based on historical data and technical indicators. They do not constitute financial advice. 
                  Stock markets are inherently unpredictable, and past performance does not guarantee future results. 
                  Always conduct your own research and consult with financial advisors before making investment decisions.
                </p>
              </div>
            </div>
          </>
        )}

        {!predictionData && !loading && !error && (
          <div style={{
            backgroundColor: '#1e293b',
            padding: '60px 30px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
          }}>
            <BarChart3 size={64} color="#475569" style={{ margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '20px', color: '#94a3b8', marginBottom: '10px' }}>
              Enter a stock symbol to get predictions
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Our algorithm analyzes historical data, technical indicators, and market trends
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionsTab;