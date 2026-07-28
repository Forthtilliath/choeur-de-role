import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import withSerwist from '@serwist/next';
import { withSentryConfig } from '@sentry/nextjs';

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const isDev = process.env.NODE_ENV === 'development';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} cloud.umami.is`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: *.supabase.co *.r2.dev i.ytimg.com *.tile.openstreetmap.org",
  "media-src 'self' *.r2.cloudflarestorage.com",
  "frame-src maps.google.com www.google.com www.youtube.com",
  "worker-src 'self'",
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co cloud.umami.is https://gateway.umami.is https://*.r2.cloudflarestorage.com https://*.ingest.sentry.io${isDev ? ' ws: http://localhost:54321 http://127.0.0.1:54321' : ''}`,
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  async rewrites() {
    // dev:local mode — proxy browser → localhost:54321 via same-origin rewrite to bypass CORS/CSP
    if (process.env.NEXT_PUBLIC_SUPABASE_PROXY_MODE !== '1') return [];
    return [
      {
        source: '/sb-local/:path*',
        destination: 'http://localhost:54321/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
    ],
  },
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      // En dev, les assets sous /_next/static et le contenu de /public changent constamment
      // (rebuilds, remplacement d'images) — un cache long-lived ferait servir des versions
      // périmées sur simple F5 (seul Ctrl+Shift+R bypasserait le cache navigateur).
      ...(isDev
        ? []
        : [
            {
              source: '/_next/static/(.*)',
              headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
            },
            {
              source: '/icons/(.*)',
              headers: [
                { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
              ],
            },
            {
              source: '/images/(.*)',
              headers: [
                { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
              ],
            },
          ]),
      {
        // Le service worker doit toujours être servi frais
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
      {
        // Firefox télécharge les images au lieu de les afficher sans ce header
        source: '/_next/image',
        headers: [{ key: 'Content-Disposition', value: 'inline' }],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: siteUrl },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Vary', value: 'Origin' },
        ],
      },
    ];
  },
};

const withPwa = withSerwist({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

export default withSentryConfig(withPwa(withMDX(nextConfig)), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "choeur-de-role",

  project: "choeur-de-role",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Delete source maps after upload to prevent public exposure
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
