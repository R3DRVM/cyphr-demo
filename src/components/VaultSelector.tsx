import React from 'react';
import { VaultContract, DEMO_VAULTS } from '../utils/vaultContract';

interface VaultSelectorProps {
  selectedVault: VaultContract | null;
  onVaultSelect: (vault: VaultContract) => void;
}

const VaultSelector: React.FC<VaultSelectorProps> = ({ selectedVault, onVaultSelect }) => {
  return (
    <div className="vault-selector">
      <h3>Select Vault for Staking</h3>
      <div className="vault-grid">
        {DEMO_VAULTS.map((vault) => (
          <div
            key={vault.address}
            className={`vault-card ${selectedVault?.address === vault.address ? 'selected' : ''}`}
            onClick={() => onVaultSelect(vault)}
          >
            <div className="vault-header">
              <h4>{vault.name}</h4>
              <div className="vault-apy">{vault.apy}% APY</div>
            </div>
            <div className="vault-details">
              <div className="vault-range">
                <span>Min: {vault.minStake} SOL</span>
                <span>Max: {vault.maxStake} SOL</span>
              </div>
              <div className="vault-address">
                {vault.address}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VaultSelector; 