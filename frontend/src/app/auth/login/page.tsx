'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({ email: z.string().email('Enter a valid email address.'), password: z.string().min(1, 'Enter your password.') });
type LoginValues = z.infer<typeof schema>;

const messageFrom = (error: any) => Array.isArray(error?.response?.data?.detail) ? 'Please check the highlighted fields and try again.' : error?.response?.data?.detail || 'We could not sign you in. Check your details and try again.';

export default function LoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginValues>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });
  const onSubmit = async (values: LoginValues) => { setLoading(true); setError(null); try { await login(values); } catch (err) { setError(messageFrom(err)); } finally { setLoading(false); } };

  return <AuthShell mode="login"><div className="mx-auto w-full max-w-md"><p className="section-kicker">Welcome back</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Sign in to your workspace.</h2><p className="mt-2 text-sm leading-6 text-slate-500">Continue your practice, check your progress, and choose your next paper.</p>
    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
      {error && <div role="alert" className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      <div className="space-y-2"><Label htmlFor="email" className="font-semibold text-slate-700">Email address</Label><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...form.register('email')} className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:bg-white" /></div>{form.formState.errors.email && <p className="text-xs font-medium text-rose-600">{form.formState.errors.email.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="password" className="font-semibold text-slate-700">Password</Label><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" {...form.register('password')} className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-10 pr-11 text-slate-900 placeholder:text-slate-400 focus-visible:bg-white" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>{form.formState.errors.password && <p className="text-xs font-medium text-rose-600">{form.formState.errors.password.message}</p>}</div>
      <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-indigo-600 text-base font-semibold shadow-xl shadow-indigo-100 hover:bg-indigo-700">{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in…</> : <>Sign in <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
    </form>
    <p className="mt-8 text-center text-sm text-slate-500">New to ExamPrep AI? <Link href="/auth/register" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">Create a free account</Link></p>
  </div></AuthShell>;
}
