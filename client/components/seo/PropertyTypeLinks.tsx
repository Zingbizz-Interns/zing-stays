import Link from 'next/link';

interface PropertyTypeLinksProps {
  citySlug: string;
  localitySlug: string;
  types: { type: string; count: number }[];
  activeType?: string;
}

const TYPE_LABELS: Record<string, string> = {
  pg: 'PG',
  hostel: 'Hostel',
  apartment: 'Apartment',
  flat: 'Flat',
};

export default function PropertyTypeLinks({
  citySlug,
  localitySlug,
  types,
  activeType,
}: PropertyTypeLinksProps) {
  if (types.length === 0) return null;

  return (
    <div>
      <h2 className="font-display text-xl mb-4">Browse by Type</h2>
      <div className="flex flex-wrap gap-3">
        {types.map(({ type, count }) => {
          const isActive = type === activeType;
          return (
            <Link
              key={type}
              href={`/${citySlug}/${localitySlug}/${type}`}
              className={[
                'px-4 py-2 border rounded-lg font-sans text-sm transition-colors',
                isActive
                  ? 'border-accent text-accent bg-accent/5'
                  : 'border-border hover:border-accent hover:text-accent',
              ].join(' ')}
            >
              {TYPE_LABELS[type] ?? type}
              {count > 0 && (
                <span className="ml-1 text-muted-foreground">({count})</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
