'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(m => m.WalletMultiButton),
  { ssr: false }
)
import { useWallet } from '@solana/wallet-adapter-react'
import { TrendingUp, TrendingDown, Zap, Users, Activity, ExternalLink } from 'lucide-react'
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

function MarqueeCard({ project }: { project: Project }) {
  const isPositive = (project.change_24h ?? 0) > 0
  return (
    <div className="rounded-lg border p-3 flex flex-col gap-1.5 shrink-0"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', width: '160px' }}>
      <div className="flex items-center justify-between gap-1">
        <span className="font-semibold text-xs truncate" style={{ color: 'var(--text)' }}>
          {project.name}
        </span>
        {project.category && (
          <span className="px-1.5 py-0.5 rounded shrink-0"
            style={{ background: 'var(--border)', color: 'var(--muted)', fontSize: '9px' }}>
            {project.category}
          </span>
        )}
      </div>
      <span className="mono text-sm font-bold" style={{ color: 'var(--secondary)' }}>
        ${(project.market_cap ?? 0).toLocaleString()}
      </span>
      <div className="flex items-center justify-between">
        <span className="mono text-xs" style={{ color: 'var(--long)' }}>
          {project.long_pct ?? 0}% LONG
        </span>
        <span className="mono text-xs font-bold"
          style={{ color: isPositive ? 'var(--long)' : 'var(--skeptic)' }}>
          {isPositive ? '+' : ''}{project.change_24h ?? 0}%
        </span>
      </div>
    </div>
  )
}

function MarqueeColumn({ projects }: { projects: Project[] }) {
  const doubled = [...projects, ...projects]
  return (
    <div style={{ overflow: 'hidden', height: '100%' }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        animation: 'scroll-up 40s linear infinite',
      }}>
        {doubled.map((p, i) => <MarqueeCard key={`${p.id}-${i}`} project={p} />)}
      </div>
    </div>
  )
}

function MarqueeRow({ projects }: { projects: Project[] }) {
  const doubled = [...projects, ...projects]
  return (
    <div style={{ overflow: 'hidden', width: '100%' }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        animation: 'scroll-left 38s linear infinite',
        width: 'max-content',
      }}>
        {doubled.map((p, i) => <MarqueeCard key={`${p.id}-${i}`} project={p} />)}
      </div>
    </div>
  )
}

const TICKER_EVENTS = [
  'anon_whale staked 500 $THESIS on Notion',
  'marc_builder went SKEPTIC on Loom',
  'founder_xyz staked 200 $THESIS on Supabase',
  'cryptovc went LONG on Raycast',
  'indie_maker staked 150 $THESIS on Linear',
  'buildoor went SKEPTIC on Cal.com',
  'solana_dev staked 800 $THESIS on Framer',
]

