import React from 'react';
import './ChatChip.css';

interface ChatChipProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  disabled?: boolean;
}

const ChatChip: React.FC<ChatChipProps> = ({ 
  label, 
  onClick, 
  variant = 'primary', 
  disabled = false 
}) => {
  return (
    <button
      className={`chat-chip chat-chip-${variant} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default ChatChip;

