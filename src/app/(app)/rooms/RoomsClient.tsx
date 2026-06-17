'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Search, BedDouble, Loader2, X, CalendarDays, CheckSquare, Square, Upload, ImageIcon } from 'lucide-react';
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

interface GuestForm {
  guestName: string; idType: string; idNumber: string;
  idImageUrl: string; checkIn: string; checkOut: string;
}

const today = () => new Date().toISOString().slice(0, 10);
const emptyGuest = (): GuestForm => ({ guestName: '', idType: 'aadhaar', idNumber: '', idImageUrl: '', checkIn: today(), checkOut: '' });

const STATUS = {
  available:   { label: 'Available',   cell: 'border-[#C6D9C6] bg-[#EFF5EF] text-[#3A5F3A] dark:bg-[#1A2A1A] dark:border-[#2A4A2A] dark:text-[#7AB87A]' },
  occupied:    { label: 'Occupied',    cell: 'border-[#EDD3B3] bg-[#FDF3E9] text-[#C87941] dark:bg-[#2A1E12] dark:border-[#4A3020]' },
  maintenance: { label: 'Maintenance', cell: 'border-[#D4C9BA] bg-[#F3EFE9] text-[#7A6A55] dark:bg-[#221E18] dark:border-[#3A3028] dark:text-[#A0907A]' },
} as const;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Avail.' },
  { key: 'occupied', label: 'Occup.' },
  { key: 'maintenance', label: 'Maint.' },
];

// ── shared panel content ─────────────────────────────────────────────────────

const ID_PLACEHOLDER: Record<string, string> = {
  aadhaar: 'XXXX XXXX XXXX', pan: 'ABCDE1234F', passport: 'A1234567',
  driving_license: 'DL-XXXX-XXXXXXX', voter_id: 'ABC1234567',
};

