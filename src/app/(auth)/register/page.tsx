'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { Logo } from '@/components/Logo';

const PERKS = [
  'Live floor plan — every room at a glance',
  'Guest ID capture at check-in (Aadhaar, PAN, Passport)',
  'Automatic booking history & revenue analytics',
  '7-day free trial — no credit card needed',
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ hotelName: '', ownerName: '', email: '', password: '', phone: '' });
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
    <div className="min-h-screen bg-[#F8F6F1] dark:bg-[#141210] flex">

      {/* Left — form */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-8 py-5 border-b border-[#DDD8CC] dark:border-white/8">
          <Link href="/" className="inline-block">
            <Logo markSize={26} />
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm">

            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-1.5">Register your hotel</h1>
              <p className="text-sm text-[#7A7060] dark:text-[#9A9080]">
                7-day free trial. Setup takes 5 minutes.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Hotel name</label>
                  <input
                    placeholder="Grand Palace"
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
              </div>

              <div>
                <label className={labelClass}>Email address</label>
                <input
                  type="email"
                  placeholder="owner@hotel.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
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
                Sign in to your dashboard
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right — value prop panel */}
      <div className="hidden lg:flex w-[420px] shrink-0 bg-[#2F4F2F] dark:bg-[#1A2A1A] flex-col p-12 justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-10">What you get</p>

          <ul className="space-y-5 mb-12">
            {PERKS.map(p => (
              <li key={p} className="flex items-start gap-3">
                <div className="w-5 h-5 shrink-0 border border-white/20 flex items-center justify-center mt-0.5">
                  <Check className="w-3 h-3 text-[#9AB89A]" />
                </div>
                <span className="text-sm text-white/80 leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>

          {/* Mini floor plan illustration */}
          <div className="bg-white/5 border border-white/10 p-5">
            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-4">Your dashboard after setup</p>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-white/30 mb-1.5">Standard · Floor 1</p>
                <div className="flex gap-1 flex-wrap">
                  {['101','102','103','104','105','106','107','108'].map((n, i) => (
                    <div key={n} className={`w-9 h-8 flex items-center justify-center text-[10px] font-medium ${
                      [1,3,6].includes(i)
                        ? 'bg-[#C87941]/20 border border-[#C87941]/40 text-[#C87941]'
                        : 'bg-white/8 border border-white/15 text-white/60'
                    }`}>{n}</div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-white/30 mb-1.5">Deluxe · Floor 2</p>
                <div className="flex gap-1 flex-wrap">
                  {['201','202','203','204','205'].map((n, i) => (
                    <div key={n} className={`w-9 h-8 flex items-center justify-center text-[10px] font-medium ${
                      [0,2].includes(i)
                        ? 'bg-[#C87941]/20 border border-[#C87941]/40 text-[#C87941]'
                        : 'bg-white/8 border border-white/15 text-white/60'
                    }`}>{n}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              {[
                { dot: 'bg-white/40', label: 'Available' },
                { dot: 'bg-[#C87941]', label: 'Occupied' },
              ].map(({ dot, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                  <span className="text-[10px] text-white/40">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <p className="text-xs text-white/40 leading-relaxed">
            &ldquo;Pehle register mein likhtey thay. Ab ek screen pe sab dikh jaata hai.&rdquo;
          </p>
          <p className="text-xs text-white/30 mt-2">— Rauf Ahmad, Dal Lake Guest House</p>
        </div>
      </div>
    </div>
  );
}
