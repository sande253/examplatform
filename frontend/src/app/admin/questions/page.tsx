'use client';
import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { AdminQuestion } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const data = await adminAPI.listQuestions(params);
      setQuestions(data.items || data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [search, statusFilter]);

  const handleApprove = async (id: string) => {
    try { await adminAPI.approveQuestion(id); setQuestions(qs => qs.map(q => q.id === id ? { ...q, approval_status: 'APPROVED' } : q)); } catch {}
  };
  const handleReject = async (id: string) => {
    try { await adminAPI.rejectQuestion(id); setQuestions(qs => qs.map(q => q.id === id ? { ...q, approval_status: 'REJECTED' } : q)); } catch {}
  };
  const handleBulkApprove = async () => {
    setBulkLoading(true);
    try { await adminAPI.bulkApprove(Array.from(selected)); setSelected(new Set()); await load(); } catch {} finally { setBulkLoading(false); }
  };

  const toggleSelect = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="admin-page">
      <div className="mb-7 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[.16em] text-cyan-300">Quality control</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Question bank</h1><p className="mt-2 text-sm text-slate-400">Review extracted questions before they reach a paper.</p></div>
        {selected.size > 0 && (
          <Button onClick={handleBulkApprove} disabled={bulkLoading} className="bg-emerald-600 hover:bg-emerald-700">
            <CheckCircle2 className="w-4 h-4 mr-2" />{bulkLoading ? 'Approving...' : `Approve Selected (${selected.size})`}
          </Button>
        )}
      </div>
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input className="admin-input pl-10" placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select className="w-44" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </Select>
        <Button variant="ghost" onClick={load} className="text-slate-400"><RefreshCw className="w-4 h-4" /></Button>
      </div>

      <Card className="border-white/10 bg-slate-900/70 shadow-xl shadow-slate-950/10">
        <CardContent className="pt-4">
          {loading ? <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div> : questions.length === 0 ? (
            <div className="text-center py-12"><p className="text-slate-400">No questions found</p></div>
          ) : (
            <div className="space-y-2">
              {questions.map(q => (
                <div key={q.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-slate-950/45 p-3 transition hover:border-white/15">
                  <input type="checkbox" checked={selected.has(q.id)} onChange={() => toggleSelect(q.id)} className="w-4 h-4 accent-indigo-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{q.question_text}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{q.subject}</Badge>
                      <Badge variant="outline" className="text-xs">{q.difficulty}</Badge>
                      <Badge variant="outline" className="text-xs">{q.question_type}</Badge>
                    </div>
                  </div>
                  <Badge variant={q.approval_status === 'APPROVED' ? 'success' : q.approval_status === 'REJECTED' ? 'destructive' : 'secondary'}>{q.approval_status}</Badge>
                  {q.approval_status !== 'APPROVED' && (
                    <Button size="sm" onClick={() => handleApprove(q.id)} className="bg-emerald-600 hover:bg-emerald-700 text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />Approve</Button>
                  )}
                  {q.approval_status !== 'REJECTED' && (
                    <Button size="sm" onClick={() => handleReject(q.id)} variant="ghost" className="text-red-400 border border-red-800 hover:bg-red-950/30 text-xs"><XCircle className="w-3 h-3 mr-1" />Reject</Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
