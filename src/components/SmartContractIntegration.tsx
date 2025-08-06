import React, { useState } from 'react';
import { useStrategyBuilder } from '../hooks/useStrategyBuilder';
import './SmartContractIntegration.css';

const SmartContractIntegration: React.FC = () => {
  const {
    connected,
    loading,
    error,
    basicVaultData,
    strategyVaultData,
    userStrategies,
    initializeBasicVault,
    depositSol,
    withdrawSol,
    claimYield,
    createStrategy,
    executeStrategy,
    loadVaultData,
    clearError,
  } = useStrategyBuilder();

  // Local state for form inputs
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [strategyName, setStrategyName] = useState('');
  const [strategyDescription, setStrategyDescription] = useState('');
  const [baseToken, setBaseToken] = useState('SOL');
  const [quoteToken, setQuoteToken] = useState('USDC');
  const [positionSize, setPositionSize] = useState('50');
  const [timeFrame, setTimeFrame] = useState('1h');
  const [yieldTarget, setYieldTarget] = useState('10');
  const [strategyId, setStrategyId] = useState('');

  // Handle deposit SOL
  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid deposit amount');
      return;
    }

    try {
      await depositSol(parseFloat(depositAmount));
      setDepositAmount('');
    } catch (err) {
      console.error('Deposit failed:', err);
    }
  };

  // Handle withdraw SOL
  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid withdrawal amount');
      return;
    }

    try {
      await withdrawSol(parseFloat(withdrawAmount));
      setWithdrawAmount('');
    } catch (err) {
      console.error('Withdrawal failed:', err);
    }
  };

  // Handle claim yield
  const handleClaimYield = async () => {
    try {
      await claimYield();
    } catch (err) {
      console.error('Claim yield failed:', err);
    }
  };

  // Handle create strategy
  const handleCreateStrategy = async () => {
    if (!strategyName.trim()) {
      alert('Please enter a strategy name');
      return;
    }

    try {
      const strategyParams = {
        name: strategyName,
        description: strategyDescription,
        baseToken,
        quoteToken,
        positionSize: parseFloat(positionSize),
        timeFrame,
        yieldTarget: parseFloat(yieldTarget),
        yieldAccumulation: true,
      };

      await createStrategy(strategyParams);
      
      // Reset form
      setStrategyName('');
      setStrategyDescription('');
      setPositionSize('50');
      setYieldTarget('10');
    } catch (err) {
      console.error('Create strategy failed:', err);
    }
  };

  // Handle execute strategy
  const handleExecuteStrategy = async () => {
    if (!strategyId.trim()) {
      alert('Please enter a strategy ID');
      return;
    }

    try {
      await executeStrategy(strategyId);
      setStrategyId('');
    } catch (err) {
      console.error('Execute strategy failed:', err);
    }
  };

  // Handle initialize vault
  const handleInitializeVault = async () => {
    try {
      await initializeBasicVault();
    } catch (err) {
      console.error('Initialize vault failed:', err);
    }
  };

  // If wallet is not connected, show connection message
  if (!connected) {
    return (
      <div className="smart-contract-integration">
        <div className="integration-header">
          <h2>🔗 Smart Contract Integration</h2>
          <p>Connect your Phantom wallet to interact with the Cyphr Vaults</p>
        </div>
        <div className="wallet-not-connected">
          <div className="wallet-icon">👛</div>
          <h3>Wallet Not Connected</h3>
          <p>Please connect your Phantom wallet to access vault features</p>
        </div>
      </div>
    );
  }

  return (
    <div className="smart-contract-integration">
      <div className="integration-header">
        <h2>🔗 Smart Contract Integration</h2>
        <p>Interact with Cyphr Vaults on Solana Devnet</p>
        <div className="header-actions">
          <button 
            className="refresh-btn"
            onClick={loadVaultData}
            disabled={loading}
          >
            {loading ? '🔄 Loading...' : '🔄 Refresh Data'}
          </button>
          <button 
            className="init-vault-btn"
            onClick={handleInitializeVault}
            disabled={loading}
          >
            🏦 Initialize Vault
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button className="clear-error-btn" onClick={clearError}>
            ✕
          </button>
        </div>
      )}

      <div className="integration-content">
        {/* Basic Vault Section */}
        <div className="vault-section">
          <h3>💰 Basic Vault</h3>
          <div className="vault-info">
            {basicVaultData ? (
              <>
                <div className="vault-stat">
                  <span className="stat-label">Total Deposits:</span>
                  <span className="stat-value">{basicVaultData.totalDeposits.toFixed(4)} SOL</span>
                </div>
                <div className="vault-stat">
                  <span className="stat-label">Total Users:</span>
                  <span className="stat-value">{basicVaultData.totalUsers}</span>
                </div>
                <div className="vault-stat">
                  <span className="stat-label">Your Deposit:</span>
                  <span className="stat-value">{basicVaultData.userDeposit.toFixed(4)} SOL</span>
                </div>
                <div className="vault-stat">
                  <span className="stat-label">Your Yield:</span>
                  <span className="stat-value">{basicVaultData.yieldEarned.toFixed(4)} SOL</span>
                </div>
                <div className="vault-stat">
                  <span className="stat-label">Yield Rate:</span>
                  <span className="stat-value">{basicVaultData.yieldRate.toFixed(2)}%</span>
                </div>
                <div className="vault-stat">
                  <span className="stat-label">Status:</span>
                  <span className={`stat-value ${basicVaultData.isPaused ? 'paused' : 'active'}`}>
                    {basicVaultData.isPaused ? '⏸️ Paused' : '✅ Active'}
                  </span>
                </div>
              </>
            ) : (
              <div className="no-data">No vault data available</div>
            )}
          </div>

          <div className="vault-actions">
            <div className="action-group">
              <h4>Deposit SOL</h4>
              <div className="input-group">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Amount in SOL"
                  min="0"
                  step="0.01"
                />
                <button 
                  onClick={handleDeposit}
                  disabled={loading || !depositAmount}
                >
                  💰 Deposit
                </button>
              </div>
            </div>

            <div className="action-group">
              <h4>Withdraw SOL</h4>
              <div className="input-group">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Amount in SOL"
                  min="0"
                  step="0.01"
                />
                <button 
                  onClick={handleWithdraw}
                  disabled={loading || !withdrawAmount}
                >
                  💸 Withdraw
                </button>
              </div>
            </div>

            <div className="action-group">
              <h4>Claim Yield</h4>
              <button 
                onClick={handleClaimYield}
                disabled={loading}
                className="claim-btn"
              >
                🎯 Claim Yield
              </button>
            </div>
          </div>
        </div>

        {/* Strategy Vault Section */}
        <div className="vault-section">
          <h3>📈 Strategy Vault</h3>
          <div className="vault-info">
            {strategyVaultData ? (
              <>
                <div className="vault-stat">
                  <span className="stat-label">Total Deposits:</span>
                  <span className="stat-value">{strategyVaultData.totalDeposits.toFixed(4)} SOL</span>
                </div>
                <div className="vault-stat">
                  <span className="stat-label">Total Users:</span>
                  <span className="stat-value">{strategyVaultData.totalUsers}</span>
                </div>
                <div className="vault-stat">
                  <span className="stat-label">Your Deposit:</span>
                  <span className="stat-value">{strategyVaultData.userDeposit.toFixed(4)} SOL</span>
                </div>
                <div className="vault-stat">
                  <span className="stat-label">Your Yield:</span>
                  <span className="stat-value">{strategyVaultData.yieldEarned.toFixed(4)} SOL</span>
                </div>
                <div className="vault-stat">
                  <span className="stat-label">Yield Rate:</span>
                  <span className="stat-value">{strategyVaultData.yieldRate.toFixed(2)}%</span>
                </div>
                <div className="vault-stat">
                  <span className="stat-label">Status:</span>
                  <span className={`stat-value ${strategyVaultData.isPaused ? 'paused' : 'active'}`}>
                    {strategyVaultData.isPaused ? '⏸️ Paused' : '✅ Active'}
                  </span>
                </div>
              </>
            ) : (
              <div className="no-data">No strategy vault data available</div>
            )}
          </div>
        </div>

        {/* Strategy Management Section */}
        <div className="strategy-section">
          <h3>🎯 Strategy Management</h3>
          
          {/* Create Strategy Form */}
          <div className="strategy-form">
            <h4>Create New Strategy</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Strategy Name:</label>
                <input
                  type="text"
                  value={strategyName}
                  onChange={(e) => setStrategyName(e.target.value)}
                  placeholder="Enter strategy name"
                />
              </div>
              
              <div className="form-group">
                <label>Description:</label>
                <input
                  type="text"
                  value={strategyDescription}
                  onChange={(e) => setStrategyDescription(e.target.value)}
                  placeholder="Enter strategy description"
                />
              </div>
              
              <div className="form-group">
                <label>Base Token:</label>
                <select value={baseToken} onChange={(e) => setBaseToken(e.target.value)}>
                  <option value="SOL">SOL</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Quote Token:</label>
                <select value={quoteToken} onChange={(e) => setQuoteToken(e.target.value)}>
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                  <option value="SOL">SOL</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Position Size (%):</label>
                <input
                  type="number"
                  value={positionSize}
                  onChange={(e) => setPositionSize(e.target.value)}
                  placeholder="50"
                  min="1"
                  max="100"
                />
              </div>
              
              <div className="form-group">
                <label>Time Frame:</label>
                <select value={timeFrame} onChange={(e) => setTimeFrame(e.target.value)}>
                  <option value="1m">1 minute</option>
                  <option value="5m">5 minutes</option>
                  <option value="15m">15 minutes</option>
                  <option value="30m">30 minutes</option>
                  <option value="1h">1 hour</option>
                  <option value="4h">4 hours</option>
                  <option value="1d">1 day</option>
                  <option value="1w">1 week</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Yield Target (%):</label>
                <input
                  type="number"
                  value={yieldTarget}
                  onChange={(e) => setYieldTarget(e.target.value)}
                  placeholder="10"
                  min="0.1"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>
            
            <button 
              onClick={handleCreateStrategy}
              disabled={loading || !strategyName.trim()}
              className="create-strategy-btn"
            >
              🚀 Create Strategy
            </button>
          </div>

          {/* Execute Strategy */}
          <div className="strategy-form">
            <h4>Execute Strategy</h4>
            <div className="form-group">
              <label>Strategy ID:</label>
              <input
                type="text"
                value={strategyId}
                onChange={(e) => setStrategyId(e.target.value)}
                placeholder="Enter strategy ID"
              />
            </div>
            <button 
              onClick={handleExecuteStrategy}
              disabled={loading || !strategyId.trim()}
              className="execute-strategy-btn"
            >
              ▶️ Execute Strategy
            </button>
          </div>

          {/* User Strategies List */}
          <div className="strategies-list">
            <h4>Your Strategies</h4>
            {userStrategies.length > 0 ? (
              <div className="strategies-grid">
                {userStrategies.map((strategy) => (
                  <div key={strategy.id} className="strategy-card">
                    <div className="strategy-header">
                      <h5>{strategy.name}</h5>
                      <span className={`status ${strategy.isActive ? 'active' : 'inactive'}`}>
                        {strategy.isActive ? '✅ Active' : '⏸️ Inactive'}
                      </span>
                    </div>
                    <p className="strategy-description">{strategy.description}</p>
                    <div className="strategy-details">
                      <div className="detail">
                        <span className="label">Pair:</span>
                        <span className="value">{strategy.baseToken}/{strategy.quoteToken}</span>
                      </div>
                      <div className="detail">
                        <span className="label">Position:</span>
                        <span className="value">{strategy.positionSize}%</span>
                      </div>
                      <div className="detail">
                        <span className="label">Target:</span>
                        <span className="value">{strategy.yieldTarget}%</span>
                      </div>
                      <div className="detail">
                        <span className="label">PnL:</span>
                        <span className={`value ${strategy.totalPnl >= 0 ? 'positive' : 'negative'}`}>
                          {strategy.totalPnl >= 0 ? '+' : ''}{strategy.totalPnl.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-strategies">
                <p>No strategies created yet</p>
                <p>Create your first strategy above to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartContractIntegration; 