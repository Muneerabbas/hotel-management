import Link from 'next/link';
import { ArrowRight, Check, BedDouble, BarChart3, Shield, Star, Globe, Sparkles } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8F6F1] dark:bg-[#141210] text-[#1C1A16] dark:text-[#EDE9E0]">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-[#F8F6F1]/90 dark:bg-[#141210]/90 backdrop-blur border-b border-[#DDD8CC] dark:border-white/8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Logo markSize={26} />
          <nav className="hidden md:flex items-center gap-6 text-sm text-[#7A7060] dark:text-[#9A9080]">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:block px-3 py-1.5 text-sm text-[#7A7060] dark:text-[#9A9080] hover:text-foreground transition-colors whitespace-nowrap">
              Sign in
            </Link>
            <Link href="/register" className="ml-1 px-3 sm:px-4 py-2 text-sm bg-[#2F4F2F] dark:bg-[#EDE9E0] text-[#F8F6F1] dark:text-[#141210] font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
              Start free →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24">
        <div className="max-w-3xl">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 mb-5 sm:mb-6 px-3 py-1.5 border border-[#DDD8CC] dark:border-white/10 bg-white dark:bg-white/5 text-xs text-[#7A7060] dark:text-[#9A9080]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3A5F3A]" />
            MehmanManager · Built for Kashmir hotel owners
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.08] tracking-tight mb-5 sm:mb-6">
            Run your hotel.<br />
            <span className="text-[#2F4F2F] dark:text-[#9AB89A]">Not spreadsheets.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#7A7060] dark:text-[#9A9080] leading-relaxed mb-7 sm:mb-8 max-w-xl">
            MehmanManager gives you a live view of every room, records every guest with their ID, and builds your booking history automatically. Setup takes 5 minutes.
          </p>

          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 mb-10 sm:mb-12">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-[#2F4F2F] dark:bg-[#EDE9E0] text-[#F8F6F1] dark:text-[#141210] font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Start your 7-day free trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-sm text-[#7A7060] dark:text-[#9A9080]">No credit card needed to start.</p>
          </div>

          {/* Social proof strip */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {[
              { n: '7 days', t: 'free trial, no card' },
              { n: '₹499', t: 'per month after trial' },
              { n: '5 min', t: 'avg. setup time' },
            ].map(({ n, t }) => (
              <div key={t} className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-bold">{n}</span>
                <span className="text-sm text-[#7A7060] dark:text-[#9A9080]">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product mockup */}
      <section className="bg-[#2F4F2F] dark:bg-[#1A2A1A] py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6 sm:mb-8 text-center">Live room status — your entire hotel at a glance</p>

          <div className="bg-[#F8F6F1] dark:bg-[#1E1B17] border border-[#DDD8CC] dark:border-white/10 overflow-hidden max-w-3xl mx-auto">
            {/* Fake top bar */}
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#DDD8CC] dark:border-white/8 bg-white dark:bg-[#141210]">
              <div className="hidden sm:flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#DDD8CC]" />
                <div className="w-3 h-3 rounded-full bg-[#DDD8CC]" />
                <div className="w-3 h-3 rounded-full bg-[#DDD8CC]" />
              </div>
              <div className="flex-1 sm:mx-4 h-5 bg-[#EDE9E0] dark:bg-white/5 rounded-sm text-[10px] flex items-center px-2 text-[#7A7060]">
                mehmanmanager.in/dashboard
              </div>
            </div>

            {/* Fake dashboard body */}
            <div className="flex min-h-[240px] sm:min-h-[280px]">
              {/* Fake sidebar — hidden on mobile */}
              <div className="hidden sm:block w-36 bg-[#2F4F2F] shrink-0 p-3 space-y-1">
                {['Dashboard', 'Rooms', 'History', 'Settings'].map((item, i) => (
                  <div key={item} className={`px-3 py-2 text-[11px] ${i === 1 ? 'bg-white/15 text-white font-medium' : 'text-white/50'}`}>
                    {item}
                  </div>
                ))}
              </div>
              {/* Fake content */}
              <div className="flex-1 p-3 sm:p-5 overflow-hidden">
                <div className="mb-3 sm:mb-4">
                  <div className="text-[11px] text-[#7A7060] mb-1">TUESDAY · 17 JUNE</div>
                  <div className="text-sm font-semibold">Good morning, Rauf</div>
                </div>
                {/* Stat boxes */}
                <div className="grid grid-cols-4 gap-1 mb-3 sm:mb-5">
                  {[
                    { l: 'Total', v: '35', c: '' },
                    { l: 'Avail.', v: '18', c: 'text-[#3A5F3A]' },
                    { l: 'Occup.', v: '14', c: 'text-[#C87941]' },
                    { l: 'Maint.', v: '3', c: 'text-[#7A6A55]' },
                  ].map(({ l, v, c }) => (
                    <div key={l} className="bg-white dark:bg-white/5 border border-[#DDD8CC] dark:border-white/8 px-1.5 sm:px-2.5 py-1.5 sm:py-2">
                      <div className="text-[9px] sm:text-[10px] text-[#7A7060] mb-0.5 sm:mb-1">{l}</div>
                      <div className={`text-base sm:text-lg font-bold ${c}`}>{v}</div>
                    </div>
                  ))}
                </div>
                {/* Floor plan */}
                <div className="text-[10px] text-[#7A7060] mb-1.5 uppercase tracking-wider">Standard — Floor 1</div>
                <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                  {['101','102','103','104','105','106','107','108','109','110','111','112'].map((n, i) => (
                    <div key={n} className={`w-8 h-7 sm:w-9 sm:h-8 flex items-center justify-center text-[9px] sm:text-[10px] font-medium border ${
                      [1,3,5,8,10].includes(i) ? 'bg-[#FDF3E9] border-[#EDD3B3] text-[#C87941]' :
                      i === 7 ? 'bg-[#F3EFE9] border-[#D4C9BA] text-[#7A6A55]' :
                      'bg-[#EFF5EF] border-[#C6D9C6] text-[#3A5F3A]'
                    }`}>{n}</div>
                  ))}
                </div>
                <div className="text-[10px] text-[#7A7060] mb-1.5 uppercase tracking-wider">Deluxe — Floor 2</div>
                <div className="flex flex-wrap gap-1">
                  {['201','202','203','204','205','206','207','208'].map((n, i) => (
                    <div key={n} className={`w-8 h-7 sm:w-9 sm:h-8 flex items-center justify-center text-[9px] sm:text-[10px] font-medium border ${
                      [0,2,4,6].includes(i) ? 'bg-[#FDF3E9] border-[#EDD3B3] text-[#C87941]' :
                      'bg-[#EFF5EF] border-[#C6D9C6] text-[#3A5F3A]'
                    }`}>{n}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6" id="features">
        <div className="max-w-lg mb-10 sm:mb-14">
          <p className="text-xs uppercase tracking-[0.2em] text-[#7A7060] dark:text-[#9A9080] mb-4">Why hotel owners use MehmanManager</p>
          <h2 className="text-2xl sm:text-3xl font-bold leading-snug">
            Stop losing track of who's in which room.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-px bg-[#DDD8CC] dark:bg-white/8 border border-[#DDD8CC] dark:border-white/8">
          {[
            {
              icon: BedDouble,
              title: 'Know every room instantly',
              body: 'Green is free. Orange is occupied. Walnut is under maintenance. One screen, no calling the front desk, no paper registers. Your entire hotel visible from your phone.',
              detail: 'Click any room to check in, check out, or flag for maintenance.',
            },
            {
              icon: Shield,
              title: 'Guest ID stored securely',
              body: 'Capture Aadhaar, PAN, Passport, Driving Licence or Voter ID at check-in. Every stay is linked to a verified identity. Useful if anyone ever asks.',
              detail: 'Required by Indian law for hotel check-ins. MehmanManager handles it cleanly.',
            },
            {
              icon: BarChart3,
              title: 'Your history earns its keep',
              body: 'Every check-in and check-out writes a record automatically. See total revenue, which room types earn the most, and a 7-day revenue chart — no extra work.',
              detail: 'Filter by guest name, date range, room type, or booking status.',
            },
          ].map(({ icon: Icon, title, body, detail }) => (
            <div key={title} className="bg-[#F8F6F1] dark:bg-[#141210] p-6 sm:p-8">
              <div className="w-9 h-9 border border-[#DDD8CC] dark:border-white/10 flex items-center justify-center mb-5">
                <Icon className="w-4 h-4 text-[#2F4F2F] dark:text-[#9AB89A]" />
              </div>
              <h3 className="font-semibold text-base mb-3">{title}</h3>
              <p className="text-sm text-[#7A7060] dark:text-[#9A9080] leading-relaxed mb-4">{body}</p>
              <p className="text-xs text-[#7A7060] dark:text-[#9A9080] border-t border-[#DDD8CC] dark:border-white/8 pt-4">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 sm:py-20 bg-white dark:bg-[#1E1B17] border-y border-[#DDD8CC] dark:border-white/8" id="how">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-lg mb-10 sm:mb-14">
            <p className="text-xs uppercase tracking-[0.2em] text-[#7A7060] dark:text-[#9A9080] mb-4">How it works</p>
            <h2 className="text-2xl sm:text-3xl font-bold">Up and running in 5 minutes</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { n: '01', title: 'Register your hotel', body: 'Enter your hotel name, city, and contact details. Takes 90 seconds.' },
              { n: '02', title: 'Add your rooms', body: 'Tell us your room types (Standard, Deluxe, Suite) and how many of each. We auto-number them by floor.' },
              { n: '03', title: 'Start managing', body: 'Click any room to check guests in. Enter their name and ID. Done. The dashboard updates instantly.' },
              { n: '04', title: 'Watch the history build', body: 'Every checkout writes a record. Your revenue and occupancy analytics grow every day you use it.' },
            ].map(({ n, title, body }) => (
              <div key={n}>
                <span className="text-3xl sm:text-4xl font-bold text-[#DDD8CC] dark:text-white/10">{n}</span>
                <h3 className="font-semibold text-sm mt-2 sm:mt-3 mb-1.5 sm:mb-2">{title}</h3>
                <p className="text-sm text-[#7A7060] dark:text-[#9A9080] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / trust */}
      <section className="py-14 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-px bg-[#DDD8CC] dark:bg-white/8 border border-[#DDD8CC] dark:border-white/8">
          <div className="bg-[#F8F6F1] dark:bg-[#141210] p-7 sm:p-10">
            <div className="flex mb-4">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-[#C87941] text-[#C87941]" />)}
            </div>
            <blockquote className="text-base leading-relaxed mb-6">
              &ldquo;Pehle register mein likhtey thay sab kuch, galti hoti thi. Ab ek screen pe sab dikh jaata hai — kaun sa kamra khali hai, kaun guest hai. Bahut aasaan ho gaya.&rdquo;
            </blockquote>
            <div>
              <p className="text-sm font-semibold">Rauf Ahmad Mir</p>
              <p className="text-xs text-[#7A7060] dark:text-[#9A9080]">Owner, Gulshan Guest House · Dal Lake, Srinagar</p>
            </div>
          </div>

          <div className="bg-[#2F4F2F] dark:bg-[#1A2A1A] p-7 sm:p-10 flex flex-col justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-5 sm:mb-6">Everything in the 7-day trial</p>
              <ul className="space-y-3">
                {[
                  'Unlimited rooms',
                  'Unlimited guests',
                  'Full booking history',
                  'Revenue analytics',
                  'Aadhaar / PAN / Passport ID capture',
                  'Works on mobile and desktop',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-white/80">
                    <Check className="w-3.5 h-3.5 text-[#9AB89A] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-white text-[#2F4F2F] font-semibold text-sm hover:bg-white/90 transition-opacity"
            >
              Start free trial — no card needed
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-14 sm:py-20 bg-white dark:bg-[#1E1B17] border-y border-[#DDD8CC] dark:border-white/8" id="pricing">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs uppercase tracking-[0.2em] text-[#7A7060] dark:text-[#9A9080] mb-4">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, honest pricing</h2>
            <p className="text-[#7A7060] dark:text-[#9A9080] max-w-md mx-auto text-sm leading-relaxed">
              Start free for 7 days. No credit card. Upgrade when you&apos;re ready — priced for Kashmir hotel owners, not Silicon Valley startups.
            </p>
          </div>

          {/* Pricing cards — stacked on mobile, 3-col on md */}
          <div className="flex flex-col md:grid md:grid-cols-3 gap-px bg-[#DDD8CC] dark:bg-white/8 border border-[#DDD8CC] dark:border-white/8">

            {/* Free Trial */}
            <div className="bg-[#F8F6F1] dark:bg-[#141210] p-7 sm:p-8 flex flex-col">
              <div className="mb-5 sm:mb-6">
                <p className="text-xs uppercase tracking-[0.15em] text-[#7A7060] dark:text-[#9A9080] mb-3">Free Trial</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold">₹0</span>
                </div>
                <p className="text-sm text-[#7A7060] dark:text-[#9A9080]">7 days · no card required</p>
              </div>
              <ul className="space-y-2.5 mb-7 sm:mb-8 flex-1">
                {[
                  'All core features',
                  'Unlimited rooms',
                  'Unlimited guest records',
                  'Booking history & analytics',
                  'ID capture (Aadhaar, PAN, Passport)',
                  'Mobile & desktop',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#7A7060] dark:text-[#9A9080]">
                    <Check className="w-3.5 h-3.5 text-[#3A5F3A] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="w-full py-2.5 text-center text-sm font-medium border border-[#2F4F2F] dark:border-[#9AB89A] text-[#2F4F2F] dark:text-[#9AB89A] hover:bg-[#2F4F2F] hover:text-white dark:hover:bg-[#9AB89A] dark:hover:text-[#141210] transition-colors"
              >
                Start free trial
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-[#2F4F2F] dark:bg-[#1A2A1A] p-7 sm:p-8 flex flex-col relative">
              <div className="absolute top-4 right-4 px-2 py-0.5 bg-[#C87941] text-white text-[10px] font-semibold uppercase tracking-wider">
                Most popular
              </div>
              <div className="mb-5 sm:mb-6">
                <p className="text-xs uppercase tracking-[0.15em] text-white/50 mb-3">Pro</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-white">₹499</span>
                  <span className="text-sm text-white/50">/month</span>
                </div>
                <p className="text-sm text-white/50">≈ ₹17/day · less than a chai</p>
              </div>
              <ul className="space-y-2.5 mb-7 sm:mb-8 flex-1">
                {[
                  'Everything in Free Trial',
                  'Unlimited usage, no expiry',
                  'Priority support via WhatsApp',
                  'Revenue & occupancy reports',
                  'Export booking history (CSV)',
                  'Multi-device access',
                  'Early access to new features',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/80">
                    <Check className="w-3.5 h-3.5 text-[#9AB89A] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="w-full py-2.5 text-center text-sm font-semibold bg-white text-[#2F4F2F] hover:bg-white/90 transition-opacity"
              >
                Get Pro — ₹499/mo
              </Link>
            </div>

            {/* Pro + Website */}
            <div className="bg-[#F8F6F1] dark:bg-[#141210] p-7 sm:p-8 flex flex-col">
              <div className="mb-5 sm:mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-[#7A7060] dark:text-[#9A9080]">Pro + Website</p>
                  <Sparkles className="w-3 h-3 text-[#C87941]" />
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold">₹999</span>
                  <span className="text-sm text-[#7A7060] dark:text-[#9A9080]">/month</span>
                </div>
                <p className="text-sm text-[#7A7060] dark:text-[#9A9080]">≈ ₹33/day · your hotel online</p>
              </div>
              <ul className="space-y-2.5 mb-7 sm:mb-8 flex-1">
                {[
                  'Everything in Pro',
                  'Dedicated hotel website',
                  'yourhotelname.mehmanmanager.in domain',
                  'Photo gallery & amenities page',
                  'Online booking inquiry form',
                  'SEO setup for Google visibility',
                  'WhatsApp inquiry button',
                  'We set it up for you — free',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#7A7060] dark:text-[#9A9080]">
                    <Check className="w-3.5 h-3.5 text-[#3A5F3A] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="w-full py-2.5 text-center text-sm font-medium bg-[#2F4F2F] dark:bg-[#EDE9E0] text-white dark:text-[#141210] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Globe className="w-3.5 h-3.5" />
                Get Pro + Website
              </Link>
            </div>

          </div>

          {/* FAQ notes */}
          <div className="mt-8 sm:mt-10 grid sm:grid-cols-3 gap-4 sm:gap-6 text-sm text-[#7A7060] dark:text-[#9A9080]">
            <p><span className="text-foreground font-medium">Can I cancel anytime?</span> Yes. No lock-in. Cancel before your next billing date and you won&apos;t be charged.</p>
            <p><span className="text-foreground font-medium">What happens after the trial?</span> Your account is paused — your data is safe. Upgrade to keep using MehmanManager.</p>
            <p><span className="text-foreground font-medium">Is there a yearly discount?</span> Coming soon. We&apos;ll offer 2 months free for annual payment.</p>
          </div>

          <p className="text-xs text-center text-[#7A7060] dark:text-[#9A9080] mt-8">
            Already have an account?{' '}
            <Link href="/login" className="underline underline-offset-2 hover:text-foreground transition-colors">Sign in</Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#DDD8CC] dark:border-white/8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo markSize={24} />
          <p className="text-xs text-[#7A7060] dark:text-[#9A9080] text-center">
            MehmanManager · Made for Kashmir hospitality · Dal Lake · Gulmarg · Pahalgam · Sonamarg
          </p>
          <div className="flex gap-5 text-xs text-[#7A7060] dark:text-[#9A9080]">
            <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
