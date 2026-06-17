'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Building2, Loader2, Plus, Trash2 } from 'lucide-react';

type Step = 1 | 2;

interface RoomType { type: string; count: number; price: number }
const ROOM_TYPE_OPTIONS = ['Standard', 'Deluxe', 'Suite', 'Executive', 'Family'];

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

// API returns names like "Jammu & Kashmir" — normalize to match dropdown values
const STATE_NAME_MAP: Record<string, string> = {
  'jammu & kashmir': 'Jammu and Kashmir',
  'andaman & nicobar islands': 'Andaman and Nicobar Islands',
  'dadra & nagar haveli and daman & diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'dadra and nagar haveli and daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'pondicherry': 'Puducherry',
  'uttaranchal': 'Uttarakhand',
  'orissa': 'Odisha',
};

function normalizeState(raw: string): string {
  const key = raw.toLowerCase().trim();
  return STATE_NAME_MAP[key] ?? INDIA_STATES.find(s => s.toLowerCase() === key) ?? raw;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const [hotel, setHotel] = useState({
    name: '', city: '', district: '', state: '', address: '', pincode: '', phone: '', description: '',
  });
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([
    { type: 'Standard', count: 10, price: 2500 },
  ]);

  const setH = (k: string, v: string) => setHotel(h => ({ ...h, [k]: v }));

  const lookupPincode = async (pin: string) => {
    if (pin.length !== 6) return;
    setPincodeLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        setHotel(h => ({
          ...h,
          city: h.city || po.Block || po.Name || '',
          district: po.District || '',
          state: normalizeState(po.State || ''),
        }));
        toast.success('Address auto-filled from pincode');
      } else {
        toast.error('Pincode not found');
      }
    } catch {
      toast.error('Failed to fetch pincode details');
    } finally {
      setPincodeLoading(false);
    }
  };

  const addType = () => {
    const unused = ROOM_TYPE_OPTIONS.find(t => !roomTypes.find(r => r.type === t));
    if (unused) setRoomTypes(r => [...r, { type: unused, count: 5, price: 3500 }]);
  };

  const updateType = (i: number, k: keyof RoomType, v: string | number) =>
    setRoomTypes(r => r.map((rt, idx) => idx === i ? { ...rt, [k]: v } : rt));

  const removeType = (i: number) =>
    setRoomTypes(r => r.filter((_, idx) => idx !== i));

  const step1Valid = hotel.name && hotel.city && hotel.phone;

  const submit = async () => {
    if (roomTypes.length === 0) { toast.error('Add at least one room type'); return; }
    if (roomTypes.some(r => r.count < 1 || r.price < 1)) {
      toast.error('All room types need valid count and price'); return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotel, roomTypes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Setup complete');
      router.push('/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm tracking-wide">StayFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Step {step} of 2</span>
            <div className="flex gap-1.5">
              {([1, 2] as const).map(n => (
                <div key={n} className={`h-1 w-6 rounded-full transition-colors ${n <= step ? 'bg-primary' : 'bg-border'}`} />
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-14">

        {/* Step 1 — Hotel details */}
        {step === 1 && (
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-6">Hotel details</p>
            <h1 className="text-2xl font-semibold mb-8">Tell us about your property</h1>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/80">Hotel name</label>
                <input
                  value={hotel.name}
                  onChange={e => setH('name', e.target.value)}
                  placeholder="Houseboat Heritage Srinagar"
                  className="w-full h-10 px-3 text-sm bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Pincode with auto-lookup */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/80">Pincode</label>
                <div className="relative">
                  <input
                    value={hotel.pincode}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setH('pincode', val);
                      if (val.length === 6) lookupPincode(val);
                    }}
                    placeholder="190001"
                    maxLength={6}
                    disabled={pincodeLoading}
                    className="w-full h-10 px-3 pr-9 text-sm bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50 disabled:opacity-60"
                  />
                  {pincodeLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {pincodeLoading
                    ? <span className="flex items-center gap-1.5 text-primary"><Loader2 className="w-3 h-3 animate-spin" />Fetching address details…</span>
                    : 'Enter 6-digit pincode to auto-fill city, district and state'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground/80">City</label>
                  <input
                    value={hotel.city}
                    onChange={e => setH('city', e.target.value)}
                    placeholder="Srinagar"
                    className="w-full h-10 px-3 text-sm bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground/80">District</label>
                  <input
                    value={hotel.district}
                    onChange={e => setH('district', e.target.value)}
                    placeholder="Srinagar"
                    className="w-full h-10 px-3 text-sm bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/80">State</label>
                <select
                  value={hotel.state}
                  onChange={e => setH('state', e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                >
                  <option value="">Select state</option>
                  {INDIA_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/80">Address</label>
                <input
                  value={hotel.address}
                  onChange={e => setH('address', e.target.value)}
                  placeholder="Near Dal Lake, Boulevard Road"
                  className="w-full h-10 px-3 text-sm bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/80">Phone</label>
                <input
                  type="tel"
                  value={hotel.phone}
                  onChange={e => setH('phone', e.target.value)}
                  placeholder="+91 94190 00000"
                  className="w-full h-10 px-3 text-sm bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/80">
                  Description <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea
                  value={hotel.description}
                  onChange={e => setH('description', e.target.value)}
                  placeholder="A brief note about your property..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    if (step1Valid) setStep(2);
                    else toast.error('Please fill hotel name, city and phone');
                  }}
                  className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 transition-opacity"
                >
                  Continue to room setup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Room configuration */}
        {step === 2 && (
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-6">Room configuration</p>
            <h1 className="text-2xl font-semibold mb-2">Set up your room types</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Each type gets its own floor. Room numbers are auto-generated (e.g. Standard → 101, 102…)
            </p>

            <div className="space-y-3 mb-6">
              {roomTypes.map((rt, i) => (
                <div key={i} className="border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Floor {i + 1}</p>
                    {roomTypes.length > 1 && (
                      <button onClick={() => removeType(i)} className="text-muted-foreground hover:text-foreground transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Type</label>
                      <select
                        value={rt.type}
                        onChange={e => updateType(i, 'type', e.target.value)}
                        className="w-full h-9 px-2.5 text-sm bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {ROOM_TYPE_OPTIONS.map(t => (
                          <option key={t} value={t} disabled={roomTypes.some((r, ri) => ri !== i && r.type === t)}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Rooms</label>
                      <input
                        type="number"
                        min={1}
                        value={rt.count}
                        onChange={e => updateType(i, 'count', Number(e.target.value))}
                        className="w-full h-9 px-2.5 text-sm bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Price / night (₹)</label>
                      <input
                        type="number"
                        min={1}
                        value={rt.price}
                        onChange={e => updateType(i, 'price', Number(e.target.value))}
                        className="w-full h-9 px-2.5 text-sm bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Preview: {Array.from({ length: Math.min(rt.count, 5) }, (_, j) => `${i + 1}0${j + 1}`).join(', ')}
                    {rt.count > 5 ? `… ${rt.count} total` : ''}
                  </p>
                </div>
              ))}

              {roomTypes.length < ROOM_TYPE_OPTIONS.length && (
                <button
                  onClick={addType}
                  className="w-full h-10 border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add room type
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back
              </button>
              <button
                onClick={submit}
                disabled={loading}
                className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Complete setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
