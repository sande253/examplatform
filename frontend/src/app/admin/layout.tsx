'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, BookOpen, ChevronLeft, FileText, HelpCircle, LayoutDashboard, LogOut, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

const navigation = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/documents', label: 'Content intake', icon: FileText },
  { href: '/admin/questions', label: 'Question bank', icon: HelpCircle },
  { href: '/admin/papers', label: 'Paper builder', icon: BookOpen },
  { href: '/admin/users', label: 'Learners', icon: Users },
  { href: '/admin/analytics', label: 'Insights', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => { if (!isLoading && (!user || user.role !== 'ADMIN')) router.push('/dashboard'); }, [user, isLoading, router]);
  if (isLoading || !user) return <div className="min-h-screen bg-slate-950" />;

  return <div className="min-h-screen bg-[#0b1120] text-slate-100 md:flex">
    <aside className="flex border-b border-white/10 bg-slate-950/75 md:sticky md:top-0 md:h-screen md:w-72 md:flex-col md:border-b-0 md:border-r">
      <div className="flex h-20 items-center gap-3 px-5"><div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/20"><ShieldCheck className="h-5 w-5 text-white" /></div><div><p className="font-bold tracking-tight text-white">ExamPrep Control</p><p className="text-[11px] font-medium uppercase tracking-widest text-cyan-300">Admin portal</p></div></div>
      <nav className="hidden flex-1 space-y-1 px-3 py-4 md:block" aria-label="Admin navigation">{navigation.map((item) => { const active = item.exact ? pathname === item.href : pathname.startsWith(item.href); return <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition', active ? 'bg-indigo-500/15 text-white shadow-sm ring-1 ring-inset ring-indigo-400/20' : 'text-slate-400 hover:bg-white/5 hover:text-white')}><item.icon className={cn('h-4 w-4', active && 'text-cyan-300')} />{item.label}{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-300" />}</Link>; })}</nav>
      <div className="hidden border-t border-white/10 p-3 md:block"><div className="mb-3 rounded-xl bg-white/5 px-3 py-2.5"><p className="truncate text-sm font-semibold text-white">{user.name}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div><Link href="/dashboard" className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"><ChevronLeft className="h-4 w-4" />Student experience</Link><button onClick={() => { logout(); router.push('/'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-300 transition hover:bg-rose-400/10"><LogOut className="h-4 w-4" />Sign out</button></div>
      <div className="flex flex-1 items-center gap-2 overflow-x-auto px-4 md:hidden">{navigation.map((item) => { const active = item.exact ? pathname === item.href : pathname.startsWith(item.href); return <Link key={item.href} href={item.href} className={cn('shrink-0 rounded-full px-3 py-2 text-xs font-semibold', active ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400')}><item.icon className="mr-1 inline h-3.5 w-3.5" />{item.label}</Link>; })}</div>
    </aside>
    <main className="min-w-0 flex-1">{children}</main>
  </div>;
}
