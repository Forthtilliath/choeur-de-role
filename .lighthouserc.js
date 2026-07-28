/** @type {import('@lhci/cli').LighthouseRcConfig} */
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/concerts',
        'http://localhost:3000/galerie',
        'http://localhost:3000/partenaires',
        'http://localhost:3000/evenements',
        'http://localhost:3000/contact',
      ],
      numberOfRuns: 1,
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
      },
    },
    assert: {
      assertions: {
        'categories:performance':    ['warn',  { minScore: 0.7 }],
        'categories:accessibility':  ['error', { minScore: 0.85 }],
        'categories:best-practices': ['warn',  { minScore: 0.85 }],
        'categories:seo':            ['warn',  { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
