import Link from 'next/link';
import { Shield, ArrowRight, TrendingUp, Train, CheckCircle, Users, Zap, Building2, Star } from 'lucide-react';
import GuidedSearchWidget from '@/components/search/GuidedSearchWidget';
import HeroCarousel from '@/components/home/HeroCarousel';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/Motion';
import ListingCard from '@/components/listings/ListingCard';
import { buttonClassName } from '@/components/ui/Button';
import type { ListingCardData } from '@/lib/types';

const INTENT_CHIPS = [
  { label: 'Near College', href: '/listings?intent=rent&nearCollege=true' },
  { label: 'Under ₹10k', href: '/listings?intent=rent&maxPrice=10000' },
  { label: 'No Deposit', href: '/listings?intent=rent&deposit=none' },
  { label: 'Verified Only', href: '/listings?intent=rent&verified=true' },
];

const TRUST_SIGNALS = [
  {
    icon: Shield,
    label: 'Verified Inventory',
    desc: 'Every listing manually reviewed',
    primary: true,
  },
  {
    icon: Users,
    label: 'Owner Direct',
    desc: 'No middlemen, no markup',
    primary: true,
  },
  {
    icon: TrendingUp,
    label: 'Transparent Pricing',
    desc: 'All costs disclosed upfront',
    primary: false,
  },
  {
    icon: CheckCircle,
    label: 'No Hidden Fees',
    desc: 'What you see is what you pay',
    primary: false,
  },
];

const FEATURED_LOCALITY = {
  city: 'Bangalore',
  locality: 'Indiranagar',
  avgRent: '₹11K – ₹20K',
  trend: '+6%',
  metro: '0.8 km',
  commuteScore: '9.2',
  livabilityScore: '8.8',
  desc: 'Dense with cafes, co-working hubs, and IT offices. Most searched locality in Bangalore this month.',
};

const LOCALITY_INSIGHTS = [
  { city: 'Bangalore', locality: 'Koramangala', avgRent: '₹8,500 – ₹15K', trend: '+4%', metro: '1.2 km' },
  { city: 'Mumbai', locality: 'Andheri East', avgRent: '₹12K – ₹22K', trend: '+2%', metro: '0.5 km' },
  { city: 'Delhi', locality: 'Laxmi Nagar', avgRent: '₹6K – ₹12K', trend: '+1%', metro: '0.3 km' },
  { city: 'Pune', locality: 'Kothrud', avgRent: '₹7K – ₹14K', trend: '+3%', metro: '2.1 km' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Search by Location',
    desc: 'Enter your city or landmark. Filter by price, room type, gender preference, and amenities.',
  },
  {
    step: '02',
    title: 'Browse Verified Listings',
    desc: 'Every listing is manually reviewed. See trust badges, commute data, and full amenity breakdown.',
  },
  {
    step: '03',
    title: 'Contact the Owner',
    desc: 'Verify your email once. Get direct owner contact — no broker, no brokerage, no markup.',
  },
];


