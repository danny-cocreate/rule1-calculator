import React, { useState, useEffect } from 'react';
import { StockData } from '../types';
import { FisherCriterion, FisherScorecard as FisherScorecardType, FISHER_CRITERIA_TEMPLATE } from '../types/fisher';
import { getCachedOrFetchFisherData } from '../services/scuttlebuttService';
import { 
  calculateQuantitativeFisherCriteria, 
  calculateOverallFisherScore,
  getFisherRatingColor,
  getFisherRatingLabel
} from '../utils/fisherCalculations';
import './FisherScorecard.css';

interface FisherScorecardProps {
  stockData: StockData;
  onScoreChange?: (score: number) => void;
}

export const FisherScorecard: React.FC<FisherScorecardProps> = ({ stockData, onScoreChange }) => {
  const [scorecard, setScorecard] = useState<FisherScorecardType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    loadFisherData();
  }, [stockData.symbol]);

  const loadFisherData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Calculate quantitative criteria from StockData.org data
      const quantitativeCriteria = calculateQuantitativeFisherCriteria(stockData);
      
      // Step 2: Get qualitative criteria IDs that need Gemini research
      const qualitativeCriteriaIds = FISHER_CRITERIA_TEMPLATE
        .filter(c => c.dataSource === 'gemini')
        .map(c => c.id);
      
      // Step 3: Research qualitative criteria with Scuttlebutt (Tavily + Ollama)
      console.log('Fetching Scuttlebutt research for', stockData.symbol);
      const geminiResponse = await getCachedOrFetchFisherData({
        symbol: stockData.symbol,
        companyName: stockData.companyName,
        criteriaToResearch: qualitativeCriteriaIds,
      });
      
      // Step 4: Combine all criteria
      const allCriteria: FisherCriterion[] = [];
      
      // Add quantitative criteria
      quantitativeCriteria.forEach(qc => {
        allCriteria.push(qc as FisherCriterion);
      });
      
      // Add qualitative criteria from Gemini
      geminiResponse.ratings.forEach(rating => {
        const template = FISHER_CRITERIA_TEMPLATE.find(t => t.id === rating.criterionId);
        if (template) {
          allCriteria.push({
            id: rating.criterionId,
            title: template.title,
            description: template.description,
            category: template.category,
            rating: rating.rating,
            justification: rating.justification,
            dataSource: 'gemini',
            confidence: rating.confidence,
            sources: rating.sources,
            lastUpdated: new Date(),
          });
        }
      });
      
      // Sort by ID
      allCriteria.sort((a, b) => a.id - b.id);
      
      // Step 5: Calculate overall score
      const overallScore = calculateOverallFisherScore(allCriteria);
      
      const fisherScorecard: FisherScorecardType = {
        symbol: stockData.symbol,
        companyName: stockData.companyName,
        overallScore,
        criteria: allCriteria,
        createdAt: new Date(),
        lastUpdated: new Date(),
      };
      
      setScorecard(fisherScorecard);
      setLoading(false);
      
      // Report score to parent
      if (onScoreChange) {
        onScoreChange(overallScore);
      }
      
    } catch (err) {
      console.error('Error loading Fisher data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load Fisher analysis');
      setLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderStars = (rating: number | null) => {
    if (rating === null) {
      return <span className="stars-empty">☆☆☆☆☆</span>;
    }
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <span className="stars">
        {'★'.repeat(fullStars)}
        {hasHalfStar ? '☆' : ''}
        {'☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0))}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="fisher-scorecard card">
        <h2>📋 Philip Fisher Quality Assessment</h2>
        <div className="fisher-loading">
          <div className="spinner"></div>
          <p>Researching {stockData.companyName} using AI...</p>
          <p className="loading-subtext">Analyzing 15 investment criteria</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fisher-scorecard card">
        <h2>📋 Philip Fisher Quality Assessment</h2>
        <div className="fisher-error">
          <p>⚠️ {error}</p>
          <button onClick={loadFisherData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!scorecard) return null;

  const overallColor = getFisherRatingColor(scorecard.overallScore);
  const overallLabel = getFisherRatingLabel(scorecard.overallScore);

  return (
    <div className="fisher-scorecard card">
      <div className="fisher-header">
        <h2>📋 Philip Fisher Quality Assessment</h2>
        <p className="fisher-subtitle">
          15-Point "Scuttlebutt" Analysis • AI-Powered Research
        </p>
      </div>

      <div className="fisher-overall-score">
        <div className="score-left">
          <div className="score-value" style={{ color: overallColor }}>
            {scorecard.overallScore.toFixed(1)}
          </div>
          <div className="score-label">{overallLabel}</div>
        </div>
        <div className="score-right">
          <div className="score-stars">
            {renderStars(scorecard.overallScore)}
          </div>
          <div className="score-fraction">
            {scorecard.overallScore.toFixed(1)} / 5.0
          </div>
        </div>
      </div>

      <div className="fisher-criteria-list">
        {scorecard.criteria.map((criterion) => {
          const isExpanded = expandedId === criterion.id;
          const ratingColor = getFisherRatingColor(criterion.rating);
          
          return (
            <div key={criterion.id} className="fisher-criterion">
              <div 
                className="criterion-header"
                onClick={() => toggleExpand(criterion.id)}
              >
                <div className="criterion-left">
                  <span className="criterion-number">{criterion.id}</span>
                  <div className="criterion-title-section">
                    <h4>{criterion.title}</h4>
                    <div className="criterion-meta">
                      {criterion.dataSource === 'gemini' && (
                        <span className="ai-badge">🤖 AI</span>
                      )}
                      {criterion.dataSource === 'stockdata' && (
                        <span className="auto-badge">📊 AUTO</span>
                      )}
                      {criterion.confidence && (
                        <span className={`confidence-badge confidence-${criterion.confidence}`}>
                          {criterion.confidence}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="criterion-right">
                  <div className="criterion-rating" style={{ color: ratingColor }}>
                    {criterion.rating !== null ? criterion.rating.toFixed(1) : 'N/A'}
                  </div>
                  <div className="criterion-stars">
                    {renderStars(criterion.rating)}
                  </div>
                  <button className="expand-button">
                    {isExpanded ? '▼' : '▶'}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="criterion-details">
                  <div className="criterion-description">
                    <strong>Question:</strong> {criterion.description}
                  </div>
                  
                  <div className="criterion-justification">
                    <strong>Analysis:</strong>
                    <p>{criterion.justification}</p>
                  </div>

                  {criterion.sources.length > 0 && (
                    <div className="criterion-sources">
                      <strong>Sources:</strong>
                      <ul>
                        {criterion.sources.map((source, idx) => (
                          <li key={idx}>{source}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="fisher-footer">
        <p>
          <strong>About Fisher's Method:</strong> Philip Fisher's 15-point checklist evaluates 
          companies based on qualitative factors like management quality, R&D effectiveness, 
          and competitive advantages—going beyond pure financial metrics.
        </p>
        <p className="last-updated">
          Last updated: {scorecard.lastUpdated.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

