import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  await connectDB();
  const hotel = await Hotel.findById(session.hotelId).select('name ownerName onboardingCompleted');
  if (!hotel) redirect('/login');
  if (!hotel.onboardingCompleted) redirect('/onboarding');

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar hotelName={hotel.name} ownerName={hotel.ownerName} />
      </div>

      {/* Main content — extra bottom padding on mobile for the bottom nav */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <MobileNav hotelName={hotel.name} />
        <div className="flex-1 pb-16 md:pb-0">
          {children}
        </div>
      </main>
    </div>
  );
}
