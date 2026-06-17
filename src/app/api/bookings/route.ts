import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status   = searchParams.get('status');   // 'active' | 'completed' | null
  const roomType = searchParams.get('roomType');
  const search   = searchParams.get('search');   // guest name or room number
  const from     = searchParams.get('from');     // ISO date
  const to       = searchParams.get('to');       // ISO date
  const limit    = parseInt(searchParams.get('limit') || '100');
  const skip     = parseInt(searchParams.get('skip')  || '0');

  await connectDB();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = { hotelId: session.hotelId };

  if (status)   query.status = status;
  if (roomType) query.roomType = roomType;
  if (from || to) {
    query.checkIn = {};
    if (from) query.checkIn.$gte = new Date(from);
    if (to)   query.checkIn.$lte = new Date(to + 'T23:59:59');
  }
  if (search) {
    query.$or = [
      { guestName:  { $regex: search, $options: 'i' } },
      { roomNumber: { $regex: search, $options: 'i' } },
      { idNumber:   { $regex: search, $options: 'i' } },
    ];
  }

  const [bookings, total] = await Promise.all([
    Booking.find(query).sort({ checkIn: -1 }).skip(skip).limit(limit).lean(),
    Booking.countDocuments(query),
  ]);

  return NextResponse.json({ bookings, total });
}
