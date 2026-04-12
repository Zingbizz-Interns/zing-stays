'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import Chip from '@/components/ui/Chip';

const OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'any', label: 'Any' },
];

export default function GenderFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('genderPref') ?? 'any';

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'any') params.delete('genderPref');
    else params.set('genderPref', value);
    router.replace(`/listings?${params.toString()}`);
  }

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2">
        Gender Preference
      </p>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map(({ value, label }) => (
          <Chip
            key={value}
            label={label}
            active={active === value}
            onClick={() => select(value)}
          />
        ))}
      </div>
    </div>
  );
}
