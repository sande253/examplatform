'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import { AdminQuestion } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, Search, Plus, X, Send } from 'lucide-react';
import Link from 'next/link';

interface PaperForm { title: string; description: string; exam_name: string; subject: string; year: string; instructions: string; duration_minutes: string; total_marks: string; access_type: 'FREE' | 'PREMIUM'; paper_type: 'FIXED' | 'GENERATED'; negative_marking_enabled: boolean; }

export default function NewPaperPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<PaperForm>({ title: '', description: '', exam_name: '', subject: '', year: '', instructions: '', duration_minutes: '60', total_marks: '100', access_type: 'FREE', paper_type: 'FIXED', negative_marking_enabled: false });
  const [allQuestions, setAllQuestions] = useState<AdminQuestion[]>([]);
  const [selected, setSelected] = useState<AdminQuestion[]>([]);
  const [qSearch, setQSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminAPI.listQuestions({ status: 'APPROVED', size: 200 }).then((d: any) => setAllQuestions(d.items || d)).catch(console.error);
  }, []);

  const filtered = allQuestions.filter(q =>
    !selected.find(s => s.id === q.id) &&
    (qSearch === '' || q.question_text.toLowerCase().includes(qSearch.toLowerCase()) || q.subject.toLowerCase().includes(qSearch.toLowerCase()))
  );

  const addQuestion = (q: AdminQuestion) => setSelected(prev => [...prev, q]);
  const removeQuestion = (id: string) => setSelected(prev => prev.filter(q => q.id !== id));

  const handleSubmit = async () => {
    if (!form.title) { 
      toast({ title: 'Validation error', description: 'Title is required.', variant: 'destructive' }); 
      return; 
    }
    if (selected.length === 0) { 
      toast({ title: 'Validation error', description: 'Add at least one question.', variant: 'destructive' }); 
      return; 
    }
    setSaving(true);
    try {
      const paper = await adminAPI.createPaper({
        ...form, year: form.year ? parseInt(form.year) : null,
        duration_minutes: parseInt(form.duration_minutes),
        total_marks: parseInt(form.total_marks),
        total_questions: selected.length,
      });
      await adminAPI.addPaperQuestions(paper.id, selected.map(q => q.id));
      toast({ title: 'Success', description: 'Paper created successfully!' });
      router.push('/admin/papers');
    } catch (e: any) {
      toast({ title: 'Error', description: e?.response?.data?.detail || 'Failed to create paper.', variant: 'destructive' });
      setSaving(false);
    }
  };

  const setField = (key: keyof PaperForm, val: any) => setForm(p => ({ ...p, [key]: val }));

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/papers"><Button variant="ghost" className="text-slate-400"><ChevronLeft className="w-4 h-4" /></Button></Link>
        <h1 className="text-2xl font-bold text-white">Create New Paper</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Paper Details */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white text-base">Paper Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Title *" value={form.title} onChange={e => setField('title', e.target.value)} className="bg-slate-900 border-slate-600 text-white" />
            <Textarea placeholder="Description" value={form.description} onChange={e => setField('description', e.target.value)} className="bg-slate-900 border-slate-600 text-white" rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Exam Name" value={form.exam_name} onChange={e => setField('exam_name', e.target.value)} className="bg-slate-900 border-slate-600 text-white" />
              <Input placeholder="Subject" value={form.subject} onChange={e => setField('subject', e.target.value)} className="bg-slate-900 border-slate-600 text-white" />
              <Input placeholder="Year" type="number" value={form.year} onChange={e => setField('year', e.target.value)} className="bg-slate-900 border-slate-600 text-white" />
              <Input placeholder="Duration (minutes)" type="number" value={form.duration_minutes} onChange={e => setField('duration_minutes', e.target.value)} className="bg-slate-900 border-slate-600 text-white" />
              <Input placeholder="Total Marks" type="number" value={form.total_marks} onChange={e => setField('total_marks', e.target.value)} className="bg-slate-900 border-slate-600 text-white" />
            </div>
            <Textarea placeholder="Instructions for students" value={form.instructions} onChange={e => setField('instructions', e.target.value)} className="bg-slate-900 border-slate-600 text-white" rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-slate-400 text-xs mb-1 block">Access Type</label>
                <Select value={form.access_type} onChange={e => setField('access_type', e.target.value as any)}>
                  <option value="FREE">Free</option>
                  <option value="PREMIUM">Premium</option>
                </Select>
              </div>
              <div><label className="text-slate-400 text-xs mb-1 block">Paper Type</label>
                <Select value={form.paper_type} onChange={e => setField('paper_type', e.target.value as any)}>
                  <option value="FIXED">Fixed</option>
                  <option value="GENERATED">Generated</option>
                </Select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
              <input type="checkbox" checked={form.negative_marking_enabled} onChange={e => setField('negative_marking_enabled', e.target.checked)} className="w-4 h-4 accent-indigo-500" />
              Enable Negative Marking
            </label>
          </CardContent>
        </Card>

        {/* Question Selector */}
        <div className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader><CardTitle className="text-white text-base">Selected Questions ({selected.length})</CardTitle></CardHeader>
            <CardContent>
              {selected.length === 0 ? <p className="text-slate-400 text-sm">No questions added yet</p> : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selected.map((q, i) => (
                    <div key={q.id} className="flex items-center gap-2 p-2 rounded bg-slate-900/50">
                      <span className="text-slate-500 text-xs w-5">{i + 1}.</span>
                      <p className="text-white text-xs flex-1 truncate">{q.question_text}</p>
                      <button onClick={() => removeQuestion(q.id)} className="text-slate-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader><CardTitle className="text-white text-base">Add Questions</CardTitle></CardHeader>
            <CardContent>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input className="pl-9 bg-slate-900 border-slate-600 text-white text-sm" placeholder="Search approved questions..." value={qSearch} onChange={e => setQSearch(e.target.value)} />
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {filtered.slice(0, 30).map(q => (
                  <button key={q.id} onClick={() => addQuestion(q)} className="w-full flex items-center gap-2 p-2.5 rounded bg-slate-900/50 border border-slate-700 hover:border-indigo-500/50 text-left transition-colors">
                    <Plus className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white text-xs truncate">{q.question_text}</p>
                      <p className="text-slate-500 text-xs">{q.subject} · {q.difficulty}</p>
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No approved questions found</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button onClick={handleSubmit} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
          <Send className="w-4 h-4 mr-2" />{saving ? 'Creating...' : 'Create Paper'}
        </Button>
        <Link href="/admin/papers"><Button variant="ghost" className="text-slate-400">Cancel</Button></Link>
      </div>
    </div>
  );
}
