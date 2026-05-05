import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0A0A0F',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: 'monospace',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '28px 48px',
            borderBottom: '1px solid #1a1a2e',
          }}
        >
          <span style={{ color: '#9945FF', fontSize: '28px', fontWeight: 'bold', letterSpacing: '4px' }}>
            STAMPRANK
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#151520',
              border: '1px solid #2a2a3a',
              borderRadius: '6px',
              padding: '6px 16px',
              color: '#9945FF',
              fontSize: '16px',
              letterSpacing: '2px',
            }}
          >
            DEVNET
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '40px 48px',
            gap: '24px',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          {/* Project slug */}
          <div
            style={{
              color: '#ffffff',
              fontSize: '80px',
              fontWeight: 'bold',
              letterSpacing: '2px',
              lineHeight: '1',
            }}
          >
            NOTION
          </div>

          {/* Market cap */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
            <span style={{ color: '#555', fontSize: '20px', letterSpacing: '2px' }}>
              MARKET CAP
            </span>
            <span style={{ color: '#ffffff', fontSize: '48px', fontWeight: 'bold' }}>
              $84,200 THESIS
            </span>
          </div>

          {/* Long/Skeptic bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', height: '16px', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ width: '72%', background: '#14F195' }} />
              <div style={{ width: '28%', background: '#EF4444' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px' }}>
              <span style={{ color: '#14F195' }}>▲ 72% LONG</span>
              <span style={{ color: '#EF4444' }}>28% SKEPTIC ▼</span>
            </div>
          </div>

          {/* Rank + 24h */}
          <div
            style={{
              color: '#14F195',
              fontSize: '32px',
              fontWeight: 'bold',
              letterSpacing: '1px',
            }}
          >
            🔥 #1 RANKED · +12.4% 24H
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 48px',
            borderTop: '1px solid #1a1a2e',
          }}
        >
          <span style={{ color: '#9945FF', fontSize: '22px', fontWeight: 'bold', letterSpacing: '1px' }}>
            Stake your $THESIS on Solana · stamp-rank.vercel.app
          </span>
        </div>
      </div>
    ),
    { ...size },
  )
}
