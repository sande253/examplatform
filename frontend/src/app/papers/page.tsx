'use client';
import { useEffect, useState, useCallback } from 'react';
import { papersAPI } from '@/lib/api';
import { Paper } from '@/lib/types';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Search, Clock, HelpCircle, Lock, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PapersPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [accessType, setAccessType] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Simple debounce
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params: any = { page, size: 12 };
        if (search) params.search = search;
        if (subject) params.subject = subject;
        if (accessType) params.access_type = accessType;
        const data = await papersAPI.list(params);
        setPapers(data.items || []);
        setTotal(data.total || 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page, search, subject, accessType]);

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Question Papers</h1>
          <p className="text-slate-600">{total} papers available</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              className="pl-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
              placeholder="Search papers..."
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
            />
          </div>
          <Select className="w-full sm:w-40" value={subject} onChange={(e) => { setSubject(e.target.value); setPage(1); }}>
            <option value="">All Subjects</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Biology">Biology</option>
          </Select>
          <Select className="w-full sm:w-36" value={accessType} onChange={(e) => { setAccessType(e.target.value); setPage(1); }}>
            <option value="">All Access</option>
            <option value="FREE">Free</option>
            <option value="PREMIUM">Premium</option>
          </Select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-52 w-full rounded-xl" />)}
          </div>
        ) : !papers?.length ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No papers found</p>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((paper) => (
              <Link key={paper.id} href={`/papers/${paper.id}`}>
                <Card className="bg-white border-slate-200 hover:border-emerald-500/50 hover:bg-slate-50 transition-all duration-200 cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-slate-900 text-base leading-snug line-clamp-2">{paper.title}</CardTitle>
                      {paper.access_type === 'PREMIUM' ? (
                        <Lock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                      ) : (
                        <Badge variant="success">Free</Badge>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {paper.subject && <Badge variant="secondary">{paper.subject}</Badge>}
                      {paper.exam && <Badge variant="outline">{paper.exam}</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1"><HelpCircle className="w-4 h-4" />{paper.questions_count} questions</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{paper.duration} min</span>
                    </div>
                    {paper.year && <p className="text-slate-500 text-xs mt-2">Year: {paper.year}</p>}
                    <div className="mt-4">
                      <Button className={`w-full text-sm ${paper.access_type === 'PREMIUM' ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 hover:bg-yellow-600/30' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                        {paper.access_type === 'PREMIUM' ? '🔒 Unlock Premium' : 'Start Test'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button variant="ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="text-slate-700"><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-slate-600 text-sm">Page {page} of {totalPages}</span>
            <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="text-slate-700"><ChevronRight className="w-4 h-4" /></Button>
          </div>
        )}
      </main>
    </div>
  );
}
