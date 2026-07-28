import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import Script from 'next/script';
import { Toaster } from 'sonner';
import { AdminContextBar } from '@/components/layout/AdminContextBar';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { SwRegister } from '@/components/layout/SwRegister';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { PageTransition } from '@/components/ui/PageTransition';
import { ConfirmProvider } from '@/context/ConfirmContext';
import { CommandPaletteProvider } from '@/context/CommandPaletteContext';
import { CommandPalette } from '@/components/features/search/CommandPalette';
import { getUserQuery } from '@/lib/auth';
import { getActivePollsForMember } from '@/components/features/sondages/queries';
import { organizationJsonLd, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo';
import { env } from '@/env';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'chorale',
    'Angers',
    'Maine-et-Loire',
    'chant choral',
    'Chœur de Rôle',
    'spectacle musical',
    'choristes',
    'association musicale',
  ],
  alternates: {
    canonical: SITE_URL,
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Chœur de Rôle',
  },
  formatDetection: { telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: '/images/og-image.webp',
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Chorale à Angers`,
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ['/images/twitter-image.webp'],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isAdmin } = await getUserQuery();
  const pendingPollsCount = isLoggedIn
    ? (await getActivePollsForMember()).filter((p) => !p.has_responded).length
    : 0;
  return (
    <html lang="fr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="theme-color" content="#5b3fa8" />
      </head>
      <body className={geist.className}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:outline-none"
        >
          Aller au contenu principal
        </a>
        <CommandPaletteProvider>
          <ConfirmProvider>
            <Header initialLoggedIn={isLoggedIn} pendingPollsCount={pendingPollsCount} />
            <AdminContextBar isAdmin={isAdmin} />
            <Suspense fallback={<div className="text-center py-20">Chargement...</div>}>
              <ErrorBoundary>
                <PageTransition>{children}</PageTransition>
              </ErrorBoundary>
            </Suspense>
            <Footer />
            <CommandPalette />
          </ConfirmProvider>
        </CommandPaletteProvider>
        <SwRegister />
        <Toaster position="bottom-right" richColors />
        {env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script
            defer
            data-website-id={env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            src="https://cloud.umami.is/script.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
