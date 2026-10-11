'use client';
import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { AdminUser } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, UserCheck, UserX, RefreshCw } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { const d = await adminAPI.listUsers({ search }); setUsers(d.items || d); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [search]);

  const handleGrant = async (userId: string) => {
    setUpdating(userId);
    try { await adminAPI.updateEntitlements(userId, { grant_premium: true, duration_days: 30 }); await load(); } catch {} finally { setUpdating(null); }
  };

  const handleRevoke = async (userId: string) => {
    setUpdating(userId);
    try { await adminAPI.updateEntitlements(userId, { revoke_premium: true }); await load(); } catch {} finally { setUpdating(null); }
  };

  return (
    <div className="admin-page">
      <div className="mb-7 flex items-end justify-between border-b border-white/10 pb-6">
        <div><p className="text-xs font-bold uppercase tracking-[.16em] text-cyan-300">Access management</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Learners</h1><p className="mt-2 text-sm text-slate-400">Search accounts and manage premium eligibility.</p></div>
        <Button variant="ghost" onClick={load} className="text-slate-400"><RefreshCw className="w-4 h-4" /></Button>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input className="admin-input pl-9" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <Card className="border-white/10 bg-slate-900/70 shadow-xl shadow-slate-950/10">
        <CardContent className="pt-4">
          {loading ? <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div> : users.length === 0 ? (
            <div className="text-center py-12"><p className="text-slate-400">No users found</p></div>
          ) : (
            <div className="space-y-2">
              {users.map(user => {
                const isPremium = user.subscription?.status === 'ACTIVE';
                return (
                <div key={user.id} className="flex items-center gap-4 rounded-xl border border-white/8 bg-slate-950/45 p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{user.name}</p>
                      <p className="text-slate-400 text-xs">{user.email}</p>
                      {user.subscription && <p className="text-slate-500 text-xs">Expires: {new Date(user.subscription.expires_at).toLocaleDateString()}</p>}
                    </div>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                    <Badge variant={isPremium ? 'success' : 'outline'}>{isPremium ? user.subscription?.plan_name || 'PREMIUM' : 'FREE'}</Badge>
                    <div className="flex gap-2">
                      {!isPremium ? (
                        <Button size="sm" onClick={() => handleGrant(user.id)} disabled={updating === user.id} className="bg-indigo-600 hover:bg-indigo-700 text-xs">
                          <UserCheck className="w-3 h-3 mr-1" />{updating === user.id ? '...' : 'Grant Premium'}
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => handleRevoke(user.id)} disabled={updating === user.id} variant="ghost" className="text-red-400 border border-red-800 hover:bg-red-950/30 text-xs">
                          <UserX className="w-3 h-3 mr-1" />{updating === user.id ? '...' : 'Revoke'}
                        </Button>
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
