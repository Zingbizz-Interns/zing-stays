'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import Chip from '@/components/ui/Chip';

const BHK_OPTIONS = [
  { value: '1bhk', label: '1 BHK' },
  { value: '2bhk', label: '2 BHK' },
  { value: '3bhk', label: '3 BHK' },
  { value: '4bhk', label: '4 BHK' },
];

export default function BhkFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.getAll('roomType');

  function toggle(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll('roomType');
    params.delete('roomType');
    if (current.includes(value)) {
      current.filter(v => v !== value).forEach(v => params.append('roomType', v));
    } else {
      [...current, value].forEach(v => params.append('roomType', v));
    }
    router.replace(`/listings?${params.toString()}`);
  }

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2">
        BHK Type
      </p>
      <div className="flex flex-wrap gap-2">
        {BHK_OPTIONS.map(({ value, label }) => (
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
