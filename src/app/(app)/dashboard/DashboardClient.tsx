'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BedDouble, TrendingUp, ChevronRight } from 'lucide-react';

interface Stats { total: number; available: number; occupied: number; maintenance: number }
interface Room { _id: string; roomNumber: string; roomType: string; status: 'available' | 'occupied' | 'maintenance'; price: number }
interface Hotel { name: string; ownerName: string; city?: string; state?: string }
interface Props { hotel: Hotel; initialStats: Stats; hotelId: string }

const STATUS = {
  available:   { label: 'Available',   dot: 'bg-[#3A5F3A]', text: 'text-[#3A5F3A] dark:text-[#7AB87A]' },
  occupied:    { label: 'Occupied',    dot: 'bg-[#C87941]', text: 'text-[#C87941]' },
  maintenance: { label: 'Maintenance', dot: 'bg-[#7A6A55]', text: 'text-[#7A6A55] dark:text-[#A0907A]' },
} as const;

export function DashboardClient({ hotel, initialStats, hotelId }: Props) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rooms').then(r => r.json()).then((data: Room[]) => {
      setRooms(data);
      setStats({
        total:       data.length,
        available:   data.filter(r => r.status === 'available').length,
        occupied:    data.filter(r => r.status === 'occupied').length,
        maintenance: data.filter(r => r.status === 'maintenance').length,
      });
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  const pct = stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const byType: Record<string, Room[]> = {};
  for (const r of rooms) {
    if (!byType[r.roomType]) byType[r.roomType] = [];
    byType[r.roomType].push(r);
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl">

      {/* Header */}
      <div className="mb-6 sm:mb-10">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
          {hotel.city || 'Kashmir'} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
          {greeting}, {hotel.ownerName.split(' ')[0]}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{hotel.name}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border mb-6 sm:mb-10">
        {[
          { label: 'Total rooms',  value: loading ? '—' : stats.total.toString() },
          { label: 'Available',    value: loading ? '—' : stats.available.toString(),   color: 'text-[#3A5F3A] dark:text-[#7AB87A]' },
          { label: 'Occupied',     value: loading ? '—' : stats.occupied.toString(),    color: 'text-[#C87941]' },
          { label: 'Maintenance',  value: loading ? '—' : stats.maintenance.toString(), color: 'text-[#7A6A55] dark:text-[#A0907A]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-background px-4 sm:px-6 py-4 sm:py-5">
            <p className="text-xs text-muted-foreground mb-1.5 sm:mb-2">{label}</p>
            <p className={`text-2xl sm:text-3xl font-semibold ${color ?? ''}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Occupancy bar */}
      <div className="mb-6 sm:mb-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Occupancy</p>
          </div>
          <p className="text-sm font-semibold">{pct}%</p>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C87941] rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center gap-5 mt-3">
          {Object.entries(STATUS).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              <span className="text-xs text-muted-foreground">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floor plan */}
      <div className="border border-border">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Room Status</p>
          <Link href="/rooms" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            Manage <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="space-y-5">
              {[1, 2].map(i => (
                <div key={i}>
                  <div className="h-3 w-20 bg-border rounded mb-3" />
                  <div className="flex gap-1.5 flex-wrap">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <div key={j} className="w-12 h-10 bg-border rounded" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : Object.keys(byType).length === 0 ? (
            <div className="py-12 text-center">
              <BedDouble className="w-8 h-8 mx-auto mb-3 text-border" />
              <p className="text-sm text-muted-foreground">No rooms configured yet</p>
            </div>
          ) : (
            <div className="space-y-7">
              {Object.entries(byType).map(([type, typeRooms]) => (
                <div key={type}>
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-xs font-medium">{type}</p>
                    <span className="text-xs text-muted-foreground">{typeRooms.length} rooms</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {typeRooms.map(room => {
                      const cfg = STATUS[room.status];
                      return (
                        <Link key={room._id} href="/rooms" title={`${room.roomNumber} — ${cfg.label}`}>
                          <div className={`
                            flex items-center justify-center w-12 h-10 border text-[11px] font-medium cursor-pointer
                            transition-opacity hover:opacity-70
                            ${room.status === 'available'
                              ? 'border-[#C6D9C6] bg-[#EFF5EF] text-[#3A5F3A] dark:bg-[#1A2A1A] dark:border-[#2A4A2A] dark:text-[#7AB87A]'
                              : room.status === 'occupied'
                              ? 'border-[#EDD3B3] bg-[#FDF3E9] text-[#C87941] dark:bg-[#2A1E12] dark:border-[#4A3020]'
                              : 'border-[#D4C9BA] bg-[#F3EFE9] text-[#7A6A55] dark:bg-[#221E18] dark:border-[#3A3028] dark:text-[#A0907A]'
                            }
                          `}>
                            {room.roomNumber}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