export default function ProjectPageClient({ slug }: { slug: string }) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [marqueeProjects, setMarqueeProjects] = useState<Project[]>([])
  const [stakeAmount, setStakeAmount] = useState(100)
  const [position, setPosition] = useState<'long' | 'skeptic' | null>(null)
  const [thesisBalance, setThesisBalance] = useState<number | null>(null)
  const [tickerIndex, setTickerIndex] = useState(0)
  const { publicKey, signTransaction, connected } = useWallet()
  const searchParams = useSearchParams()

  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'long' || action === 'skeptic') setPosition(action)
  }, [searchParams])

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex(i => (i + 1) % TICKER_EVENTS.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

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

  useEffect(() => {
    supabase
      .from('projects')
      .select('*')
      .neq('slug', slug)
      .order('rank')
      .then(({ data }) => { if (data) setMarqueeProjects(data) })
  }, [slug])

  useEffect(() => {
    if (!publicKey) return
    const wallet = publicKey.toBase58()
    console.log('Looking up wallet:', wallet)
    supabase
      .from('users')
      .select('thesis_balance')
      .eq('wallet_address', wallet)
      .single()
      .then(({ data, error }) => {
        console.log('Select result:', data, error)
        if (!error && data) {
          setThesisBalance(data.thesis_balance)
        } else {
          console.log('Inserting new user')
          supabase
            .from('users')
            .insert({ wallet_address: wallet, thesis_balance: 1000 })
            .then(() => setThesisBalance(1000))
        }
      })
  }, [publicKey])

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
    if (!project) return

    const signature = await stakeOnChain(publicKey, slug, stakeAmount, position, signTransaction!)

    alert('Stake confirmed! Transaction: ' + signature)

    const newMarketCap = (project?.market_cap ?? 0) + stakeAmount
    const newStakers = (project?.stakers ?? 0) + 1
    const newBalance = (thesisBalance ?? 0) - stakeAmount

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

    console.log('Updating balance for wallet:', publicKey.toBase58(), 'new balance:', newBalance)
    const updateResult = await supabase.from('users').update({ thesis_balance: newBalance }).eq('wallet_address', publicKey.toBase58())
    console.log('Balance update response:', updateResult)

    setProject({ ...project!, market_cap: newMarketCap, stakers: newStakers })
    setThesisBalance(prev => (prev ?? 0) - stakeAmount)
  }

  const header = (
    <header className="border-b px-6 py-4 flex items-center justify-between"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="flex items-center gap-3">
        <Link href="/">
          <span className="text-lg font-bold" style={{ color: 'var(--primary)' }}>STAMPRANK</span>
        </Link>
        <span className="mono text-xs px-2 py-0.5 rounded hidden sm:inline"
          style={{ background: 'var(--border)', color: 'var(--secondary)' }}>
          DEVNET
        </span>
      </div>
      <div className="hidden md:flex items-center gap-2 text-xs">
        <Zap size={12} style={{ color: 'var(--primary)' }} />
        <span style={{ color: 'var(--text)' }}>{TICKER_EVENTS[tickerIndex]}</span>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/submit"
          className="hidden md:flex text-sm font-bold transition-opacity hover:opacity-70"
          style={{ color: 'var(--secondary)' }}>
          Submit Project
        </Link>
        <div className="hidden md:flex items-center gap-1.5">
          <Activity size={12} style={{ color: 'var(--secondary)' }} />
          <span className="mono text-xs" style={{ color: 'var(--muted)' }}>Solana · 400ms</span>
        </div>
        {publicKey && thesisBalance !== null && (
          <span className="mono text-xs hidden md:inline" style={{ color: 'var(--secondary)' }}>
            {thesisBalance.toLocaleString()} $THESIS
          </span>
        )}
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

      {/* Mobile top marquee */}
      {marqueeProjects.length > 0 && (
        <div className="lg:hidden px-4 pt-4 overflow-hidden">
          <MarqueeRow projects={marqueeProjects} />
        </div>
      )}

      <div className="relative">
        {/* Desktop left column */}
        {marqueeProjects.length > 0 && (
          <div className="hidden lg:block absolute left-4 top-0 bottom-0 w-44"
            style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}>
            <MarqueeColumn projects={marqueeProjects} />
          </div>
        )}

        {/* Desktop right column */}
        {marqueeProjects.length > 0 && (
          <div className="hidden lg:block absolute right-4 top-0 bottom-0 w-44"
            style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}>
            <MarqueeColumn projects={marqueeProjects} />
          </div>
        )}

        {/* Main content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">

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
            {project.description && (
              <p style={{ color: 'var(--muted)', fontSize: '16px' }}>{project.description}</p>
            )}
            {project.url && (
              <a href={`https://${project.url}`} target="_blank"
                className="flex items-center gap-1 text-xs mt-1 hover:opacity-70 transition-opacity"
                style={{ color: 'var(--primary)' }}>
                {project.url} <ExternalLink size={10} />
              </a>
            )}
          </div>
          <div className="mono text-xs px-3 py-1.5 rounded font-bold"
            style={{ background: 'var(--border)', color: 'var(--muted)' }}>
            #{project.rank} RANKED
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

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
              Balance: {thesisBalance !== null ? thesisBalance.toLocaleString() : '—'} $THESIS available
            </p>
          </div>
        </div>
        </div>{/* end main content */}
      </div>{/* end relative wrapper */}
    </div>
  )
}
