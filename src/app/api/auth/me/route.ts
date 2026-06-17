import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Hotel from '@/models/Hotel';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const hotel = await Hotel.findById(session.hotelId).select('-password');
  if (!hotel) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(hotel);
}
