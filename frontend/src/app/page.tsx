import Link from 'next/link';
import { ArrowRight, BarChart3, BookOpen, BrainCircuit, CheckCircle2, FileUp, Sparkles, Timer, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogoWithText } from '@/components/logo';

const features = [
  { icon: FileUp, title: 'Paper to practice in minutes', text: 'Turn source papers into structured, review-ready questions with an intelligent ingestion workflow.' },
  { icon: Timer, title: 'Built for exam conditions', text: 'Timed attempts, saved answers, review flags, and a focused test workspace keep practice intentional.' },
  { icon: BarChart3, title: 'Make progress visible', text: 'See scores, timing, and topic-level performance so your next session has a clear purpose.' },
];

export default function Home() {
  return <div className="public-shell overflow-hidden">
    <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
      <Link href="/"><LogoWithText size="sm" /></Link>
      <div className="flex items-center gap-2"><Link href="/auth/login"><Button variant="ghost" className="text-slate-600">Log in</Button></Link><Link href="/auth/register"><Button className="rounded-xl bg-indigo-600 px-5 shadow-xl shadow-indigo-200 hover:bg-indigo-700">Get started</Button></Link></div>
    </header>

    <main>
      <section className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-12 md:grid-cols-[1.05fr_.95fr] md:items-center md:px-8 md:pb-28 md:pt-20">
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm"><Sparkles className="h-3.5 w-3.5" />A calmer way to prepare</div>
          <h1 className="max-w-3xl text-5xl font-bold tracking-[-.05em] text-slate-950 md:text-7xl md:leading-[1.02]">Practice with a plan. <span className="text-indigo-600">Perform with confidence.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">ExamPrep AI transforms question papers into a focused practice system — so every session takes you somewhere useful.</p>
          <div className="mt-9 flex flex-wrap gap-3"><Link href="/auth/register"><Button size="lg" className="h-13 rounded-xl bg-indigo-600 px-6 text-base shadow-xl shadow-indigo-200 hover:bg-indigo-700">Start for free <ArrowRight className="ml-2 h-4 w-4" /></Button></Link><a href="#how-it-works"><Button size="lg" variant="outline" className="h-13 rounded-xl border-slate-200 bg-white px-6 text-base">How it works</Button></a></div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-500"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-600" />Free practice papers</span><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-600" />No card required</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-lg animate-rise">
          <div className="absolute -right-12 -top-10 h-64 w-64 rounded-full bg-cyan-200/50 blur-3xl" /><div className="absolute -bottom-8 -left-8 h-52 w-52 rounded-full bg-indigo-200/70 blur-3xl" />
          <div className="relative rounded-[28px] border border-white/80 bg-white p-5 shadow-2xl shadow-indigo-950/10">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white"><BrainCircuit className="h-5 w-5" /></div><div><p className="text-sm font-bold text-slate-900">Today&apos;s practice</p><p className="text-xs text-slate-500">Focused session</p></div></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">On track</span></div>
            <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white"><div className="flex items-center justify-between text-xs text-slate-400"><span>UPSC prelims · Polity</span><span>18:24 left</span></div><p className="mt-5 text-lg font-semibold leading-7">Which provision protects equality before law in India?</p><div className="mt-5 grid gap-2">{['Article 14', 'Article 19', 'Article 21'].map((item, index) => <div key={item} className={index === 0 ? 'rounded-xl border border-indigo-400 bg-indigo-500/20 px-3 py-2.5 text-sm font-medium' : 'rounded-xl border border-slate-700 px-3 py-2.5 text-sm text-slate-300'}><span className="mr-3 text-indigo-300">{String.fromCharCode(65 + index)}</span>{item}</div>)}</div></div>
            <div className="mt-5 grid grid-cols-3 gap-3">{[['78%', 'Best score'], ['12', 'Tests'], ['4.6h', 'This week']].map(([value, label]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><p className="text-lg font-bold text-slate-900">{value}</p><p className="text-[11px] font-medium text-slate-500">{label}</p></div>)}</div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-slate-200/80 bg-white/70 py-20"><div className="mx-auto max-w-7xl px-5 md:px-8"><div className="max-w-xl"><p className="section-kicker">Designed for momentum</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">Less busywork. More meaningful practice.</h2></div><div className="mt-12 grid gap-5 md:grid-cols-3">{features.map((feature, index) => <article key={feature.title} className="soft-card-hover p-6"><div className="mb-8 flex items-center justify-between"><div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><feature.icon className="h-5 w-5" /></div><span className="text-sm font-bold text-slate-300">0{index + 1}</span></div><h3 className="text-lg font-bold text-slate-900">{feature.title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{feature.text}</p></article>)}</div></div></section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-[.8fr_1.2fr] md:items-center md:px-8"><div><p className="section-kicker">A real practice loop</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">Know exactly what to do next.</h2><p className="mt-4 max-w-md leading-7 text-slate-600">Move from paper to attempt to review without losing context. Your most recent results stay close to the next paper you should tackle.</p><Link href="/auth/register"><Button className="mt-7 rounded-xl bg-slate-950 px-5 hover:bg-slate-800">Build your routine <ArrowRight className="ml-2 h-4 w-4" /></Button></Link></div><div className="grid grid-cols-3 gap-3"><div className="rounded-2xl bg-indigo-600 p-5 text-white"><Trophy className="h-5 w-5 text-indigo-200" /><p className="mt-12 text-3xl font-bold">78%</p><p className="mt-1 text-xs text-indigo-100">Your best score</p></div><div className="mt-8 rounded-2xl bg-cyan-50 p-5 text-cyan-950"><BookOpen className="h-5 w-5 text-cyan-700" /><p className="mt-12 text-3xl font-bold">24</p><p className="mt-1 text-xs text-cyan-800">Papers ready</p></div><div className="rounded-2xl bg-slate-950 p-5 text-white"><BarChart3 className="h-5 w-5 text-cyan-300" /><p className="mt-12 text-3xl font-bold">+16</p><p className="mt-1 text-xs text-slate-400">Points improved</p></div></div></section>
    </main>
    <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:px-8"><LogoWithText size="sm" /><p>© {new Date().getFullYear()} ExamPrep AI. Learn with intention.</p></div></footer>
  </div>;
}
