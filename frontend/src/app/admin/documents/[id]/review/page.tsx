'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import { AdminQuestion } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, XCircle, ChevronLeft, CheckSquare } from 'lucide-react';
import Link from 'next/link';

export default function DocumentReviewPage() {
  const { id } = useParams<{ id: string }>();
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const load = async () => {
    try { const q = await adminAPI.getDocumentQuestions(id); setQuestions(q.items || q); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const handleApprove = async (qId: string) => {
    setApproving(qId);
    try { await adminAPI.approveQuestion(qId); setQuestions(qs => qs.map(q => q.id === qId ? { ...q, approval_status: 'APPROVED' } : q)); }
    catch { } finally { setApproving(null); }
  };

  const handleReject = async (qId: string) => {
    setApproving(qId);
    try { await adminAPI.rejectQuestion(qId); setQuestions(qs => qs.map(q => q.id === qId ? { ...q, approval_status: 'REJECTED' } : q)); }
    catch { } finally { setApproving(null); }
  };

  const handleBulkApprove = async () => {
    setBulkLoading(true);
    const draftIds = questions.filter(q => q.approval_status === 'DRAFT').map(q => q.id);
    try { await adminAPI.bulkApprove(draftIds); await load(); }
    catch { } finally { setBulkLoading(false); }
  };

  const draftCount = questions.filter(q => q.approval_status === 'DRAFT').length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/documents"><Button variant="ghost" className="text-slate-400"><ChevronLeft className="w-4 h-4" /></Button></Link>
          <h1 className="text-2xl font-bold text-white">Review Extracted Questions</h1>
        </div>
        {draftCount > 0 && (
          <Button onClick={handleBulkApprove} disabled={bulkLoading} className="bg-emerald-600 hover:bg-emerald-700">
            <CheckSquare className="w-4 h-4 mr-2" />{bulkLoading ? 'Approving...' : `Approve All (${draftCount})`}
          </Button>
        )}
      </div>

      {loading ? <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div> : questions.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-12 pb-12 text-center"><p className="text-slate-400">No questions extracted yet. Process the document first.</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <Card key={q.id} className={`border ${ q.approval_status === 'APPROVED' ? 'border-emerald-700/50 bg-emerald-950/10' : q.approval_status === 'REJECTED' ? 'border-red-700/50 bg-red-950/10' : 'border-slate-700 bg-slate-800/50'}`}>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-4">
                  <span className="text-slate-500 text-sm font-mono w-6 flex-shrink-0 mt-0.5">Q{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm mb-3">{q.question_text}</p>
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {q.options.map(opt => (
                          <div key={opt.option_key} className={`text-xs p-2 rounded border ${ String(q.correct_answer) === opt.option_key ? 'border-emerald-600/50 bg-emerald-950/30 text-emerald-300' : 'border-slate-700 bg-slate-900/50 text-slate-400'}`}>
                            <span className="font-bold">{opt.option_key}.</span> {opt.option_text}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="secondary">{q.subject}</Badge>
                      <Badge variant="outline">{q.difficulty}</Badge>
                      <Badge variant="outline">{q.question_type}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Badge variant={q.approval_status === 'APPROVED' ? 'success' : q.approval_status === 'REJECTED' ? 'destructive' : 'secondary'}>
                      {q.approval_status}
                    </Badge>
                    {q.approval_status === 'DRAFT' && (
                      <>
                        <Button size="sm" onClick={() => handleApprove(q.id)} disabled={approving === q.id} className="bg-emerald-600 hover:bg-emerald-700 text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />Approve</Button>
                        <Button size="sm" onClick={() => handleReject(q.id)} disabled={approving === q.id} variant="ghost" className="text-red-400 border border-red-800 hover:bg-red-950/30 text-xs"><XCircle className="w-3 h-3 mr-1" />Reject</Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
