// src/debug/Preflight.tsx
import React from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import tokens from '../config/tokens.devnet.json';

export function usePreflight() {
  const env = (import.meta as any).env || {};
  const wallet = (window as any).solana;
  const okEnv = Boolean(env.VITE_PROGRAM_ID && env.VITE_RPC_PRIMARY);
  const okTokens = tokens && ['mintA','mintB'].every(k => (tokens as any)[k]);
  const okWallet = Boolean(wallet?.publicKey);
  const ok = okEnv && okTokens && okWallet;
  return { ok, okEnv, okTokens, okWallet };
}

export function PreflightBanner() {
  const { ok, okEnv, okTokens, okWallet } = usePreflight();
  const env = (import.meta as any).env || {};
  
  if (ok) return null;
  
  return (
    <div className="bg-gradient-to-r from-cyphr-dark/90 to-cyphr-dark/70 rounded-2xl border border-cyphr-gray/30 p-6 mb-6 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-cyphr-orange to-cyphr-red rounded-xl flex items-center justify-center mr-4">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-cyphr-white mb-1">System Preflight Check</h3>
            <p className="text-cyphr-gray text-sm">Please resolve the following issues to enable full functionality</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Environment Check */}
          <div className={`flex items-center px-3 py-2 rounded-lg ${okEnv ? 'bg-cyphr-teal/20 border border-cyphr-teal/30' : 'bg-cyphr-red/20 border border-cyphr-red/30'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${okEnv ? 'bg-cyphr-teal' : 'bg-cyphr-red'}`}></div>
            <span className={`text-sm font-medium ${okEnv ? 'text-cyphr-teal' : 'text-cyphr-red'}`}>
              {okEnv ? 'ENV ' : 'ENV '}
              {okEnv ? <Check className="w-4 h-4 inline" /> : <X className="w-4 h-4 inline" />}
            </span>
          </div>
          
          {/* Tokens Check */}
          <div className={`flex items-center px-3 py-2 rounded-lg ${okTokens ? 'bg-cyphr-teal/20 border border-cyphr-teal/30' : 'bg-cyphr-red/20 border border-cyphr-red/30'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${okTokens ? 'bg-cyphr-teal' : 'bg-cyphr-red'}`}></div>
            <span className={`text-sm font-medium ${okTokens ? 'text-cyphr-teal' : 'text-cyphr-red'}`}>
              {okTokens ? 'TOKENS ' : 'TOKENS '}
              {okTokens ? <Check className="w-4 h-4 inline" /> : <X className="w-4 h-4 inline" />}
            </span>
          </div>
          
          {/* Wallet Check */}
          <div className={`flex items-center px-3 py-2 rounded-lg ${okWallet ? 'bg-cyphr-teal/20 border border-cyphr-teal/30' : 'bg-cyphr-red/20 border border-cyphr-red/30'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${okWallet ? 'bg-cyphr-teal' : 'bg-cyphr-red'}`}></div>
            <span className={`text-sm font-medium ${okWallet ? 'text-cyphr-teal' : 'text-cyphr-red'}`}>
              {okWallet ? 'WALLET ' : 'WALLET '}
              {okWallet ? <Check className="w-4 h-4 inline" /> : <X className="w-4 h-4 inline" />}
            </span>
          </div>
        </div>
      </div>
      
      {/* Detailed Status */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-cyphr-dark/50 rounded-lg p-3 border border-cyphr-gray/20">
          <div className="flex items-center mb-2">
            <img src="/assets/icons/StrategyLogicIcon.png" alt="Config" className="w-4 h-4 mr-2" />
            <span className="text-cyphr-gray text-sm font-medium">Environment</span>
          </div>
          <div className="text-xs font-mono">
            {okEnv ? (
              <span className="text-cyphr-teal"><Check className="w-3 h-3 inline mr-1" />Configured</span>
            ) : (
              <div className="text-cyphr-red">
                <div><X className="w-3 h-3 inline mr-1" />VITE_PROGRAM_ID: {env.VITE_PROGRAM_ID ? 'Set' : 'Missing'}</div>
                <div><X className="w-3 h-3 inline mr-1" />VITE_RPC_PRIMARY: {env.VITE_RPC_PRIMARY ? 'Set' : 'Missing'}</div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-cyphr-dark/50 rounded-lg p-3 border border-cyphr-gray/20">
          <div className="flex items-center mb-2">
            <img src="/assets/icons/TokenDataIcon.png" alt="Tokens" className="w-4 h-4 mr-2" />
            <span className="text-cyphr-gray text-sm font-medium">Token Config</span>
          </div>
          <div className="text-xs font-mono">
            {okTokens ? (
              <span className="text-cyphr-teal"><Check className="w-3 h-3 inline mr-1" />Valid</span>
            ) : (
              <div className="text-cyphr-red">
                <div><X className="w-3 h-3 inline mr-1" />mintA: {(tokens as any).mintA || 'Missing'}</div>
                <div><X className="w-3 h-3 inline mr-1" />mintB: {(tokens as any).mintB || 'Missing'}</div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-cyphr-dark/50 rounded-lg p-3 border border-cyphr-gray/20">
          <div className="flex items-center mb-2">
            <img src="/assets/icons/WalletIcon.png" alt="Wallet" className="w-4 h-4 mr-2" />
            <span className="text-cyphr-gray text-sm font-medium">Wallet</span>
          </div>
          <div className="text-xs font-mono">
            {okWallet ? (
              <span className="text-cyphr-teal"><Check className="w-3 h-3 inline mr-1" />Connected</span>
            ) : (
              <div className="text-cyphr-red">
                <div><X className="w-3 h-3 inline mr-1" />Not connected</div>
                <div>Connect Phantom wallet</div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Action Items */}
      {!ok && (
        <div className="mt-4 p-4 bg-cyphr-dark/30 rounded-lg border border-cyphr-gray/20">
          <h4 className="text-cyphr-white font-medium mb-2">To resolve:</h4>
          <ul className="text-cyphr-gray text-sm space-y-1">
            {!okEnv && (
              <li>• Set up your <code className="bg-cyphr-dark/50 px-1 rounded">.env.local</code> file with program ID and RPC endpoint</li>
            )}
            {!okTokens && (
              <li>• Run <code className="bg-cyphr-dark/50 px-1 rounded">npm run setup:devnet</code> to configure tokens</li>
            )}
            {!okWallet && (
              <li>• Connect your Phantom wallet using the wallet connect button</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
