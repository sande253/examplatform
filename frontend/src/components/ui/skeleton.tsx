import { cn } from '@/lib/utils';
export function Skeleton({ className, ...props }: { className?: string; [key: string]: any }) {
  return <div className={cn('animate-pulse rounded-md bg-slate-700/50', className)} {...props} />;
}
