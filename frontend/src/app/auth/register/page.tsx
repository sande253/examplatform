'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({ name: z.string().trim().min(2, 'Enter at least 2 characters.'), email: z.string().email('Enter a valid email address.'), password: z.string().min(8, 'Use at least 8 characters.'), confirmPassword: z.string() }).refine((data) => data.password === data.confirmPassword, { message: 'Passwords do not match.', path: ['confirmPassword'] });
type RegisterValues = z.infer<typeof schema>;
const messageFrom = (error: any) => Array.isArray(error?.response?.data?.detail) ? 'Please check the highlighted fields and try again.' : error?.response?.data?.detail || 'We could not create your account. Please try again.';

export default function RegisterPage() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<RegisterValues>({ resolver: zodResolver(schema), defaultValues: { name: '', email: '', password: '', confirmPassword: '' } });
  const onSubmit = async ({ name, email, password }: RegisterValues) => { setLoading(true); setError(null); try { await register({ name, email, password }); } catch (err) { setError(messageFrom(err)); } finally { setLoading(false); } };
  return <AuthShell mode="register"><div className="mx-auto w-full max-w-md"><p className="section-kicker">Start free</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Create your study space.</h2><p className="mt-2 text-sm leading-6 text-slate-500">Set up your account and turn your next practice session into a stronger result.</p>
    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
      {error && <div role="alert" className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      <div className="space-y-2"><Label htmlFor="name" className="font-semibold text-slate-700">Your name</Label><div className="relative"><UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input id="name" autoComplete="name" placeholder="Your full name" {...form.register('name')} className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:bg-white" /></div>{form.formState.errors.name && <p className="text-xs font-medium text-rose-600">{form.formState.errors.name.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="email" className="font-semibold text-slate-700">Email address</Label><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...form.register('email')} className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:bg-white" /></div>{form.formState.errors.email && <p className="text-xs font-medium text-rose-600">{form.formState.errors.email.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="password" className="font-semibold text-slate-700">Password</Label><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 8 characters" {...form.register('password')} className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10 pr-11 text-slate-900 placeholder:text-slate-400 focus-visible:bg-white" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>{form.formState.errors.password ? <p className="text-xs font-medium text-rose-600">{form.formState.errors.password.message}</p> : <p className="text-xs text-slate-400">Use 8 or more characters.</p>}</div>
      <div className="space-y-2"><Label htmlFor="confirmPassword" className="font-semibold text-slate-700">Confirm password</Label><Input id="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Repeat your password" {...form.register('confirmPassword')} className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:bg-white" />{form.formState.errors.confirmPassword && <p className="text-xs font-medium text-rose-600">{form.formState.errors.confirmPassword.message}</p>}</div>
      <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-indigo-600 text-base font-semibold shadow-xl shadow-indigo-100 hover:bg-indigo-700">{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account…</> : <>Create account <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
    </form>
    <p className="mt-7 text-center text-sm text-slate-500">Already have an account? <Link href="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">Sign in</Link></p>
  </div></AuthShell>;
}
