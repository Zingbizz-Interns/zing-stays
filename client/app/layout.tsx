import type { Metadata } from 'next';
import { Fraunces, Source_Serif_4, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import QueryProvider from '@/components/providers/QueryProvider';
import AuthProvider from '@/components/providers/AuthProvider';
import { PHProvider } from '@/components/providers/PostHogProvider';
import AppChrome from '@/components/layout/AppChrome';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  display: 'swap',
});

const ibmSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-sans',
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
    <html lang="en" className={`${fraunces.variable} ${sourceSerif.variable} ${ibmSans.variable} ${ibmMono.variable}`}>
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
