'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ContactInfo {
  phone: string;
  name?: string;
}

interface ContactButtonProps {
  listingId: number;
  ownerId?: number;
  city?: string;
  locality?: string;
  propertyType?: string;
  onReveal?: () => void;
  className?: string;
}

export default function ContactButton({
  listingId,
  ownerId,
  city,
  locality,
  propertyType,
  onReveal,
  className,
}: ContactButtonProps) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const posthog = usePostHog();
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = ownerId !== undefined && user?.id === ownerId;

  if (isOwner) {
    return (
      <p className={cn('font-mono text-xs text-muted-foreground uppercase tracking-wide', className)}>
        Your listing
      </p>
    );
  }

  const revealContact = async (allowAuthenticatedRequest = isAuthenticated) => {
    if (!allowAuthenticatedRequest) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname || `/listings/${listingId}`)}`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ContactInfo>(`/listings/${listingId}/contact`, {});
      setContact(res);
      onReveal?.();
      posthog?.capture('contact_revealed', {
        listing_id: listingId,
        city,
        locality,
        property_type: propertyType,
        page_type: 'listing_detail',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve contact details');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Link
        href={`/auth/login?redirect=${encodeURIComponent(pathname || `/listings/${listingId}`)}`}
        className={cn(
          'inline-flex items-center justify-center font-sans font-medium text-sm min-h-[44px] px-4 py-2 bg-accent text-accent-foreground rounded-md shadow-sm hover:bg-accent-secondary hover:shadow-md transition-all duration-200',
          className,
        )}
      >
        Sign in to Contact
      </Link>
    );
  }

  if (contact) {
    return (
      <div className={cn('p-4 border border-accent/30 bg-accent/5 rounded-lg', className)}>
        <p className="font-mono text-xs uppercase tracking-[0.1em] text-accent mb-1">
          Owner Contact
        </p>
        {contact.name && <p className="font-display text-base mb-0.5">{contact.name}</p>}
        <a
          href={`tel:${contact.phone}`}
          className="font-display text-xl text-accent hover:underline underline-offset-4"
        >
          {contact.phone}
        </a>
      </div>
    );
  }

  return (
    <>
      <Button size="sm" onClick={() => void revealContact()} disabled={loading} className={className}>
        {loading ? 'Loading...' : 'Contact Owner'}
      </Button>
      {error && (
        <p className="font-sans text-xs text-red-500 mt-1">{error}</p>
      )}
    </>
  );
}
