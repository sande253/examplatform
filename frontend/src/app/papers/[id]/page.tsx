'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { papersAPI, testsAPI } from '@/lib/api';
import { Paper, AttemptResult } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { Clock, HelpCircle, Lock, BookOpen, Play, AlertCircle, ArrowLeft } from 'lucide-react';

export default function PaperDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, subscription } = useAuth();
  const { toast } = useToast();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [history, setHistory] = useState<AttemptResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [paperResult, historyResult] = await Promise.allSettled([
          papersAPI.get(id),
          testsAPI.getHistory(),
        ]);
        if (paperResult.status === 'fulfilled') {
          setPaper(paperResult.value);
        }
        if (historyResult.status === 'fulfilled') {
          const attempts = historyResult.value || [];
          setHistory(attempts.filter((a: any) => a.paper_id === id));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const canAccess = paper?.access_type === 'FREE' || subscription?.is_active;

  const handleStart = async () => {
    if (!canAccess) { router.push('/pricing'); return; }
    setStarting(true);
    try {
      const attempt = await testsAPI.start(id);
      router.push(`/test/${attempt.id}`);
    } catch (e: any) {
      toast({ title: 'Error', description: e?.response?.data?.detail || 'Failed to start test. Please try again.', variant: 'destructive' });
      setStarting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0F172A]"><Navbar />
      <div className="container mx-auto px-6 py-8 space-y-4">
        <Skeleton className="h-8 w-48" /><Skeleton className="h-48 w-full" />
      </div>
    </div>
  );

  if (!paper) return (
    <div className="min-h-screen bg-[#0F172A] text-white"><Navbar />
      <div className="container mx-auto px-6 py-20 text-center"><p className="text-slate-400">Paper not found.</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-50">
      <Navbar />
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <Link href="/papers"><Button variant="ghost" className="text-slate-400 hover:text-white mb-6"><ArrowLeft className="w-4 h-4 mr-2" />Back to Papers</Button></Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Paper Info */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-white text-xl">{paper.title}</CardTitle>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {paper.subject && <Badge variant="secondary">{paper.subject}</Badge>}
                      {paper.exam && <Badge variant="outline">{paper.exam}</Badge>}
                      <Badge variant={paper.access_type === 'FREE' ? 'success' : 'default'}>
                        {paper.access_type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {paper.description && <p className="text-slate-300">{paper.description}</p>}
                <Separator />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><p className="text-2xl font-bold text-white">{paper.questions_count}</p><p className="text-slate-400 text-sm">Questions</p></div>
                  <div><p className="text-2xl font-bold text-white">{paper.duration}</p><p className="text-slate-400 text-sm">Minutes</p></div>
                  <div><p className="text-2xl font-bold text-white">{paper.marks}</p><p className="text-slate-400 text-sm">Marks</p></div>
                </div>
                {paper.instructions && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-white font-semibold mb-2">Instructions</h3>
                      <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{paper.instructions}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Past Attempts */}
            {history.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader><CardTitle className="text-white text-base">Your Previous Attempts</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {history.map((a) => (
                      <Link key={a.id} href={`/test/${a.id}/results`}>
                        <div className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                          <div><p className="text-slate-300 text-sm">Attempt #{a.id.slice(0,6)}</p></div>
                          <p className={`font-bold ${a.score_percentage >= 70 ? 'text-emerald-400' : a.score_percentage >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{Math.round(a.score_percentage)}%</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Card */}
          <div>
            <Card className="bg-slate-800/50 border-slate-700 sticky top-24">
              <CardContent className="pt-6 space-y-4">
                {!canAccess ? (
                  <>
                    <div className="text-center py-4">
                      <Lock className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                      <p className="text-white font-semibold">Premium Content</p>
                      <p className="text-slate-400 text-sm mt-1">Upgrade to access this paper</p>
                    </div>
                    <Link href="/pricing" className="block">
                      <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">Unlock Premium — ₹199/mo</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="text-center py-2">
                      <Play className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                      <p className="text-white font-semibold">Ready to test yourself?</p>
                    </div>
                    <Button onClick={handleStart} disabled={starting} className="w-full bg-indigo-600 hover:bg-indigo-700">
                      {starting ? 'Starting...' : 'Start Test'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
