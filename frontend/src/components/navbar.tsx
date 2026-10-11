'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, History, LayoutDashboard, LogOut, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogoWithText } from '@/components/logo';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const studentNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/papers', label: 'Practice', icon: BookOpen },
  { href: '/history', label: 'Progress', icon: History },
];

export function Navbar() {
  const { user, logout, subscription } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const initials = user?.name.split(' ').map((name) => name[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const handleLogout = () => { logout(); router.push('/'); };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href={user ? '/dashboard' : '/'} className="shrink-0"><LogoWithText size="sm" /></Link>
        {user ? <>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Student navigation">
            {studentNav.map((item) => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return <Link key={item.href} href={item.href} className={cn('flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors', active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900')}><item.icon className="h-4 w-4" />{item.label}</Link>;
            })}
            {user.role === 'ADMIN' && <Link href="/admin" className="ml-2 flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"><ShieldCheck className="h-4 w-4" />Admin portal</Link>}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Badge className={cn('hidden border-0 px-2.5 py-1 text-[10px] font-bold tracking-wider sm:inline-flex', subscription?.is_active ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600')}>{subscription?.is_active ? 'PREMIUM' : 'FREE PLAN'}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><button className="flex items-center gap-2 rounded-full p-1 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" aria-label="Open account menu"><Avatar className="h-9 w-9 border-2 border-white shadow-sm"><AvatarFallback className="bg-gradient-to-br from-indigo-500 to-cyan-500 text-xs font-bold text-white">{initials}</AvatarFallback></Avatar></button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 rounded-xl p-2">
                <DropdownMenuLabel className="px-2 py-2 font-normal"><p className="font-semibold text-slate-900">{user.name}</p><p className="mt-0.5 truncate text-xs text-slate-500">{user.email}</p></DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-lg" onClick={() => router.push('/dashboard')}><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg" onClick={() => router.push('/profile')}><User className="mr-2 h-4 w-4" />Account</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-lg text-red-600 focus:text-red-600" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </> : <div className="flex items-center gap-2"><Link href="/auth/login"><Button variant="ghost" className="text-slate-600">Log in</Button></Link><Link href="/auth/register"><Button className="rounded-xl bg-indigo-600 px-5 shadow-lg shadow-indigo-200 hover:bg-indigo-700">Start learning</Button></Link></div>}
      </div>
    </header>
  );
}
