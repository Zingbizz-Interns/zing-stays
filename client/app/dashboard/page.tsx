'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import SectionLabel from '@/components/ui/SectionLabel';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <div>
      <SectionLabel>Dashboard</SectionLabel>
      <h1 className="font-display text-3xl mb-2">Welcome, {user?.name || 'there'}</h1>
      <p className="font-sans text-muted-foreground mb-10">{user?.email}</p>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-border rounded-xl p-8">
          <h2 className="font-display text-xl mb-2">Your Listings</h2>
          <p className="font-sans text-sm text-muted-foreground mb-6">Manage the rooms you&apos;ve posted</p>
          <Link
            href="/dashboard/listings"
            className={cn(
              'inline-flex items-center justify-center font-sans font-medium touch-manipulation transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'min-h-[44px] px-6 py-3 text-base',
              'bg-transparent border border-foreground text-foreground rounded-md hover:bg-muted hover:border-accent hover:text-accent',
            )}
          >
            View My Rooms
          </Link>
        </div>
        <div className="border border-border rounded-xl p-8">
          <h2 className="font-display text-xl mb-2">Post a New Room</h2>
          <p className="font-sans text-sm text-muted-foreground mb-6">List your PG, hostel, or room for free</p>
          <Link
            href="/dashboard/listings/new"
            className={cn(
              'inline-flex items-center justify-center font-sans font-medium touch-manipulation transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'min-h-[44px] px-6 py-3 text-base',
              'bg-accent text-accent-foreground rounded-md shadow-sm hover:bg-accent-secondary hover:shadow-md active:translate-y-0',
            )}
          >
            + Post a Room
          </Link>
        </div>
      </div>
    </div>
  );
}
