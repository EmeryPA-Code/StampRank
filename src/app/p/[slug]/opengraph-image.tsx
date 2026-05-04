import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }

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
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
        }}
      >
        <div style={{ color: '#ffffff', fontSize: '60px', fontWeight: 'bold' }}>
          StampRank Test
        </div>
        <div style={{ color: '#14F195', fontSize: '30px' }}>
          $THESIS · Solana
        </div>
      </div>
    ),
    { ...size },
  )
}
