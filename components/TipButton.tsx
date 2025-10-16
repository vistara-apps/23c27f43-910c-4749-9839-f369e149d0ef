'use client';

import { useState } from 'react';
import { formatUSDC } from '@/lib/utils';
import type { TipAmount } from '@/lib/types';

interface TipButtonProps {
  amount: TipAmount;
  onTip: (amount: TipAmount) => void;
  disabled?: boolean;
}

export function TipButton({ amount, onTip, disabled = false }: TipButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={() => onTip(amount)}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative overflow-hidden rounded-lg px-6 py-4 font-semibold text-white
        transition-all duration-300 transform
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
        ${isHovered && !disabled ? 'shadow-xl' : 'shadow-lg'}
      `}
      style={{
        background: disabled 
          ? 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)'
          : 'linear-gradient(135deg, #0052ff 0%, #0041cc 100%)',
      }}
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        <span className="text-2xl">💰</span>
        <span className="text-lg">{formatUSDC(amount)}</span>
      </div>
      {isHovered && !disabled && (
        <div className="absolute inset-0 bg-white opacity-10" />
      )}
    </button>
  );
}
