import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';
import Booking from '@/models/Booking';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { roomIds, guestName, idType, idNumber, idImageUrl, checkIn, checkOut } = await req.json();

  if (!roomIds?.length || !guestName || !idType) {
    return NextResponse.json({ error: 'Room IDs, guest name and ID type are required' }, { status: 400 });
  }
  if (!idNumber && !idImageUrl) {
    return NextResponse.json({ error: 'Provide either an ID number or upload an ID card image' }, { status: 400 });
  }

  await connectDB();

  const rooms = await Room.find({ _id: { $in: roomIds }, hotelId: session.hotelId });
  if (rooms.length !== roomIds.length) {
    return NextResponse.json({ error: 'One or more rooms not found' }, { status: 404 });
  }

  const notAvailable = rooms.filter(r => r.status !== 'available');
  if (notAvailable.length > 0) {
    return NextResponse.json(
      { error: `Rooms not available: ${notAvailable.map(r => r.roomNumber).join(', ')}` },
      { status: 400 }
    );
  }

  const checkInDate = checkIn ? new Date(checkIn) : new Date();

  await Booking.insertMany(
    rooms.map(r => ({
      hotelId:    session.hotelId,
      roomId:     r._id,
      roomNumber: r.roomNumber,
      roomType:   r.roomType,
      price:      r.price,
      guestName,
      idType,
      idNumber:   idNumber || null,
      idImageUrl: idImageUrl || null,
      checkIn:    checkInDate,
      checkOut:   checkOut ? new Date(checkOut) : null,
      status:     'active',
    }))
  );

  await Room.updateMany({ _id: { $in: roomIds } }, { status: 'occupied' });

  return NextResponse.json({ success: true, roomsCheckedIn: rooms.length });
}
