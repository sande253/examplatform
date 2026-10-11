'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerProps {
  timeRemaining: number; // in seconds
  onExpire: () => void;
}

export function Timer({ timeRemaining, onExpire }: TimerProps) {
  const [time, setTime] = useState(timeRemaining);

  useEffect(() => {
    setTime(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    if (time <= 0) {
      onExpire();
      return;
    }

    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [time, onExpire]);

  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  const formatTime = () => {
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isWarning = time < 300 && time >= 60;
  const isCritical = time < 60;

  return (
    <div className="flex items-center gap-2">
      <Clock className={cn(
        'w-5 h-5',
        isCritical ? 'text-red-500' : isWarning ? 'text-red-400' : 'text-slate-400'
      )} />
      <span
        className={cn(
          'font-mono',
          isCritical && 'text-red-500 font-bold text-xl animate-pulse',
          isWarning && 'text-red-400 animate-pulse',
          !isWarning && !isCritical && 'text-slate-300'
        )}
      >
        {formatTime()}
      </span>
    </div>
  );
}