export default async function HomePage() {
  let featuredListings: ListingCardData[] = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const res = await fetch(`${apiUrl}/listings?limit=3&status=active`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      featuredListings = data.data ?? [];
    }
  } catch {
    // hero renders without featured listings
  }

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      {/*
        overflow-hidden is intentionally absent — the search dropdown must
        escape the section bounds without being clipped.
      */}
      <section className="relative">
        {/* Background diagonal rule pattern — scoped to its own clipping div */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -48deg,
              transparent,
              transparent 88px,
              rgba(30, 58, 138, 0.014) 88px,
              rgba(30, 58, 138, 0.014) 89px
            )`,
          }}
        />

        <div className="relative w-full max-w-content mx-auto px-6 pt-14 lg:pt-20">

          {/* ── Row 1: Headline (left) + Carousel (right) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 xl:gap-x-16 items-start mb-10">

            {/* LEFT — headline + tagline */}
            <div className="lg:col-span-5 flex flex-col lg:pt-4">
              <FadeIn delay={0.05}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="font-mono text-[10px] text-accent uppercase tracking-[0.24em]">
                    Verified Student Housing
                  </span>
                  <span className="flex-shrink-0 w-8 h-px bg-foreground/15" />
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.24em]">
                    India
                  </span>
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <h1
                  className="font-display font-bold leading-[0.92] tracking-[-0.035em] text-foreground mb-5"
                  style={{ fontSize: 'clamp(2.6rem, 5.5vw, 4.8rem)' }}
                >
                  Find the Room<br />
                  <span className="text-accent">You Actually</span><br />
                  Want.
                </h1>
              </FadeIn>

              <FadeIn delay={0.15}>
                <p className="font-sans text-[14px] text-muted-foreground leading-relaxed max-w-[22rem]">
                  Verified PGs, hostels and rooms across India. Transparent pricing, direct owner contact, zero brokerage.
                </p>
              </FadeIn>
            </div>

            {/* RIGHT — carousel + stats */}
            <div className="lg:col-span-7 hidden lg:block">
              <FadeIn delay={0.18}>
                <HeroCarousel />
              </FadeIn>

              <FadeIn delay={0.35}>
                <div
                  className="mt-3 rounded-xl px-5 py-3 flex items-center justify-between"
                  style={{ backgroundColor: 'rgba(30,58,138,0.06)', border: '1px solid rgba(30,58,138,0.1)' }}
                >
                  {[
                    { value: '10,000+', label: 'Verified Listings' },
                    { value: '50+', label: 'Cities' },
                    { value: '25,000+', label: 'Tenants Helped' },
                    { value: '4.8 ★', label: 'Avg Rating' },
                  ].map(({ value, label }, i) => (
                    <div key={label} className={`text-center ${i > 0 ? 'border-l border-accent/15 pl-4' : ''}`}>
                      <div className="font-mono text-sm font-bold text-accent leading-none">{value}</div>
                      <div className="font-sans text-[9px] text-muted-foreground uppercase tracking-widest mt-1">{label}</div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 border-l border-accent/15 pl-4">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse flex-shrink-0" />
                    <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">Live Verified</span>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>

          {/* ── Row 2: Full-width search — no overflow constraint above this ── */}
          <FadeIn delay={0.22} className="relative z-50 pb-16 lg:pb-20">
            <GuidedSearchWidget />

            {/* Intent chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              {INTENT_CHIPS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground border border-border/70 hover:border-accent/50 hover:text-accent bg-card/70 px-3 py-1.5 rounded-full transition-all duration-150 backdrop-blur-sm"
                >
                  {label}
                </Link>
              ))}
            </div>
          </FadeIn>

        </div>
      </section>

      {/* ─── TRUST BAND ───────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#DDD6CC', borderTop: '1px solid #C8C0B4', borderBottom: '1px solid #C8C0B4' }}>
        <div className="max-w-content mx-auto px-6 py-0">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {TRUST_SIGNALS.map(({ icon: Icon, label, desc, primary }, i) => (
              <div
                key={label}
                className={`flex items-start gap-3.5 py-5 px-5 ${i > 0 ? 'border-l border-black/8' : 'pl-0'}`}
              >
                <div
                  className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: primary ? 'rgba(30, 58, 138, 0.14)' : 'rgba(30, 58, 138, 0.06)',
                  }}
                >
                  <Icon
                    className="w-4 h-4"
                    strokeWidth={1.5}
                    style={{ color: primary ? '#1E3A8A' : '#6B665F' }}
                  />
                </div>
                <div>
                  <p
                    className="font-sans text-[11px] font-bold uppercase tracking-wide leading-none mb-0.5"
                    style={{ color: primary ? '#111111' : '#3D3830' }}
                  >
                    {label}
                  </p>
                  <p className="font-sans text-[11px] text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED LISTINGS ────────────────────────────────────────────── */}
      {featuredListings.length > 0 && (
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-content mx-auto">
            <StaggerContainer>
              <StaggerItem>
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <p className="font-mono text-[10px] text-accent uppercase tracking-[0.22em] mb-2">
                      Featured Listings
                    </p>
                    <h2 className="font-display text-3xl md:text-[2.6rem] font-bold leading-tight tracking-tight text-foreground">
                      Rooms Ready Now
                    </h2>
                  </div>
                  <Link
                    href="/listings"
                    className="hidden md:flex items-center gap-2 font-mono text-[10px] text-accent uppercase tracking-widest hover:gap-3 transition-all duration-200 group border-b border-accent/30 pb-0.5"
                  >
                    See All
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-150" />
                  </Link>
                </div>
              </StaggerItem>

              {/* Asymmetric 8/4 grid with micro-signal badges */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {featuredListings[0] && (
                  <StaggerItem className="md:col-span-8 flex flex-col gap-2">
                    <div className="flex items-center gap-2.5 px-1">
                      <span
                        className="font-mono text-[9px] uppercase tracking-[0.16em] px-2.5 py-1 rounded"
                        style={{ backgroundColor: 'rgba(30,58,138,0.08)', color: '#1E3A8A', border: '1px solid rgba(30,58,138,0.18)' }}
                      >
                        Featured Pick
                      </span>
                      <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
                        Viewed 180+ times this week
                      </span>
                    </div>
                    <ListingCard listing={featuredListings[0]} variant="full" />
                  </StaggerItem>
                )}
                <div className="md:col-span-4 flex flex-col gap-5">
                  {featuredListings[1] && (
                    <StaggerItem className="flex flex-col gap-2">
                      <div className="flex items-center gap-2.5 px-1">
                        <span
                          className="font-mono text-[9px] uppercase tracking-[0.16em] px-2.5 py-1 rounded"
                          style={{ backgroundColor: 'rgba(22,121,76,0.08)', color: '#16794C', border: '1px solid rgba(22,121,76,0.18)' }}
                        >
                          Just Listed
                        </span>
                      </div>
                      <ListingCard listing={featuredListings[1]} variant="compact" />
                    </StaggerItem>
                  )}
                  {featuredListings[2] && (
                    <StaggerItem className="flex flex-col gap-2">
                      <div className="flex items-center gap-2.5 px-1">
                        <span
                          className="font-mono text-[9px] uppercase tracking-[0.16em] px-2.5 py-1 rounded"
                          style={{ backgroundColor: 'rgba(161,92,26,0.08)', color: '#A15C1A', border: '1px solid rgba(161,92,26,0.18)' }}
                        >
                          High Demand
                        </span>
                      </div>
                      <ListingCard listing={featuredListings[2]} variant="compact" />
                    </StaggerItem>
                  )}
                </div>
              </div>

              <StaggerItem className="mt-8 md:hidden text-center">
                <Link href="/listings" className={buttonClassName({ variant: 'secondary', size: 'md' })}>
                  View All Listings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ─── LOCALITY INTELLIGENCE ────────────────────────────────────────── */}
      <section
        className="py-16 md:py-24 px-6"
        style={{ backgroundColor: '#D8D1C6', borderTop: '1px solid #C4BAB0', borderBottom: '1px solid #C4BAB0' }}
      >
        <div className="max-w-content mx-auto">
          <FadeIn>
            <p className="font-mono text-[10px] text-accent uppercase tracking-[0.22em] mb-2">
              Locality Intelligence
            </p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
              <h2 className="font-display text-3xl md:text-[2.6rem] font-bold leading-tight tracking-tight text-foreground">
                Know Before<br className="hidden md:block" /> You Move.
              </h2>
              <p className="font-serif text-sm text-muted-foreground max-w-xs leading-relaxed">
                Rent ranges and price trends updated weekly for top localities across India.
              </p>
            </div>
          </FadeIn>

          {/* Featured locality card — full-width, more data-rich */}
          <FadeIn className="mb-5">
            <Link
              href={`/${FEATURED_LOCALITY.city.toLowerCase()}/${FEATURED_LOCALITY.locality.toLowerCase()}`}
              className="group block rounded-2xl overflow-hidden border border-black/12 hover:border-accent/40 hover:shadow-xl transition-all duration-300"
              style={{ backgroundColor: '#F7F4EF' }}
            >
              <div className="p-6 md:p-7">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <Star className="w-3 h-3 text-accent fill-accent" />
                      <span className="font-mono text-[9px] text-accent uppercase tracking-[0.2em]">Top Pick This Month</span>
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.16em]">{FEATURED_LOCALITY.city}</p>
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-0.5 group-hover:text-accent transition-colors duration-200">
                      {FEATURED_LOCALITY.locality}
                    </h3>
                  </div>
                  <span className="font-mono text-[9px] text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20 flex-shrink-0">
                    {FEATURED_LOCALITY.trend}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  <div className="border-l-2 border-accent/20 pl-3">
                    <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Avg Rent</p>
                    <p className="font-mono text-base font-bold text-foreground leading-tight">{FEATURED_LOCALITY.avgRent}</p>
                  </div>
                  <div className="border-l-2 border-accent/20 pl-3">
                    <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Metro Distance</p>
                    <div className="flex items-center gap-1">
                      <Train className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} />
                      <p className="font-mono text-base font-bold text-foreground">{FEATURED_LOCALITY.metro}</p>
                    </div>
                  </div>
                  <div className="border-l-2 border-accent/20 pl-3">
                    <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Commute Score</p>
                    <p className="font-mono text-base font-bold text-foreground">{FEATURED_LOCALITY.commuteScore}<span className="text-xs text-muted-foreground font-normal"> / 10</span></p>
                  </div>
                  <div className="border-l-2 border-accent/20 pl-3">
                    <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Livability</p>
                    <p className="font-mono text-base font-bold text-foreground">{FEATURED_LOCALITY.livabilityScore}<span className="text-xs text-muted-foreground font-normal"> / 10</span></p>
                  </div>
                </div>

                <p className="font-serif text-sm text-muted-foreground leading-relaxed mb-4 max-w-lg">{FEATURED_LOCALITY.desc}</p>

                <div className="flex items-center gap-1.5 font-mono text-[9px] text-accent uppercase tracking-wider group-hover:gap-3 transition-all duration-150">
                  Explore {FEATURED_LOCALITY.locality}
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          </FadeIn>

          {/* Regular locality grid */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {LOCALITY_INSIGHTS.map(({ city, locality, avgRent, trend, metro }) => (
              <StaggerItem key={`${city}-${locality}`}>
                <Link
                  href={`/${city.toLowerCase()}/${locality.toLowerCase().replace(/ /g, '-')}`}
                  className="block group border border-black/10 rounded-xl p-5 hover:border-accent/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  style={{ backgroundColor: '#F0EBE4' }}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.16em]">{city}</p>
                      <h3 className="font-display text-lg font-semibold text-foreground mt-0.5 group-hover:text-accent transition-colors duration-150">
                        {locality}
                      </h3>
                    </div>
                    <span className="font-mono text-[9px] text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20 flex-shrink-0">
                      {trend}
                    </span>
                  </div>

                  <div className="space-y-2.5 mb-5">
                    <div>
                      <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Avg Rent Range</p>
                      <p className="font-mono text-base font-bold text-foreground leading-none">{avgRent}</p>
                    </div>
                    <div className="flex items-center gap-1.5 font-sans text-[11px] text-muted-foreground">
                      <Train className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
                      <span>{metro} to nearest metro</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-[9px] text-accent uppercase tracking-wider group-hover:gap-2.5 transition-all duration-150 border-t border-black/8 pt-4">
                    Explore Locality
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section
        className="py-16 md:py-24 px-6 relative overflow-hidden"
        style={{ backgroundColor: '#F2EDE6' }}
      >
        {/* Large faded "HOW" watermark */}
        <div
          className="absolute -left-16 top-1/2 -translate-y-1/2 font-display font-bold leading-none tracking-tighter pointer-events-none select-none hidden xl:block"
          style={{ fontSize: '22rem', color: 'rgba(30,58,138,0.04)' }}
          aria-hidden="true"
        >
          HOW
        </div>

        {/* Diagonal accent rule */}
        <div
          className="absolute right-0 top-0 bottom-0 w-px hidden lg:block"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(30,58,138,0.1), transparent)' }}
        />

        <div className="max-w-content mx-auto relative z-10">
          <FadeIn>
            <p className="font-mono text-[10px] text-accent uppercase tracking-[0.22em] mb-2">Simple Process</p>
            <h2 className="font-display text-3xl md:text-[2.6rem] font-bold leading-tight tracking-tight text-foreground mb-14">
              Three Steps to Home.
            </h2>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-3 gap-10 lg:gap-16">
            {HOW_IT_WORKS.map(({ step, title, desc }, idx) => (
              <StaggerItem key={step}>
                <div className="group relative">
                  {/* Large faded step number */}
                  <div
                    className="absolute -top-6 -left-3 font-display font-bold leading-none select-none pointer-events-none group-hover:opacity-100 transition-all duration-500"
                    style={{
                      fontSize: '8rem',
                      color: 'rgba(30,58,138,0.07)',
                    }}
                    aria-hidden="true"
                  >
                    {step}
                  </div>

                  {/* Step connector line (hide on last) */}
                  {idx < HOW_IT_WORKS.length - 1 && (
                    <div
                      className="hidden md:block absolute top-14 left-full w-16 h-px -translate-x-8"
                      style={{ background: 'linear-gradient(to right, rgba(30,58,138,0.2), transparent)' }}
                    />
                  )}

                  <div className="relative pt-12">
                    <div className="w-px h-10 mb-5 group-hover:h-12 transition-all duration-300" style={{ backgroundColor: 'rgba(30,58,138,0.35)' }} />
                    <h3 className="font-display text-xl font-semibold text-foreground mb-3 group-hover:text-accent transition-colors duration-150">
                      {title}
                    </h3>
                    <p className="font-serif text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── OWNER CTA ────────────────────────────────────────────────────── */}
      <section
        className="py-16 md:py-24 px-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0C0C0C 0%, #111827 40%, #0A0F1E 100%)',
        }}
      >
        {/* Diagonal line texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -52deg,
              transparent,
              transparent 70px,
              rgba(255, 255, 255, 0.018) 70px,
              rgba(255, 255, 255, 0.018) 71px
            )`,
          }}
        />

        {/* Radial accent glow — right side */}
        <div
          className="absolute right-0 top-0 bottom-0 w-2/3 hidden lg:block pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(30, 58, 138, 0.22) 0%, transparent 60%)' }}
        />

        {/* Subtle top border gradient */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(30,58,138,0.5), transparent)' }}
        />

        <FadeIn className="max-w-content mx-auto relative z-10">
          <div className="max-w-lg">
            <div className="flex items-center gap-2.5 mb-5">
              <Building2 className="w-3.5 h-3.5 text-white/25" />
              <p className="font-mono text-[9px] text-white/25 uppercase tracking-[0.24em]">For Property Owners</p>
            </div>

            <h2 className="font-display text-3xl md:text-[2.8rem] font-bold leading-[1.05] tracking-tight text-white mb-5">
              Fill Vacancies in<br />
              <span style={{ color: 'rgba(148,171,255,0.9)' }}>24 Hours.</span> Zero Brokerage.
            </h2>

            <p className="font-sans text-sm md:text-[15px] text-white/45 leading-relaxed mb-8 max-w-sm">
              Reach thousands of verified students and working professionals. Post for free, manage inquiries, and fill vacancies faster.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/dashboard/listings/new"
                className="group inline-flex items-center gap-2.5 bg-white text-foreground font-sans font-bold text-sm px-7 py-3.5 rounded-xl hover:bg-accent hover:text-white transition-all duration-200 shadow-xl hover:shadow-accent/25"
              >
                Post a Room — It&apos;s Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
              </Link>
              <div className="flex items-center gap-2.5 font-mono text-[9px] text-white/25 uppercase tracking-[0.18em] mt-1 sm:mt-3">
                <Zap className="w-3 h-3" />
                No credit card required
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
    </>
  );
}
