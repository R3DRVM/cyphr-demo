import React, { useState } from 'react';
import { useSolanaWallet } from '../providers/SolanaWalletProvider';
import { enableCollateral, borrow } from '../adapters/lender';
import { dexAdapter } from '../adapters/dexAdapter';
import { useTakeProfit } from '../hooks/useTakeProfit';
import { usePreflight } from './Preflight';
import { useToast } from '../hooks/useToast';
import { Play, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';

export interface DemoStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  signature?: string;
  explorerUrl?: string;
  error?: string;
}

export function DemoRunner() {
  const { connected, publicKey } = useSolanaWallet();
  const preflight = usePreflight();
  const { showToast } = useToast();
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<DemoStep[]>([
    {
      id: '1',
      name: 'Enable Collateral (0.25 SOL)',
      status: 'pending'
    },
    {
      id: '2',
      name: 'Borrow (5 USDC)',
      status: 'pending'
    },
    {
      id: '3',
      name: 'Buy (1 unit)',
      status: 'pending'
    },
    {
      id: '4',
      name: 'Arm Take-Profit',
      status: 'pending'
    }
  ]);

  const { armTakeProfit } = useTakeProfit();

  const runDemo = async () => {
    if (!connected || !publicKey || !preflight.ok) {
      showToast({
        type: 'error',
        title: 'Demo Failed',
        message: 'Wallet not connected or system not ready'
      });
      return;
    }

    setIsRunning(true);
    setCurrentStep(0);

    try {
      // Step 1: Enable Collateral
      await runStep(0, async () => {
        const result = await enableCollateral(
          'So11111111111111111111111111111111111111112', // SOL mint
          0.25
        );
        return result.signature;
      });

      // Step 2: Borrow USDC
      await runStep(1, async () => {
        const result = await borrow(
          '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // USDC mint
          5
        );
        return result.signature;
      });

      // Step 3: Buy (swap USDC for SOL)
      await runStep(2, async () => {
        const result = await dexAdapter.swap({
          inputToken: 'USDC',
          outputToken: 'SOL',
          amountIn: 1,
          maxSlippagePct: 1.0,
          owner: publicKey,
          sendTransaction: async (tx) => {
            // Mock transaction sending
            return 'buy_demo_signature';
          }
        });
        return result.signature;
      });

      // Step 4: Arm Take-Profit
      await runStep(3, async () => {
        await armTakeProfit(1, 'A', 'B');
        return 'tp_armed_signature';
      });

      showToast({
        type: 'success',
        title: 'Demo Completed',
        message: 'All demo steps completed successfully!'
      });

    } catch (error) {
      console.error('Demo failed:', error);
      showToast({
        type: 'error',
        title: 'Demo Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runStep = async (stepIndex: number, operation: () => Promise<string>) => {
    // Update step status to running
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex 
        ? { ...step, status: 'running' }
        : step
    ));

    try {
      const signature = await operation();
      
      // Update step status to completed
      setSteps(prev => prev.map((step, index) => 
        index === stepIndex 
          ? { 
              ...step, 
              status: 'completed',
              signature,
              explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
            }
          : step
      ));

      setCurrentStep(stepIndex + 1);
      
      // Show success toast for this step
      showToast({
        type: 'success',
        title: `Step ${stepIndex + 1} Completed`,
        message: steps[stepIndex].name,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      });

      // Small delay between steps
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      // Update step status to failed
      setSteps(prev => prev.map((step, index) => 
        index === stepIndex 
          ? { 
              ...step, 
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          : step
      ));

      throw error;
    }
  };

  const resetDemo = () => {
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending', signature: undefined, explorerUrl: undefined, error: undefined })));
    setCurrentStep(0);
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-400" />;
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'running':
        return 'text-blue-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="demo-runner">
      <div className="demo-header">
        <h3 className="demo-title">Demo Runner</h3>
        <p className="demo-description">
          One-click demo: Deposit SOL → Borrow USDC → Trade → Arm TP
        </p>
      </div>

      {/* Demo Steps */}
      <div className="demo-steps">
        {steps.map((step, index) => (
          <div key={step.id} className="demo-step">
            <div className="step-header">
              <div className="step-icon">
                {getStepIcon(step.status)}
              </div>
              <div className="step-info">
                <span className="step-name">{step.name}</span>
                <span className={`step-status ${getStepStatusColor(step.status)}`}>
                  {step.status.toUpperCase()}
                </span>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {step.signature && (
              <div className="step-signature">
                <span>Signature:</span>
                <span className="signature-text">{step.signature.slice(0, 8)}...{step.signature.slice(-8)}</span>
              </div>
            )}

            {step.explorerUrl && (
              <a
                href={step.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="step-explorer"
              >
                View on Explorer
              </a>
            )}

            {step.error && (
              <div className="step-error">
                <span>Error:</span>
                <span className="error-text">{step.error}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Demo Controls */}
      <div className="demo-controls">
        <button
          className="demo-btn run"
          onClick={runDemo}
          disabled={!connected || !preflight.ok || isRunning}
        >
          <Play className="w-4 h-4" />
          {isRunning ? 'Running Demo...' : 'Run Demo'}
        </button>

        <button
          className="demo-btn reset"
          onClick={resetDemo}
          disabled={isRunning}
        >
          Reset Demo
        </button>
      </div>

      {/* Demo Progress */}
      {isRunning && (
        <div className="demo-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentStep) / steps.length) * 100}%` }}
            />
          </div>
          <span className="progress-text">
            Step {currentStep} of {steps.length}
          </span>
        </div>
      )}

      {/* Demo Info */}
      <div className="demo-info">
        <h4>What This Demo Does:</h4>
        <ul className="demo-list">
          <li>Enables 0.25 SOL as collateral</li>
          <li>Borrows 5 USDC against the collateral</li>
          <li>Executes a 1 USDC → SOL swap</li>
          <li>Arms a take-profit order for automated selling</li>
        </ul>
        <p className="demo-note">
          <strong>Note:</strong> This demo uses mock transactions in demo mode. 
          In production, these would be real on-chain transactions.
        </p>
      </div>
    </div>
  );
}
