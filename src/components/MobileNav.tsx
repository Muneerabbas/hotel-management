'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BedDouble, History, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/rooms',     icon: BedDouble,        label: 'Rooms'     },
  { href: '/history',   icon: History,          label: 'History'   },
  { href: '/settings',  icon: Settings,         label: 'Settings'  },
];

export function MobileNav({ hotelName }: { hotelName: string }) {
  const pathname = usePathname();
  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 h-14 flex items-center justify-between shrink-0">
        <Logo markSize={24} />
        <span className="text-xs text-muted-foreground truncate max-w-[200px]">{hotelName}</span>
      </header>

      {/* Bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t border-border grid grid-cols-4 safe-area-inset-bottom">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={cn(
                'flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground active:opacity-60'
              )}
            >
              <Icon className={cn('w-5 h-5', active && 'scale-105')} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
