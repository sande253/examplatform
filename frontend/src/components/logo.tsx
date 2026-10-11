'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function Logo({ className, size = 'md', animated = true }: LogoProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className={cn('relative', sizes[size], className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('w-full h-full', animated && 'transition-transform duration-300 hover:scale-110')}
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="emerald-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="light-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>

        {/* Graduation cap base */}
        <g className={animated ? 'animate-float' : ''}>
          {/* Cap board */}
          <path
            d="M50 35 L15 48 L50 61 L85 48 Z"
            fill="url(#emerald-gradient)"
            className={animated ? 'transition-all duration-500' : ''}
          />
          
          {/* Cap top highlight */}
          <path
            d="M50 35 L30 43 L50 51 L70 43 Z"
            fill="url(#light-emerald)"
            opacity="0.6"
          />

          {/* Tassel */}
          <circle cx="85" cy="48" r="3" fill="#047857" />
          <line x1="85" y1="51" x2="85" y2="60" stroke="#047857" strokeWidth="1.5" />
          <circle cx="85" cy="62" r="2.5" fill="#10b981" />
        </g>

        {/* Brain/AI circuit pattern */}
        <g opacity="0.9">
          {/* Central node */}
          <circle cx="50" cy="70" r="4" fill="#059669" />
          
          {/* Circuit connections */}
          <line x1="50" y1="70" x2="35" y2="75" stroke="#10b981" strokeWidth="1.5" />
          <line x1="50" y1="70" x2="65" y2="75" stroke="#10b981" strokeWidth="1.5" />
          <line x1="50" y1="70" x2="50" y2="85" stroke="#10b981" strokeWidth="1.5" />
          
          {/* Circuit nodes */}
          <circle cx="35" cy="75" r="2.5" fill="#6ee7b7" />
          <circle cx="65" cy="75" r="2.5" fill="#6ee7b7" />
          <circle cx="50" cy="85" r="2.5" fill="#6ee7b7" />
          
          {/* Small connecting lines */}
          <line x1="35" y1="75" x2="30" y2="80" stroke="#34d399" strokeWidth="1" opacity="0.7" />
          <line x1="65" y1="75" x2="70" y2="80" stroke="#34d399" strokeWidth="1" opacity="0.7" />
          
          {/* End nodes */}
          <circle cx="30" cy="80" r="1.5" fill="#10b981" />
          <circle cx="70" cy="80" r="1.5" fill="#10b981" />
        </g>

        {/* Pulsing ring animation (optional) */}
        {animated && (
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke="url(#emerald-gradient)" 
            strokeWidth="0.5" 
            opacity="0.3"
            className="animate-pulse"
          />
        )}
      </svg>
    </div>
  );
}

export function LogoWithText({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Logo size={size} />
      <span className={cn('font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent', textSizes[size])}>
        ExamPrep AI
      </span>
    </div>
  );
}
