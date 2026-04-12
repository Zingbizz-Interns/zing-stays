'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const MIN = 0;
const MAX = 100000;
const STEP = 1000;

function PriceRangeSlider({ initialMin, initialMax }: { initialMin: number; initialMax: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [minVal, setMinVal] = useState(initialMin);
  const [maxVal, setMaxVal] = useState(initialMax);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushPrices = useCallback(
    (min: number, max: number) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (min > MIN) params.set('minPrice', String(min));
        else params.delete('minPrice');
        if (max < MAX) params.set('maxPrice', String(max));
        else params.delete('maxPrice');
        router.replace(`/listings?${params.toString()}`);
      }, 300);
    },
    [router, searchParams],
  );

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const minPercent = ((minVal - MIN) / (MAX - MIN)) * 100;
  const maxPercent = ((maxVal - MIN) / (MAX - MIN)) * 100;

  const formatPrice = (v: number) =>
    v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`;

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-3">
        Price Range (₹)
      </p>

      <div className="flex justify-between mb-2">
        <span className="font-sans text-xs text-foreground">{formatPrice(minVal)}</span>
        <span className="font-sans text-xs text-foreground">{formatPrice(maxVal)}{maxVal >= MAX ? '+' : ''}</span>
      </div>

      <div className="relative h-5 flex items-center">
        {/* Track background */}
        <div className="absolute w-full h-1 bg-muted rounded-full" />

        {/* Active range highlight */}
        <div
          className="absolute h-1 bg-accent rounded-full"
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
        />

        {/* Min thumb */}
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={minVal}
          onChange={e => {
            const v = Math.min(Number(e.target.value), maxVal - STEP);
            setMinVal(v);
            pushPrices(v, maxVal);
          }}
          className="absolute w-full appearance-none bg-transparent cursor-pointer range-thumb"
          style={{ zIndex: minVal >= maxVal - STEP ? 5 : 3 }}
        />

        {/* Max thumb */}
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={maxVal}
          onChange={e => {
            const v = Math.max(Number(e.target.value), minVal + STEP);
            setMaxVal(v);
            pushPrices(minVal, v);
          }}
          className="absolute w-full appearance-none bg-transparent cursor-pointer range-thumb"
          style={{ zIndex: 4 }}
        />
      </div>

      <div className="flex justify-between mt-1">
        <span className="font-sans text-xs text-muted-foreground">{formatPrice(MIN)}</span>
        <span className="font-sans text-xs text-muted-foreground">{formatPrice(MAX)}+</span>
      </div>
    </div>
  );
}

export default function PriceRangeFilter() {
  const searchParams = useSearchParams();
  const minPrice = Number(searchParams.get('minPrice') || MIN);
  const maxPrice = Number(searchParams.get('maxPrice') || MAX);

  return (
    <PriceRangeSlider
      key={`${minPrice}|${maxPrice}`}
      initialMin={minPrice}
      initialMax={maxPrice}
    />
  );
}
