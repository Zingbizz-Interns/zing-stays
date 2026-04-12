'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import Chip from '@/components/ui/Chip';
import IntentFilter from './filters/IntentFilter';
import BhkFilter from './filters/BhkFilter';
import OccupancyFilter from './filters/OccupancyFilter';
import PriceRangeFilter from './filters/PriceRangeFilter';
import AvailabilityFilter from './filters/AvailabilityFilter';
import PreferredTenantsFilter from './filters/PreferredTenantsFilter';
import FurnishingFilter from './filters/FurnishingFilter';
import PropertyTypeFilter from './filters/PropertyTypeFilter';
import GenderFilter from './filters/GenderFilter';

const FILTER_PARAMS = [
  'intent', 'roomType', 'minPrice', 'maxPrice', 'availability', 'preferredTenants',
  'furnishing', 'propertyType', 'genderPref', 'foodIncluded',
];

function countActiveFilters(searchParams: ReturnType<typeof useSearchParams>): number {
  let count = 0;
  if (searchParams.get('intent')) count++;
  if (searchParams.getAll('roomType').length > 0) count++;
  if (searchParams.get('minPrice') || searchParams.get('maxPrice')) count++;
  const avail = searchParams.get('availability');
  if (avail && avail !== 'any') count++;
  const tenants = searchParams.getAll('preferredTenants');
  if (tenants.length > 0 && !(tenants.length === 1 && tenants[0] === 'any')) count++;
  if (searchParams.getAll('furnishing').length > 0) count++;
  if (searchParams.getAll('propertyType').length > 0) count++;
  const gender = searchParams.get('genderPref');
  if (gender && gender !== 'any') count++;
  if (searchParams.get('foodIncluded') === 'true') count++;
  return count;
}

function FilterHeader({ activeCount }: { activeCount: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function reset() {
    const params = new URLSearchParams(searchParams.toString());
    FILTER_PARAMS.forEach(k => params.delete(k));
    router.replace(`/listings?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <span className="font-mono text-xs uppercase tracking-[0.1em] text-foreground font-semibold">
        Filters{activeCount > 0 ? ` (${activeCount})` : ''}
      </span>
      {activeCount > 0 && (
        <button
          type="button"
          onClick={reset}
          className="font-sans text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Reset
        </button>
      )}
    </div>
  );
}

function FoodIncludedFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('foodIncluded') === 'true';

  function toggle() {
    const params = new URLSearchParams(searchParams.toString());
    if (active) params.delete('foodIncluded');
    else params.set('foodIncluded', 'true');
    router.replace(`/listings?${params.toString()}`);
  }

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2">
        Meals
      </p>
      <Chip label="Food Included" active={active} onClick={toggle} />
    </div>
  );
}

export default function ListingFilters() {
  const searchParams = useSearchParams();
  const intent = searchParams.get('intent');
  const propertyTypes = searchParams.getAll('propertyType');
  const activeCount = countActiveFilters(searchParams);

  const showBhk =
    intent === 'buy' ||
    propertyTypes.some(t => t === 'apartment' || t === 'flat');

  const showOccupancy =
    intent !== 'buy' &&
    propertyTypes.some(t => t === 'pg' || t === 'hostel');

  return (
    <aside className="w-full md:w-56 shrink-0 space-y-6">
      <FilterHeader activeCount={activeCount} />
      <IntentFilter />
      <PropertyTypeFilter />
      {showBhk && <BhkFilter />}
      {showOccupancy && <OccupancyFilter />}
      <PriceRangeFilter />
      <AvailabilityFilter />
      <FurnishingFilter />
      <PreferredTenantsFilter />
      <GenderFilter />
      <FoodIncludedFilter />
    </aside>
  );
}
