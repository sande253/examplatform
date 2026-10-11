'use client';
import { cn } from '@/lib/utils';
import React from 'react';

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (o: boolean) => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60" onClick={() => onOpenChange(false)} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
export function DialogContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl', className)}>{children}</div>;
}
export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}
export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold text-white">{children}</h2>;
}
export function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-400 mt-1">{children}</p>;
}
export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end gap-3 mt-6">{children}</div>;
}
