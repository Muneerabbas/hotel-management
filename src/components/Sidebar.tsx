'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Building2, LayoutDashboard, BedDouble, History, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/rooms',     icon: BedDouble,        label: 'Rooms'     },
  { href: '/history',   icon: History,          label: 'History'   },
  { href: '/settings',  icon: Settings,         label: 'Settings'  },
];

interface SidebarProps { hotelName: string; ownerName: string }

export function Sidebar({ hotelName, ownerName }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const { theme, setTheme } = useTheme();

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('Signed out');
    router.push('/login');
  };

  return (
    <aside className="w-52 shrink-0 flex flex-col h-screen sticky top-0 bg-primary border-r border-primary/20">

      {/* Brand */}
      <div className="h-14 flex items-center px-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary-foreground/70" />
          <span className="text-sm font-semibold text-primary-foreground tracking-wide">StayFlow</span>
        </div>
      </div>

      {/* Hotel info */}
      <div className="px-5 pt-5 pb-3">
        <p className="text-[11px] uppercase tracking-[0.15em] text-primary-foreground/40 mb-1">Property</p>
        <p className="text-sm font-medium text-primary-foreground truncate">{hotelName}</p>
        <p className="text-xs text-primary-foreground/50 truncate mt-0.5">{ownerName}</p>
      </div>

      <div className="mx-5 h-px bg-white/10 mb-3" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-1 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}>
              <div className={cn(
                'flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors',
                active
                  ? 'bg-white/15 text-primary-foreground font-medium'
                  : 'text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/8'
              )}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 space-y-0.5 border-t border-white/10 pt-3">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex w-full items-center gap-3 px-3 py-2 rounded text-sm text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/8 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded text-sm text-primary-foreground/60 hover:text-primary-foreground/90 hover:bg-white/8 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
