'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useFavorites, useToggleFavorite } from '@/hooks/useFavorites';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  listingId: number;
  city?: string;
  locality?: string;
  /** Render as a small icon-only button (for use inline on cards) */
  compact?: boolean;
}

export default function FavoriteButton({ listingId, city, locality, compact }: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { data } = useFavorites();
  const { save, remove } = useToggleFavorite();
  const [error, setError] = useState<string | null>(null);

  const isSaved = useMemo(
    () => (data?.data ?? []).some((listing) => listing.id === listingId),
    [data, listingId],
  );

  const isBusy = save.isPending || remove.isPending;

  const toggleFavorite = async (allowAuthenticatedRequest = isAuthenticated) => {
    if (!allowAuthenticatedRequest) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname || '/listings')}`);
      return;
    }

    setError(null);
    try {
      if (isSaved) {
        await remove.mutateAsync({ listingId, city, locality });
      } else {
        await save.mutateAsync({ listingId, city, locality });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update saved listings');
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        aria-label={isSaved ? 'Remove from favorites' : 'Save to favorites'}
        onClick={(e) => { e.stopPropagation(); void toggleFavorite(); }}
        disabled={isBusy}
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:bg-white disabled:opacity-50',
          isSaved ? 'text-red-500' : 'text-gray-500 hover:text-red-400',
        )}
      >
        <Heart className={cn('h-4 w-4', isSaved && 'fill-current')} />
      </button>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant={isSaved ? 'primary' : 'secondary'}
        size="lg"
        className="w-full gap-2"
        onClick={() => void toggleFavorite()}
        disabled={isBusy}
      >
        <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        {isBusy ? 'Updating...' : isSaved ? 'Saved to Favorites' : 'Save Listing'}
      </Button>
      {error ? (
        <p className="font-sans text-xs text-red-500 text-center mt-2">{error}</p>
      ) : (
        <p className="font-sans text-xs text-muted-foreground text-center mt-2">
          {isAuthenticated ? 'Save this listing to revisit it later' : 'Sign in to save this listing'}
        </p>
      )}
    </>
  );
}
