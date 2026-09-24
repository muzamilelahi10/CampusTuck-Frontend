import React from 'react';
import { formatPKR } from '@campustuck/shared';

interface PriceTagProps {
  paisa: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function PriceTag({ paisa, className = '', size = 'md' }: PriceTagProps) {
  const sizeClasses = {
    sm: 'text-sm font-semibold',
    md: 'text-base font-bold',
    lg: 'text-xl font-extrabold',
    xl: 'text-2xl font-black',
  };

  return (
    <span className={`text-ink tracking-tight ${sizeClasses[size]} ${className}`}>
      {formatPKR(paisa)}
    </span>
  );
}
