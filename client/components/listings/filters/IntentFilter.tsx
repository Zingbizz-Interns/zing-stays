'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import Chip from '@/components/ui/Chip';

const OPTIONS = [
  { value: 'rent', label: 'Rent' },
  { value: 'buy', label: 'Buy' },
];

export default function IntentFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('intent') ?? '';

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (active === value) {
      params.delete('intent');
    } else {
      params.set('intent', value);
    }
    router.replace(`/listings?${params.toString()}`);
  }

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2">
        Listing Intent
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
