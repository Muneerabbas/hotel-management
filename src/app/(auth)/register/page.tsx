'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ hotelName: '', ownerName: '', phone: '', password: '' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Account created');
      router.push('/onboarding');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full h-11 px-3.5 text-sm bg-white dark:bg-white/5 border border-[#DDD8CC] dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-[#2F4F2F] dark:focus:ring-[#9AB89A] placeholder:text-[#7A7060]/50 dark:placeholder:text-white/25 transition-colors';
  const labelClass = 'block text-xs font-medium text-[#1C1A16] dark:text-[#EDE9E0] mb-1.5';

  return (
    <div className="min-h-screen bg-[#F8F6F1] dark:bg-[#141210] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="mb-8">
          <Link href="/" className="inline-block mb-8">
            <Logo markSize={28} />
          </Link>
          <h1 className="text-2xl font-bold mb-1.5">Register your hotel</h1>
          <p className="text-sm text-[#7A7060] dark:text-[#9A9080]">
            7-day free trial · No credit card needed
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={labelClass}>Hotel name</label>
            <input
              placeholder="Dal View Guest House"
              value={form.hotelName}
              onChange={e => set('hotelName', e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Your name</label>
            <input
              placeholder="Rauf Mir"
              value={form.ownerName}
              onChange={e => set('ownerName', e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Phone number</label>
            <input
              type="tel"
              placeholder="+91 94190 00000"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                required
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7060] hover:text-foreground transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#2F4F2F] dark:bg-[#EDE9E0] text-[#F8F6F1] dark:text-[#141210] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Start free trial
          </button>
        </form>

        <p className="text-xs text-[#7A7060] dark:text-[#9A9080] mt-6 text-center">
          Already registered?{' '}
          <Link href="/login" className="text-[#1C1A16] dark:text-[#EDE9E0] underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
