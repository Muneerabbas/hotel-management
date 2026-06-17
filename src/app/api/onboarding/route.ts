import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import Room from '@/models/Room';
import { getSession } from '@/lib/auth';

interface RoomTypeConfig {
  name: string;
  count: number;
  price: number;
  floorPrefix: number;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const body = await req.json();
    const { roomTypes } = body;
    const hotel = body.hotel ?? body;
    const { address, city, district, state, pincode } = hotel;

    await Hotel.findByIdAndUpdate(session.hotelId, {
      address,
      city,
      district,
      state,
      pincode,
      onboardingCompleted: true,
    });

    // Delete existing rooms for this hotel (re-onboarding case)
    await Room.deleteMany({ hotelId: session.hotelId });

    const rooms = [];
    for (let i = 0; i < roomTypes.length; i++) {
      const rt: RoomTypeConfig = roomTypes[i];
      const floor = i + 1;
      for (let j = 1; j <= rt.count; j++) {
        const roomNumber = `${floor}${String(j).padStart(2, '0')}`;
        rooms.push({
          hotelId: session.hotelId,
          roomNumber,
          roomType: rt.name,
          price: rt.price,
          status: 'available',
        });
      }
    }

    await Room.insertMany(rooms);

    return NextResponse.json({ success: true, roomsCreated: rooms.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
