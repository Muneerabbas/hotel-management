'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Search, BedDouble, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ID_TYPES } from '@/lib/constants';

interface Room {
  _id: string;
  roomNumber: string;
  roomType: string;
  status: 'available' | 'occupied' | 'maintenance';
  price: number;
}

type Filter = 'all' | 'available' | 'occupied' | 'maintenance';

interface GuestForm { guestName: string; idType: string; idNumber: string }
const emptyGuest: GuestForm = { guestName: '', idType: 'aadhaar', idNumber: '' };

const STATUS = {
  available:   { label: 'Available',   cell: 'border-[#C6D9C6] bg-[#EFF5EF] text-[#3A5F3A] dark:bg-[#1A2A1A] dark:border-[#2A4A2A] dark:text-[#7AB87A]' },
  occupied:    { label: 'Occupied',    cell: 'border-[#EDD3B3] bg-[#FDF3E9] text-[#C87941] dark:bg-[#2A1E12] dark:border-[#4A3020]' },
  maintenance: { label: 'Maintenance', cell: 'border-[#D4C9BA] bg-[#F3EFE9] text-[#7A6A55] dark:bg-[#221E18] dark:border-[#3A3028] dark:text-[#A0907A]' },
} as const;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',         label: 'All' },
  { key: 'available',   label: 'Available' },
  { key: 'occupied',    label: 'Occupied' },
  { key: 'maintenance', label: 'Maintenance' },
];

