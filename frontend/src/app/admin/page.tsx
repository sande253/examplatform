'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminAPI } from '@/lib/api';
import { AdminAnalytics } from '@/lib/types';
import { ArrowRight, BarChart3, BookOpen, FilePlus2, HelpCircle, Sparkles, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminOverviewPage() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  useEffect(() => { adminAPI.getAdminAnalytics().then(setData).catch(console.error); }, []);
  const stats = data ? [
    { label: 'Learners', value: data.total_users, note: `${data.registrations_this_month} joined this month`, icon: Users, tone: 'text-cyan-300 bg-cyan-400/10' },
    { label: 'Published papers', value: data.total_papers, note: 'Ready for student practice', icon: BookOpen, tone: 'text-violet-300 bg-violet-400/10' },
    { label: 'Question bank', value: data.total_questions, note: 'Available for assembly', icon: HelpCircle, tone: 'text-amber-300 bg-amber-400/10' },
    { label: 'Test attempts', value: data.total_tests_taken, note: `${data.tests_this_month} this month`, icon: BarChart3, tone: 'text-emerald-300 bg-emerald-400/10' },
  ] : [];

  return <div className="admin-page">
    <div className="flex flex-col gap-5 border-b border-white/10 pb-7 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-cyan-300">Operations overview</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Everything in motion.</h1><p className="mt-2 text-sm text-slate-400">Manage content, learners, and the quality of every practice experience.</p></div><Link href="/admin/papers/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-400"><FilePlus2 className="h-4 w-4" />Create a paper</Link></div>
    <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{data ? stats.map((stat) => <div key={stat.label} className="admin-panel p-5"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-400">{stat.label}</p><p className="mt-2 text-3xl font-bold tracking-tight text-white">{Number(stat.value ?? 0).toLocaleString()}</p></div><div className={`grid h-10 w-10 place-items-center rounded-xl ${stat.tone}`}><stat.icon className="h-5 w-5" /></div></div><p className="mt-5 text-xs text-slate-500">{stat.note}</p></div>) : [...Array(4)].map((_, index) => <Skeleton key={index} className="h-40 rounded-2xl bg-slate-800" />)}</section>
    <section className="mt-7 grid gap-5 lg:grid-cols-[1.3fr_.7fr]"><div className="admin-panel p-6"><div className="flex items-center justify-between"><div><p className="font-semibold text-white">Content workflow</p><p className="mt-1 text-sm text-slate-400">A clear route from raw files to student-ready papers.</p></div><Sparkles className="h-5 w-5 text-cyan-300" /></div><div className="mt-7 grid gap-3 sm:grid-cols-3">{[{number:'01', title:'Ingest', text:'Upload source PDFs and start extraction.', href:'/admin/documents'}, {number:'02', title:'Review', text:'Approve the questions worth keeping.', href:'/admin/questions'}, {number:'03', title:'Publish', text:'Assemble polished practice papers.', href:'/admin/papers'}].map((step) => <Link key={step.number} href={step.href} className="group rounded-xl border border-white/8 bg-slate-950/45 p-4 transition hover:border-indigo-400/40 hover:bg-slate-900"><p className="text-xs font-bold text-cyan-300">{step.number}</p><p className="mt-5 font-semibold text-white">{step.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{step.text}</p><ArrowRight className="mt-4 h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-cyan-300" /></Link>)}</div></div><div className="admin-panel p-6"><p className="font-semibold text-white">Premium health</p><p className="mt-1 text-sm text-slate-400">Your current subscriber snapshot.</p><div className="mt-8 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-400/10 p-5"><p className="text-4xl font-bold text-white">{data?.premium_subscribers?.toLocaleString() ?? '—'}</p><p className="mt-1 text-sm text-slate-300">active premium learners</p><Link href="/admin/users" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-cyan-300 hover:text-cyan-200">Manage access <ArrowRight className="h-4 w-4" /></Link></div></div></section>
  </div>;
}
