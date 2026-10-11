import { cn } from '@/lib/utils';
export function Separator({ className, orientation = 'horizontal', ...props }: { className?: string; orientation?: 'horizontal' | 'vertical'; [key: string]: any }) {
  return <div className={cn('bg-slate-700', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)} {...props} />;
}
