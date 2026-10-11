'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { testsAPI } from '@/lib/api';
import { AttemptResult } from '@/lib/types';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Eye, Calendar, Clock, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HistoryPage() {
  const [history, setHistory] = useState<AttemptResult[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const data = await testsAPI.getHistory();
        setHistory(data);
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBadgeVariant = (score: number): 'success' | 'destructive' | 'default' => {
    if (score >= 70) return 'success';
    if (score >= 40) return 'default';
    return 'destructive';
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Test History</h1>
          <p className="text-slate-600">View all your past test attempts and results</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No tests taken yet
            </h3>
            <p className="text-slate-600 mb-6">
              Start your first test to see your history here
            </p>
            <Button
              onClick={() => router.push('/papers')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Browse Papers
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((result) => (
              <Card
                key={result.id}
                className="bg-white border-slate-200 hover:border-indigo-300 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            Test #{result.id.slice(0, 8)}
                          </h3>
                          <p className="text-slate-600 text-sm">
                            Paper ID: {result.paper_id}
                          </p>
                        </div>
                        <Badge
                          variant={getScoreBadgeVariant(result.score_percentage)}
                          className="text-lg px-4 py-1"
                        >
                          {result.score_percentage.toFixed(1)}%
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 mb-1">Correct</p>
                          <p className="text-emerald-600 font-semibold">
                            {result.correct_count}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Incorrect</p>
                          <p className="text-red-600 font-semibold">
                            {result.incorrect_count}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Unanswered</p>
                          <p className="text-slate-600 font-semibold">
                            {result.unanswered_count}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Time Taken</p>
                          <p className="text-slate-700 font-semibold">
                            {formatDuration(result.time_taken)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="md:ml-4">
                      <Button
                        onClick={() => router.push(`/test/${result.id}/results`)}
                        className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Results
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
