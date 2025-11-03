import React from 'react';
import './PriceVisualization.css';

interface PriceVisualizationProps {
  currentPrice: number;
  stickerPrice: number;
  mosPrice: number;
}

export const PriceVisualization: React.FC<PriceVisualizationProps> = ({
  currentPrice,
  stickerPrice,
  mosPrice,
}) => {
  // Calculate the scale: use the maximum value to determine bar widths
  const maxValue = Math.max(currentPrice, stickerPrice);
  
  // Calculate width percentages relative to the max value
  const currentPriceWidth = (currentPrice / maxValue) * 100;
  const stickerBarWidth = (stickerPrice / maxValue) * 100;
  
  // Within the sticker bar, MOS is always 50% of sticker price
  const mosWidth = stickerBarWidth * 0.5;
  const stickerWidth = stickerBarWidth * 0.5;

  return (
    <div className="price-visualization">
      {/* Current Price label - positioned at end of purple bar */}
      <div className="price-labels-container">
        <div 
          className="price-label-positioned" 
          style={{ 
            left: `${Math.min(Math.max(currentPriceWidth, 8), 92)}%`,
          }}
        >
          <span className="label-name">Current Price</span>
          <span className="label-value">${currentPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Bar 1: Current Price - sized proportionally */}
      <div className="price-range current-price-bar">
        <div className="price-bar">
          <div 
            className="price-segment current-price-segment" 
            style={{ width: `${currentPriceWidth}%` }}
          />
        </div>
      </div>

      {/* MOS and Sticker Price labels - positioned at marker and end */}
      <div className="price-labels-container">
        <div 
          className="price-label-positioned" 
          style={{ left: `${Math.min(Math.max(mosWidth, 8), 92)}%` }}
        >
          <span className="label-name">MOS Price</span>
          <span className="label-value">${mosPrice.toFixed(2)}</span>
        </div>
        <div 
          className="price-label-positioned" 
          style={{ left: `${Math.min(Math.max(stickerBarWidth, 8), 92)}%` }}
        >
          <span className="label-name">Sticker Price</span>
          <span className="label-value">${stickerPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Bar 2: MOS and Sticker Price - sized proportionally and adjustable based on growth rate */}
      <div className="price-range valuation-bar">
        <div className="price-bar">
          <div 
            className="price-segment mos-segment" 
            style={{ width: `${mosWidth}%` }}
          />
          <div 
            className="price-segment sticker-segment" 
            style={{ width: `${stickerWidth}%` }}
          />
        </div>
        <div className="price-markers">
          <div className="price-marker" style={{ left: `${mosWidth}%` }}>
            <div className="marker-line"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

