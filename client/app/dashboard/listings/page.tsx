'use client';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { OwnerListing } from '@/lib/types';
import Button from '@/components/ui/Button';
import SectionLabel from '@/components/ui/SectionLabel';
import CompletenessBar from '@/components/forms/CompletenessBar';
import { cn } from '@/lib/utils';

export default function MyListingsPage() {
  const qc = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => api.get<{ data: OwnerListing[] }>('/listings/mine'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/listings/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-listings'] }),
  });

  const listings = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <SectionLabel>My Rooms</SectionLabel>
          <h1 className="font-display text-3xl">Your Listings</h1>
        </div>
        <Link
          href="/dashboard/listings/new"
          className={cn(
            'inline-flex items-center justify-center font-sans font-medium touch-manipulation transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'min-h-[44px] px-6 py-3 text-base',
            'bg-accent text-accent-foreground rounded-md shadow-sm hover:bg-accent-secondary hover:shadow-md active:translate-y-0',
          )}
        >
          + Add Room
        </Link>
      </div>
      {isPending ? (
        <div className="animate-pulse h-48 bg-muted rounded-lg" />
      ) : (
        <div className="space-y-4">
          {listings.length === 0 && (
            <div className="text-center py-16 border border-dashed border-border rounded-lg">
              <p className="font-display text-xl mb-4">No listings yet</p>
              <Link
                href="/dashboard/listings/new"
                className={cn(
                  'inline-flex items-center justify-center font-sans font-medium touch-manipulation transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'min-h-[44px] px-6 py-3 text-base',
                  'bg-accent text-accent-foreground rounded-md shadow-sm hover:bg-accent-secondary hover:shadow-md active:translate-y-0',
                )}
              >
                Post Your First Room
              </Link>
            </div>
          )}
          {listings.map((l) => (
            <div key={l.id} className="border border-border rounded-lg p-6 flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="font-display text-lg mb-1">{l.title}</h3>
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-wide mb-4">
                  {l.locality}, {l.city} · ₹{l.price.toLocaleString('en-IN')}
                  {l.intent === 'rent' ? '/mo' : ''} · {l.intent === 'buy' ? 'for sale' : 'for rent'}
                </p>
                <CompletenessBar score={l.completenessScore} />
              </div>
              <div className="flex gap-3 items-start">
                <Link
                  href={`/dashboard/listings/${l.id}/edit`}
                  className={cn(
                    'inline-flex items-center justify-center font-sans font-medium touch-manipulation transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    'min-h-[44px] px-4 py-2 text-sm',
                    'bg-transparent border border-foreground text-foreground rounded-md hover:bg-muted hover:border-accent hover:text-accent',
                  )}
                >
                  Edit
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate(l.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
