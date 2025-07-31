import React from 'react';

interface LogoProps {
  variant?: 'black' | 'white' | 'teal' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ variant = 'teal', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    black: 'text-cyphr-black',
    white: 'text-cyphr-white',
    teal: 'text-cyphr-teal',
    pink: 'text-cyphr-pink'
  };

  return (
    <svg 
      className={`${sizeClasses[size]} ${colorClasses[variant]} ${className}`}
      viewBox="0 0 32 32" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Stylized bat/bird logo */}
      <path d="M16 4L20 12L24 8L20 16L28 20L20 24L24 28L20 20L16 28L12 20L8 28L12 24L4 20L12 16L8 12L12 8L16 4Z" />
    </svg>
  );
};

export default Logo; 