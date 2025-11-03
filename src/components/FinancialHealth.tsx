import React from 'react';
import { StockData } from '../types';
import './FinancialHealth.css';

interface FinancialHealthProps {
  stockData: StockData;
  stickerPrice: number;
  mosPrice: number;
  signal?: 'BUY' | 'WAIT' | 'SELL';
}

export const FinancialHealth: React.FC<FinancialHealthProps> = ({
  stockData,
  stickerPrice,
  mosPrice,
  signal,
}) => {
  return (
    <div className={`financial-health card ${signal ? `signal-${signal.toLowerCase()}` : ''}`}>
      <h3>Financial Health & Valuation</h3>
      
      <div className="metrics-list">
        <div className="metric-item">
          <span className="metric-label">ROE</span>
          <span className="metric-value">
            {stockData.roe !== null ? `${stockData.roe.toFixed(1)}%` : 'N/A'}
          </span>
        </div>
        
        <div className="metric-item">
          <span className="metric-label">Debt/Equity</span>
          <span className="metric-value">
            {stockData.debtToEquity !== null 
              ? stockData.debtToEquity.toFixed(2) 
              : 'N/A'}
          </span>
        </div>
        
        <div className="metric-item">
          <span className="metric-label">Current Ratio</span>
          <span className="metric-value">
            {stockData.currentRatio !== null 
              ? stockData.currentRatio.toFixed(2) 
              : 'N/A'}
          </span>
        </div>
        
        <div className="metric-item">
          <span className="metric-label">PE Ratio</span>
          <span className="metric-value">
            {stockData.peRatio !== null 
              ? stockData.peRatio.toFixed(1) 
              : 'N/A'}
          </span>
        </div>
        
        <div className="metric-item highlight">
          <span className="metric-label">Sticker Price</span>
          <span className="metric-value">${stickerPrice.toFixed(2)}</span>
        </div>
        
        <div className="metric-item highlight">
          <span className="metric-label">MOS Price</span>
          <span className="metric-value">${mosPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

