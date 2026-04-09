import Link from 'next/link';

interface LocalityLink {
  id: number;
  name: string;
  slug: string;
  listingCount: number;
}

interface LocalityLinksProps {
  citySlug: string;
  localities: LocalityLink[];
}

export default function LocalityLinks({ citySlug, localities }: LocalityLinksProps) {
  if (localities.length === 0) return null;

  return (
    <div>
      <h2 className="font-display text-xl mb-4">Nearby Areas</h2>
      <div className="flex flex-wrap gap-3">
        {localities.map((l) => (
          <Link
            key={l.id}
            href={`/${citySlug}/${l.slug}`}
            className="px-4 py-2 border border-border rounded-lg font-sans text-sm hover:border-accent hover:text-accent transition-colors"
          >
            {l.name}
            {l.listingCount > 0 && (
              <span className="ml-1 text-muted-foreground">({l.listingCount})</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
