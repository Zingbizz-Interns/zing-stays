import Link from 'next/link';

interface BudgetBandLinksProps {
  citySlug: string;
  localitySlug?: string;
  minPrice: number;
  maxPrice: number;
}

interface BudgetBand {
  label: string;
  max?: number;
  min?: number;
}

function getBands(minPrice: number, maxPrice: number): BudgetBand[] {
  const bands: BudgetBand[] = [];
  if (maxPrice > 5000) bands.push({ label: 'Under ₹5,000', max: 5000 });
  if (maxPrice > 10000) bands.push({ label: 'Under ₹10,000', max: 10000 });
  if (maxPrice > 15000) bands.push({ label: 'Under ₹15,000', max: 15000 });
  if (minPrice < 15000 && maxPrice > 15000)
    bands.push({ label: '₹15,000+', min: 15000 });
  return bands;
}

export default function BudgetBandLinks({
  citySlug,
  localitySlug,
  minPrice,
  maxPrice,
}: BudgetBandLinksProps) {
  const bands = getBands(minPrice, maxPrice);
  if (bands.length === 0) return null;

  function bandHref(band: BudgetBand) {
    const params = new URLSearchParams({ city: citySlug });
    if (localitySlug) params.set('locality', localitySlug);
    if (band.max) params.set('price_max', String(band.max));
    if (band.min) params.set('price_min', String(band.min));
    return `/listings?${params.toString()}`;
  }

  return (
    <div>
      <h2 className="font-display text-xl mb-4">Browse by Budget</h2>
      <div className="flex flex-wrap gap-3">
        {bands.map((band) => (
          <Link
            key={band.label}
            href={bandHref(band)}
            className="px-4 py-2 border border-border rounded-lg font-sans text-sm hover:border-accent hover:text-accent transition-colors"
          >
            {band.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
