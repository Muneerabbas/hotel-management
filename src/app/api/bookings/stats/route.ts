import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  const hotelOid = new mongoose.Types.ObjectId(session.hotelId);

  const [totals, byType, recentRevenue] = await Promise.all([
    Booking.aggregate([
      { $match: { hotelId: hotelOid } },
      {
        $group: {
          _id: null,
          totalBookings:   { $sum: 1 },
          completedStays:  { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          activeGuests:    { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          totalRevenue:    { $sum: { $ifNull: ['$totalAmount', 0] } },
          totalNights:     { $sum: { $ifNull: ['$nights', 0] } },
          avgNights:       { $avg: { $ifNull: ['$nights', 1] } },
        },
      },
    ]),
    Booking.aggregate([
      { $match: { hotelId: hotelOid, status: 'completed' } },
      { $group: { _id: '$roomType', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { revenue: -1 } },
    ]),
    // Last 7 days revenue
    Booking.aggregate([
      {
        $match: {
          hotelId: hotelOid,
          status: 'completed',
          checkOut: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$checkOut' } },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return NextResponse.json({
    summary: totals[0] ?? { totalBookings: 0, completedStays: 0, activeGuests: 0, totalRevenue: 0, totalNights: 0, avgNights: 0 },
    byType,
    recentRevenue,
  });
}
