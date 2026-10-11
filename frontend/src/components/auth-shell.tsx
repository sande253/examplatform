import Link from 'next/link';
import { BarChart3, BrainCircuit, CheckCircle2, Sparkles } from 'lucide-react';
import { LogoWithText } from '@/components/logo';

export function AuthShell({ children, mode }: { children: React.ReactNode; mode: 'login' | 'register' }) {
  const creatingAccount = mode === 'register';
  return <div className="min-h-screen bg-[#f7f8ff] p-4 md:p-6">
    <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[28px] border border-white bg-white shadow-2xl shadow-indigo-950/10 md:grid-cols-[.95fr_1.05fr] md:min-h-[calc(100vh-3rem)]">
      <aside className="relative hidden overflow-hidden bg-slate-950 p-10 text-white md:flex md:flex-col">
        <div className="absolute -right-24 -top-20 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl" /><div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
        <Link href="/" className="relative z-10"><LogoWithText size="sm" className="[&>span]:from-white [&>span]:to-cyan-200" /></Link>
        <div className="relative z-10 my-auto"><div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-cyan-200"><BrainCircuit className="h-6 w-6" /></div><p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-200">ExamPrep AI</p><h1 className="mt-3 max-w-sm text-4xl font-bold tracking-tight">{creatingAccount ? 'Your next best score starts here.' : 'Welcome back to focused practice.'}</h1><p className="mt-5 max-w-sm leading-7 text-slate-300">{creatingAccount ? 'Build a practice routine around real papers, timed attempts, and clear progress.' : 'Pick up where you left off and turn today’s practice into tomorrow’s confidence.'}</p></div>
        <div className="relative z-10 grid gap-3"><div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"><BarChart3 className="h-5 w-5 text-cyan-300" /><div><p className="text-sm font-semibold">Progress with context</p><p className="text-xs text-slate-400">See the next skill to sharpen.</p></div></div><div className="flex items-center gap-2 text-xs text-slate-400"><CheckCircle2 className="h-4 w-4 text-emerald-300" />Practice is free to start.</div></div>
      </aside>
      <main className="flex flex-col p-6 sm:p-10 md:p-14"><div className="mb-10 flex items-center justify-between md:hidden"><Link href="/"><LogoWithText size="sm" /></Link><Sparkles className="h-5 w-5 text-indigo-500" /></div>{children}</main>
    </div>
  </div>;
}
