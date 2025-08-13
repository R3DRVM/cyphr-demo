import React from 'react';
import { useTransactionContext, TransactionStatus as TransactionStatusType } from '../contexts/TransactionContext';
import { Clipboard, Search, Clock, Check, X, HelpCircle } from 'lucide-react';
import './TransactionStatus.css';

const TransactionStatus: React.FC = () => {
  const { transactions, clearTransactions, clearOldTransactions } = useTransactionContext();

  // Don't render if no transactions
  if (transactions.length === 0) {
    return null;
  }

  // Get status icon and color for visual feedback
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <Check className="w-4 h-4" />;
      case 'failed':
        return <X className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'var(--accent-color)';
      case 'confirmed':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString();
  };

  // Copy transaction signature to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="transaction-status-container">
      <div className="transaction-status-header">
        <h3>Transaction Status</h3>
        <div className="transaction-status-actions">
          <button 
            className="clear-old-btn"
            onClick={clearOldTransactions}
            title="Clear old transactions"
          >
            Clear Old
          </button>
          <button 
            className="clear-all-btn"
            onClick={clearTransactions}
            title="Clear all transactions"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="transaction-list">
        {transactions.map((tx) => (
          <div key={tx.id} className={`transaction-item ${tx.status}`}>
            <div className="transaction-header">
              <div className="transaction-status">
                <span 
                  className="status-icon"
                  style={{ color: getStatusColor(tx.status) }}
                >
                  {getStatusIcon(tx.status)}
                </span>
                <span className="transaction-type">{tx.type}</span>
              </div>
              <span className="transaction-time">
                {formatTimestamp(tx.timestamp)}
              </span>
            </div>

            <div className="transaction-description">
              {tx.description}
            </div>

            {/* Show loading spinner for pending transactions */}
            {tx.status === 'pending' && (
              <div className="transaction-pending">
                <div className="loading-spinner"></div>
                <span>Processing transaction...</span>
              </div>
            )}

            {/* Show success details for confirmed transactions */}
            {tx.status === 'confirmed' && tx.signature && (
              <div className="transaction-confirmed">
                <div className="transaction-signature">
                  <span className="signature-label">Signature:</span>
                  <span className="signature-value">
                    {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                  </span>
                  <button 
                    className="copy-btn"
                    onClick={() => copyToClipboard(tx.signature!)}
                    title="Copy signature"
                  >
                    <Clipboard className="w-4 h-4" />
                  </button>
                </div>
                {tx.explorerUrl && (
                  <a 
                    href={tx.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="explorer-link"
                  >
                    <Search className="w-4 h-4 inline mr-1" />View on Explorer
                  </a>
                )}
              </div>
            )}

            {/* Show error details for failed transactions */}
            {tx.status === 'failed' && tx.error && (
              <div className="transaction-failed">
                <div className="error-message">
                  <span className="error-label">Error:</span>
                  <span className="error-value">{tx.error}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionStatus; 