import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { hotelName, ownerName, email, password, phone } = await req.json();

    if (!hotelName || !ownerName || !email || !password || !phone) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const existing = await Hotel.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hotel = await Hotel.create({ name: hotelName, ownerName, email, password, phone });

    const token = signToken({ hotelId: hotel._id.toString(), email: hotel.email, hotelName: hotel.name });

    const cookieStore = await cookies();
    cookieStore.set('stayflow_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({ hotelId: hotel._id.toString(), hotelName: hotel.name }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
