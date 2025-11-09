import { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { StockResults } from './components/StockResults';
import { FisherScorecard } from './components/FisherScorecard';
import { fetchStockData } from './services/alphaVantageService';
import { StockData } from './types';
import './App.css';

function App() {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signal, setSignal] = useState<'BUY' | 'WAIT' | 'SELL' | null>(null);
  const [fisherScore, setFisherScore] = useState<number | null>(null);

  const handleSearch = async (symbol: string) => {
    setIsLoading(true);
    setError(null);
    setStockData(null);
    setSignal(null);
    setFisherScore(null);

    try {
      const data = await fetchStockData(symbol);
      setStockData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`app ${signal ? `signal-${signal.toLowerCase()}` : ''}`}>
      {stockData && (
        <nav className="navbar">
          <div className="nav-content">
            <svg className="logo-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ transform: 'scaleX(-1)' }}>
              <path d="M4 4l12 0c1.5 0 2 0.5 3 1.5l9 9c1 1 1 2.5 0 3.5l-10 10c-1 1-2.5 1-3.5 0l-9-9c-1-1-1.5-1.5-1.5-3L4 4z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="10" cy="10" r="1.5" fill="white"/>
            </svg>
            <h1 className="logo-text">MOS Calculator</h1>
          </div>
        </nav>
      )}

      <main className="main-content">
        {!stockData && (
          <h1 className="page-title">
            <svg className="page-title-icon" width="48" height="48" viewBox="0 0 32 32" fill="none" style={{ transform: 'scaleX(-1)' }}>
              <path d="M4 4l12 0c1.5 0 2 0.5 3 1.5l9 9c1 1 1 2.5 0 3.5l-10 10c-1 1-2.5 1-3.5 0l-9-9c-1-1-1.5-1.5-1.5-3L4 4z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="10" cy="10" r="1.5" fill="white"/>
            </svg>
            MOS Calculator
          </h1>
        )}
        
        <SearchBar onSearch={handleSearch} isLoading={isLoading} signal={signal} />

        {isLoading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Fetching stock data...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <svg width="64" height="64" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2"/>
              <path d="M24 14v12m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h3 style={{ margin: '0 0 8px 0', color: '#f97316', fontSize: '20px' }}>
              {error.includes('rate limit') ? '⏰ API Rate Limit Reached' : '⚠️ Error'}
            </h3>
            <p>{error}</p>
            {error.includes('rate limit') && (
              <div style={{ marginTop: '16px', padding: '16px', background: '#fff7ed', borderRadius: '8px', width: '100%' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#9a3412' }}>
                  💡 <strong>Tip:</strong> Alpha Vantage free tier allows 5 requests per minute and 25 per day. 
                  Each stock search uses 2 requests. Try again in a few minutes or tomorrow!
                </p>
              </div>
            )}
            <button 
              onClick={() => setError(null)}
              className="error-retry-button"
            >
              Try Another Stock
            </button>
          </div>
        )}

        {stockData && !isLoading && (
          <>
            <StockResults stockData={stockData} onSignalChange={setSignal} fisherScore={fisherScore} />
            <FisherScorecard stockData={stockData} onScoreChange={setFisherScore} />
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Company logos provided by{' '}
          <a href="https://clearbit.com" target="_blank" rel="noopener noreferrer">
            Clearbit
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;

