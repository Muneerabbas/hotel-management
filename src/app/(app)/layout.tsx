import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import { Sidebar } from '@/components/Sidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  await connectDB();
  const hotel = await Hotel.findById(session.hotelId).select('name ownerName onboardingCompleted');
  if (!hotel) redirect('/login');
  if (!hotel.onboardingCompleted) redirect('/onboarding');

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar hotelName={hotel.name} ownerName={hotel.ownerName} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
