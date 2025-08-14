import React, { useState, useEffect } from 'react';
import { useSolanaWallet } from '../providers/SolanaWalletProvider';
import { usePreflight } from './Preflight';
import { configService } from '../services/config';
import { setupEnvFile } from '../utils/envSetup';
import { Wallet, Play, Settings, CheckCircle, XCircle } from 'lucide-react';

export function QuickStart() {
  const { connected, publicKey, connect, disconnect } = useSolanaWallet();
  const preflight = usePreflight();
  const [useDefaults, setUseDefaults] = useState(true);
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'checking' | 'devnet' | 'other'>('checking');

  // Auto-setup env file on mount
  useEffect(() => {
    setupEnvFile();
  }, []);

  // Update config service when defaults toggle changes
  useEffect(() => {
    configService.setUseDefaults(useDefaults);
  }, [useDefaults]);

  // Check Phantom network
  useEffect(() => {
    const checkNetwork = async () => {
      if (connected && (window as any).solana) {
        try {
          const network = await (window as any).solana.connection.rpcEndpoint;
          if (network.includes('devnet')) {
            setNetworkStatus('devnet');
          } else {
            setNetworkStatus('other');
          }
        } catch (error) {
          setNetworkStatus('other');
        }
      } else {
        setNetworkStatus('checking');
      }
    };

    checkNetwork();
    const interval = setInterval(checkNetwork, 2000);
    return () => clearInterval(interval);
  }, [connected]);

  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnectWallet = () => {
    disconnect();
  };

  const handleRunDemo = async () => {
    if (!connected || !preflight.ok) return;
    
    setIsRunningDemo(true);
    try {
      // Simulate demo sequence
      console.log('🚀 Starting demo sequence...');
      
      // Enable Collateral 0.25 SOL
      console.log('1️⃣ Enable Collateral 0.25 SOL...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Borrow 5 USDC
      console.log('2️⃣ Borrow 5 USDC...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Buy 1 unit
      console.log('3️⃣ Buy 1 unit...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Arm TP
      console.log('4️⃣ Arm Take Profit...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Demo sequence completed!');
      
      // Auto-scroll to Borrow & Trade panel
      const borrowPanel = document.querySelector('.borrow-trade-panel');
      if (borrowPanel) {
        borrowPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
    } catch (error) {
      console.error('Demo failed:', error);
    } finally {
      setIsRunningDemo(false);
    }
  };

  const getNetworkStatusIcon = () => {
    switch (networkStatus) {
      case 'devnet':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'other':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getNetworkStatusText = () => {
    switch (networkStatus) {
      case 'devnet':
        return 'Devnet ✓';
      case 'other':
        return 'Wrong Network';
      default:
        return 'Checking...';
    }
  };

  return (
    <div className="quickstart-strip">
      <div className="quickstart-content">
        <div className="quickstart-left">
          <h3 className="quickstart-title">QuickStart</h3>
          <span className="quickstart-subtitle">Get started in seconds</span>
        </div>
        
        <div className="quickstart-controls">
          {/* Wallet Connection */}
          <div className="control-group">
            {!connected ? (
              <button
                className="control-btn connect-wallet"
                onClick={handleConnectWallet}
                disabled={isRunningDemo}
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            ) : (
              <button
                className="control-btn disconnect-wallet"
                onClick={handleDisconnectWallet}
                disabled={isRunningDemo}
              >
                <Wallet className="w-4 h-4" />
                Disconnect
              </button>
            )}
          </div>

          {/* Network Status */}
          <div className="control-group">
            <div className="network-status">
              {getNetworkStatusIcon()}
              <span className="network-text">{getNetworkStatusText()}</span>
            </div>
            {networkStatus === 'other' && (
              <div className="network-tip">
                Switch to Devnet in Phantom settings
              </div>
            )}
          </div>

          {/* Use Defaults Toggle */}
          <div className="control-group">
            <label className="defaults-toggle">
              <input
                type="checkbox"
                checked={useDefaults}
                onChange={(e) => setUseDefaults(e.target.checked)}
                disabled={isRunningDemo}
              />
              <span className="toggle-label">Use Defaults</span>
            </label>
            {useDefaults && (
              <span className="defaults-note">using devnet defaults</span>
            )}
          </div>

          {/* Run Demo Button */}
          <div className="control-group">
            <button
              className="control-btn run-demo"
              onClick={handleRunDemo}
              disabled={!connected || !preflight.ok || isRunningDemo}
              title={!connected ? 'Connect wallet first' : !preflight.ok ? 'System not ready' : 'Run demo sequence'}
            >
              <Play className="w-4 h-4" />
              {isRunningDemo ? 'Running...' : 'Run Demo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
