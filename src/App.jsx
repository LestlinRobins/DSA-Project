import React, { useState } from "react";
import { Search, Activity, TrendingUp, Brain } from "lucide-react";
// Import the 4 main components
import SearchTab from "./components/SearchTab";
import VolatilityTab from "./components/VolatilityTab";
import TopGainersLosersTab from "./components/TopGainersLosersTab";
import PredictionsTab from "./components/PredictionsTab";
import "./AppNew.css";

function App() {
  // Main state for tab navigation
  const [activeTab, setActiveTab] = useState("search");

  // Global state that can be shared between components
  const [selectedStock, setSelectedStock] = useState(null);
  const [searchedSymbol, setSearchedSymbol] = useState("");
  // Tab configuration with icons
  const tabs = [
    { id: "search", label: "Search & Charts", icon: Search },
    { id: "volatility", label: "Volatility", icon: Activity },
    { id: "gainers-losers", label: "Top Gainers/Losers", icon: TrendingUp },
    { id: "predictions", label: "Predictions", icon: Brain },
  ];

  // Function to handle stock selection from search tab
  const handleStockSelect = (stock) => {
    setSelectedStock(stock);
    setSearchedSymbol(stock.symbol);
  };

  // Function to render the active tab content
  const renderActiveTab = () => {
    switch (activeTab) {
      case "search":
        return (
          <SearchTab
            selectedStock={selectedStock}
            onStockSelect={handleStockSelect}
          />
        );
      case "volatility":
        return (
          <VolatilityTab
            searchedSymbol={searchedSymbol}
            selectedStock={selectedStock}
          />
        );
      case "gainers-losers":
        return <TopGainersLosersTab />;
      case "predictions":
        return <PredictionsTab selectedStock={selectedStock} />;
      default:
        return (
          <SearchTab
            selectedStock={selectedStock}
            onStockSelect={handleStockSelect}
          />
        );
    }
  };

  return (
    <div className="desktop-app">
      {/* Left Sidebar with Tabs */}
      <div className="sidebar">
        <div className="app-logo">
          <h2>📊 Stock Analyzer</h2>
          <p>Dummy App Structure</p>
        </div>

        <nav className="tab-navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <p>Ready for team development!</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <div className="content-header">
          <h1>{tabs.find((tab) => tab.id === activeTab)?.label}</h1>
        </div>

        <div className="content-body">{renderActiveTab()}</div>
      </div>
    </div>
  );
}

export default App;
