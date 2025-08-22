import React from 'react';
import { useSolanaWallet } from '../../providers/SolanaWalletProvider';
import { useChatController, QuickAction } from '../../hooks/useChatController';
import { TrendingUp, Wallet, ArrowUpDown, DollarSign } from 'lucide-react';

export function StarterActions() {
  const { dispatch } = useChatController();
  const { connected } = useSolanaWallet();

  const handleCardClick = (action: QuickAction) => {
    if (!connected) {
      return; // Cards are disabled when not connected
    }
    dispatch(action);
  };

  const Card = ({ 
    title, 
    hint, 
    onClick, 
    disabled,
    icon: Icon,
    color
  }: { 
    title: string; 
    hint: string; 
    onClick: () => void;
    disabled: boolean;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }) => (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`w-full text-left rounded-xl border transition-all duration-200 p-5 disabled:opacity-40 disabled:cursor-not-allowed group ${color}`}
      title={disabled ? 'Connect your wallet to use this feature' : undefined}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-white mb-2">{title}</div>
          <div className="opacity-70 text-sm text-gray-300 group-hover:text-gray-200 transition-colors">"{hint}"</div>
        </div>
      </div>
    </button>
  );

  return (
    <div className="grid gap-4 max-w-[640px] mx-auto">
      <Card 
        title="Yield Strategies" 
        hint="Find me a yield strategy with 15% APY"
        onClick={() => handleCardClick({ kind: 'yield', targetBps: 1500 })}
        disabled={!connected}
        icon={TrendingUp}
        color="border-green-500/30 bg-green-500/10 hover:bg-green-500/20 hover:border-green-500/50"
      />
      <Card 
        title="Deposits" 
        hint="Deposit 1 SOL"
        onClick={() => handleCardClick({ kind: 'deposit', sol: 1 })}
        disabled={!connected}
        icon={Wallet}
        color="border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500/50"
      />
      <Card 
        title="Withdrawals" 
        hint="Withdraw all"
        onClick={() => handleCardClick({ kind: 'withdraw', all: true })}
        disabled={!connected}
        icon={ArrowUpDown}
        color="border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-500/50"
      />
      <Card 
        title="Borrowing" 
        hint="Borrow 100 USDC"
        onClick={() => handleCardClick({ kind: 'borrow', usdc: 100 })}
        disabled={!connected}
        icon={DollarSign}
        color="border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 hover:border-yellow-500/50"
      />
    </div>
  );
}
