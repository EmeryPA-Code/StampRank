import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }

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

  const name = project?.name ?? slug
  const marketCap: number = project?.market_cap ?? 0
  const longPct: number = project?.long_pct ?? 0
  const change24h: number = project?.change_24h ?? 0
  const rank = project?.rank ?? '—'
  const isPositive = change24h >= 0
  const skepticPct = 100 - longPct

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0A0A0F',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Rank badge */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
          <div style={{
            background: '#151520',
            border: '1px solid #2a2a3a',
            borderRadius: '8px',
            padding: '8px 20px',
            color: '#666',
            fontSize: '20px',
            fontFamily: 'monospace',
          }}>
            #{rank} RANKED
          </div>
        </div>

        {/* Project name */}
        <div style={{
          color: '#ffffff',
          fontSize: '84px',
          fontWeight: 'bold',
          lineHeight: '1',
          marginBottom: '20px',
          fontFamily: 'sans-serif',
        }}>
          {name}
        </div>

        {/* Market cap */}
        <div style={{
          color: '#14F195',
          fontSize: '44px',
          fontWeight: 'bold',
          marginBottom: '36px',
          fontFamily: 'monospace',
        }}>
          ${marketCap.toLocaleString()}
        </div>

        {/* Sentiment bar */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '28px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '10px',
            fontSize: '18px',
            fontFamily: 'monospace',
          }}>
            <span style={{ color: '#14F195' }}>▲ LONG {longPct}%</span>
            <span style={{ color: '#ef4444' }}>SKEPTIC {skepticPct}% ▼</span>
          </div>
          <div style={{
            display: 'flex',
            height: '14px',
            borderRadius: '7px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${longPct}%`,
              background: '#14F195',
            }} />
            <div style={{
              width: `${skepticPct}%`,
              background: '#ef4444',
            }} />
          </div>
        </div>

        {/* 24h change */}
        <div style={{
          color: isPositive ? '#14F195' : '#ef4444',
          fontSize: '40px',
          fontWeight: 'bold',
          fontFamily: 'monospace',
        }}>
          {isPositive ? '+' : ''}{change24h}% 24H
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute',
          bottom: '0px',
          left: '0px',
          right: '0px',
          padding: '0 60px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #1a1a2a',
          paddingTop: '24px',
        }}>
          <span style={{
            color: '#9945FF',
            fontSize: '26px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
          }}>
            StampRank · Powered by Solana
          </span>
        </div>
      </div>
    ),
    { ...size },
  )
}
