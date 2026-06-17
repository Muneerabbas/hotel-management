import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';
import Booking from '@/models/Booking';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date'); // YYYY-MM-DD — overlay booking status for this date

  const rooms = await Room.find({ hotelId: session.hotelId }).sort({ roomNumber: 1 }).lean();

  if (!date) return NextResponse.json(rooms);

  // Find all bookings that cover this date
  const d = new Date(date);
  const dayStart = new Date(date + 'T00:00:00.000Z');
  const dayEnd   = new Date(date + 'T23:59:59.999Z');

  const occupiedBookings = await Booking.find({
    hotelId: session.hotelId,
    checkIn: { $lte: dayEnd },
    $or: [
      { checkOut: null },                  // still active (no checkout yet)
      { checkOut: { $gte: dayStart } },    // checked out after the date
    ],
  }).select('roomId').lean();

  const occupiedIds = new Set(occupiedBookings.map(b => b.roomId.toString()));

  const overlaid = rooms.map(r => ({
    ...r,
    status: occupiedIds.has(r._id.toString()) ? 'occupied' : r.status === 'maintenance' ? 'maintenance' : 'available',
    _dateOverlay: true,
  }));

  return NextResponse.json(overlaid);
}