export function RoomsClient() {
  const [rooms, setRooms]       = useState<Room[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<Filter>('available');
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState<Room | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [guestForm, setGuestForm] = useState<GuestForm>(emptyGuest);

  const fetchRooms = useCallback(async () => {
    const data = await fetch('/api/rooms').then(r => r.json());
    setRooms(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const openPanel = (room: Room) => {
    setSelected(room);
    setGuestForm(emptyGuest);
  };

  const updateStatus = async (roomId: string, newStatus: Room['status'], guest?: GuestForm) => {
    if (newStatus === 'occupied') {
      if (!guest?.guestName.trim()) { toast.error('Guest name is required'); return; }
      if (!guest?.idNumber.trim())  { toast.error('ID number is required');   return; }
    }

    setRooms(prev => prev.map(r => r._id === roomId ? { ...r, status: newStatus } : r));
    if (selected?._id === roomId) setSelected(prev => prev ? { ...prev, status: newStatus } : null);
    setUpdating(roomId);

    try {
      const res = await fetch(`/api/rooms/${roomId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...guest }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Update failed');
      }
      const label = newStatus === 'occupied'
        ? `${guest?.guestName} checked in to Room ${selected?.roomNumber}`
        : `Room ${selected?.roomNumber} marked ${STATUS[newStatus].label.toLowerCase()}`;
      toast.success(label);
      setSelected(null);
    } catch (err: unknown) {
      fetchRooms();
      toast.error(err instanceof Error ? err.message : 'Failed to update room');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = rooms.filter(r =>
    (filter === 'all' || r.status === filter) &&
    (r.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
     r.roomType.toLowerCase().includes(search.toLowerCase()))
  );

  const counts = {
    all:         rooms.length,
    available:   rooms.filter(r => r.status === 'available').length,
    occupied:    rooms.filter(r => r.status === 'occupied').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  };

  const byType: Record<string, Room[]> = {};
  for (const r of filtered) {
    if (!byType[r.roomType]) byType[r.roomType] = [];
    byType[r.roomType].push(r);
  }

  return (
    <div className="flex h-full">
      {/* Main */}
      <div className="flex-1 p-8 overflow-y-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">Property</p>
          <h1 className="text-2xl font-semibold">Rooms</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {counts.available} available · {counts.occupied} occupied · {counts.maintenance} maintenance
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              placeholder="Search room or type"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 pl-9 pr-3 text-sm bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring w-52 placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="flex gap-px border border-border overflow-hidden">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  'px-3 py-1.5 text-xs transition-colors',
                  filter === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:text-foreground'
                )}
              >
                {label} {key !== 'all' && `(${counts[key]})`}
              </button>
            ))}
          </div>
        </div>

        {/* Floor plan */}
        {loading ? (
          <div className="space-y-8">
            {[1, 2].map(i => (
              <div key={i}>
                <div className="h-3 w-24 bg-border rounded mb-3" />
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: 12 }).map((_, j) => (
                    <div key={j} className="w-14 h-12 bg-border rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <BedDouble className="w-8 h-8 mx-auto mb-3 text-border" />
            <p className="text-sm text-muted-foreground">No rooms match your filter</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(byType).map(([type, typeRooms]) => (
              <div key={type}>
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-xs font-medium uppercase tracking-wider">{type}</p>
                  <span className="text-xs text-muted-foreground">{typeRooms.length} rooms</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {typeRooms.map(room => {
                    const isUpdating = updating === room._id;
                    return (
                      <button
                        key={room._id}
                        onClick={() => openPanel(room)}
                        disabled={isUpdating}
                        title={`Room ${room.roomNumber} — ${STATUS[room.status].label}`}
                        className={cn(
                          'flex items-center justify-center w-14 h-12 border text-[11px] font-medium transition-opacity hover:opacity-70 disabled:opacity-40',
                          selected?._id === room._id ? 'ring-1 ring-foreground/40' : '',
                          STATUS[room.status].cell
                        )}
                      >
                        {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : room.roomNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Side panel */}
      {selected && (
        <div className="w-80 shrink-0 border-l border-border bg-background flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <p className="text-xs text-muted-foreground">{selected.roomType}</p>
              <p className="text-lg font-semibold">Room {selected.roomNumber}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Status badge */}
            <div className={cn('inline-flex items-center px-3 py-1.5 text-xs font-medium border', STATUS[selected.status].cell)}>
              {STATUS[selected.status].label}
            </div>

            <div className="text-sm text-muted-foreground">
              ₹{selected.price.toLocaleString()} / night
            </div>

            <div className="h-px bg-border" />

            {/* Check-in form */}
            {selected.status === 'available' && (
              <div className="space-y-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Guest check-in</p>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Guest name</label>
                  <input
                    placeholder="Full name as per ID"
                    value={guestForm.guestName}
                    onChange={e => setGuestForm(f => ({ ...f, guestName: e.target.value }))}
                    className="w-full h-9 px-3 text-sm bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">ID type</label>
                  <select
                    value={guestForm.idType}
                    onChange={e => setGuestForm(f => ({ ...f, idType: e.target.value }))}
                    className="w-full h-9 px-3 text-sm bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                  >
                    {ID_TYPES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    {ID_TYPES.find(t => t.value === guestForm.idType)?.label} number
                  </label>
                  <input
                    placeholder={
                      guestForm.idType === 'aadhaar'         ? 'XXXX XXXX XXXX' :
                      guestForm.idType === 'pan'             ? 'ABCDE1234F' :
                      guestForm.idType === 'passport'        ? 'A1234567' :
                      guestForm.idType === 'driving_license' ? 'DL-XXXX-XXXXXXX' :
                      guestForm.idType === 'voter_id'        ? 'ABC1234567' :
                      'Enter ID number'
                    }
                    value={guestForm.idNumber}
                    onChange={e => setGuestForm(f => ({ ...f, idNumber: e.target.value }))}
                    className="w-full h-9 px-3 text-sm font-mono bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
                  />
                </div>

                <button
                  disabled={updating === selected._id}
                  onClick={() => updateStatus(selected._id, 'occupied', guestForm)}
                  className="w-full h-10 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating === selected._id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Check in guest
                </button>

                <div className="h-px bg-border" />

                <button
                  disabled={updating === selected._id}
                  onClick={() => updateStatus(selected._id, 'maintenance')}
                  className="w-full h-9 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {updating === selected._id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Mark as maintenance
                </button>
              </div>
            )}

            {/* Check-out */}
            {selected.status === 'occupied' && (
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</p>
                <button
                  disabled={updating === selected._id}
                  onClick={() => updateStatus(selected._id, 'available')}
                  className="w-full h-10 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating === selected._id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Check out guest
                </button>
              </div>
            )}

            {/* Maintenance → Available */}
            {selected.status === 'maintenance' && (
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</p>
                <button
                  disabled={updating === selected._id}
                  onClick={() => updateStatus(selected._id, 'available')}
                  className="w-full h-10 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating === selected._id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Mark available
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
