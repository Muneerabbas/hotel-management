import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import Room from '@/models/Room';
import { getSession } from '@/lib/auth';

interface RoomInput {
  number: string;
  type: string;
  price: number;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const { rooms }: { rooms: RoomInput[] } = await req.json();

    if (!rooms?.length) {
      return NextResponse.json({ error: 'At least one room is required' }, { status: 400 });
    }

    const numbers = rooms.map(r => r.number);
    if (new Set(numbers).size !== numbers.length) {
      return NextResponse.json({ error: 'Duplicate room numbers found' }, { status: 400 });
    }

    await Hotel.findByIdAndUpdate(session.hotelId, { onboardingCompleted: true });
    await Room.deleteMany({ hotelId: session.hotelId });

    await Room.insertMany(
      rooms.map(r => ({
        hotelId: session.hotelId,
        roomNumber: r.number.trim(),
        roomType: r.type,
        price: r.price,
        status: 'available',
      }))
    );

    return NextResponse.json({ success: true, roomsCreated: rooms.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
