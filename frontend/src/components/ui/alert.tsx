import { cn } from '@/lib/utils';
export function Alert({ className, variant = 'default', children }: { className?: string; variant?: 'default' | 'destructive'; children: React.ReactNode }) {
  return <div className={cn('rounded-lg border p-4', variant === 'destructive' ? 'border-red-800 bg-red-950/50 text-red-400' : 'border-slate-200 bg-slate-50 text-slate-700', className)}>{children}</div>;
}
export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <div className="text-sm">{children}</div>;
}
