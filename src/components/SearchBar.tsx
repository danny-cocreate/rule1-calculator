import React, { useState, useRef, useEffect } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (symbol: string) => void;
  isLoading: boolean;
  signal?: 'BUY' | 'WAIT' | 'SELL' | null;
}

// Popular stock symbols for autocomplete
const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'WMT', name: 'Walmart Inc.' },
  { symbol: 'DIS', name: 'The Walt Disney Company' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'BA', name: 'The Boeing Company' },
  { symbol: 'KO', name: 'The Coca-Cola Company' },
];

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, signal }) => {
  const [symbol, setSymbol] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredStocks, setFilteredStocks] = useState(POPULAR_STOCKS);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setSymbol(value);
    if (value.trim()) {
      const filtered = POPULAR_STOCKS.filter(
        stock =>
          stock.symbol.toLowerCase().includes(value.toLowerCase()) ||
          stock.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredStocks(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredStocks(POPULAR_STOCKS);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (stockSymbol: string) => {
    setSymbol(stockSymbol);
    setShowSuggestions(false);
    onSearch(stockSymbol);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      setShowSuggestions(false);
      onSearch(symbol.trim().toUpperCase());
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className={`search-container ${signal ? `signal-${signal.toLowerCase()}` : ''}`} ref={wrapperRef}>
        <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <input
          type="text"
          value={symbol}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search by stock symbol or company name"
          className="search-input"
          disabled={isLoading}
          autoComplete="off"
        />
        {showSuggestions && filteredStocks.length > 0 && (
          <div className="suggestions-dropdown">
            {filteredStocks.map((stock) => (
              <div
                key={stock.symbol}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(stock.symbol)}
              >
                <span className="suggestion-symbol">{stock.symbol}</span>
                <span className="suggestion-name">{stock.name}</span>
              </div>
            ))}
          </div>
        )}
        <button 
          type="submit" 
          className="analyze-button"
          disabled={isLoading || !symbol.trim()}
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
    </form>
  );
};

