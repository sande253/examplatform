import { cn } from '@/lib/utils';
export function Badge({ className, variant = 'default', children, ...props }: { className?: string; variant?: 'default' | 'secondary' | 'success' | 'destructive' | 'outline'; children: React.ReactNode; [key: string]: any }) {
  const variants = {
    default: 'bg-indigo-600 text-white',
    secondary: 'bg-slate-700 text-slate-200',
    success: 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30',
    destructive: 'bg-red-600/20 text-red-400 border border-red-600/30',
    outline: 'border border-slate-600 text-slate-300',
  };
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', variants[variant], className)} {...props}>{children}</span>;
}
