import type { Metadata, Viewport } from 'next';
import { Sora, Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { SmoothScroll } from '@/components/system/SmoothScroll';
import { NoScriptFallback } from '@/components/system/NoScriptFallback';

const display = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://drom.example.com'),
  title: {
    default: 'DROM | Advanced Aerial System for Defense Applications',
    template: '%s | DROM',
  },
  description:
    'DROM is a compact aerial platform engineered for mobility, precision control and rapid tactical integration in demanding operational environments.',
  applicationName: 'DROM',
  keywords: [
    'DROM',
    'aerial platform',
    'defense technology',
    'tactical drone',
    'compact UAV',
    'security operations',
  ],
  authors: [{ name: 'MDH-X' }],
  openGraph: {
    type: 'website',
    title: 'DROM — Advanced Aerial System for Defense Applications',
    description:
      'A compact aerial platform engineered for mobility, precision control and rapid tactical integration.',
    siteName: 'DROM',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DROM — Advanced Aerial System for Defense Applications',
    description:
      'A compact aerial platform engineered for mobility, precision control and rapid tactical integration.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#030508',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="font-sans text-text-primary antialiased">
        <a
          href="#overview"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100]
            focus:bg-ink-900 focus:border focus:border-signal-blue/60 focus:px-4 focus:py-2
            focus:text-text-primary focus:font-mono focus:text-label focus:uppercase"
        >
          Skip to content
        </a>
        <NoScriptFallback />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
