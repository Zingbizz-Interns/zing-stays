'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import Chip from '@/components/ui/Chip';

const ALL_OPTIONS = [
  { value: 'pg', label: 'PG' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'flat', label: 'Flat' },
];

const BUY_OPTIONS = ALL_OPTIONS.filter(o => o.value === 'apartment' || o.value === 'flat');

const BHK_TYPES = ['1bhk', '2bhk', '3bhk', '4bhk'];
const OCCUPANCY_TYPES = ['single', 'double', 'multiple'];

export default function PropertyTypeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intent = searchParams.get('intent');
  const active = searchParams.getAll('propertyType');

  const options = intent === 'buy' ? BUY_OPTIONS : ALL_OPTIONS;

  function toggle(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll('propertyType');
    let next: string[];

    if (current.includes(value)) {
      next = current.filter(v => v !== value);
    } else {
      next = [...current, value];
    }

    params.delete('propertyType');
    next.forEach(v => params.append('propertyType', v));

    // Clear roomType if now incompatible with new property type selection
    const isPgHostel = next.length > 0 && next.every(t => t === 'pg' || t === 'hostel');
    const isAptFlat = next.length > 0 && next.every(t => t === 'apartment' || t === 'flat');
    const currentRoomTypes = params.getAll('roomType');

    if (isPgHostel) {
      // Strip BHK values
      const filtered = currentRoomTypes.filter(rt => !BHK_TYPES.includes(rt));
      params.delete('roomType');
      filtered.forEach(rt => params.append('roomType', rt));
    } else if (isAptFlat) {
      // Strip occupancy values
      const filtered = currentRoomTypes.filter(rt => !OCCUPANCY_TYPES.includes(rt));
      params.delete('roomType');
      filtered.forEach(rt => params.append('roomType', rt));
    }

    router.replace(`/listings?${params.toString()}`);
  }

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2">
        Property Type
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map(({ value, label }) => (
          <Chip
            key={value}
            label={label}
            active={active.includes(value)}
            onClick={() => toggle(value)}
          />
        ))}
      </div>
    </div>
  );
}
