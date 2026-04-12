'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import Chip from '@/components/ui/Chip';

const OPTIONS = [
  { value: 'students', label: 'Students' },
  { value: 'working', label: 'Working Professionals' },
  { value: 'family', label: 'Family' },
  { value: 'any', label: 'Any' },
];

export default function PreferredTenantsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.getAll('preferredTenants');

  function toggle(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll('preferredTenants');
    params.delete('preferredTenants');

    if (value === 'any') {
      // 'any' clears all other selections
      if (!current.includes('any')) {
        params.append('preferredTenants', 'any');
      }
    } else {
      const withoutAny = current.filter(v => v !== 'any');
      if (withoutAny.includes(value)) {
        withoutAny.filter(v => v !== value).forEach(v => params.append('preferredTenants', v));
      } else {
        [...withoutAny, value].forEach(v => params.append('preferredTenants', v));
      }
    }
    router.replace(`/listings?${params.toString()}`);
  }

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2">
        Preferred Tenants
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
