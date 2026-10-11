'use client';
import { cn } from '@/lib/utils';
import React, { createContext, useContext, useState } from 'react';

const TabsCtx = createContext({ value: '', onChange: (v: string) => {} });
export function Tabs({ defaultValue, value, onValueChange, children, className }: any) {
  const [internal, setInternal] = useState(defaultValue || '');
  const current = value ?? internal;
  return (
    <TabsCtx.Provider value={{ value: current, onChange: (v) => { setInternal(v); onValueChange?.(v); } }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsCtx.Provider>
  );
}
export function TabsList({ children, className }: any) {
  return <div className={cn('flex gap-1 rounded-lg bg-slate-800 p-1', className)}>{children}</div>;
}
export function TabsTrigger({ value, children, className }: any) {
  const ctx = useContext(TabsCtx);
  return (
    <button onClick={() => ctx.onChange(value)} className={cn('flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all', ctx.value === value ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white', className)}>
      {children}
    </button>
  );
}
export function TabsContent({ value, children }: any) {
  const ctx = useContext(TabsCtx);
  if (ctx.value !== value) return null;
  return <div>{children}</div>;
}
