'use client';
import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ListingFilters from '@/components/listings/ListingFilters';
import ListingCard from '@/components/listings/ListingCard';
import SectionLabel from '@/components/ui/SectionLabel';
import type { ListingCardData } from '@/lib/types';
import { useSearch, type SearchFilters } from '@/hooks/useSearch';

const BUY_ALLOWED_PROPERTY_TYPES = ['apartment', 'flat'];
const BHK_ROOM_TYPES = ['1bhk', '2bhk', '3bhk', '4bhk'];
const OCCUPANCY_ROOM_TYPES = ['single', 'double', 'multiple'];

function canonicalizeParams(
  intent: string | null,
  propertyType: string | null,
  roomTypes: string[],
): {
  propertyTypes: string[];
  roomTypes: string[];
  changed: boolean;
} {
  let resultPropertyTypes = propertyType ? [propertyType] : [];
  let resultRoomTypes = [...roomTypes];
  let changed = false;

  if (intent === 'buy') {
    // Strip pg/hostel from propertyType
    const filtered = resultPropertyTypes.filter(pt => BUY_ALLOWED_PROPERTY_TYPES.includes(pt));
    if (filtered.length !== resultPropertyTypes.length) {
      changed = true;
    }
    resultPropertyTypes = filtered.length > 0 ? filtered : [];

    // Strip occupancy values from roomType
    const filteredRt = resultRoomTypes.filter(rt => !OCCUPANCY_ROOM_TYPES.includes(rt));
    if (filteredRt.length !== resultRoomTypes.length) {
      changed = true;
      resultRoomTypes = filteredRt;
    }
  } else if (intent === 'rent') {
    const onlyPgHostel =
      resultPropertyTypes.length > 0 &&
      resultPropertyTypes.every(pt => !BUY_ALLOWED_PROPERTY_TYPES.includes(pt));

    if (onlyPgHostel) {
      // Strip BHK values when using PG/Hostel
      const filteredRt = resultRoomTypes.filter(rt => !BHK_ROOM_TYPES.includes(rt));
      if (filteredRt.length !== resultRoomTypes.length) {
        changed = true;
        resultRoomTypes = filteredRt;
      }
    }
  }

  return { propertyTypes: resultPropertyTypes, roomTypes: resultRoomTypes, changed };
}

function ListingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const intent = searchParams.get('intent');
  const propertyType = searchParams.get('propertyType') ?? searchParams.get('property_type');
  const roomTypes = searchParams.getAll('roomType');
  const localityIds = searchParams.getAll('localityId');
  const cityId = searchParams.get('cityId');
  const q = searchParams.get('q');
  const roomTypeLegacy = searchParams.get('room_type');
  const gender = searchParams.get('gender');
  const foodIncluded = searchParams.get('food_included');
  const priceMin = searchParams.get('price_min');
  const priceMax = searchParams.get('price_max');

  const { propertyTypes: canonPropTypes, roomTypes: canonRoomTypes, changed } =
    canonicalizeParams(intent, propertyType, roomTypes);

  // Replace URL if canonicalization changed anything
  useEffect(() => {
    if (!changed) return;
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (intent) params.set('intent', intent);
    if (cityId) params.set('cityId', cityId);
    localityIds.forEach(id => params.append('localityId', id));
    canonPropTypes.forEach(pt => params.set('propertyType', pt));
    canonRoomTypes.forEach(rt => params.append('roomType', rt));
    if (roomTypeLegacy) params.set('room_type', roomTypeLegacy);
    if (gender) params.set('gender', gender);
    if (foodIncluded) params.set('food_included', foodIncluded);
    if (priceMin) params.set('price_min', priceMin);
    if (priceMax) params.set('price_max', priceMax);
    router.replace(`/listings?${params.toString()}`);
  }, [
    changed, q, intent, cityId, localityIds, canonPropTypes, canonRoomTypes,
    roomTypeLegacy, gender, foodIncluded, priceMin, priceMax, router,
  ]);

  const filters: SearchFilters = {
    ...(q ? { q } : {}),
    ...(intent ? { intent: intent as 'buy' | 'rent' } : {}),
    ...(cityId ? { cityId } : {}),
    ...(localityIds.length > 0 ? { localityId: localityIds } : {}),
    ...(canonRoomTypes.length > 0 ? { roomType: canonRoomTypes } : {}),
    ...(roomTypeLegacy ? { room_type: roomTypeLegacy } : {}),
    ...(canonPropTypes.length > 0 ? { propertyType: canonPropTypes[0] } : {}),
    ...(gender ? { gender } : {}),
    ...(foodIncluded ? { food_included: foodIncluded } : {}),
    ...(priceMin ? { price_min: priceMin } : {}),
    ...(priceMax ? { price_max: priceMax } : {}),
  };

  const { data, isPending, error } = useSearch(filters);
  const listings = data?.hits ?? [];

  return (
    <div className="flex flex-col md:flex-row gap-12">
      <ListingFilters />
      <div className="flex-1">
        {isPending && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        )}
        {error && (
          <p className="text-muted-foreground font-sans">
            Failed to load listings. Try again.
          </p>
        )}
        {!isPending && listings.length === 0 && (
          <div className="text-center py-24">
            <p className="font-display text-2xl mb-2">No rooms found</p>
            <p className="font-sans text-muted-foreground">
              Try adjusting your filters or search a different city.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {listings.map((listing: ListingCardData) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <div className="max-w-content mx-auto px-6 py-12">
      <div className="mb-10">
        <SectionLabel>Browse Rooms</SectionLabel>
        <h1 className="font-display text-4xl mb-6">Available Rooms</h1>
      </div>
      <Suspense fallback={<div className="animate-pulse h-96 bg-muted rounded-lg" />}>
        <ListingsContent />
      </Suspense>
    </div>
  );
}
