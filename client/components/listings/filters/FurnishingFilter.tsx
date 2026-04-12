'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import Chip from '@/components/ui/Chip';

const OPTIONS = [
  { value: 'furnished', label: 'Furnished' },
  { value: 'semi', label: 'Semi-Furnished' },
  { value: 'unfurnished', label: 'Unfurnished' },
];

export default function FurnishingFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.getAll('furnishing');

  function toggle(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll('furnishing');
    params.delete('furnishing');
    if (current.includes(value)) {
      current.filter(v => v !== value).forEach(v => params.append('furnishing', v));
    } else {
      [...current, value].forEach(v => params.append('furnishing', v));
    }
    router.replace(`/listings?${params.toString()}`);
  }

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2">
        Furnishing
      </p>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map(({ value, label }) => (
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
