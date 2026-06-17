import { getSession } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import { SettingsClient } from './SettingsClient';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return null;

  await connectDB();
  const hotel = await Hotel.findById(session.hotelId).select('-password').lean();

  return <SettingsClient hotel={JSON.parse(JSON.stringify(hotel))} />;
}
