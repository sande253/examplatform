'use client';
import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { AdminAnalytics } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, HelpCircle, BarChart2, TrendingUp, Crown } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAdminAnalytics().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const stats = data ? [
    { label: 'Total Users', value: data.total_users, icon: Users, color: 'text-indigo-400' },
    { label: 'Total Papers', value: data.total_papers, icon: BookOpen, color: 'text-emerald-400' },
    { label: 'Total Questions', value: data.total_questions, icon: HelpCircle, color: 'text-yellow-400' },
    { label: 'Tests Taken', value: data.total_tests_taken, icon: BarChart2, color: 'text-purple-400' },
    { label: 'Premium Users', value: data.premium_subscribers, icon: Crown, color: 'text-yellow-400' },
    { label: 'New This Month', value: data.registrations_this_month, icon: TrendingUp, color: 'text-blue-400' },
  ] : [];

  const chartData = data ? [
    { name: 'New Users', value: data.registrations_this_month || 0 },
    { name: 'Tests/Month', value: data.tests_this_month || 0 },
    { name: 'Premium', value: data.premium_subscribers || 0 },
  ] : [];

  return (
    <div className="admin-page">
      <div className="mb-7 border-b border-white/10 pb-6"><p className="text-xs font-bold uppercase tracking-[.16em] text-cyan-300">Performance</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Platform insights</h1><p className="mt-2 text-sm text-slate-400">A high-level view of learner activity and content inventory.</p></div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 mb-6">
        {loading ? [...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />) :
          stats.map(stat => (
            <Card key={stat.label} className="border-white/10 bg-slate-900/70 shadow-xl shadow-slate-950/10">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div><p className="text-slate-400 text-sm">{stat.label}</p><p className="text-2xl font-bold text-white mt-1">{Number(stat.value ?? 0).toLocaleString()}</p></div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))
        }
      </div>

      {!loading && data && (
        <Card className="border-white/10 bg-slate-900/70 shadow-xl shadow-slate-950/10">
          <CardHeader><CardTitle className="text-white">Activity overview</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8 }} />
                <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
