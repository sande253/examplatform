'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { testsAPI, papersAPI } from '@/lib/api';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, CheckCircle, TrendingUp, Calendar, Lock, ArrowRight, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { AttemptResult, Paper } from '@/lib/types';

export default function DashboardPage() {
  const { user, subscription } = useAuth();
  const [history, setHistory] = useState<AttemptResult[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [hist, paps] = await Promise.allSettled([
          testsAPI.getHistory(),
          papersAPI.list({ page: 1, size: 6 }),
        ]);
        if (hist.status === 'fulfilled') setHistory((hist.value || []).slice(0, 5));
        if (paps.status === 'fulfilled') setPapers(paps.value.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const avgScore = history.length ? Math.round(history.reduce((a, h) => a + h.score_percentage, 0) / history.length) : 0;
  const bestScore = history.length ? Math.round(Math.max(...history.map(h => h.score_percentage))) : 0;

  return (
    <div className="app-shell">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-kicker">Your study space</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Welcome back, {user?.name?.split(' ')[0]}.</h1>
            <p className="mt-1 text-slate-500">Pick up the practice that moves you forward.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={subscription?.is_active ? 'success' : 'secondary'} className="text-sm px-3 py-1">
              {subscription?.plan || 'FREE'} Plan
            </Badge>
            {!subscription?.is_active && (
              <Link href="/pricing">
                <Button className="rounded-xl bg-indigo-600 text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700">Upgrade to Premium</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Tests Taken', value: history.length, icon: BookOpen, color: 'text-emerald-500' },
            { label: 'Average Score', value: `${avgScore}%`, icon: TrendingUp, color: 'text-emerald-600' },
            { label: 'Best Score', value: `${bestScore}%`, icon: Trophy, color: 'text-yellow-500' },
            { label: 'This Month', value: history.filter(h => new Date(h.time_taken).getMonth() === new Date().getMonth()).length, icon: Calendar, color: 'text-teal-500' },
          ].map((stat) => (
            <Card key={stat.label} className="soft-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? <Skeleton className="h-8 w-16" /> : stat.value}</p>
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50"><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Attempts */}
          <div className="lg:col-span-2">
            <Card className="soft-card">
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-500" />Recent Attempts</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No tests taken yet</p>
                    <Link href="/papers"><Button className="mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-700">Browse Papers</Button></Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((attempt) => (
                      <Link key={attempt.id} href={`/test/${attempt.id}/results`}>
                        <div className="flex items-center justify-between rounded-xl border border-transparent p-3 transition-colors hover:border-indigo-100 hover:bg-indigo-50/40">
                          <div>
                            <p className="text-slate-900 font-medium text-sm">Test #{attempt.id.slice(0, 8)}</p>
                            <p className="text-slate-600 text-xs">{attempt.correct_count}✓ {attempt.incorrect_count}✗ {attempt.unanswered_count} skipped</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold text-lg ${attempt.score_percentage >= 70 ? 'text-emerald-400' : attempt.score_percentage >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {Math.round(attempt.score_percentage)}%
                            </p>
                            <p className="text-slate-500 text-xs">{Math.floor(attempt.time_taken / 60)}m {attempt.time_taken % 60}s</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Available Papers */}
          <div>
            <Card className="soft-card">
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-emerald-500" />Papers</span>
                  <Link href="/papers"><Button variant="ghost" size="sm" className="text-emerald-600 text-xs">View All <ArrowRight className="w-3 h-3 ml-1" /></Button></Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                ) : (
                  <div className="space-y-2">
                    {papers.map((paper) => (
                      <Link key={paper.id} href={`/papers/${paper.id}`}>
                        <div className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-indigo-50/50">
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-900 text-sm font-medium truncate">{paper.title}</p>
                            <p className="text-slate-600 text-xs">{paper.questions_count}Q · {paper.duration}min</p>
                          </div>
                          {paper.access_type === 'PREMIUM' ? (
                            <Lock className="w-4 h-4 text-yellow-500 flex-shrink-0 ml-2" />
                          ) : (
                            <Badge variant="success" className="text-xs ml-2">Free</Badge>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
