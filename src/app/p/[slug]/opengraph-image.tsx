import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data: project } = await supabase
    .from('projects')
    .select('name, market_cap, long_pct, change_24h, rank')
    .eq('slug', slug)
    .single()

  const name = project?.name?.toUpperCase() ?? 'STAMPRANK'
  const marketCap = project ? `$${(project.market_cap ?? 0).toLocaleString()} THESIS` : '—'
  const longPct = project?.long_pct ?? 50
  const skepticPct = 100 - longPct
  const change = project?.change_24h ?? 0
  const rank = project?.rank ?? null
  const isPositive = change >= 0

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
          {/* Project name */}
          <div
            style={{
              color: '#ffffff',
              fontSize: name.length > 12 ? '56px' : '80px',
              fontWeight: 'bold',
              letterSpacing: '2px',
              lineHeight: '1',
            }}
          >
            {name}
          </div>

          {/* Market cap */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
            <span style={{ color: '#555', fontSize: '20px', letterSpacing: '2px' }}>
              MARKET CAP
            </span>
            <span style={{ color: '#ffffff', fontSize: '48px', fontWeight: 'bold' }}>
              {marketCap}
            </span>
          </div>

          {/* Long/Skeptic bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', height: '16px', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${longPct}%`, background: '#14F195' }} />
              <div style={{ width: `${skepticPct}%`, background: '#EF4444' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px' }}>
              <span style={{ color: '#14F195' }}>▲ {longPct}% LONG</span>
              <span style={{ color: '#EF4444' }}>{skepticPct}% SKEPTIC ▼</span>
            </div>
          </div>

          {/* Rank + 24h */}
          <div
            style={{
              color: isPositive ? '#14F195' : '#EF4444',
              fontSize: '32px',
              fontWeight: 'bold',
              letterSpacing: '1px',
            }}
          >
            {rank !== null ? `🔥 #${rank} RANKED · ` : ''}
            {isPositive ? '+' : ''}{change}% 24H
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
