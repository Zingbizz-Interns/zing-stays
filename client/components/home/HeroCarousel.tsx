'use client';

import { useState, useEffect, useCallback } from 'react';
import Image, { StaticImageData } from 'next/image';
import { ChevronLeft, ChevronRight, Eye, MapPin } from 'lucide-react';

import img1 from '@/assets/alan-alves-Xf3Bk7jTKyw-unsplash.jpg';
import img2 from '@/assets/dillon-kydd-XGvwt544g8k-unsplash.jpg';
import img3 from '@/assets/luke-van-zyl-koH7IVuwRLw-unsplash.jpg';
import img4 from '@/assets/webaliser-_TPTXZd9mOo-unsplash.jpg';
import img5 from '@/assets/lissete-laverde-7OFTxbGWqwk-unsplash.jpg';

interface Slide {
  image: StaticImageData;
  price: string;
  location: string;
  tag: string;
  tagVariant: 'verified' | 'available';
  badge: string;
  highlight?: string;
  viewCount?: string;
}

const SLIDES: Slide[] = [
  {
    image: img1 as StaticImageData,
    price: '₹9,500',
    location: 'Koramangala, Bangalore',
    tag: 'Verified',
    tagVariant: 'verified',
    badge: 'Owner Direct · No Brokerage',
    highlight: 'Just Listed',
  },
  {
    image: img2 as StaticImageData,
    price: '₹14,000',
    location: 'Andheri East, Mumbai',
    tag: 'Ready to Move',
    tagVariant: 'available',
    badge: 'Zero Deposit',
    highlight: 'High Demand',
    viewCount: 'Viewed 200+ times',
  },
  {
    image: img3 as StaticImageData,
    price: '₹7,800',
    location: 'Laxmi Nagar, Delhi',
    tag: 'Verified',
    tagVariant: 'verified',
    badge: 'Owner Direct',
    viewCount: 'Viewed 85+ times',
  },
  {
    image: img4 as StaticImageData,
    price: '₹11,000',
    location: 'Kothrud, Pune',
    tag: 'Ready to Move',
    tagVariant: 'available',
    badge: 'Meals Included',
    highlight: 'Just Listed',
  },
  {
    image: img5 as StaticImageData,
    price: '₹16,500',
    location: 'Banjara Hills, Hyderabad',
    tag: 'Verified',
    tagVariant: 'verified',
    badge: 'No Brokerage',
    highlight: 'Premium',
    viewCount: 'Viewed 140+ times',
  },
];

const INTERVAL_MS = 5200;

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [busy, setBusy] = useState(false);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (idx: number) => {
      if (busy) return;
      setBusy(true);
      setCurrent(idx);
      setTimeout(() => setBusy(false), 750);
    },
    [busy],
  );

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused, next]);

  const slide = SLIDES[current];

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-2xl select-none"
      style={{ height: '476px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Stacked images */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            opacity: i === current ? 1 : 0,
            transition: 'opacity 750ms cubic-bezier(0.4,0,0.2,1)',
            zIndex: i === current ? 2 : 1,
          }}
        >
          <Image
            src={s.image}
            alt={s.location}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 680px"
            priority={i === 0}
          />
        </div>
      ))}

      {/* Gradient overlays for readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/88 via-black/15 to-black/30" />
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/20 to-transparent" />

      {/* Top-left highlight badge */}
      <div
        className="absolute top-4 left-4 z-20 transition-all duration-500"
        style={{ opacity: slide.highlight ? 1 : 0 }}
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white bg-accent px-3 py-1.5 rounded-full shadow-lg">
          {slide.highlight ?? ' '}
        </span>
      </div>

      {/* Top-right counter */}
      <div className="absolute top-4 right-4 z-20 font-mono text-[9px] text-white/50 uppercase tracking-widest bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
        {current + 1}&thinsp;/&thinsp;{SLIDES.length}
      </div>

      {/* Prev arrow */}
      <button
        type="button"
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/65 hover:text-white transition-all duration-150"
        aria-label="Previous listing"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Next arrow */}
      <button
        type="button"
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/65 hover:text-white transition-all duration-150"
        aria-label="Next listing"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Bottom content overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-5 pt-10 pb-5">
        {/* View count */}
        <div className="flex items-center gap-1.5 mb-3 h-4">
          {slide.viewCount && (
            <>
              <Eye className="w-3 h-3 text-white/40" />
              <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider">{slide.viewCount}</span>
            </>
          )}
        </div>

        {/* Price + tag */}
        <div className="flex items-end justify-between gap-3 mb-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[2.2rem] font-bold text-white leading-none">{slide.price}</span>
            <span className="font-mono text-[10px] text-white/45 uppercase tracking-wider">/mo</span>
          </div>
          <span
            className="font-mono text-[9px] uppercase tracking-[0.16em] px-3 py-1.5 rounded-full flex-shrink-0 shadow-md"
            style={{
              backgroundColor: slide.tagVariant === 'verified' ? '#1E3A8A' : '#16794C',
              color: 'white',
            }}
          >
            {slide.tag}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 mb-1">
          <MapPin className="w-3.5 h-3.5 text-white/55 flex-shrink-0" strokeWidth={1.5} />
          <span className="font-sans text-[13px] text-white/85 font-medium">{slide.location}</span>
        </div>

        {/* Badge */}
        <div className="font-mono text-[9px] text-white/35 uppercase tracking-wider mb-4">{slide.badge}</div>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className="h-[3px] rounded-full transition-all duration-400 focus:outline-none"
              style={{
                width: i === current ? '22px' : '6px',
                backgroundColor: i === current ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
