'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { testsAPI } from '@/lib/api';
import { AttemptResult } from '@/lib/types';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { Trophy, CheckCircle2, XCircle, Minus, Clock, RotateCcw, ArrowLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

function topicRows(raw: AttemptResult['topic_performance']) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((row: any) => ({
    topic: row.topic || row.name || 'Topic',
    score: Number(row.score ?? row.correct ?? 0),
  }));
  return Object.entries(raw as Record<string, any>).map(([topic, value]) => ({
    topic,
    score: Number(value?.score ?? value?.correct ?? 0),
  }));
}

export default function ResultsPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const router = useRouter();
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testsAPI.getResults(attemptId).then(setResult).catch(() => router.push('/dashboard')).finally(() => setLoading(false));
  }, [attemptId, router]);

  const topics = useMemo(() => (result ? topicRows(result.topic_performance) : []), [result]);

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="mx-auto max-w-5xl space-y-4 px-6 py-10">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-3xl" />)}</div>
      </div>
    );
  }
  if (!result) return null;

  const pct = Math.round(result.score_percentage || 0);
  const tone = pct >= 70 ? 'emerald' : pct >= 40 ? 'amber' : 'rose';
  const headline = pct >= 70 ? 'Strong performance' : pct >= 40 ? 'Solid attempt' : 'Keep going';
  const totalQ = (result.correct_count || 0) + (result.incorrect_count || 0) + (result.unanswered_count || 0);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-10">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-kicker">Attempt report</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Your results</h1>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost" className="text-slate-500"><ArrowLeft className="mr-1 h-4 w-4" />Dashboard</Button>
          </Link>
        </div>

        <section className={cn(
          'overflow-hidden rounded-3xl border p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,.4)] md:p-8',
          tone === 'emerald' && 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white',
          tone === 'amber' && 'border-amber-200 bg-gradient-to-br from-amber-50 to-white',
          tone === 'rose' && 'border-rose-200 bg-gradient-to-br from-rose-50 to-white',
        )}>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className={cn(
                'grid h-14 w-14 place-items-center rounded-2xl',
                tone === 'emerald' && 'bg-emerald-500/15 text-emerald-600',
                tone === 'amber' && 'bg-amber-500/15 text-amber-600',
                tone === 'rose' && 'bg-rose-500/15 text-rose-600',
              )}>
                <Trophy className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">{headline}</p>
                <p className={cn(
                  'text-5xl font-extrabold tracking-tight',
                  tone === 'emerald' && 'text-emerald-600',
                  tone === 'amber' && 'text-amber-600',
                  tone === 'rose' && 'text-rose-600',
                )}>{pct}%</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Correct', value: result.correct_count, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Incorrect', value: result.incorrect_count, icon: XCircle, color: 'text-rose-600 bg-rose-50' },
                { label: 'Skipped', value: result.unanswered_count, icon: Minus, color: 'text-slate-500 bg-slate-100' },
                { label: 'Time', value: `${Math.floor((result.time_taken || 0) / 60)}m`, icon: Clock, color: 'text-indigo-600 bg-indigo-50' },
              ].map((stat) => (
                <div key={stat.label} className="min-w-[104px] rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
                  <stat.icon className={cn('mb-2 h-4 w-4 rounded p-0.5', stat.color)} />
                  <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-5 text-sm text-slate-500">{result.correct_count} of {totalQ || '—'} questions scored correctly.</p>
        </section>

        {topics.length > 0 && (
          <section className="soft-card mt-6 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <h2 className="font-semibold text-slate-900">Topic mix</h2>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topics}>
                  <XAxis dataKey="topic" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="score" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {result.questions_review?.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Question review</h2>
            <div className="space-y-3">
              {result.questions_review.map((q: any, idx: number) => {
                const skipped = q.skipped || q.user_answer == null || q.user_answer === '';
                const isCorrect = q.is_correct === true;
                return (
                  <article
                    key={q.question_id || idx}
                    className={cn(
                      'rounded-2xl border bg-white p-5 shadow-sm',
                      skipped && 'border-slate-200',
                      isCorrect && !skipped && 'border-emerald-200',
                      q.is_correct === false && 'border-rose-200',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {skipped ? <Minus className="mt-0.5 h-5 w-5 text-slate-400" /> : isCorrect ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" /> : <XCircle className="mt-0.5 h-5 w-5 text-rose-500" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">Q{idx + 1}. {q.question_text}</p>
                        {Array.isArray(q.options) && q.options.length > 0 && (
                          <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                            {q.options.map((opt: any) => {
                              const key = opt.key || opt.id || opt.option_key;
                              const text = opt.text || opt.option_text;
                              const chosen = String(q.user_answer) === String(key) || String(q.user_answer).toLowerCase() === String(text).toLowerCase();
                              const correct = String(q.correct_answer) === String(key) || String(q.correct_answer).toLowerCase() === String(text).toLowerCase();
                              return (
                                <div
                                  key={key}
                                  className={cn(
                                    'rounded-xl border px-3 py-2 text-xs',
                                    correct && 'border-emerald-300 bg-emerald-50 text-emerald-800',
                                    chosen && !correct && 'border-rose-300 bg-rose-50 text-rose-800',
                                    !chosen && !correct && 'border-slate-200 text-slate-600',
                                  )}
                                >
                                  <span className="font-semibold">{key}</span> · {text}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <div className="mt-3 flex flex-wrap gap-4 text-sm">
                          <p className="text-slate-500">Your answer: <span className="font-medium text-slate-800">{skipped ? 'Skipped' : String(q.user_answer)}</span></p>
                          {!isCorrect && q.correct_answer != null && (
                            <p className="text-slate-500">Correct: <span className="font-medium text-emerald-700">{String(q.correct_answer)}</span></p>
                          )}
                        </div>
                        {q.explanation && (
                          <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">{q.explanation}</p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {result.paper_id && (
            <Button onClick={() => router.push(`/papers/${result.paper_id}`)} className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
              <RotateCcw className="mr-2 h-4 w-4" />Try again
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push('/papers')} className="rounded-xl">Browse papers</Button>
        </div>
      </main>
    </div>
  );
}
