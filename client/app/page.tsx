import Link from 'next/link';
import Image from 'next/image';
import { Search, Shield, Phone, ArrowRight } from 'lucide-react';
import GuidedSearchWidget from '@/components/search/GuidedSearchWidget';
import SectionLabel from '@/components/ui/SectionLabel';
import { buttonClassName } from '@/components/ui/Button';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/Motion';
import Card from '@/components/ui/Card';

import heroImage from '@/assets/lissete-laverde-7OFTxbGWqwk-unsplash.jpg';
import type { ListingCardData } from '@/lib/types';
import ListingCard from '@/components/listings/ListingCard';

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Search Your City',
    desc: 'Enter your city, locality, or nearby landmark to find available rooms instantly.',
    icon: Search,
  },
  {
    step: '02',
    title: 'Browse & Filter',
    desc: 'Filter by price, room type, amenities, and gender preference to narrow your choices.',
    icon: Shield,
  },
  {
    step: '03',
    title: 'Contact Owner',
    desc: 'Verify your email once and get direct access to owner contact details.',
    icon: Phone,
  },
];

const POPULAR_CITIES = [
  { name: 'Mumbai', slug: 'mumbai' },
  { name: 'Bangalore', slug: 'bangalore' },
  { name: 'Delhi', slug: 'delhi' },
  { name: 'Pune', slug: 'pune' },
  { name: 'Hyderabad', slug: 'hyderabad' },
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
  } catch (error) {
    console.error('Failed to fetch featured listings:', error);
  }

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative min-h-[88vh] flex flex-col justify-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={heroImage}
            alt="Modern residential property"
            fill
            className="object-cover"
            priority
            quality={90}
            placeholder="blur"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        </div>

        <div className="relative z-10 max-w-content mx-auto px-6 py-16 md:py-24 w-full">
          {/* Headline area */}
          <div className="text-center mb-10">
            <FadeIn delay={0.1} className="mb-4">
              <span className="inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.15em] text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Student &amp; Bachelor Housing
              </span>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1 className="font-display text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground mb-4">
                Find Your Perfect <span className="text-accent">Room</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="font-sans text-base md:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                Verified PGs, hostels, and shared accommodations with transparent pricing and direct owner contact.
              </p>
            </FadeIn>
          </div>

          {/* Search Card — centered, elevated */}
          <FadeIn delay={0.4}>
            <div className="flex justify-center">
              <GuidedSearchWidget />
            </div>
          </FadeIn>

          {/* Popular cities — below search */}
          <FadeIn delay={0.5} className="flex items-center justify-center gap-5 flex-wrap mt-6">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-[0.1em]">
              Popular:
            </span>
            {POPULAR_CITIES.map(({ name, slug }) => (
              <Link
                key={slug}
                href={`/${slug}`}
                className="font-sans text-sm text-muted-foreground hover:text-accent transition-colors underline-offset-4 hover:underline decoration-accent"
              >
                {name}
              </Link>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="border-y border-border bg-muted/30">
        <div className="max-w-content mx-auto px-6 py-6">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '10K+', label: 'Verified Listings' },
              { value: '50+', label: 'Cities Covered' },
              { value: '25K+', label: 'Happy Tenants' },
              { value: '4.8★', label: 'Average Rating' },
            ].map(({ value, label }) => (
              <StaggerItem key={label} className="text-center relative">
                <div className="font-display text-2xl md:text-3xl text-foreground tracking-tight">
                  {value}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.12em] mt-0.5">
                  {label}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── Featured Properties ─── */}
      <section className="py-16 md:py-24 px-6">
        <StaggerContainer className="max-w-content mx-auto">
          <StaggerItem>
            <SectionLabel>Featured</SectionLabel>
            <h2 className="font-display text-3xl md:text-4xl text-center mb-3">
              Popular Rooms Near You
            </h2>
            <p className="font-sans text-muted-foreground text-center mb-10 max-w-lg mx-auto">
              Hand-picked verified rooms from top-rated owners across India.
            </p>
          </StaggerItem>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <StaggerItem key={listing.id}>
                <ListingCard listing={listing} variant="compact" />
              </StaggerItem>
            ))}
            {featuredListings.length === 0 && (
              <div className="col-span-3 text-center py-10 text-muted-foreground">
                No featured properties available right now.
              </div>
            )}
          </div>

          <StaggerItem className="text-center mt-8">
            <Link
              href="/listings"
              className={buttonClassName({ variant: 'secondary', size: 'md' })}
            >
              View All Listings
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-16 md:py-24 px-6 border-t border-border">
        <StaggerContainer className="max-w-content mx-auto">
          <StaggerItem>
            <SectionLabel>How It Works</SectionLabel>
            <h2 className="font-display text-3xl md:text-4xl text-center mb-12">
              Simple. Fast. Transparent.
            </h2>
          </StaggerItem>
          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }) => (
              <StaggerItem key={step}>
                <div className="flex flex-col items-start">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <span className="font-mono text-xs text-accent uppercase tracking-[0.15em] mb-1.5">
                    Step {step}
                  </span>
                  <h3 className="font-display text-xl mb-2">{title}</h3>
                  <p className="font-sans text-muted-foreground leading-relaxed text-sm">
                    {desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative py-16 md:py-24 px-6 border-t border-border overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full bg-accent opacity-[0.04] blur-3xl" />
        </div>
        <FadeIn className="max-w-content mx-auto text-center relative z-10">
          <SectionLabel>For Property Owners</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl mb-5">
            List Your Room in Minutes
          </h2>
          <p className="font-sans text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            Post your PG, hostel, or room for free. Reach thousands of students
            looking for their next home.
          </p>
          <Link
            href="/dashboard/listings/new"
            className={buttonClassName({ size: 'lg' })}
          >
            Post a Room — It&apos;s Free
          </Link>
        </FadeIn>
      </section>
    </>
  );
}
