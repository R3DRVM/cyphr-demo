import React, { useEffect, useState } from 'react';
import { useSolanaWallet } from '../providers/SolanaWalletProvider';
import { getConnection, testConnection } from '../services/connection';
import { configService } from '../services/config';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export interface PreflightStatus {
  ok: boolean;
  details: {
    env: boolean;
    tokens: boolean;
    wallet: boolean;
    connection: boolean;
  };
  errors: string[];
  warnings: string[];
}

export function usePreflight(): PreflightStatus {
  const { connected, publicKey } = useSolanaWallet();
  const [status, setStatus] = useState<PreflightStatus>({
    ok: false,
    details: {
      env: false,
      tokens: false,
      wallet: false,
      connection: false
    },
    errors: [],
    warnings: []
  });

  useEffect(() => {
    const checkPreflight = async () => {
      const errors: string[] = [];
      const warnings: string[] = [];
      const details = {
        env: false,
        tokens: false,
        wallet: false,
        connection: false
      };

      // Check environment variables with defaults
      try {
        const useDefaults = configService.getUseDefaults();
        
        if (useDefaults) {
          // With defaults, env check passes if we can resolve values
          const network = configService.getSolanaNetwork();
          const rpcUrl = configService.getRpcUrl();
          const lendingProgramId = configService.getLendingProgramId();
          const strategyProgramId = configService.getStrategyProgramId();
          
          if (network && rpcUrl && lendingProgramId && strategyProgramId) {
            details.env = true;
            if (configService.isUsingDefault('VITE_SOLANA_NETWORK') || 
                configService.isUsingDefault('VITE_RPC_URL') ||
                configService.isUsingDefault('VITE_LENDING_PROGRAM_ID') ||
                configService.isUsingDefault('VITE_STRATEGY_PROGRAM_ID')) {
              warnings.push('Using devnet defaults for missing environment variables');
            }
          } else {
            errors.push('Failed to resolve configuration values');
          }
        } else {
          // Without defaults, check for actual env vars
          const requiredEnvVars = [
            'VITE_SOLANA_NETWORK',
            'VITE_RPC_URL',
            'VITE_LENDING_PROGRAM_ID',
            'VITE_STRATEGY_PROGRAM_ID'
          ];

          const missingEnvVars = requiredEnvVars.filter(
            envVar => !(import.meta as any).env?.[envVar]
          );

          if (missingEnvVars.length === 0) {
            details.env = true;
          } else {
            errors.push(`Missing environment variables: ${missingEnvVars.join(', ')}`);
          }
        }
      } catch (error) {
        errors.push('Failed to check environment variables');
      }

      // Check tokens configuration
      try {
        const tokensConfig = configService.getTokensConfig();
        const requiredTokenKeys = [
          'mintA', 'mintB', 'vaultA', 'vaultB', 'swapState',
          'swapAuthority', 'feeAccount', 'poolTokenMint'
        ];

        const missingTokenKeys = requiredTokenKeys.filter(
          key => !tokensConfig[key] || tokensConfig[key] === 'placeholder_' + key
        );

        if (missingTokenKeys.length === 0) {
          details.tokens = true;
        } else {
          errors.push(`Missing or placeholder token keys: ${missingTokenKeys.join(', ')}`);
        }
      } catch (error) {
        errors.push('Failed to check tokens configuration');
      }

      // Check wallet connection
      if (connected && publicKey) {
        details.wallet = true;
      } else {
        errors.push('Wallet not connected');
      }

      // Check Solana connection
      try {
        const connectionOk = await testConnection();
        if (connectionOk) {
          details.connection = true;
        } else {
          errors.push('Failed to connect to Solana network');
        }
      } catch (error) {
        errors.push('Failed to connect to Solana network');
      }

      const ok = Object.values(details).every(Boolean);

      setStatus({
        ok,
        details,
        errors,
        warnings
      });
    };

    checkPreflight();
    const interval = setInterval(checkPreflight, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [connected, publicKey]);

  return status;
}

export function PreflightBanner() {
  const preflight = usePreflight();

  if (preflight.ok) {
    return null;
  }

  return (
    <div className="preflight-banner">
      <div className="preflight-header">
        <AlertTriangle className="w-4 h-4 text-yellow-400" />
        <span className="preflight-title">System Check Required</span>
      </div>
      
      <div className="preflight-details">
        <div className="preflight-item">
          <span>Environment:</span>
          {preflight.details.env ? (
            <div className="status-group">
              <CheckCircle className="w-4 h-4 text-green-400" />
              {configService.getUseDefaults() && configService.isUsingDefault('VITE_SOLANA_NETWORK') && (
                <span className="defaults-note">using defaults</span>
              )}
            </div>
          ) : (
            <XCircle className="w-4 h-4 text-red-400" />
          )}
        </div>
        
        <div className="preflight-item">
          <span>Tokens Config:</span>
          {preflight.details.tokens ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400" />
          )}
        </div>
        
        <div className="preflight-item">
          <span>Wallet:</span>
          {preflight.details.wallet ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400" />
          )}
        </div>
        
        <div className="preflight-item">
          <span>Connection:</span>
          {preflight.details.connection ? (
            <div className="status-group">
              <CheckCircle className="w-4 h-4 text-green-400" />
              {configService.getUseDefaults() && configService.isUsingDefault('VITE_RPC_URL') && (
                <span className="defaults-note">using defaults</span>
              )}
            </div>
          ) : (
            <XCircle className="w-4 h-4 text-red-400" />
          )}
        </div>
      </div>

      {preflight.warnings.length > 0 && (
        <div className="preflight-warnings">
          <div className="preflight-warnings-title">
            <Info className="w-4 h-4 text-blue-400" />
            <span>Info:</span>
          </div>
          <ul className="preflight-warnings-list">
            {preflight.warnings.map((warning, index) => (
              <li key={index} className="preflight-warning-item">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {preflight.errors.length > 0 && (
        <div className="preflight-errors">
          <div className="preflight-errors-title">Issues Found:</div>
          <ul className="preflight-errors-list">
            {preflight.errors.map((error, index) => (
              <li key={index} className="preflight-error-item">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="preflight-help">
        <p>Please check your configuration and wallet connection to enable full functionality.</p>
        {configService.getUseDefaults() && (
          <p className="defaults-help">
            💡 <strong>QuickStart mode enabled:</strong> The app is using devnet defaults. 
            You can override these in <code>.env.local</code> if needed.
          </p>
        )}
      </div>
    </div>
  );
}
