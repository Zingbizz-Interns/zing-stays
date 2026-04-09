import type { Metadata } from 'next';
import { IBM_Plex_Mono, Playfair_Display, Source_Sans_3 } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import QueryProvider from '@/components/providers/QueryProvider';
import AuthProvider from '@/components/providers/AuthProvider';
import { PHProvider } from '@/components/providers/PostHogProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans',
  display: 'swap',
});

const ibmMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ZindStay — Find Your Perfect Room',
  description: 'Student and bachelor-focused rental marketplace with verified listings.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSans.variable} ${ibmMono.variable}`}>
      <body className="font-sans bg-background text-foreground antialiased">
        <QueryProvider>
          <AuthProvider>
            <PHProvider>
              <Suspense>
                <Navbar />
                <main>{children}</main>
                <Footer />
              </Suspense>
            </PHProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
