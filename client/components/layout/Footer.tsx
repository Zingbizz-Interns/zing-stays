import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border mt-32">
      <div className="max-w-content mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="font-display text-lg text-foreground">ZindStay</p>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-[0.1em]">
          Affordable rooms for students &amp; bachelors
        </p>
        <div className="flex gap-6">
          <Link href="/listings" className="font-sans text-sm text-muted-foreground hover:text-accent transition-colors">Browse</Link>
          <Link href="/dashboard/listings/new" className="font-sans text-sm text-muted-foreground hover:text-accent transition-colors">Post Room</Link>
        </div>
      </div>
    </footer>
  );
}
