'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Hotel {
  _id: string; name: string; ownerName: string; email: string;
  phone: string; address?: string; city?: string; state?: string;
}

export function SettingsClient({ hotel }: { hotel: Hotel }) {
  const [form, setForm] = useState({
    name: hotel.name, ownerName: hotel.ownerName, phone: hotel.phone,
    address: hotel.address || '', city: hotel.city || '', state: hotel.state || '',
  });
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full h-10 px-3 text-sm bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring';
  const labelClass = 'block text-xs text-muted-foreground mb-1.5';

  return (
    <div className="p-4 sm:p-8 max-w-xl">

      {/* Header */}
      <div className="mb-6 sm:mb-10">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">Account</p>
        <h1 className="text-xl sm:text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">{hotel.phone}</p>
      </div>

      <form onSubmit={save} className="space-y-8">

        {/* Hotel info */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">Hotel information</p>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Hotel name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email address</label>
              <input value={hotel.email} disabled className={`${inputClass} opacity-40 cursor-not-allowed`} />
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Owner */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">Owner details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full name</label>
              <input value={form.ownerName} onChange={e => set('ownerName', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Location */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">Location</p>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Address</label>
              <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Near Dal Lake, Boulevard Road" className={inputClass} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>City</label>
                <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Srinagar" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input value={form.state} onChange={e => set('state', e.target.value)} placeholder="Jammu & Kashmir" className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-muted-foreground">Changes are saved immediately</p>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
