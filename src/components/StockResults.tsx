import React, { useState } from 'react';
import { StockData, CalculatedMetrics } from '../types';
import { PriceVisualization } from './PriceVisualization';
import { GrowthMetrics } from './GrowthMetrics';
import { FinancialHealth } from './FinancialHealth';
import { calculateMetrics, calculateDefaultGrowthRate } from '../utils/calculations';
import './StockResults.css';

interface StockResultsProps {
  stockData: StockData;
  onSignalChange?: (signal: 'BUY' | 'WAIT' | 'SELL') => void;
  fisherScore?: number | null;
}

export const StockResults: React.FC<StockResultsProps> = ({ stockData, onSignalChange, fisherScore }) => {
  const defaultGrowthRate = calculateDefaultGrowthRate(stockData);
  const [customGrowthRate, setCustomGrowthRate] = useState(defaultGrowthRate);
  const metrics: CalculatedMetrics = calculateMetrics(stockData, customGrowthRate);

  // Notify parent of signal change
  React.useEffect(() => {
    if (onSignalChange) {
      onSignalChange(metrics.signal);
    }
  }, [metrics.signal, onSignalChange]);

  const handleGrowthRateChange = (newRate: number) => {
    setCustomGrowthRate(newRate);
  };

  const handleReset = () => {
    setCustomGrowthRate(defaultGrowthRate);
  };

  return (
    <div className="stock-results">
      <div className="results-header">
        <div className="header-top">
          <div className="company-info">
            <h2 className="company-name">{stockData.companyName}</h2>
            <div className="company-meta">
              <span className="stock-symbol">{stockData.symbol}</span>
              <span className="last-updated">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 4v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                {stockData.lastUpdated}
              </span>
            </div>
          </div>
          <div className="badge-container">
            {fisherScore !== null && fisherScore !== undefined && (
              <div className="fisher-score-badge">
                <div className="fisher-stars-mini">
                  {'★'.repeat(Math.floor(fisherScore))}
                  {fisherScore % 1 >= 0.5 ? '☆' : ''}
                  {'☆'.repeat(5 - Math.floor(fisherScore) - (fisherScore % 1 >= 0.5 ? 1 : 0))}
                </div>
                <div className="fisher-score-text">{fisherScore.toFixed(1)} / 5.0</div>
              </div>
            )}
            <div className={`bookmark-badge signal-${metrics.signal.toLowerCase()}`}>
              {metrics.signal === 'WAIT' ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M10 6v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <span className="checkmark">✓</span>
              )}
              {metrics.signal}
            </div>
          </div>
        </div>

        <PriceVisualization
          currentPrice={stockData.currentPrice}
          stickerPrice={metrics.stickerPrice}
          mosPrice={metrics.mosPrice}
        />
      </div>

      <div className="metrics-grid">
        <GrowthMetrics
          stockData={stockData}
          customGrowthRate={customGrowthRate}
          onGrowthRateChange={handleGrowthRateChange}
          onReset={handleReset}
          signal={metrics.signal}
        />
        <FinancialHealth
          stockData={stockData}
          stickerPrice={metrics.stickerPrice}
          mosPrice={metrics.mosPrice}
          signal={metrics.signal}
        />
      </div>
    </div>
  );
};