function GuestFormFields({
  form, setForm,
}: {
  form: GuestForm;
  setForm: (f: GuestForm) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [idMode, setIdMode] = useState<'number' | 'image'>(form.idImageUrl ? 'image' : 'number');

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm({ ...form, idImageUrl: data.url, idNumber: '' });
      toast.success('ID card uploaded');
    } catch {
      toast.error('Upload failed — check Cloudinary config');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">Guest name</label>
        <input
          placeholder="Full name as per ID"
          value={form.guestName}
          onChange={e => setForm({ ...form, guestName: e.target.value })}
          className="w-full h-9 px-3 text-sm bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">ID type</label>
        <select
          value={form.idType}
          onChange={e => setForm({ ...form, idType: e.target.value })}
          className="w-full h-9 px-3 text-sm bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
        >
          {ID_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      {/* ID number vs image toggle */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">ID verification</label>
          <div className="flex gap-px border border-border overflow-hidden text-[11px]">
            <button
              type="button"
              onClick={() => { setIdMode('number'); setForm({ ...form, idImageUrl: '' }); }}
              className={cn('px-2.5 py-1 transition-colors', idMode === 'number' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground')}
            >
              Number
            </button>
            <button
              type="button"
              onClick={() => { setIdMode('image'); setForm({ ...form, idNumber: '' }); }}
              className={cn('px-2.5 py-1 transition-colors', idMode === 'image' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground')}
            >
              Photo
            </button>
          </div>
        </div>

        {idMode === 'number' ? (
          <input
            placeholder={ID_PLACEHOLDER[form.idType] ?? 'Enter ID number'}
            value={form.idNumber}
            onChange={e => setForm({ ...form, idNumber: e.target.value })}
            className="w-full h-9 px-3 text-sm font-mono bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
          />
        ) : (
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {form.idImageUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.idImageUrl} alt="ID card" className="w-full rounded border border-border object-cover max-h-32" />
                <button
                  type="button"
                  onClick={() => { setForm({ ...form, idImageUrl: '' }); if (fileRef.current) fileRef.current.value = ''; }}
                  className="absolute top-1 right-1 w-6 h-6 bg-background/80 border border-border rounded flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full h-20 border border-dashed border-border rounded flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span className="text-xs">Uploading…</span></>
                ) : (
                  <><Upload className="w-4 h-4" /><span className="text-xs">Tap to take photo or upload</span></>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Check-in date</label>
          <input
            type="date" value={form.checkIn}
            onChange={e => setForm({ ...form, checkIn: e.target.value })}
            className="w-full h-9 px-2 text-xs bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Check-out <span className="opacity-50">(opt.)</span></label>
          <input
            type="date" value={form.checkOut} min={form.checkIn}
            onChange={e => setForm({ ...form, checkOut: e.target.value })}
            className="w-full h-9 px-2 text-xs bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
    </div>
  );
}

// ── panel wrapper: side-panel on desktop, bottom-sheet on mobile ─────────────
function Panel({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <>
      {/* Mobile backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={onClose} />
      {/* Panel */}
      <div className={cn(
        'bg-background border-border z-50 flex flex-col',
        // Mobile: bottom sheet
        'fixed bottom-0 left-0 right-0 max-h-[88vh] rounded-t-2xl border-t overflow-y-auto',
        // Desktop: right side panel
        'md:relative md:bottom-auto md:left-auto md:right-auto md:rounded-none md:border-t-0 md:border-l md:w-80 md:shrink-0 md:h-full md:max-h-none md:overflow-y-auto',
      )}>
        {/* Drag handle on mobile */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        {children}
      </div>
    </>
  );
}

// ── main component ───────────────────────────────────────────────────────────

export function RoomsClient() {
  const [rooms, setRooms]         = useState<Room[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<Filter>('available');
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState<Room | null>(null);
  const [updating, setUpdating]   = useState<string | null>(null);
  const [guestForm, setGuestForm] = useState<GuestForm>(emptyGuest());
  const [filterDate, setFilterDate] = useState('');
  const [multiMode, setMultiMode]   = useState(false);
  const [multiSel, setMultiSel]     = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkForm, setBulkForm]     = useState<GuestForm>(emptyGuest());

  const fetchRooms = useCallback(async (date?: string) => {
    const url = date ? `/api/rooms?date=${date}` : '/api/rooms';
    const data = await fetch(url).then(r => r.json());
    setRooms(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRooms(filterDate || undefined); }, [fetchRooms, filterDate]);

  const openPanel = (room: Room) => {
    if (multiMode) {
      setMultiSel(prev => {
        const next = new Set(prev);
        next.has(room._id) ? next.delete(room._id) : next.add(room._id);
        return next;
      });
      return;
    }
    setSelected(room);
    setGuestForm(emptyGuest());
  };

  const closeAll = () => { setSelected(null); setMultiSel(new Set()); };

  const updateStatus = async (roomId: string, newStatus: Room['status'], guest?: GuestForm) => {
    if (newStatus === 'occupied') {
      if (!guest?.guestName.trim()) { toast.error('Guest name is required'); return; }
      if (!guest?.idNumber.trim() && !guest?.idImageUrl) { toast.error('Enter ID number or upload an ID card photo'); return; }
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
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Update failed'); }
      const roomNum = rooms.find(r => r._id === roomId)?.roomNumber;
      const label = newStatus === 'occupied'
        ? `${guest?.guestName} checked in to Room ${roomNum}`
        : `Room ${roomNum} marked ${STATUS[newStatus].label.toLowerCase()}`;
      toast.success(label);
      setSelected(null);
    } catch (err: unknown) {
      fetchRooms(filterDate || undefined);
      toast.error(err instanceof Error ? err.message : 'Failed to update room');
    } finally {
      setUpdating(null);
    }
  };

  const bulkCheckIn = async () => {
    if (!bulkForm.guestName.trim()) { toast.error('Guest name is required'); return; }
    if (!bulkForm.idNumber.trim() && !bulkForm.idImageUrl) { toast.error('Enter ID number or upload an ID card photo'); return; }
    if (multiSel.size === 0)        { toast.error('Select at least one room'); return; }
    setBulkLoading(true);
    try {
      const res = await fetch('/api/rooms/bulk-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomIds: [...multiSel], ...bulkForm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${bulkForm.guestName} checked in to ${data.roomsCheckedIn} rooms`);
      setMultiSel(new Set());
      setMultiMode(false);
      setBulkForm(emptyGuest());
      fetchRooms(filterDate || undefined);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bulk check-in failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const filtered = rooms.filter(r =>
    (filter === 'all' || r.status === filter) &&
    (r.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
     r.roomType.toLowerCase().includes(search.toLowerCase()))
  );

  const counts = {
    all: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied:  rooms.filter(r => r.status === 'occupied').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  };

  const byType: Record<string, Room[]> = {};
  for (const r of filtered) {
    if (!byType[r.roomType]) byType[r.roomType] = [];
    byType[r.roomType].push(r);
  }

  const selectedMultiRooms = rooms.filter(r => multiSel.has(r._id));
  const panelOpen = !multiMode && !!selected;
  const bulkPanelOpen = multiMode && multiSel.size > 0;

  return (
    <div className="flex h-full relative">
      {/* Main */}
      <div className="flex-1 p-4 sm:p-8 overflow-y-auto min-w-0">

        {/* Header */}
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">Property</p>
          <h1 className="text-xl sm:text-2xl font-semibold">Rooms</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {counts.available} available · {counts.occupied} occupied · {counts.maintenance} maintenance
            {filterDate && <span className="ml-2 text-primary font-medium">· {filterDate}</span>}
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-2 mb-6">
          {/* Row 1: search + filter tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                placeholder="Room or type…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-9 pl-9 pr-3 text-sm bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring w-36 sm:w-52 placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="flex gap-px border border-border overflow-hidden rounded">
              {FILTERS.map(({ key, label }) => (
                <button key={key} onClick={() => setFilter(key)}
                  className={cn('px-2.5 py-1.5 text-xs transition-colors whitespace-nowrap',
                    filter === key ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'
                  )}
                >
                  {label}
                  <span className="hidden sm:inline">{key !== 'all' && ` (${counts[key]})`}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => { setMultiMode(m => !m); setMultiSel(new Set()); setSelected(null); }}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded transition-colors',
                multiMode ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {multiMode ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{multiMode ? `${multiSel.size} selected` : 'Multi-select'}</span>
              <span className="sm:hidden">{multiMode ? multiSel.size : 'Multi'}</span>
            </button>
          </div>

          {/* Row 2: date filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <CalendarDays className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground hidden sm:inline">Availability on:</span>
            <input
              type="date" value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="h-8 px-2.5 text-xs bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {filterDate && (
              <button onClick={() => setFilterDate('')} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Room grid */}
        {loading ? (
          <div className="space-y-8">
            {[1, 2].map(i => (
              <div key={i}>
                <div className="h-3 w-24 bg-border rounded mb-3" />
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: 12 }).map((_, j) => <div key={j} className="w-14 h-12 bg-border rounded" />)}
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
          <div className="space-y-8">
            {Object.entries(byType).map(([type, typeRooms]) => (
              <div key={type}>
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-xs font-medium uppercase tracking-wider">{type}</p>
                  <span className="text-xs text-muted-foreground">{typeRooms.length} rooms</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {typeRooms.map(room => {
                    const isUpdating = updating === room._id;
                    const isMultiSel = multiSel.has(room._id);
                    return (
                      <button key={room._id} onClick={() => openPanel(room)} disabled={isUpdating}
                        className={cn(
                          'flex items-center justify-center w-14 h-12 border text-[11px] font-medium transition-all active:scale-95',
                          isMultiSel ? 'ring-2 ring-primary ring-offset-1' : '',
                          selected?._id === room._id ? 'ring-1 ring-foreground/40' : '',
                          isUpdating ? 'opacity-40' : 'hover:opacity-75',
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

      {/* ── Single-room panel ── */}
      <Panel open={panelOpen} onClose={() => setSelected(null)}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="text-xs text-muted-foreground">{selected?.roomType}</p>
            <p className="text-lg font-semibold">Room {selected?.roomNumber}</p>
          </div>
          <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {selected && (
            <>
              <div className="flex items-center justify-between">
                <span className={cn('inline-flex items-center px-3 py-1.5 text-xs font-medium border', STATUS[selected.status].cell)}>
                  {STATUS[selected.status].label}
                </span>
                <span className="text-sm text-muted-foreground">₹{selected.price.toLocaleString()}/night</span>
              </div>

              <div className="h-px bg-border" />

              {selected.status === 'available' && (
                <>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Guest check-in</p>
                  <GuestFormFields
                    form={guestForm} setForm={setGuestForm}
                  />
                  <button
                    disabled={updating === selected._id}
                    onClick={() => updateStatus(selected._id, 'occupied', guestForm)}
                    className="w-full h-10 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updating === selected._id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Check in guest
                  </button>
                  <button
                    disabled={updating === selected._id}
                    onClick={() => updateStatus(selected._id, 'maintenance')}
                    className="w-full h-9 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    Mark as maintenance
                  </button>
                </>
              )}

              {selected.status === 'occupied' && (
                <button
                  disabled={updating === selected._id}
                  onClick={() => updateStatus(selected._id, 'available')}
                  className="w-full h-10 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating === selected._id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Check out guest
                </button>
              )}

              {selected.status === 'maintenance' && (
                <button
                  disabled={updating === selected._id}
                  onClick={() => updateStatus(selected._id, 'available')}
                  className="w-full h-10 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating === selected._id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Mark available
                </button>
              )}
            </>
          )}
        </div>
      </Panel>

      {/* ── Bulk check-in panel ── */}
      <Panel open={bulkPanelOpen} onClose={closeAll}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="text-xs text-muted-foreground">Bulk check-in</p>
            <p className="text-base font-semibold">{multiSel.size} room{multiSel.size > 1 ? 's' : ''} selected</p>
          </div>
          <button onClick={closeAll} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Selected rooms</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedMultiRooms.map(r => (
                <span key={r._id} className={cn('px-2 py-1 text-xs border font-mono', STATUS[r.status].cell)}>
                  {r.roomNumber}
                </span>
              ))}
            </div>
          </div>

          <div className="h-px bg-border" />
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Guest details</p>
          <GuestFormFields
            form={bulkForm} setForm={setBulkForm}
          />
          <button
            onClick={bulkCheckIn} disabled={bulkLoading}
            className="w-full h-10 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {bulkLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Check in to {multiSel.size} room{multiSel.size > 1 ? 's' : ''}
          </button>
        </div>
      </Panel>
    </div>
  );
}
