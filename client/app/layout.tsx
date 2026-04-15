import type { Metadata } from 'next';
import { IBM_Plex_Mono, Playfair_Display, Source_Sans_3 } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import QueryProvider from '@/components/providers/QueryProvider';
import AuthProvider from '@/components/providers/AuthProvider';
import { PHProvider } from '@/components/providers/PostHogProvider';
import AppChrome from '@/components/layout/AppChrome';

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
  title: 'ZingBrokers — Find Your Perfect Room',
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
                <AppChrome>{children}</AppChrome>
              </Suspense>
            </PHProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
