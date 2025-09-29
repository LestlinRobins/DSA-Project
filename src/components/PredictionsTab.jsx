import React, { useState, useEffect } from "react";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Target,
} from "lucide-react";

const PredictionsTab = ({ selectedStock }) => {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predictionModel, setPredictionModel] = useState("technical"); // "technical" or "fundamental"

  // Mock prediction generator
  const generatePredictions = (stock) => {
    const currentPrice = 150 + Math.random() * 100; // Mock current price
    const volatility = Math.random() * 30 + 10; // 10-40% volatility

    return {
      symbol: stock?.symbol || "DEMO",
      currentPrice: currentPrice.toFixed(2),
      predictions: {
        technical: {
          shortTerm: {
            period: "1 Week",
            predictedPrice: (
              currentPrice *
              (1 + (Math.random() - 0.5) * 0.1)
            ).toFixed(2),
            confidence: (Math.random() * 30 + 60).toFixed(0), // 60-90%
            direction: Math.random() > 0.5 ? "up" : "down",
          },
          mediumTerm: {
            period: "1 Month",
            predictedPrice: (
              currentPrice *
              (1 + (Math.random() - 0.5) * 0.2)
            ).toFixed(2),
            confidence: (Math.random() * 25 + 55).toFixed(0), // 55-80%
            direction: Math.random() > 0.5 ? "up" : "down",
          },
          longTerm: {
            period: "3 Months",
            predictedPrice: (
              currentPrice *
              (1 + (Math.random() - 0.5) * 0.3)
            ).toFixed(2),
            confidence: (Math.random() * 20 + 40).toFixed(0), // 40-60%
            direction: Math.random() > 0.5 ? "up" : "down",
          },
        },
        fundamental: {
          targetPrice: (
            currentPrice *
            (1 + (Math.random() - 0.5) * 0.25)
          ).toFixed(2),
          recommendation: ["Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"][
            Math.floor(Math.random() * 5)
          ],
          riskLevel: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
          factors: [
            "Strong earnings growth",
            "Market expansion opportunities",
            "Competitive positioning",
            "Financial health indicators",
          ],
        },
      },
      indicators: {
        rsi: (Math.random() * 100).toFixed(0),
        macd: Math.random() > 0.5 ? "Bullish" : "Bearish",
        movingAverage: Math.random() > 0.5 ? "Above" : "Below",
        support: (currentPrice * 0.95).toFixed(2),
        resistance: (currentPrice * 1.05).toFixed(2),
      },
    };
  };

  // Load predictions when stock changes
  useEffect(() => {
    if (selectedStock) {
      loadPredictions(selectedStock);
    }
  }, [selectedStock, predictionModel]);

  const loadPredictions = async (stock) => {
    setLoading(true);
    try {
      // Simulate AI model processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const data = generatePredictions(stock);
      setPredictions(data);
    } catch (error) {
      console.error("Error generating predictions:", error);
    } finally {
      setLoading(false);
    }
  };

  const PredictionCard = ({ prediction, period }) => (
    <div className={`prediction-card ${prediction.direction}`}>
      <div className="prediction-header">
        <h4>{period}</h4>
        <div className={`direction-indicator ${prediction.direction}`}>
          {prediction.direction === "up" ? (
            <TrendingUp size={16} />
          ) : (
            <TrendingDown size={16} />
          )}
        </div>
      </div>

      <div className="prediction-price">
        <span className="predicted-price">${prediction.predictedPrice}</span>
        <span className="price-change">
          {prediction.direction === "up" ? "+" : ""}
          {(
            ((prediction.predictedPrice - predictions.currentPrice) /
              predictions.currentPrice) *
            100
          ).toFixed(1)}
          %
        </span>
      </div>

      <div className="confidence-meter">
        <label>Confidence</label>
        <div className="confidence-bar">
          <div
            className="confidence-fill"
            style={{ width: `${prediction.confidence}%` }}
          />
        </div>
        <span>{prediction.confidence}%</span>
      </div>
    </div>
  );

  return (
    <div className="predictions-tab">
      <div className="tab-header">
        <h2>🧠 AI Stock Predictions</h2>
        <p className="tab-description">
          Machine learning powered stock price predictions and analysis
        </p>
      </div>

      {!selectedStock ? (
        <div className="no-stock-message">
          <Brain size={48} className="icon" />
          <h3>No Stock Selected</h3>
          <p>
            Please select a stock from the "Search & Charts" tab to see AI
            predictions.
          </p>
          <div className="instruction-steps">
            <p>To get predictions:</p>
            <ol>
              <li>Go to "Search & Charts" tab</li>
              <li>Search and select a company</li>
              <li>Return to this tab to see AI-powered predictions</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="predictions-content">
          {/* Model Selector */}
          <div className="model-selector">
            <label>Prediction Model:</label>
            <div className="model-buttons">
              <button
                className={`model-button ${
                  predictionModel === "technical" ? "active" : ""
                }`}
                onClick={() => setPredictionModel("technical")}
              >
                📈 Technical Analysis
              </button>
              <button
                className={`model-button ${
                  predictionModel === "fundamental" ? "active" : ""
                }`}
                onClick={() => setPredictionModel("fundamental")}
              >
                📊 Fundamental Analysis
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>AI is analyzing {selectedStock.symbol}...</p>
              <p>Processing market data and patterns...</p>
            </div>
          ) : predictions ? (
            <div className="predictions-display">
              {/* Current Stock Info */}
              <div className="current-stock-info">
                <h3>{predictions.symbol}</h3>
                <div className="current-price">
                  Current Price: <span>${predictions.currentPrice}</span>
                </div>
              </div>

              {predictionModel === "technical" ? (
                <div className="technical-predictions">
                  <h4>📈 Technical Analysis Predictions</h4>
                  <div className="predictions-grid">
                    <PredictionCard
                      prediction={predictions.predictions.technical.shortTerm}
                      period="Short Term (1 Week)"
                    />
                    <PredictionCard
                      prediction={predictions.predictions.technical.mediumTerm}
                      period="Medium Term (1 Month)"
                    />
                    <PredictionCard
                      prediction={predictions.predictions.technical.longTerm}
                      period="Long Term (3 Months)"
                    />
                  </div>

                  {/* Technical Indicators */}
                  <div className="technical-indicators">
                    <h4>📊 Technical Indicators</h4>
                    <div className="indicators-grid">
                      <div className="indicator-item">
                        <label>RSI</label>
                        <span
                          className={
                            predictions.indicators.rsi > 70
                              ? "overbought"
                              : predictions.indicators.rsi < 30
                              ? "oversold"
                              : "neutral"
                          }
                        >
                          {predictions.indicators.rsi}
                        </span>
                      </div>
                      <div className="indicator-item">
                        <label>MACD</label>
                        <span
                          className={
                            predictions.indicators.macd === "Bullish"
                              ? "bullish"
                              : "bearish"
                          }
                        >
                          {predictions.indicators.macd}
                        </span>
                      </div>
                      <div className="indicator-item">
                        <label>Moving Average</label>
                        <span>{predictions.indicators.movingAverage} MA50</span>
                      </div>
                      <div className="indicator-item">
                        <label>Support Level</label>
                        <span>${predictions.indicators.support}</span>
                      </div>
                      <div className="indicator-item">
                        <label>Resistance Level</label>
                        <span>${predictions.indicators.resistance}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="fundamental-predictions">
                  <h4>📊 Fundamental Analysis</h4>

                  <div className="fundamental-summary">
                    <div className="target-price-card">
                      <Target size={24} />
                      <div className="target-info">
                        <label>Target Price</label>
                        <span className="target-price">
                          ${predictions.predictions.fundamental.targetPrice}
                        </span>
                      </div>
                    </div>

                    <div className="recommendation-card">
                      <div
                        className={`recommendation ${predictions.predictions.fundamental.recommendation
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        <strong>
                          {predictions.predictions.fundamental.recommendation}
                        </strong>
                      </div>
                      <div
                        className={`risk-level ${predictions.predictions.fundamental.riskLevel.toLowerCase()}`}
                      >
                        Risk: {predictions.predictions.fundamental.riskLevel}
                      </div>
                    </div>
                  </div>

                  <div className="key-factors">
                    <h4>🔑 Key Factors</h4>
                    <ul>
                      {predictions.predictions.fundamental.factors.map(
                        (factor, index) => (
                          <li key={index}>{factor}</li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="disclaimer">
                <AlertCircle size={16} />
                <p>
                  <strong>Disclaimer:</strong> These predictions are for
                  educational purposes only. Not financial advice. Always do
                  your own research before making investment decisions.
                </p>
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
            Integrate real machine learning models (TensorFlow, scikit-learn)
          </li>
          <li>Implement LSTM networks for time series prediction</li>
          <li>Add sentiment analysis from news and social media</li>
          <li>
            Include more technical indicators (Bollinger Bands, Stochastic)
          </li>
          <li>Add backtesting functionality for prediction accuracy</li>
          <li>Implement ensemble models combining multiple approaches</li>
        </ul>
      </div>
    </div>
  );
};

export default PredictionsTab;
