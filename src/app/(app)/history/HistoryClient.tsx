'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Calendar, TrendingUp, BedDouble, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ID_LABELS } from '@/lib/constants';

interface Booking {
  _id: string;
  roomNumber: string;
  roomType: string;
  price: number;
  guestName: string;
  idType: string;
  idNumber: string | null;
  idImageUrl: string | null;
  checkIn: string;
  checkOut: string | null;
  nights: number | null;
  totalAmount: number | null;
  status: 'active' | 'completed';
}

interface Stats {
  summary: {
    totalBookings: number;
    completedStays: number;
    activeGuests: number;
    totalRevenue: number;
    avgNights: number;
  };
  byType: { _id: string; count: number; revenue: number }[];
  recentRevenue: { _id: string; revenue: number; bookings: number }[];
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function HistoryClient() {
  const [bookings, setBookings]         = useState<Booking[]>([]);
  const [stats, setStats]               = useState<Stats | null>(null);
  const [loading, setLoading]           = useState(true);
  const [total, setTotal]               = useState(0);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [from, setFrom]                 = useState('');
  const [to, setTo]                     = useState('');
  const [typeFilter, setTypeFilter]     = useState('');
  const [expanded, setExpanded]         = useState<string | null>(null);
  const [roomTypes, setRoomTypes]       = useState<string[]>([]);
  const [showFilters, setShowFilters]   = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)             params.set('search',   search);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (from)               params.set('from',     from);
    if (to)                 params.set('to',       to);
    if (typeFilter)         params.set('roomType', typeFilter);
    params.set('limit', '50');
    const data = await fetch(`/api/bookings?${params}`).then(r => r.json());
    setBookings(data.bookings);
    setTotal(data.total);
    setLoading(false);
  }, [search, statusFilter, from, to, typeFilter]);

  const fetchStats = useCallback(async () => {
    const data = await fetch('/api/bookings/stats').then(r => r.json());
    setStats(data);
    setRoomTypes(data.byType.map((b: { _id: string }) => b._id));
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => {
    const t = setTimeout(fetchBookings, 300);
    return () => clearTimeout(t);
  }, [fetchBookings]);

  const clearFilters = () => { setSearch(''); setStatusFilter('all'); setFrom(''); setTo(''); setTypeFilter(''); };
  const hasFilters = search || statusFilter !== 'all' || from || to || typeFilter;
  const maxRevenue = stats?.recentRevenue.reduce((m, d) => Math.max(m, d.revenue), 0) || 1;

  return (
    <div className="p-4 sm:p-8 max-w-5xl">

      {/* Header */}
      <div className="mb-6 sm:mb-10">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">Analytics</p>
        <h1 className="text-xl sm:text-2xl font-semibold">Booking History</h1>
        <p className="text-sm text-muted-foreground mt-1">Guest records, stay history, and revenue</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border mb-6 sm:mb-10">
        {[
          { label: 'Total bookings',  value: stats?.summary.totalBookings.toLocaleString() ?? '—' },
          { label: 'Active guests',   value: stats?.summary.activeGuests.toLocaleString() ?? '—',  color: 'text-[#C87941]' },
          { label: 'Revenue',         value: stats ? `₹${stats.summary.totalRevenue.toLocaleString()}` : '—', color: 'text-[#3A5F3A] dark:text-[#7AB87A]' },
          { label: 'Avg. stay',       value: stats ? `${stats.summary.avgNights.toFixed(1)} nights` : '—' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-background px-4 sm:px-6 py-4 sm:py-5">
            <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
            <p className={cn('text-xl sm:text-2xl font-semibold', color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {stats && (
        <div className="grid md:grid-cols-2 gap-px bg-border border border-border mb-6 sm:mb-10">
          {/* 7-day revenue */}
          <div className="bg-background p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Last 7 days revenue</p>
            </div>
            {stats.recentRevenue.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No checkout data yet</p>
            ) : (
              <div className="flex items-end gap-2">
                {stats.recentRevenue.map(d => {
                  const BAR_MAX_PX = 96;
                  const barH = d.revenue > 0 ? Math.max(4, Math.round((d.revenue / maxRevenue) * BAR_MAX_PX)) : 4;
                  return (
                    <div key={d._id} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-muted-foreground h-4 flex items-end">
                        {d.revenue > 0 ? `₹${(d.revenue / 1000).toFixed(0)}k` : ''}
                      </span>
                      <div
                        className="w-full bg-[#C87941]/70 transition-all duration-500"
                        style={{ height: `${barH}px` }}
                        title={`₹${d.revenue.toLocaleString()}`}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(d._id).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* By room type */}
          <div className="bg-background p-6">
            <div className="flex items-center gap-2 mb-5">
              <BedDouble className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Revenue by room type</p>
            </div>
            {stats.byType.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No completed stays yet</p>
            ) : (() => {
              const maxRev = Math.max(...stats.byType.map(x => x.revenue));
              const totalRev = stats.byType.reduce((s, x) => s + x.revenue, 0);
              return (
                <div className="space-y-5">
                  {stats.byType.map(t => {
                    const pct = Math.round((t.revenue / maxRev) * 100);
                    const share = Math.round((t.revenue / totalRev) * 100);
                    return (
                      <div key={t._id}>
                        <div className="flex items-baseline justify-between mb-2">
                          <span className="text-sm font-medium">{t._id}</span>
                          <span className="text-sm font-semibold">₹{t.revenue.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-border rounded-full overflow-hidden mb-1.5">
                          <div
                            className="h-full bg-primary/70 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>{t.count} stays</span>
                          <span>{share}% of revenue</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              placeholder="Search guest, room, or ID"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 pl-9 pr-3 text-sm bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring w-56 placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="flex gap-px border border-border overflow-hidden">
            {(['all', 'active', 'completed'] as const).map(key => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={cn(
                  'px-3 py-1.5 text-xs capitalize transition-colors',
                  statusFilter === key ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'
                )}
              >
                {key}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1.5 h-9 px-3 text-xs border transition-colors',
              showFilters ? 'border-primary text-foreground' : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            <Calendar className="w-3.5 h-3.5" />
            Date range
            <ChevronDown className={cn('w-3 h-3 transition-transform', showFilters && 'rotate-180')} />
          </button>

          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 p-4 bg-card border border-border">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">From</p>
              <input
                type="date"
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="h-8 px-2 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring w-36"
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">To</p>
              <input
                type="date"
                value={to}
                onChange={e => setTo(e.target.value)}
                className="h-8 px-2 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring w-36"
              />
            </div>
            {roomTypes.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Room type</p>
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => setTypeFilter('')}
                    className={cn('px-2.5 py-1 text-xs border transition-colors', typeFilter === '' ? 'border-primary bg-primary/5 text-foreground' : 'border-border text-muted-foreground hover:text-foreground')}
                  >All</button>
                  {roomTypes.map(t => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={cn('px-2.5 py-1 text-xs border transition-colors', typeFilter === t ? 'border-primary bg-primary/5 text-foreground' : 'border-border text-muted-foreground hover:text-foreground')}
                    >{t}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground mb-4">
        {loading ? 'Loading…' : `${total} booking${total !== 1 ? 's' : ''} found`}
      </p>

      {/* Bookings list */}
      {loading ? (
        <div className="space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 bg-border/30 rounded" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-24 text-center">
          <Calendar className="w-8 h-8 mx-auto mb-3 text-border" />
          <p className="text-sm text-muted-foreground">No bookings found</p>
        </div>
      ) : (
        <div className="border border-border divide-y divide-border">
          {/* Desktop table head — hidden on mobile */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-2.5 bg-card">
            {['Guest', 'Room', 'Check-in', 'Check-out', 'Amount'].map(h => (
              <p key={h} className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{h}</p>
            ))}
          </div>

          {bookings.map(b => (
            <div key={b._id}>
              {/* Desktop row */}
              <button
                className="hidden md:grid w-full grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3.5 text-left hover:bg-card/60 transition-colors"
                onClick={() => setExpanded(expanded === b._id ? null : b._id)}
              >
                <div>
                  <p className="text-sm font-medium truncate">{b.guestName}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {(ID_LABELS as Record<string, string>)[b.idType] ?? b.idType}
                  </p>
                </div>
                <div>
                  <p className="text-sm">Room {b.roomNumber}</p>
                  <p className="text-xs text-muted-foreground">{b.roomType}</p>
                </div>
                <div>
                  <p className="text-sm">{fmt(b.checkIn)}</p>
                  <p className="text-xs text-muted-foreground">{fmtTime(b.checkIn)}</p>
                </div>
                <div>
                  {b.checkOut ? (
                    <>
                      <p className="text-sm">{fmt(b.checkOut)}</p>
                      <p className="text-xs text-muted-foreground">{b.nights} night{b.nights !== 1 ? 's' : ''}</p>
                    </>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-[#C87941] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C87941] animate-pulse" />
                      Active
                    </span>
                  )}
                </div>
                <div>
                  {b.totalAmount != null ? (
                    <p className="text-sm font-medium">₹{b.totalAmount.toLocaleString()}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">—</p>
                  )}
                  <p className="text-xs text-muted-foreground">₹{b.price.toLocaleString()}/night</p>
                </div>
              </button>

              {/* Mobile card */}
              <button
                className="md:hidden w-full px-4 py-3.5 text-left hover:bg-card/60 transition-colors"
                onClick={() => setExpanded(expanded === b._id ? null : b._id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{b.guestName}</p>
                    <p className="text-xs text-muted-foreground">Room {b.roomNumber} · {b.roomType}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {b.totalAmount != null ? (
                      <p className="text-sm font-medium">₹{b.totalAmount.toLocaleString()}</p>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-[#C87941] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C87941] animate-pulse" />
                        Active
                      </span>
                    )}
                    <p className="text-xs text-muted-foreground">{fmt(b.checkIn)}</p>
                  </div>
                </div>
              </button>

              {/* Expanded details */}
              {expanded === b._id && (
                <div className="px-4 sm:px-5 py-4 bg-card border-t border-border space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'ID Type',   value: (ID_LABELS as Record<string, string>)[b.idType] ?? b.idType },
                      { label: 'ID Number', value: b.idNumber ?? '—', mono: true },
                      { label: 'Check-in',  value: `${fmt(b.checkIn)} at ${fmtTime(b.checkIn)}` },
                      { label: 'Check-out', value: b.checkOut ? `${fmt(b.checkOut)} at ${fmtTime(b.checkOut)}` : 'Still in' },
                      { label: 'Nights',    value: b.nights != null ? `${b.nights}` : 'In progress' },
                      { label: 'Total',     value: b.totalAmount != null ? `₹${b.totalAmount.toLocaleString()}` : 'In progress' },
                      { label: 'Rate',      value: `₹${b.price.toLocaleString()} / night` },
                      { label: 'Status',    value: b.status === 'active' ? 'Active stay' : 'Completed' },
                    ].map(({ label, value, mono }) => (
                      <div key={label}>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
                        <p className={cn('text-sm', mono && 'font-mono')}>{value}</p>
                      </div>
                    ))}
                  </div>
                  {b.idImageUrl && (
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">ID Card Photo</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <a href={b.idImageUrl} target="_blank" rel="noopener noreferrer">
                        <img src={b.idImageUrl} alt="Guest ID card" className="max-w-xs w-full rounded border border-border object-cover hover:opacity-90 transition-opacity" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {total > bookings.length && (
            <div className="px-5 py-3 text-center">
              <p className="text-xs text-muted-foreground">Showing {bookings.length} of {total}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
