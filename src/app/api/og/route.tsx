import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

const SITE_NAME = 'Chœur de Rôle';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') ?? SITE_NAME;
  const subtitle = searchParams.get('subtitle') ?? '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #0b1a0e 0%, #132215 55%, #1a3020 100%)',
          padding: '60px',
          position: 'relative',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Barre de couleur en haut */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '5px',
            background: 'linear-gradient(90deg, #4a9e60 0%, #7bbbe5 100%)',
          }}
        />

        {/* Nom du site */}
        <div
          style={{
            color: 'rgba(255,255,255,0.42)',
            fontSize: '20px',
            letterSpacing: '0.06em',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          ♪ {SITE_NAME}
        </div>

        <div style={{ flex: 1 }} />

        {/* Contenu principal */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            maxWidth: '900px',
          }}
        >
          {subtitle ? (
            <div
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '22px',
                letterSpacing: '0.03em',
              }}
            >
              {subtitle}
            </div>
          ) : null}
          <div
            style={{
              color: '#ffffff',
              fontSize: title.length > 45 ? '50px' : title.length > 30 ? '58px' : '66px',
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </div>
        </div>

        {/* URL en bas à droite */}
        <div
          style={{
            position: 'absolute',
            bottom: '44px',
            right: '60px',
            color: 'rgba(255,255,255,0.28)',
            fontSize: '17px',
            letterSpacing: '0.03em',
          }}
        >
          choeur-de-role.fr
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
