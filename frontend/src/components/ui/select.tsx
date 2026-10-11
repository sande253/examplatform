import { cn } from '@/lib/utils';
import React from 'react';
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { className?: string }>(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn('flex h-10 w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50', className)} {...props}>{children}</select>
));
Select.displayName = 'Select';
