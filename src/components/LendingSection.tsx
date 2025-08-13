import React, { useState } from 'react';
import { useSolanaWallet } from '../providers/SolanaWalletProvider';
import { useTxToasts } from '../hooks/useTxToasts';
import { getConnection } from '../services/connection';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Rocket, Zap } from 'lucide-react';

interface LendingSectionProps {
  onNavigateToTerminal?: () => void;
  preflightOk?: boolean;
}

const LendingSection: React.FC<LendingSectionProps> = ({ onNavigateToTerminal, preflightOk = true }) => {
  const { connected, publicKey } = useSolanaWallet();
  const { withTxToasts } = useTxToasts();
  const [depositAmount, setDepositAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDeposit = async () => {
    if (!connected || !publicKey) return;
    
    setIsLoading(true);
    try {
      const connection = getConnection();
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey('11111111111111111111111111111111'), // Placeholder
          lamports: Number(depositAmount) * LAMPORTS_PER_SOL,
        })
      );

      const signature = await withTxToasts(
        connection.sendTransaction(transaction, []).then(sig => ({ signature: sig })),
        {
          pending: 'Depositing SOL...',
          success: 'SOL deposited successfully!',
          error: 'Failed to deposit SOL'
        }
      );

      if (signature) {
        setDepositAmount('');
        // Navigate to terminal after successful deposit
        onNavigateToTerminal?.();
      }
    } catch (error) {
      console.error('Deposit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!connected || !publicKey) return;
    
    setIsLoading(true);
    try {
      // Simulate borrowing MEAD tokens
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = await withTxToasts(
        Promise.resolve({ signature: 'demo-signature' }),
        {
          pending: 'Minting MEAD...',
          success: 'MEAD minted successfully!',
          error: 'Failed to mint MEAD'
        }
      );

      if (result.signature) {
        setBorrowAmount('');
        // Navigate to terminal after successful borrow
        onNavigateToTerminal?.();
      }
    } catch (error) {
      console.error('Borrow error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyphr-teal to-cyphr-blue rounded-2xl mb-6">
          <img src="/assets/icons/WalletIcon.png" alt="Lending" className="w-10 h-10" />
        </div>
        <h2 className="text-4xl font-bold text-cyphr-white mb-4 font-nulshock">
          Lending & Borrowing
        </h2>
        <p className="text-xl text-cyphr-gray max-w-2xl mx-auto">
          Deposit your assets to earn yield and borrow against them to access liquidity for trading strategies
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Deposit Card */}
        <div className="bg-gradient-to-br from-cyphr-dark/80 to-cyphr-dark/40 rounded-2xl border border-cyphr-gray/20 p-8 backdrop-blur-sm">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyphr-teal to-cyphr-teal/80 rounded-xl flex items-center justify-center mr-4">
              <img src="/assets/icons/DepositIcon.png" alt="Deposit" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-cyphr-white">Deposit Assets</h3>
              <p className="text-cyphr-gray">Earn yield on your deposits</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-cyphr-gray mb-2">
                Amount (SOL)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-cyphr-dark/50 border border-cyphr-gray/30 rounded-xl px-4 py-4 text-cyphr-white placeholder-cyphr-gray/50 focus:outline-none focus:ring-2 focus:ring-cyphr-teal/50 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-cyphr-gray text-sm">SOL</span>
                </div>
              </div>
            </div>

            <div className="bg-cyphr-dark/30 rounded-xl p-4 border border-cyphr-gray/20">
              <div className="flex justify-between items-center text-sm">
                <span className="text-cyphr-gray">Current APY:</span>
                <span className="text-cyphr-teal font-semibold">8.5%</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-cyphr-gray">Total Value Locked:</span>
                <span className="text-cyphr-white">$2.4M</span>
              </div>
            </div>

            <button
              onClick={handleDeposit}
              disabled={!preflightOk || isLoading || !depositAmount || Number(depositAmount) <= 0}
              className="w-full bg-gradient-to-r from-cyphr-teal to-cyphr-blue hover:from-cyphr-teal/90 hover:to-cyphr-blue/90 disabled:from-cyphr-gray disabled:to-cyphr-gray/50 disabled:cursor-not-allowed text-cyphr-dark font-bold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
              title={!preflightOk ? 'System not ready - check preflight banner' : ''}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyphr-dark mr-2"></div>
                  Processing...
                </div>
              ) : (
                <><Rocket className="w-4 h-4 inline mr-1" />Approve & Deposit</>
              )}
            </button>
          </div>
        </div>

        {/* Borrow Card */}
        <div className="bg-gradient-to-br from-cyphr-dark/80 to-cyphr-dark/40 rounded-2xl border border-cyphr-gray/20 p-8 backdrop-blur-sm">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyphr-orange to-cyphr-red rounded-xl flex items-center justify-center mr-4">
              <img src="/assets/icons/ActionIcon.png" alt="Borrow" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-cyphr-white">Borrow MEAD</h3>
              <p className="text-cyphr-gray">Access liquidity for trading</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-cyphr-gray mb-2">
                Amount (MEAD)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-cyphr-dark/50 border border-cyphr-gray/30 rounded-xl px-4 py-4 text-cyphr-white placeholder-cyphr-gray/50 focus:outline-none focus:ring-2 focus:ring-cyphr-orange/50 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-cyphr-gray text-sm">MEAD</span>
                </div>
              </div>
            </div>

            <div className="bg-cyphr-dark/30 rounded-xl p-4 border border-cyphr-gray/20">
              <div className="flex justify-between items-center text-sm">
                <span className="text-cyphr-gray">Borrow Rate:</span>
                <span className="text-cyphr-orange font-semibold">12.5%</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-cyphr-gray">Collateral Ratio:</span>
                <span className="text-cyphr-white">150%</span>
              </div>
            </div>

            <button
              onClick={handleBorrow}
              disabled={!preflightOk || isLoading || !borrowAmount || Number(borrowAmount) <= 0}
              className="w-full bg-gradient-to-r from-cyphr-orange to-cyphr-red hover:from-cyphr-orange/90 hover:to-cyphr-red/90 disabled:from-cyphr-gray disabled:to-cyphr-gray/50 disabled:cursor-not-allowed text-cyphr-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
              title={!preflightOk ? 'System not ready - check preflight banner' : ''}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyphr-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <><Zap className="w-4 h-4 inline mr-1" />Mint MEAD</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-cyphr-dark/60 to-cyphr-dark/40 rounded-2xl border border-cyphr-gray/20 p-8 mb-8">
        <h3 className="text-2xl font-bold text-cyphr-white mb-6 text-center">Protocol Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-cyphr-teal mb-2">$12.4M</div>
            <div className="text-cyphr-gray">Total Value Locked</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyphr-blue mb-2">1,247</div>
            <div className="text-cyphr-gray">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyphr-orange mb-2">8.5%</div>
            <div className="text-cyphr-gray">Average APY</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyphr-red mb-2">$2.1M</div>
            <div className="text-cyphr-gray">Total Borrowed</div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-cyphr-teal/20 to-cyphr-blue/20 rounded-2xl border border-cyphr-teal/30 p-8">
          <h3 className="text-2xl font-bold text-cyphr-white mb-4">
            Ready to Start Trading?
          </h3>
          <p className="text-cyphr-gray mb-6 max-w-2xl mx-auto">
            After depositing and borrowing, navigate to the Strategy Builder to execute your trading strategies with the borrowed capital.
          </p>
          <button
            onClick={onNavigateToTerminal}
            className="bg-gradient-to-r from-cyphr-teal to-cyphr-blue hover:from-cyphr-teal/90 hover:to-cyphr-blue/90 text-cyphr-dark font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Rocket className="w-4 h-4 inline mr-2" />Go to Strategy Builder
          </button>
        </div>
      </div>
    </div>
  );
};

export default LendingSection;
