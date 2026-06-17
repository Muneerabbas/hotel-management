'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Executive', 'Family', 'Single', 'Twin', 'Presidential'];

function uid() { return Math.random().toString(36).slice(2, 9); }

interface Room  { id: string; number: string }
interface Group { id: string; type: string; price: number; rooms: Room[] }
interface Floor { id: string; floorNum: number; groups: Group[] }

function genRooms(floorNum: number, startSeq: number, count: number): Room[] {
  return Array.from({ length: count }, (_, i) => ({
    id: uid(),
    number: `${floorNum}${String(startSeq + i).padStart(2, '0')}`,
  }));
}

function makeFloor(floorNum: number): Floor {
  return {
    id: uid(), floorNum,
    groups: [{ id: uid(), type: 'Standard', price: 2500, rooms: genRooms(floorNum, 1, 10) }],
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [floors, setFloors] = useState<Floor[]>([makeFloor(1)]);
  const [editing, setEditing] = useState<string | null>(null);

  const allNumbers = floors.flatMap(f => f.groups.flatMap(g => g.rooms.map(r => r.number.trim())));
  const duplicates = new Set(allNumbers.filter((n, i) => n && allNumbers.indexOf(n) !== i));

  // ── mutators ──────────────────────────────────────────────────────────

  const setFloor = (fid: string, patch: Partial<Floor>) =>
    setFloors(p => p.map(f => f.id === fid ? { ...f, ...patch } : f));

  const setGroup = (fid: string, gid: string, patch: Partial<Group>) =>
    setFloors(p => p.map(f => f.id === fid
      ? { ...f, groups: f.groups.map(g => g.id === gid ? { ...g, ...patch } : g) }
      : f));

  const setRoomNum = (fid: string, gid: string, rid: string, val: string) =>
    setFloors(p => p.map(f => f.id === fid ? {
      ...f,
      groups: f.groups.map(g => g.id === gid ? {
        ...g, rooms: g.rooms.map(r => r.id === rid ? { ...r, number: val } : r),
      } : g),
    } : f));

  const setCount = (fid: string, gid: string, count: number) => {
    if (count < 1 || count > 99) return;
    setFloors(p => p.map(f => {
      if (f.id !== fid) return f;
      return {
        ...f,
        groups: f.groups.map(g => {
          if (g.id !== gid) return g;
          const rooms = [...g.rooms];
          if (count > rooms.length) {
            const seq = rooms.length + 1;
            for (let i = 0; i < count - rooms.length; i++)
              rooms.push({ id: uid(), number: `${f.floorNum}${String(seq + i).padStart(2, '0')}` });
          } else {
            rooms.splice(count);
          }
          return { ...g, rooms };
        }),
      };
    }));
  };

  const addGroup = (fid: string) => {
    const floor = floors.find(f => f.id === fid)!;
    const usedTypes = floor.groups.map(g => g.type);
    const type = ROOM_TYPES.find(t => !usedTypes.includes(t)) ?? 'Standard';
    const seq = floor.groups.reduce((n, g) => n + g.rooms.length, 0) + 1;
    setFloor(fid, {
      groups: [...floor.groups, { id: uid(), type, price: 3500, rooms: genRooms(floor.floorNum, seq, 5) }],
    });
  };

  const removeGroup = (fid: string, gid: string) =>
    setFloors(p => p.map(f => f.id === fid ? { ...f, groups: f.groups.filter(g => g.id !== gid) } : f));

  const addFloor = () => {
    const next = Math.max(...floors.map(f => f.floorNum)) + 1;
    setFloors(p => [...p, makeFloor(next)]);
  };

  const removeFloor = (fid: string) => setFloors(p => p.filter(f => f.id !== fid));

  // ── submit ────────────────────────────────────────────────────────────

  const submit = async () => {
    const rooms = floors.flatMap(f => f.groups.flatMap(g => g.rooms.map(r => ({
      number: r.number.trim(), type: g.type, price: g.price,
    }))));
    if (!rooms.length) { toast.error('Add at least one room'); return; }
    if (rooms.some(r => !r.number)) { toast.error('All room numbers must be filled'); return; }
    if (duplicates.size > 0) { toast.error(`Duplicate room numbers: ${[...duplicates].join(', ')}`); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rooms }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Setup complete · ${rooms.length} rooms created`);
      router.push('/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  const totalRooms = floors.reduce((n, f) => n + f.groups.reduce((m, g) => m + g.rooms.length, 0), 0);

  // ── render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo markSize={24} />
          <span className="text-xs text-muted-foreground">{totalRooms} room{totalRooms !== 1 ? 's' : ''} configured</span>
        </div>
      </header>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">Room setup</p>
        <h1 className="text-2xl font-semibold mb-1">Set up your rooms</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Add floors and room groups. You can mix room types on the same floor and edit any room number.
        </p>

        {duplicates.size > 0 && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-destructive/8 border border-destructive/20 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Duplicate room numbers: <span className="font-mono font-medium">{[...duplicates].join(', ')}</span>
          </div>
        )}

        <div className="space-y-6">
          {floors.map((floor, fi) => (
            <div key={floor.id} className="border border-border">
              {/* Floor header */}
              <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Floor</span>
                  <input
                    type="number"
                    min={0}
                    value={floor.floorNum}
                    onChange={e => setFloor(floor.id, { floorNum: Number(e.target.value) })}
                    className="w-14 h-7 px-2 text-sm font-medium bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring text-center"
                  />
                  <span className="text-xs text-muted-foreground">
                    {floor.groups.reduce((n, g) => n + g.rooms.length, 0)} rooms
                  </span>
                </div>
                {floors.length > 1 && (
                  <button onClick={() => removeFloor(floor.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Groups */}
              <div className="divide-y divide-border">
                {floor.groups.map((group, gi) => (
                  <div key={group.id} className="p-4 space-y-3">
                    {/* Group controls */}
                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        value={group.type}
                        onChange={e => setGroup(floor.id, group.id, { type: e.target.value })}
                        className="h-8 px-2.5 text-xs font-medium bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {ROOM_TYPES.map(t => (
                          <option key={t} value={t}
                            disabled={t !== group.type && floor.groups.some(g => g.id !== group.id && g.type === t)}>
                            {t}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Rooms</span>
                        <button
                          onClick={() => setCount(floor.id, group.id, group.rooms.length - 1)}
                          className="w-6 h-6 flex items-center justify-center border border-border rounded text-sm hover:bg-muted transition-colors"
                        >−</button>
                        <span className="w-7 text-center text-sm font-medium">{group.rooms.length}</span>
                        <button
                          onClick={() => setCount(floor.id, group.id, group.rooms.length + 1)}
                          className="w-6 h-6 flex items-center justify-center border border-border rounded text-sm hover:bg-muted transition-colors"
                        >+</button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">₹</span>
                        <input
                          type="number"
                          min={1}
                          value={group.price}
                          onChange={e => setGroup(floor.id, group.id, { price: Number(e.target.value) })}
                          className="w-24 h-8 px-2.5 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
                          placeholder="Price/night"
                        />
                        <span className="text-xs text-muted-foreground">/night</span>
                      </div>

                      {floor.groups.length > 1 && (
                        <button
                          onClick={() => removeGroup(floor.id, group.id)}
                          className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Room number chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {group.rooms.map(room => {
                        const isDup = duplicates.has(room.number.trim());
                        const isEdit = editing === room.id;
                        return isEdit ? (
                          <input
                            key={room.id}
                            autoFocus
                            value={room.number}
                            onChange={e => setRoomNum(floor.id, group.id, room.id, e.target.value)}
                            onBlur={() => setEditing(null)}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditing(null); }}
                            className={cn(
                              'w-16 h-8 px-2 text-xs text-center font-mono border rounded focus:outline-none focus:ring-1 focus:ring-ring bg-background',
                              isDup ? 'border-destructive text-destructive' : 'border-primary'
                            )}
                          />
                        ) : (
                          <button
                            key={room.id}
                            onClick={() => setEditing(room.id)}
                            title="Click to edit room number"
                            className={cn(
                              'h-8 px-2.5 text-xs font-mono border rounded transition-colors hover:border-foreground/40',
                              isDup
                                ? 'border-destructive/50 bg-destructive/8 text-destructive'
                                : 'border-border bg-card text-foreground'
                            )}
                          >
                            {room.number || '—'}
                          </button>
                        );
                      })}
                    </div>
                    {gi === 0 && (
                      <p className="text-[11px] text-muted-foreground">Click any room number to edit it</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Add group */}
              <div className="px-4 py-3 border-t border-border">
                <button
                  onClick={() => addGroup(floor.id)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add room type to this floor
                </button>
              </div>
            </div>
          ))}

          {/* Add floor */}
          <button
            onClick={addFloor}
            className="w-full h-11 border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Add floor
          </button>
        </div>

        {/* Submit */}
        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={submit}
            disabled={loading || duplicates.size > 0}
            className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Complete setup · {totalRooms} rooms
          </button>
          {duplicates.size > 0 && (
            <span className="text-xs text-destructive">Fix duplicate room numbers first</span>
          )}
        </div>
      </div>
    </div>
  );
}
