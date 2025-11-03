import React from 'react';
import { StockData } from '../types';
import './GrowthMetrics.css';

interface GrowthMetricsProps {
  stockData: StockData;
  customGrowthRate: number;
  onGrowthRateChange: (rate: number) => void;
  onReset: () => void;
  signal?: 'BUY' | 'WAIT' | 'SELL';
}

export const GrowthMetrics: React.FC<GrowthMetricsProps> = ({
  stockData,
  customGrowthRate,
  onGrowthRateChange,
  onReset,
  signal,
}) => {
  return (
    <div className={`growth-metrics card ${signal ? `signal-${signal.toLowerCase()}` : ''}`}>
      <h3>Growth Metrics</h3>
      
      <div className="custom-growth-rate">
        <div className="growth-rate-header">
          <label>Custom Growth Rate (%)</label>
          <button onClick={onReset} className="reset-button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 3.5c-1.5-1.5-3.5-2-5.5-2s-4 .5-5.5 2-2 3.5-2 5.5.5 4 2 5.5 3.5 2 5.5 2c1.5 0 3-.5 4-1.5m1.5-1.5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Reset
          </button>
        </div>
        <div className="slider-container">
          <input
            type="number"
            value={customGrowthRate.toFixed(1)}
            onChange={(e) => onGrowthRateChange(parseFloat(e.target.value) || 0)}
            className="growth-rate-input"
            step="0.1"
            min="0"
            max="50"
          />
          <input
            type="range"
            value={customGrowthRate}
            onChange={(e) => onGrowthRateChange(parseFloat(e.target.value))}
            className="growth-rate-slider"
            min="0"
            max="50"
            step="0.1"
          />
        </div>
      </div>

      <div className="metrics-list">
        <div className="metric-item">
          <span className="metric-label">EPS Growth</span>
          <span className="metric-value">{stockData.epsGrowth.toFixed(1)}%</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Sales Growth</span>
          <span className="metric-value">{stockData.salesGrowth.toFixed(1)}%</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Book Value Growth</span>
          <span className="metric-value">
            {stockData.bookValueGrowth !== null 
              ? `${stockData.bookValueGrowth.toFixed(1)}%` 
              : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

