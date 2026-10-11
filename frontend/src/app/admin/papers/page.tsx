'use client';
import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { Paper } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Plus, BookOpen, Send, RefreshCw } from 'lucide-react';

export default function AdminPapersPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { const d = await adminAPI.listAdminPapers(); setPapers(d.items || d); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handlePublish = async (id: string) => {
    setPublishing(id);
    try { await adminAPI.publishPaper(id); await load(); } catch {} finally { setPublishing(null); }
  };

  return (
    <div className="admin-page">
      <div className="mb-7 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[.16em] text-cyan-300">Publishing</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Paper builder</h1><p className="mt-2 text-sm text-slate-400">Assemble and publish practice experiences for learners.</p></div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={load} className="text-slate-400"><RefreshCw className="w-4 h-4" /></Button>
          <Link href="/admin/papers/new"><Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="w-4 h-4 mr-2" />Create Paper</Button></Link>
        </div>
      </div>

      <Card className="border-white/10 bg-slate-900/70 shadow-xl shadow-slate-950/10">
        <CardContent className="pt-4">
          {loading ? <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : papers.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">No papers yet</p>
              <Link href="/admin/papers/new"><Button className="bg-indigo-600 hover:bg-indigo-700">Create First Paper</Button></Link>
            </div>
          ) : (
            <div className="space-y-2">
              {papers.map(paper => (
                <div key={paper.id} className="flex items-center gap-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                  <div className="flex-1">
                    <p className="text-white font-medium">{paper.title}</p>
                    <div className="flex gap-2 mt-1">
                      {paper.subject && <Badge variant="secondary" className="text-xs">{paper.subject}</Badge>}
                      <Badge variant={paper.access_type === 'FREE' ? 'success' : 'default'} className="text-xs">{paper.access_type}</Badge>
                      <span className="text-slate-400 text-xs">{(paper as any).total_questions ?? paper.questions_count ?? 0}Q · {(paper as any).duration_minutes ?? paper.duration ?? 0}min</span>
                    </div>
                  </div>
                  <Badge variant={(paper as any).status === 'PUBLISHED' ? 'success' : 'secondary'}>{(paper as any).status || 'DRAFT'}</Badge>
                  {(paper as any).status !== 'PUBLISHED' && (
                    <Button size="sm" onClick={() => handlePublish(paper.id)} disabled={publishing === paper.id} className="bg-indigo-600 hover:bg-indigo-700 text-xs">
                      <Send className="w-3 h-3 mr-1" />{publishing === paper.id ? 'Publishing...' : 'Publish'}
                    </Button>
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
