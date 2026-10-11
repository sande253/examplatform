'use client';
import { useEffect, useRef, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { Document } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { Upload, FileText, RefreshCw, Play, Eye, AlertCircle, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';

const STATUS_BADGE: Record<string, { label: string; variant: any }> = {
  UPLOADED: { label: 'Uploaded', variant: 'secondary' },
  PROCESSING: { label: 'Processing', variant: 'outline' },
  REVIEW_REQUIRED: { label: 'Needs Review', variant: 'default' },
  APPROVED: { label: 'Approved', variant: 'success' },
  PUBLISHED: { label: 'Published', variant: 'success' },
  FAILED: { label: 'Failed', variant: 'destructive' },
};

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({ title: '', subject: '', exam_name: '' });
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    try { const d = await adminAPI.listDocuments(); setDocs(d.items || d); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (file: File) => {
    if (!file || file.type !== 'application/pdf') { 
      toast({ title: 'Invalid file', description: 'Only PDF files are allowed.', variant: 'destructive' });
      return; 
    }
    if (file.size > 50 * 1024 * 1024) { 
      toast({ title: 'File too large', description: 'File must be under 50MB.', variant: 'destructive' });
      return; 
    }
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', formData.title || file.name.replace('.pdf', ''));
    fd.append('subject', formData.subject);
    fd.append('exam_name', formData.exam_name);
    try {
      await adminAPI.uploadDocument(fd);
      setFormData({ title: '', subject: '', exam_name: '' });
      await load();
      toast({ title: 'Success', description: 'Document uploaded successfully!' });
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e?.response?.data?.detail || 'Failed to upload document.', variant: 'destructive' });
    } finally { setUploading(false); }
  };

  const handleProcess = async (id: string) => {
    setProcessing(id);
    try { 
      await adminAPI.processDocument(id); 
      await load();
      toast({ title: 'Processing complete', description: 'Questions extracted — ready for review.' });
    }
    catch (e: any) { 
      await load();
      toast({
        title: 'Processing failed',
        description: e?.response?.data?.detail || 'Failed to process document.',
        variant: 'destructive',
      });
    } finally { setProcessing(null); }
  };

  const handleRetry = async (id: string) => {
    setProcessing(id);
    try {
      await adminAPI.retryDocument(id);
      await load();
      toast({ title: 'Retry complete', description: 'Document reprocessed successfully.' });
    } catch (e: any) {
      await load();
      toast({
        title: 'Retry failed',
        description: e?.response?.data?.detail || 'Failed to reprocess document.',
        variant: 'destructive',
      });
    } finally { setProcessing(null); }
  };

  return (
    <div className="admin-page">
      <div className="mb-7 border-b border-white/10 pb-6"><p className="text-xs font-bold uppercase tracking-[.16em] text-cyan-300">Content intake</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Bring source material in.</h1><p className="mt-2 text-sm text-slate-400">Upload PDFs, monitor extraction, and route items into review.</p></div>

      {/* Upload Form */}
      <Card className="mb-6 border-white/10 bg-slate-900/70 shadow-xl shadow-slate-950/10">
        <CardHeader><CardTitle className="text-white text-base">Upload New Document</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            <Input placeholder="Title (optional)" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className="admin-input" />
            <Input placeholder="Subject" value={formData.subject} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))} className="admin-input" />
            <Input placeholder="Exam Name" value={formData.exam_name} onChange={e => setFormData(p => ({ ...p, exam_name: e.target.value }))} className="admin-input" />
          </div>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleUpload(f); }}
            onClick={() => fileRef.current?.click()}
            className={`rounded-2xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer ${ dragOver ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-700 hover:border-indigo-400/50 hover:bg-white/[.03]'}`}
          >
            <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400">{uploading ? 'Uploading...' : 'Drop PDF here or click to select'}</p>
            <p className="text-slate-600 text-sm mt-1">Max size: 50MB</p>
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card className="border-white/10 bg-slate-900/70 shadow-xl shadow-slate-950/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white text-base">Documents ({docs.length})</CardTitle>
          <Button variant="ghost" size="sm" onClick={load} className="text-slate-400"><RefreshCw className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent>
          {loading ? <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : docs.length === 0 ? (
            <div className="text-center py-12"><FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">No documents uploaded yet</p></div>
          ) : (
            <div className="space-y-2">
              {docs.map(doc => {
                const statusInfo = STATUS_BADGE[doc.status] || { label: doc.status, variant: 'secondary' };
                return (
                  <div key={doc.id} className="flex items-center gap-4 rounded-xl border border-white/8 bg-slate-950/45 p-4">
                    <FileText className="w-5 h-5 text-slate-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{doc.title}</p>
                      <p className="text-slate-400 text-xs">{doc.subject} · {doc.original_filename} · {(doc.file_size_bytes / 1024 / 1024).toFixed(1)}MB</p>
                      {doc.error_message && <p className="text-red-400 text-xs mt-0.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{doc.error_message}</p>}
                    </div>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    <div className="flex gap-2 flex-shrink-0">
                      {doc.status === 'UPLOADED' && (
                        <Button size="sm" onClick={() => handleProcess(doc.id)} disabled={processing === doc.id} className="bg-indigo-600 hover:bg-indigo-700 text-xs">
                          {processing === doc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Play className="w-3 h-3 mr-1" />Process</>}
                        </Button>
                      )}
                      {doc.status === 'FAILED' && (
                        <Button size="sm" onClick={() => handleRetry(doc.id)} disabled={processing === doc.id} className="bg-orange-600 hover:bg-orange-700 text-xs">
                          {processing === doc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><RefreshCw className="w-3 h-3 mr-1" />Retry</>}
                        </Button>
                      )}
                      {(doc.status === 'REVIEW_REQUIRED' || doc.status === 'APPROVED') && (
                        <Link href={`/admin/documents/${doc.id}/review`}>
                          <Button size="sm" variant="ghost" className="text-indigo-400 border border-indigo-500/30 text-xs"><Eye className="w-3 h-3 mr-1" />Review</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
