import React from 'react';
import { X, Zap } from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  singleSignature?: boolean;
}

export function ConsentModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Transaction",
  message = "Are you sure you want to proceed?",
  singleSignature = true
}: ConsentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Single Signature Badge */}
        {singleSignature && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-blue-600/20 border border-blue-600/30 rounded-lg">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-200 font-medium">Single Signature Mode ⚡</span>
          </div>
        )}
        
        {/* Message */}
        <p className="text-gray-300 mb-6 leading-relaxed">{message}</p>
        
        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}