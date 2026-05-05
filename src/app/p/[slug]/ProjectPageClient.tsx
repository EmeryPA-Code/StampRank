'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(m => m.WalletMultiButton),
  { ssr: false }
)
import { useWallet } from '@solana/wallet-adapter-react'
import { TrendingUp, TrendingDown, ArrowLeft, Users, Activity, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { stakeOnChain } from '@/lib/solana'
import { supabase } from '@/lib/supabase'

type Project = {
  id: number
  name: string
  slug: string
  description: string
  url: string
  category: string
  long_pct: number
  market_cap: number
  rank: number
  change_24h: number
  stakers: number
}

function MiniChart({ history, positive }: { history: number[], positive: boolean }) {
  const max = Math.max(...history)
  const min = Math.min(...history)
  const range = max - min || 1
  const width = 200
  const height = 60
  const points = history.map((v, i) => {
    const x = (i / (history.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={points}
        fill="none"
        stroke={positive ? 'var(--long)' : 'var(--skeptic)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ProjectPageClient({ slug }: { slug: string }) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [stakeAmount, setStakeAmount] = useState(100)
  const [position, setPosition] = useState<'long' | 'skeptic' | null>(null)
  const { publicKey, signTransaction, connected } = useWallet()

  useEffect(() => {
    supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        setProject(data)
        setLoading(false)
      })
  }, [slug])

  const isPositive = (project?.change_24h ?? 0) > 0
  const history = project
    ? [
        project.market_cap * 0.7,
        project.market_cap * 0.75,
        project.market_cap * 0.8,
        project.market_cap * 0.85,
        project.market_cap * 0.9,
        project.market_cap * 0.95,
        project.market_cap,
      ]
    : []

  async function handleStake() {
    if (!connected || !publicKey) {
      alert('Please connect your wallet first')
      return
    }
    if (!position) return

    const signature = await stakeOnChain(publicKey, slug, stakeAmount, position, signTransaction!)

    alert('Stake confirmed! Transaction: ' + signature)

    const newMarketCap = (project.market_cap ?? 0) + stakeAmount
    const newStakers = (project.stakers ?? 0) + 1

    supabase.from('stakes').insert({
      wallet: publicKey.toBase58(),
      project_slug: slug,
      amount: stakeAmount,
      type: position,
    })

    console.log('Updating slug:', slug, 'new market_cap:', newMarketCap)
    const updateResponse = await supabase.from('projects').update({
      market_cap: newMarketCap,
      stakers: newStakers,
    }).eq('slug', slug)
    console.log('Supabase update response:', updateResponse)

    setProject({ ...project, market_cap: newMarketCap, stakers: newStakers })
  }

  const header = (
    <header className="border-b px-6 py-4 flex items-center justify-between"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-70"
          style={{ color: 'var(--muted)' }}>
          <ArrowLeft size={16} />
          <span className="text-sm">Leaderboard</span>
        </Link>
        <span style={{ color: 'var(--border)' }}>·</span>
        <span className="font-bold" style={{ color: 'var(--primary)' }}>STAMPRANK</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Activity size={12} style={{ color: 'var(--secondary)' }} />
          <span className="mono text-xs" style={{ color: 'var(--muted)' }}>Solana · 400ms</span>
        </div>
        <div className="wallet-adapter-button-wrapper" style={{ ['--wallet-adapter-button-background' as string]: '#9945FF' }}>
          <WalletMultiButton />
        </div>
      </div>
    </header>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
        {header}
        <div className="flex-1 flex items-center justify-center">
          <span className="mono text-xs" style={{ color: 'var(--muted)' }}>Loading…</span>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
        {header}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p style={{ color: 'var(--muted)' }}>Project not found</p>
            <Link href="/" className="text-sm mt-2 block" style={{ color: 'var(--primary)' }}>
              ← Back to leaderboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>

      {header}

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">

        {/* Project Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <span className="text-xs px-2 py-0.5 rounded"
                style={{ background: 'var(--border)', color: 'var(--muted)' }}>
                {project.category}
              </span>
              <span className="mono text-xs px-2 py-0.5 rounded flex items-center gap-1"
                style={{ background: 'var(--border)', color: 'var(--secondary)' }}>
                ● LIVE
              </span>
            </div>
            <p style={{ color: 'var(--muted)' }}>{project.description}</p>
            <a href={`https://${project.url}`} target="_blank"
              className="flex items-center gap-1 text-xs mt-1 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--primary)' }}>
              {project.url} <ExternalLink size={10} />
            </a>
          </div>
          <div className="mono text-xs px-3 py-1.5 rounded font-bold"
            style={{ background: 'var(--border)', color: 'var(--muted)' }}>
            #{project.rank} RANKED
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'MARKET CAP', value: `$${(project.market_cap ?? 0).toLocaleString()}`, color: 'var(--text)' },
            { label: '24H CHANGE', value: `${isPositive ? '+' : ''}${project.change_24h ?? 0}%`, color: isPositive ? 'var(--long)' : 'var(--skeptic)' },
            { label: 'LONG', value: `${project.long_pct ?? 0}%`, color: 'var(--long)' },
            { label: 'STAKERS', value: (project.stakers ?? 0).toLocaleString(), color: 'var(--text)' },
          ].map(stat => (
            <div key={stat.label} className="rounded-lg p-4 border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{stat.label}</p>
              <p className="mono text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">

          {/* Chart + Sentiment */}
          <div className="col-span-2 rounded-lg border p-6 flex flex-col gap-4"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                MARKET CAP · 7D
              </span>
              <div className="flex items-center gap-1">
                {isPositive
                  ? <TrendingUp size={14} style={{ color: 'var(--long)' }} />
                  : <TrendingDown size={14} style={{ color: 'var(--skeptic)' }} />}
                <span className="mono text-sm font-bold"
                  style={{ color: isPositive ? 'var(--long)' : 'var(--skeptic)' }}>
                  {isPositive ? '+' : ''}{project.change_24h ?? 0}%
                </span>
              </div>
            </div>
            <MiniChart history={history} positive={isPositive} />

            {/* Sentiment Bar */}
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--long)' }}>▲ LONG {project.long_pct ?? 0}%</span>
                <span style={{ color: 'var(--skeptic)' }}>SKEPTIC {100 - (project.long_pct ?? 0)}% ▼</span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                <div className="rounded-full transition-all"
                  style={{ width: `${project.long_pct ?? 0}%`, background: 'var(--long)' }} />
                <div className="rounded-full transition-all"
                  style={{ width: `${100 - (project.long_pct ?? 0)}%`, background: 'var(--skeptic)' }} />
              </div>
              <div className="flex items-center gap-1">
                <Users size={12} style={{ color: 'var(--muted)' }} />
                <span className="mono text-xs" style={{ color: 'var(--muted)' }}>
                  {(project.stakers ?? 0).toLocaleString()} open positions
                </span>
              </div>
            </div>
          </div>

          {/* Stake Panel */}
          <div className="rounded-lg border p-6 flex flex-col gap-4"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
              STAKE YOUR THESIS
            </span>

            <div className="flex flex-col gap-2">
              <label className="text-xs" style={{ color: 'var(--muted)' }}>AMOUNT</label>
              <div className="flex items-center gap-2 border rounded px-3 py-2"
                style={{ borderColor: 'var(--border)' }}>
                <span className="mono text-xs" style={{ color: 'var(--primary)' }}>$THESIS</span>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={e => setStakeAmount(Number(e.target.value))}
                  className="mono text-sm font-bold bg-transparent outline-none flex-1 text-right"
                  style={{ color: 'var(--text)' }}
                />
              </div>
              <div className="flex gap-2">
                {[100, 250, 500].map(amt => (
                  <button key={amt}
                    onClick={() => setStakeAmount(amt)}
                    className="flex-1 py-1 rounded text-xs mono transition-opacity hover:opacity-70"
                    style={{ background: 'var(--border)', color: 'var(--muted)' }}>
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setPosition('long')}
                className="w-full py-3 rounded font-bold text-sm transition-opacity hover:opacity-80"
                style={{
                  background: position === 'long' ? 'var(--long)' : 'transparent',
                  color: position === 'long' ? '#000' : 'var(--long)',
                  border: '1px solid var(--long)'
                }}>
                ▲ LONG {project.name}
              </button>
              <button
                onClick={() => setPosition('skeptic')}
                className="w-full py-3 rounded font-bold text-sm transition-opacity hover:opacity-80"
                style={{
                  background: position === 'skeptic' ? 'var(--skeptic)' : 'transparent',
                  color: position === 'skeptic' ? '#fff' : 'var(--skeptic)',
                  border: '1px solid var(--skeptic)'
                }}>
                ▼ SKEPTIC {project.name}
              </button>
            </div>

            {position && (
              <button
                onClick={handleStake}
                className="w-full py-3 rounded font-bold text-sm transition-opacity hover:opacity-80"
                style={{ background: 'var(--primary)', color: '#fff' }}>
                {connected ? 'Stake $THESIS' : 'Connect Wallet to Stake'}
              </button>
            )}

            <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
              Balance: 1,000 $THESIS available
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
