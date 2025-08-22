import React, { useState, useEffect } from 'react';

interface CustomAmountDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  title?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export default function CustomAmountDialog({ 
  open, 
  onClose, 
  onConfirm, 
  title = "Enter amount of SOL to deposit",
  placeholder = "e.g., 1",
  min = 0.1,
  max = 10,
  step = 0.1
}: CustomAmountDialogProps) {
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (open) {
      setValue('');
      setError('');
    }
  }, [open]);

  const handleConfirm = () => {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || numValue <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (numValue < min) {
      setError(`Minimum amount is ${min} SOL`);
      return;
    }
    
    if (numValue > max) {
      setError(`Maximum amount is ${max} SOL`);
      return;
    }
    
    onConfirm(numValue);
    onClose();
  };

  const handleQuickAmount = (amount: number) => {
    setValue(amount.toString());
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 grid place-items-center z-50">
      <div className="bg-neutral-900 rounded-xl p-6 w-[360px] border border-neutral-700">
        <h3 className="text-lg font-semibold mb-4 text-white">{title}</h3>
        
        <div className="mb-4">
          <input
            autoFocus
            type="number"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError('');
            }}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 outline-none border border-neutral-600 focus:border-blue-500 text-white"
          />
          
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => handleQuickAmount(0.1)}
            className="px-3 py-1 rounded bg-neutral-700 hover:bg-neutral-600 text-sm text-white"
          >
            +0.1
          </button>
          <button 
            onClick={() => handleQuickAmount(0.5)}
            className="px-3 py-1 rounded bg-neutral-700 hover:bg-neutral-600 text-sm text-white"
          >
            +0.5
          </button>
          <button 
            onClick={() => handleQuickAmount(1.0)}
            className="px-3 py-1 rounded bg-neutral-700 hover:bg-neutral-600 text-sm text-white"
          >
            +1.0
          </button>
          <button 
            onClick={() => handleQuickAmount(max)}
            className="px-3 py-1 rounded bg-neutral-700 hover:bg-neutral-600 text-sm text-white"
          >
            Max
          </button>
        </div>

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600 text-white"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
