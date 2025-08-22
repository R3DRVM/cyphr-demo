import React from 'react';
import { CheckCircle, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { ChatActionResult } from '../../services/chatActions';

export interface ResultCardProps {
  result: ChatActionResult;
  className?: string;
}

export function ResultCard({ result, className = '' }: ResultCardProps) {
  const isPositive = result.delta > 0;
  const totalSteps = result.signatures.length;
  const hasWarnings = result.notes.some(note => 
    note.includes('skipped') || note.includes('failed') || note.includes('busy')
  );

  return (
    <div className={`result-card ${className}`}>
      <div className="result-card-header">
        <h3>Demo Results</h3>
        <div className={`result-card-status ${result.success ? 'success' : 'failed'}`}>
          {result.success ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <Info className="w-5 h-5 text-red-500" />
          )}
          <span>{result.success ? 'Completed' : 'Failed'}</span>
        </div>
      </div>

      <div className="result-card-balance">
        <div className="balance-item">
          <span className="balance-label">Starting Balance:</span>
          <span className="balance-value">{result.startBalance.toFixed(4)} SOL</span>
        </div>
        
        <div className="balance-item">
          <span className="balance-label">Final Balance:</span>
          <span className="balance-value">{result.endBalance.toFixed(4)} SOL</span>
        </div>
        
        <div className={`balance-item delta ${isPositive ? 'positive' : 'negative'}`}>
          <span className="balance-label">Net Change:</span>
          <span className="balance-value">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 inline mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 inline mr-1" />
            )}
            {result.delta > 0 ? '+' : ''}{result.delta.toFixed(4)} SOL
          </span>
        </div>
      </div>

      <div className="result-card-stats">
        <div className="stat-item">
          <span className="stat-label">Total Steps:</span>
          <span className="stat-value">{totalSteps}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Signatures:</span>
          <span className="stat-value">{result.signatures.length}</span>
        </div>
      </div>

      {result.notes.length > 0 && (
        <div className="result-card-notes">
          <h4>Notes:</h4>
          <ul className="notes-list">
            {result.notes.map((note, index) => (
              <li 
                key={index} 
                className={`note-item ${note.includes('skipped') || note.includes('failed') || note.includes('busy') ? 'warning' : 'info'}`}
              >
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasWarnings && (
        <div className="result-card-warning">
          <Info className="w-4 h-4 text-yellow-500" />
          <span>Some steps were skipped or failed. Check notes above.</span>
        </div>
      )}

      <style>{`
        .result-card {
          background: rgba(17, 24, 39, 0.9);
          border: 1px solid rgba(75, 85, 99, 0.6);
          border-radius: 12px;
          padding: 16px;
          margin: 16px 0;
          backdrop-filter: blur(20px);
        }

        .result-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(75, 85, 99, 0.3);
        }

        .result-card-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #e5e7eb;
        }

        .result-card-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 500;
        }

        .result-card-status.success {
          color: #10b981;
        }

        .result-card-status.failed {
          color: #ef4444;
        }

        .result-card-balance {
          margin-bottom: 16px;
        }

        .balance-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid rgba(75, 85, 99, 0.2);
        }

        .balance-item:last-child {
          border-bottom: none;
          font-weight: 600;
        }

        .balance-label {
          color: #9ca3af;
          font-size: 14px;
        }

        .balance-value {
          color: #e5e7eb;
          font-size: 14px;
          font-family: monospace;
        }

        .balance-item.delta.positive .balance-value {
          color: #10b981;
        }

        .balance-item.delta.negative .balance-value {
          color: #ef4444;
        }

        .result-card-stats {
          display: flex;
          gap: 24px;
          margin-bottom: 16px;
          padding: 12px;
          background: rgba(75, 85, 99, 0.1);
          border-radius: 8px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          color: #9ca3af;
          font-size: 12px;
        }

        .stat-value {
          color: #e5e7eb;
          font-size: 16px;
          font-weight: 600;
          font-family: monospace;
        }

        .result-card-notes {
          margin-bottom: 16px;
        }

        .result-card-notes h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #d1d5db;
        }

        .notes-list {
          margin: 0;
          padding-left: 20px;
        }

        .note-item {
          margin: 4px 0;
          font-size: 13px;
          color: #e5e7eb;
        }

        .note-item.warning {
          color: #fbbf24;
        }

        .note-item.info {
          color: #60a5fa;
        }

        .result-card-warning {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 8px;
          color: #fbbf24;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
