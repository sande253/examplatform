'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { testsAPI } from '@/lib/api';
import { TestState, TestAttemptQuestion, QuestionOption } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Flag, Send, CheckCircle2, AlertCircle, Clock3, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function choiceList(q: TestAttemptQuestion): QuestionOption[] {
  const existing = q.question?.options || [];
  if (existing.length > 0) return existing;
  const text = q.question?.text || '';
  if (/true or false/i.test(text) || q.question?.type === 'MCQ') {
    if (/true or false/i.test(text)) return [
      { id: 'True', text: 'True' },
      { id: 'False', text: 'False' },
    ];
  }
  return [];
}

export default function TestPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const router = useRouter();
  const [state, setState] = useState<TestState | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const autosaveRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    async function load() {
      try {
        const data = await testsAPI.getState(attemptId);
        setState(data);
        setTimeLeft(data.time_remaining);
        const restoredAnswers: Record<string, string> = {};
        const restoredMarked = new Set<string>();
        data.questions.forEach(q => {
          if (q.selected_answer) restoredAnswers[q.question_id] = String(q.selected_answer);
          if (q.status === 'MARKED') restoredMarked.add(q.question_id);
        });
        setAnswers(restoredAnswers);
        setMarked(restoredMarked);
      } catch {
        router.push('/papers');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [attemptId, router]);

  const handleSubmit = useCallback(async (auto = false) => {
    if (!auto && !showSubmitDialog) {
      setShowSubmitDialog(true);
      return;
    }
    setSubmitting(true);
    setShowSubmitDialog(false);
    try {
      await testsAPI.submit(attemptId);
      router.push(`/test/${attemptId}/results`);
    } catch {
      setSubmitting(false);
    }
  }, [attemptId, router, showSubmitDialog]);

  useEffect(() => {
    if (!state || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state, handleSubmit, timeLeft > 0]);

  useEffect(() => {
    if (!state || state.status === 'COMPLETED') return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have an active test. Are you sure you want to leave?';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state]);

  const saveCurrentAnswer = useCallback(async () => {
    if (!state) return;
    const q = state.questions[currentIdx];
    const answer = answers[q.question_id];
    if (!answer) return;
    setSaveStatus('saving');
    try {
      await testsAPI.saveAnswer(attemptId, q.question_id, answer);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }, [state, currentIdx, answers, attemptId]);

  useEffect(() => {
    autosaveRef.current = setInterval(() => { saveCurrentAnswer(); }, 30000);
    return () => clearInterval(autosaveRef.current);
  }, [saveCurrentAnswer]);

  const handleAnswer = async (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    setSaveStatus('saving');
    try {
      await testsAPI.saveAnswer(attemptId, questionId, answer);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  };

  const handleToggleReview = async (questionId: string) => {
    setMarked(prev => {
      const next = new Set(prev);
      next.has(questionId) ? next.delete(questionId) : next.add(questionId);
      return next;
    });
    try { await testsAPI.toggleReview(attemptId, questionId); } catch {}
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-indigo-400" />
        Preparing your paper…
      </div>
    );
  }
  if (!state) return null;

  const currentQ = state.questions[currentIdx];
  const answered = Object.keys(answers).length;
  const total = state.questions.length;
  const isTimeLow = timeLeft < 300;
  const progress = total ? (answered / total) * 100 : 0;
  const options = choiceList(currentQ);

  const getQStatus = (q: TestAttemptQuestion) => {
    if (marked.has(q.question_id)) return 'marked';
    if (answers[q.question_id]) return 'answered';
    return 'unanswered';
  };

  const Palette = ({ compact = false }: { compact?: boolean }) => (
    <div className={cn('grid gap-1.5', compact ? 'grid-cols-8 sm:grid-cols-10' : 'grid-cols-5')}>
      {state.questions.map((q, i) => {
        const status = getQStatus(q);
        return (
          <button
            key={q.question_id}
            onClick={() => setCurrentIdx(i)}
            className={cn(
              'grid h-9 w-9 place-items-center rounded-lg text-xs font-bold transition',
              i === currentIdx && 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950',
              status === 'answered' && 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30',
              status === 'marked' && 'bg-amber-500/20 text-amber-300 border border-amber-400/30',
              status === 'unanswered' && 'border border-white/10 bg-white/5 text-slate-400 hover:border-white/25 hover:text-white',
            )}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-slate-50">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,.18),_transparent_55%)] pointer-events-none" />

      <header className="relative z-10 border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur md:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-indigo-300">Live attempt</p>
            <p className="text-sm font-semibold text-white">Stay focused — answers save as you go.</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
              {saveStatus === 'saving' && <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving</>}
              {saveStatus === 'saved' && <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />Saved</>}
              {saveStatus === 'error' && <><AlertCircle className="h-3.5 w-3.5 text-red-400" />Retrying save</>}
            </p>
            <div className={cn(
              'flex items-center gap-2 rounded-xl px-3 py-2 font-mono text-lg font-bold',
              isTimeLow ? 'bg-red-500/15 text-red-300 ring-1 ring-red-400/30' : 'bg-white/5 text-white ring-1 ring-white/10',
            )}>
              <Clock3 className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
            <Button onClick={() => setShowSubmitDialog(true)} disabled={submitting} className="rounded-xl bg-indigo-500 hover:bg-indigo-400">
              <Send className="mr-1 h-4 w-4" />Submit
            </Button>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-slate-950/60 p-5 lg:flex">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[.16em] text-slate-500">Question map</p>
          <Palette />
          <div className="mt-6 space-y-2 text-xs text-slate-400">
            <p className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-emerald-500/40" />Answered · {answered}</p>
            <p className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-amber-500/40" />Marked · {marked.size}</p>
            <p className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-white/15" />Left · {total - answered}</p>
          </div>
          <p className="mt-auto pt-6 text-xs text-slate-500">{answered} of {total} complete</p>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-10 md:py-8">
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 flex items-center justify-between">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                  Question {currentIdx + 1} of {total}
                </span>
                <button
                  onClick={() => handleToggleReview(currentQ.question_id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition',
                    marked.has(currentQ.question_id)
                      ? 'border-amber-400/40 bg-amber-500/15 text-amber-200'
                      : 'border-white/10 text-slate-400 hover:border-amber-400/30 hover:text-amber-200',
                  )}
                >
                  <Flag className="h-3.5 w-3.5" />
                  {marked.has(currentQ.question_id) ? 'Marked' : 'Mark for review'}
                </button>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[.04] p-6 shadow-2xl shadow-indigo-950/20 md:p-8">
                <p className="text-xl font-semibold leading-8 text-white md:text-[1.35rem]">{currentQ.question.text}</p>

                <div className="mt-8 space-y-3">
                  {options.length > 0 ? options.map((opt, index) => {
                    const selected = answers[currentQ.question_id] === opt.id;
                    const letter = opt.id && opt.id !== opt.text ? opt.id : String.fromCharCode(65 + index);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleAnswer(currentQ.question_id, opt.id)}
                        className={cn(
                          'flex w-full items-start gap-4 rounded-2xl border px-4 py-4 text-left transition',
                          selected
                            ? 'border-indigo-400/70 bg-indigo-500/15 text-white shadow-[0_0_0_1px_rgba(129,140,248,.35)]'
                            : 'border-white/10 bg-slate-950/40 text-slate-200 hover:border-indigo-400/40 hover:bg-white/5',
                        )}
                      >
                        <span className={cn(
                          'grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold',
                          selected ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-300',
                        )}>
                          {letter}
                        </span>
                        <span className="pt-1 text-[15px] leading-6">{opt.text}</span>
                      </button>
                    );
                  }) : (
                    <input
                      type="text"
                      placeholder="Type your answer"
                      value={answers[currentQ.question_id] || ''}
                      onChange={(e) => handleAnswer(currentQ.question_id, e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-lg text-white outline-none ring-indigo-400 focus:ring-2"
                    />
                  )}
                </div>
              </div>

              <div className="mt-6 lg:hidden">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[.16em] text-slate-500">Jump to</p>
                <Palette compact />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur md:px-8">
            <Button variant="ghost" onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0} className="text-slate-300 hover:text-white">
              <ChevronLeft className="mr-1 h-4 w-4" />Previous
            </Button>
            {currentIdx === total - 1 ? (
              <Button onClick={() => setShowSubmitDialog(true)} className="rounded-xl bg-indigo-500 hover:bg-indigo-400">
                Review & submit
              </Button>
            ) : (
              <Button onClick={() => setCurrentIdx(i => Math.min(total - 1, i + 1))} className="rounded-xl bg-white/10 text-white hover:bg-white/15">
                Next question<ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="rounded-2xl border-white/10 bg-slate-900">
          <DialogHeader>
            <DialogTitle>Submit this attempt?</DialogTitle>
            <DialogDescription>
              You have answered {answered} of {total} questions
              {total - answered > 0 ? `, with ${total - answered} still blank` : ''}. You cannot change answers after submitting.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSubmitDialog(false)} className="text-slate-300">Keep working</Button>
            <Button onClick={() => handleSubmit(true)} disabled={submitting} className="rounded-xl bg-indigo-500 hover:bg-indigo-400">
              {submitting ? 'Submitting…' : 'Submit now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
