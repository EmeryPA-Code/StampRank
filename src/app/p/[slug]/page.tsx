'use client'

import React, { useState } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { TrendingUp, TrendingDown, ArrowLeft, Users, Activity, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { stakeOnChain } from '@/lib/solana'
import { supabase } from '@/lib/supabase'

const PROJECTS: Record<string, {
  name: string
  desc: string
  url: string
  longPct: number
  marketCap: number
  rank: number
  change: number
  stakers: number
  category: string
  history: number[]
}> = {
  notion: {
    name: 'Notion', desc: 'The all-in-one workspace', url: 'notion.so',
    longPct: 72, marketCap: 84200, rank: 1, change: 12.4, stakers: 1204,
    category: 'Productivity',
    history: [61000, 63000, 67000, 65000, 70000, 72000, 78000, 84200],
  },
  linear: {
    name: 'Linear', desc: 'The issue tracker for modern teams', url: 'linear.app',
    longPct: 68, marketCap: 61800, rank: 2, change: 8.1, stakers: 891,
    category: 'Developer Tools',
    history: [48000, 51000, 53000, 55000, 57000, 58000, 60000, 61800],
  },
  supabase: {
    name: 'Supabase', desc: 'The open source Firebase alternative', url: 'supabase.com',
    longPct: 88, marketCap: 21400, rank: 6, change: 31.2, stakers: 387,
    category: 'Developer Tools',
    history: [9000, 11000, 13000, 14000, 15500, 17000, 19000, 21400],
  },
}

function MiniChart({ history, positive }: { history: number[], positive: boolean }) {
  const max = Math.max(...history)
  const min = Math.min(...history)
  const range = max - min
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

export default function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params)
  const project = PROJECTS[slug]
  const [stakeAmount, setStakeAmount] = useState(100)
  const [position, setPosition] = useState<'long' | 'skeptic' | null>(null)
  const isPositive = project?.change > 0
  const { publicKey, signTransaction, connected } = useWallet()

  async function handleStake() {
    if (!connected || !publicKey) {
      alert('Please connect your wallet first')
      return
    }
    if (!position) return

    const signature = await stakeOnChain(publicKey, slug, stakeAmount, position, signTransaction!)

    await supabase.from('stakes').insert({
      wallet: publicKey.toBase58(),
      project_slug: slug,
      amount: stakeAmount,
      type: position,
    })

    alert('Stake confirmed! Transaction: ' + signature)
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <p style={{ color: 'var(--muted)' }}>Project not found</p>
          <Link href="/" className="text-sm mt-2 block" style={{ color: 'var(--primary)' }}>
            ← Back to leaderboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>

      {/* Header */}
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
            <p style={{ color: 'var(--muted)' }}>{project.desc}</p>
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
            { label: 'MARKET CAP', value: `$${project.marketCap.toLocaleString()}`, color: 'var(--text)' },
            { label: '24H CHANGE', value: `${isPositive ? '+' : ''}${project.change}%`, color: isPositive ? 'var(--long)' : 'var(--skeptic)' },
            { label: 'LONG', value: `${project.longPct}%`, color: 'var(--long)' },
            { label: 'STAKERS', value: project.stakers.toLocaleString(), color: 'var(--text)' },
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
                  {isPositive ? '+' : ''}{project.change}%
                </span>
              </div>
            </div>
            <MiniChart history={project.history} positive={isPositive} />

            {/* Sentiment Bar */}
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--long)' }}>▲ LONG {project.longPct}%</span>
                <span style={{ color: 'var(--skeptic)' }}>SKEPTIC {100 - project.longPct}% ▼</span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                <div className="rounded-full transition-all"
                  style={{ width: `${project.longPct}%`, background: 'var(--long)' }} />
                <div className="rounded-full transition-all"
                  style={{ width: `${100 - project.longPct}%`, background: 'var(--skeptic)' }} />
              </div>
              <div className="flex items-center gap-1">
                <Users size={12} style={{ color: 'var(--muted)' }} />
                <span className="mono text-xs" style={{ color: 'var(--muted)' }}>
                  {project.stakers.toLocaleString()} open positions
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