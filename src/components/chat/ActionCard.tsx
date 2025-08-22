import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, ExternalLink, Play } from 'lucide-react';

export interface ActionCardProps {
  title: string;
  status: 'pending' | 'success' | 'failed';
  signature?: string;
  elapsedMs?: number;
  onRun?: () => void;
  interactive?: boolean;
  className?: string;
}

export function ActionCard({ 
  title, 
  status, 
  signature, 
  elapsedMs, 
  onRun, 
  interactive = false,
  className = ''
}: ActionCardProps) {
  const [startTime] = useState(Date.now());
  const [currentElapsed, setCurrentElapsed] = useState(0);

  useEffect(() => {
    if (status === 'pending') {
      const interval = setInterval(() => {
        setCurrentElapsed(Date.now() - startTime);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [status, startTime]);

  const elapsed = elapsedMs || currentElapsed;
  const explorerUrl = signature ? `https://explorer.solana.com/tx/${signature}?cluster=devnet` : null;

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'In Progress';
      case 'success':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'success':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`action-card ${className}`}>
      <div className="action-card-header">
        <div className="action-card-title">
          <h4>{title}</h4>
          <div className="action-card-status">
            {getStatusIcon()}
            <span className={getStatusColor()}>{getStatusText()}</span>
          </div>
        </div>
        
        {elapsed > 0 && (
          <div className="action-card-timer">
            {(elapsed / 1000).toFixed(1)}s
          </div>
        )}
      </div>

      <div className="action-card-content">
        {interactive && status === 'pending' && onRun && (
          <button 
            className="action-card-run-btn"
            onClick={onRun}
            disabled={status !== 'pending'}
          >
            <Play className="w-4 h-4" />
            Run
          </button>
        )}

        {signature && explorerUrl && (
          <div className="action-card-explorer">
            <a 
              href={explorerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="action-card-explorer-link"
            >
              <ExternalLink className="w-3 h-3" />
              View on Explorer
            </a>
          </div>
        )}
      </div>

      <style>{`
        .action-card {
          background: rgba(17, 24, 39, 0.8);
          border: 1px solid rgba(75, 85, 99, 0.5);
          border-radius: 8px;
          padding: 12px;
          margin: 8px 0;
          backdrop-filter: blur(20px);
        }

        .action-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .action-card-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .action-card-title h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #e5e7eb;
        }

        .action-card-status {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
        }

        .action-card-timer {
          font-size: 12px;
          color: #9ca3af;
          font-family: monospace;
        }

        .action-card-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .action-card-run-btn {
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: background-color 0.2s;
        }

        .action-card-run-btn:hover:not(:disabled) {
          background: #2563eb;
        }

        .action-card-run-btn:disabled {
          background: #6b7280;
          cursor: not-allowed;
        }

        .action-card-explorer {
          display: flex;
          align-items: center;
        }

        .action-card-explorer-link {
          color: #3b82f6;
          text-decoration: none;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: color 0.2s;
        }

        .action-card-explorer-link:hover {
          color: #2563eb;
        }
      `}</style>
    </div>
  );
}
