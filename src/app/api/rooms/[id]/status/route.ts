import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';
import Booking from '@/models/Booking';
import { getSession } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { status, guestName, idType, idNumber, idImageUrl, checkIn, checkOut } = body;

  if (!['available', 'occupied', 'maintenance'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  await connectDB();

  const room = await Room.findOne({ _id: id, hotelId: session.hotelId });
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

  const previousStatus = room.status;

  if (status === 'occupied' && previousStatus !== 'occupied') {
    if (!guestName || !idType) {
      return NextResponse.json(
        { error: 'Guest name and ID type are required for check-in' },
        { status: 400 }
      );
    }
    if (!idNumber && !idImageUrl) {
      return NextResponse.json(
        { error: 'Provide either an ID number or upload an ID card image' },
        { status: 400 }
      );
    }
    const checkInDate = checkIn ? new Date(checkIn) : new Date();
    await Booking.create({
      hotelId:    session.hotelId,
      roomId:     room._id,
      roomNumber: room.roomNumber,
      roomType:   room.roomType,
      price:      room.price,
      guestName,
      idType,
      idNumber:   idNumber || null,
      idImageUrl: idImageUrl || null,
      checkIn:    checkInDate,
      checkOut:   checkOut ? new Date(checkOut) : null,
      status:     'active',
    });
  }

  if (status !== 'occupied' && previousStatus === 'occupied') {
    const activeBooking = await Booking.findOne({ roomId: room._id, status: 'active' }).sort({ checkIn: -1 });
    if (activeBooking) {
      const checkOutDate = new Date();
      const msPerDay = 1000 * 60 * 60 * 24;
      const nights = Math.max(1, Math.round((checkOutDate.getTime() - activeBooking.checkIn.getTime()) / msPerDay));
      await Booking.findByIdAndUpdate(activeBooking._id, {
        checkOut: checkOutDate,
        nights,
        totalAmount: nights * room.price,
        status: 'completed',
      });
    }
  }

  room.status = status;
  await room.save();

  return NextResponse.json(room);
}
