import React from 'react';

interface InlineNoticeProps {
  text: string;
  type?: 'error' | 'warning' | 'info';
}

export function InlineNotice({ text, type = 'warning' }: InlineNoticeProps) {
  const bgColor = {
    error: 'rgba(239, 68, 68, 0.1)',
    warning: 'rgba(245, 158, 11, 0.1)',
    info: 'rgba(59, 130, 246, 0.1)'
  };

  const textColor = {
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };

  const borderColor = {
    error: 'rgba(239, 68, 68, 0.3)',
    warning: 'rgba(245, 158, 11, 0.3)',
    info: 'rgba(59, 130, 246, 0.3)'
  };

  return (
    <div 
      style={{
        padding: '12px 16px',
        backgroundColor: bgColor[type],
        color: textColor[type],
        border: `1px solid ${borderColor[type]}`,
        borderRadius: '6px',
        fontSize: '14px',
        margin: '16px 0'
      }}
    >
      {text}
    </div>
  );
}
