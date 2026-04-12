import Image from 'next/image';
import Link from 'next/link';
import type { ListingCardData } from '@/lib/types';
import Card from '@/components/ui/Card';
import TrustBadge from '@/components/ui/TrustBadge';
import ContactButton from './ContactButton';
import FavoriteButton from './FavoriteButton';

const TRUST_BADGES = ['verified_owner', 'well_detailed', 'recently_updated'] as const;
type TrustBadgeType = (typeof TRUST_BADGES)[number];

function isTrustBadge(value: string): value is TrustBadgeType {
  return (TRUST_BADGES as readonly string[]).includes(value);
}

function formatRoomType(roomType: string): string {
  const map: Record<string, string> = {
    '1bhk': '1 BHK', '2bhk': '2 BHK', '3bhk': '3 BHK', '4bhk': '4 BHK',
    single: 'Single', double: 'Double', multiple: 'Multiple',
  };
  return map[roomType] ?? roomType;
}

function formatPropertyType(propertyType: string): string {
  const map: Record<string, string> = {
    pg: 'PG', hostel: 'Hostel', apartment: 'Apartment', flat: 'Flat',
  };
  return map[propertyType] ?? propertyType;
}

function formatFurnishing(furnishing: string): string {
  const map: Record<string, string> = {
    furnished: 'Furnished', semi: 'Semi-Furnished', unfurnished: 'Unfurnished',
  };
  return map[furnishing] ?? furnishing;
}

function formatAvailability(availableFrom?: string | null): string | null {
  if (!availableFrom) return null;
  const date = new Date(availableFrom);
  if (isNaN(date.getTime())) return null;
  if (date <= new Date()) return 'Now';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface ListingCardProps {
  listing: ListingCardData;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const thumb = listing.images[0] ?? null;
  const priceSuffix = listing.intent === 'buy' ? '' : '/mo';
  const availability = formatAvailability(listing.availableFrom);
  const hasLocalityLink = listing.citySlug && listing.localitySlug;

  return (
    <Card hoverEffect className="relative overflow-hidden flex flex-col md:flex-row">
      {/* Full-card link behind everything */}
      <Link
        href={`/listings/${listing.id}`}
        className="absolute inset-0 z-0"
        aria-label={listing.title}
      />

      {/* Image */}
      <div className="relative w-full md:w-48 lg:w-64 shrink-0 aspect-[4/3] md:aspect-auto bg-muted">
        {thumb ? (
          <Image
            src={thumb}
            alt={listing.title}
            fill
            className="object-cover md:rounded-l-lg"
            sizes="(max-width: 768px) 100vw, 256px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-mono text-xs uppercase tracking-wider">
            No Photo
          </div>
        )}
        {/* Favorite button overlaid on image */}
        <div className="absolute top-2 right-2 z-10">
          <FavoriteButton
            listingId={listing.id}
            city={listing.city}
            locality={listing.locality}
            compact
          />
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 p-4 flex flex-col gap-1.5 relative z-10 pointer-events-none">
        {/* Title row */}
        <h3 className="font-display text-base leading-tight line-clamp-2 pr-2">{listing.title}</h3>

        {/* Locality + explore nearby */}
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
            {listing.locality}, {listing.city}
          </p>
          {hasLocalityLink && (
            <Link
              href={`/${listing.citySlug}/${listing.localitySlug}`}
              className="text-xs text-blue-600 hover:underline pointer-events-auto"
            >
              Explore nearby →
            </Link>
          )}
        </div>

        {/* Price + deposit */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-display text-lg text-accent">
            ₹{listing.price.toLocaleString('en-IN')}
            {priceSuffix && <span className="font-sans text-xs text-muted-foreground">{priceSuffix}</span>}
          </span>
          {listing.deposit != null && listing.deposit > 0 && (
            <span className="font-sans text-xs text-muted-foreground">
              · Deposit: ₹{listing.deposit.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Primary tags: room type · furnishing · property type */}
        <div className="flex flex-wrap gap-1">
          <span className="font-mono text-xs px-2 py-0.5 bg-muted border border-border rounded uppercase tracking-wide">
            {formatRoomType(listing.roomType)}
          </span>
          {listing.furnishing && (
            <span className="font-mono text-xs px-2 py-0.5 bg-muted border border-border rounded uppercase tracking-wide">
              {formatFurnishing(listing.furnishing)}
            </span>
          )}
          <span className="font-mono text-xs px-2 py-0.5 bg-muted border border-border rounded uppercase tracking-wide">
            {formatPropertyType(listing.propertyType)}
          </span>
          {listing.foodIncluded && (
            <span className="font-mono text-xs px-2 py-0.5 bg-accent/10 border border-accent/30 text-accent rounded uppercase tracking-wide">
              Food Incl.
            </span>
          )}
        </div>

        {/* Secondary info: area · preferred tenants · gender */}
        {(listing.areaSqft || (listing.preferredTenants && listing.preferredTenants !== 'any') || (listing.genderPref && listing.genderPref !== 'any')) && (
          <p className="font-sans text-xs text-muted-foreground">
            {[
              listing.areaSqft ? `${listing.areaSqft} sq ft` : null,
              listing.preferredTenants && listing.preferredTenants !== 'any'
                ? `For ${listing.preferredTenants}`
                : null,
              listing.genderPref === 'male' ? 'Male only'
                : listing.genderPref === 'female' ? 'Female only'
                : null,
            ].filter(Boolean).join(' · ')}
          </p>
        )}

        {/* Availability */}
        {availability && (
          <p className="font-sans text-xs text-muted-foreground">
            Available: {availability}
          </p>
        )}

        {/* Landmark */}
        {listing.landmark && (
          <p className="font-sans text-xs text-muted-foreground">
            Near {listing.landmark}
          </p>
        )}

        {/* Trust badges */}
        {listing.badges.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1 border-t border-border">
            {listing.badges.filter(isTrustBadge).map((badge) => (
              <TrustBadge key={badge} type={badge} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-2 flex justify-end pointer-events-auto">
          <ContactButton
            listingId={listing.id}
            ownerId={listing.ownerId}
            city={listing.city}
            locality={listing.locality}
            propertyType={listing.propertyType}
          />
        </div>
      </div>
    </Card>
  );
}
