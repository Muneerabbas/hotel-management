import { getSession } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';
import Hotel from '@/models/Hotel';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  await connectDB();
  const [hotel, rooms] = await Promise.all([
    Hotel.findById(session.hotelId).select('name ownerName city state').lean(),
    Room.find({ hotelId: session.hotelId }).lean(),
  ]);

  const stats = {
    total: rooms.length,
    available: rooms.filter((r) => r.status === 'available').length,
    occupied: rooms.filter((r) => r.status === 'occupied').length,
    maintenance: rooms.filter((r) => r.status === 'maintenance').length,
  };

  return (
    <DashboardClient
      hotel={JSON.parse(JSON.stringify(hotel))}
      initialStats={stats}
      hotelId={session.hotelId}
    />
  );
}
