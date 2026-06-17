'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BedDouble, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(data.onboardingCompleted ? '/dashboard' : '/onboarding');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full h-11 px-3.5 text-sm bg-white dark:bg-white/5 border border-[#DDD8CC] dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-[#2F4F2F] dark:focus:ring-[#9AB89A] placeholder:text-[#7A7060]/50 dark:placeholder:text-white/25 transition-colors';
  const labelClass = 'block text-xs font-medium text-[#1C1A16] dark:text-[#EDE9E0] mb-1.5';

  return (
    <div className="min-h-screen bg-[#F8F6F1] dark:bg-[#141210] flex">

      {/* Left — value prop */}
      <div className="hidden lg:flex w-[420px] shrink-0 bg-[#2F4F2F] dark:bg-[#1A2A1A] flex-col p-12 justify-between">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 mb-14">
            <div className="w-7 h-7 bg-white/15 flex items-center justify-center">
              <BedDouble className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-white">StayFlow</span>
          </Link>

          <h2 className="text-2xl font-bold text-white leading-snug mb-4">
            Your hotel,<br />always in view.
          </h2>
          <p className="text-sm text-white/50 leading-relaxed mb-10">
            Real-time room status, guest records, and revenue analytics — all from one screen.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10">
            {[
              { n: '5 min', l: 'to set up' },
              { n: '₹0', l: 'forever free' },
              { n: '100%', l: 'guest records' },
              { n: '1 screen', l: 'entire hotel' },
            ].map(({ n, l }) => (
              <div key={l} className="bg-[#2F4F2F] dark:bg-[#1A2A1A] px-5 py-4">
                <p className="text-lg font-bold text-white">{n}</p>
                <p className="text-xs text-white/40 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <p className="text-xs text-white/40 italic leading-relaxed">
            &ldquo;Ab ek screen pe sab dikh jaata hai — kaun sa kamra khali hai, kaun guest hai.&rdquo;
          </p>
          <p className="text-xs text-white/25 mt-2">Dal Lake, Srinagar</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header only */}
        <div className="lg:hidden px-8 py-5 border-b border-[#DDD8CC] dark:border-white/8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-7 h-7 bg-[#2F4F2F] flex items-center justify-center">
              <BedDouble className="w-3.5 h-3.5 text-[#F8F6F1]" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight">StayFlow</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm">

            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-1.5">Welcome back</h1>
              <p className="text-sm text-[#7A7060] dark:text-[#9A9080]">
                Sign in to your hotel dashboard
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className={labelClass}>Email address</label>
                <input
                  type="email"
                  placeholder="owner@hotel.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
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
                Sign in
              </button>
            </form>

            <p className="text-xs text-[#7A7060] dark:text-[#9A9080] mt-6 text-center">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[#1C1A16] dark:text-[#EDE9E0] underline underline-offset-2">
                Register your hotel free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
