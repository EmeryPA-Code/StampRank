'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Zap, Activity, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(m => m.WalletMultiButton),
  { ssr: false }
)
import { useWallet } from '@solana/wallet-adapter-react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type Project = {
  id: number
  name: string
  slug: string
  desc: string
  long_pct: number
  market_cap: number
  rank: number
  change_24h: number
  stakers: number
  category?: string
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

function Ticker() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % TICKER_EVENTS.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full border-b flex items-center gap-3 px-6 py-2 text-xs"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <Zap size={12} style={{ color: 'var(--primary)' }} />
      <span style={{ color: 'var(--muted)' }}>LIVE</span>
      <span style={{ color: 'var(--text)' }}>{TICKER_EVENTS[index]}</span>
    </div>
  )
}

function ClientTime() {
  const [time, setTime] = useState<string | null>(null)
  useEffect(() => { setTime(new Date().toUTCString()) }, [])
  if (!time) return null
  return <>{time}</>
}

function MarketCapBar({ longPct }: { longPct: number }) {
  return (
    <div className="flex h-1.5 w-24 rounded-full overflow-hidden gap-0.5">
      <div className="rounded-full transition-all duration-500"
        style={{ width: `${longPct}%`, background: 'var(--long)' }} />
      <div className="rounded-full transition-all duration-500"
        style={{ width: `${100 - longPct}%`, background: 'var(--skeptic)' }} />
    </div>
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
          <span className="text-xs px-1.5 py-0.5 rounded shrink-0"
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
        {doubled.map((p, i) => (
          <MarqueeCard key={`${p.id}-${i}`} project={p} />
        ))}
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
        {doubled.map((p, i) => (
          <MarqueeCard key={`${p.id}-${i}`} project={p} />
        ))}
      </div>
    </div>
  )
}

function ProjectRow({ project }: { project: Project }) {
  const isPositive = (project.change_24h ?? 0) > 0
  const router = useRouter()

  return (
    <tr className="border-b cursor-pointer transition-colors hover:opacity-80"
      style={{ borderColor: 'var(--border)' }}
      onClick={() => router.push(`/p/${project.slug}`)}>
      <td className="px-6 py-4">
        <span className="mono text-sm" style={{ color: 'var(--muted)' }}>
          #{project.rank}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <Link href={`/p/${project.slug}`}
            className="font-semibold text-sm hover:underline"
            onClick={e => e.stopPropagation()}>
            {project.name}
          </Link>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>{project.desc}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="mono font-bold text-sm">
          ${(project.market_cap ?? 0).toLocaleString()}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          <MarketCapBar longPct={project.long_pct ?? 0} />
          <span className="mono text-xs" style={{ color: 'var(--muted)' }}>
            {project.long_pct ?? 0}% LONG
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1">
          {isPositive
            ? <TrendingUp size={12} style={{ color: 'var(--long)' }} />
            : <TrendingDown size={12} style={{ color: 'var(--skeptic)' }} />}
          <span className="mono text-sm font-bold"
            style={{ color: isPositive ? 'var(--long)' : 'var(--skeptic)' }}>
            {isPositive ? '+' : ''}{project.change_24h ?? 0}%
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="mono text-xs" style={{ color: 'var(--muted)' }}>
          {(project.stakers ?? 0).toLocaleString()} stakers
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <button
            onClick={e => { e.stopPropagation() }}
            className="px-3 py-1 rounded text-xs font-bold transition-opacity hover:opacity-80"
            style={{ background: 'var(--long)', color: '#000' }}>
            LONG
          </button>
          <button
            onClick={e => { e.stopPropagation() }}
            className="px-3 py-1 rounded text-xs font-bold transition-opacity hover:opacity-80"
            style={{ background: 'var(--skeptic)', color: '#fff' }}>
            SKEPTIC
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState<number | null>(null)
  const [projectCount, setProjectCount] = useState(0)
  const [totalStaked, setTotalStaked] = useState(0)
  const [totalStakers, setTotalStakers] = useState(0)
  const { publicKey } = useWallet()

  async function fetchStats() {
    const [rowsRes, countRes] = await Promise.all([
      supabase.from('projects').select('market_cap, stakers'),
      supabase.from('projects').select('id', { count: 'exact', head: true }),
    ])
    if (rowsRes.data) {
      setTotalStaked(rowsRes.data.reduce((sum, p) => sum + (p.market_cap ?? 0), 0))
      setTotalStakers(rowsRes.data.reduce((sum, p) => sum + (p.stakers ?? 0), 0))
    }
    if (countRes.count !== null) setProjectCount(countRes.count)
  }

  useEffect(() => {
    supabase.from('projects').select('*').order('rank').then(({ data }) => {
      if (data) setProjects(data)
      setLoading(false)
    })
    fetchStats()

    const channel: RealtimeChannel = supabase
      .channel('projects-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects' }, (payload) => {
        setProjects(prev => {
          const updated = prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p)
          return updated.sort((a, b) => (b.market_cap ?? 0) - (a.market_cap ?? 0))
        })
        fetchStats()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    if (!publicKey) { setBalance(null); return }
    console.log('Looking up wallet:', publicKey.toBase58())
    supabase
      .from('users')
      .select('thesis_balance')
      .eq('wallet_address', publicKey.toBase58())
      .single()
      .then(({ data, error }) => {
        console.log('Select result:', data, error)
        if (!error && data) setBalance(data.thesis_balance)
      })
  }, [publicKey])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>

      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
            STAMPRANK
          </span>
          <span className="mono text-xs px-2 py-0.5 rounded hidden sm:inline"
            style={{ background: 'var(--border)', color: 'var(--secondary)' }}>
            DEVNET
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/submit"
            className="hidden md:flex text-sm font-bold transition-opacity hover:opacity-70"
            style={{ color: 'var(--secondary)' }}>
            Submit Project
          </Link>
          <div className="hidden md:flex items-center gap-1.5">
            <Activity size={12} style={{ color: 'var(--secondary)' }} />
            <span className="mono text-xs" style={{ color: 'var(--muted)' }}>
              Solana · 400ms
            </span>
          </div>
          {publicKey && balance !== null && (
            <span className="mono text-xs hidden md:inline"
              style={{ color: 'var(--secondary)' }}>
              {balance.toLocaleString()} $THESIS
            </span>
          )}
          {publicKey && (
            <Link href="/profile"
              className="flex items-center justify-center w-8 h-8 rounded transition-opacity hover:opacity-70"
              style={{ background: 'var(--border)', color: 'var(--muted)' }}>
              <User size={14} />
            </Link>
          )}
          <div className="wallet-adapter-button-wrapper" style={{ ['--wallet-adapter-button-background' as string]: '#9945FF' }}>
            <WalletMultiButton />
          </div>
        </div>
      </header>

      {/* Ticker */}
      <Ticker />

      {/* Hero */}
      <section className="relative overflow-hidden border-b"
        style={{
          background: 'linear-gradient(180deg, #0A0A0F 0%, #111118 100%)',
          borderColor: 'var(--border)',
        }}>

        {/* Mobile top marquee row */}
        <div className="lg:hidden pt-4 px-4">
          <MarqueeRow projects={projects} />
        </div>

        {/* Desktop left column */}
        <div className="hidden lg:block absolute left-4 top-0 bottom-0 w-44"
          style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}>
          <MarqueeColumn projects={projects} />
        </div>

        {/* Desktop right column */}
        <div className="hidden lg:block absolute right-4 top-0 bottom-0 w-44"
          style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}>
          <MarqueeColumn projects={projects} />
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 py-16">

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-6 mono"
            style={{ background: '#1a0f2e', color: 'var(--primary)', border: '1px solid #3d1f6e' }}>
            ⚡ Built on Solana
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight"
            style={{ color: '#ffffff', lineHeight: 1.1, maxWidth: '800px' }}>
            The Market Decides<br />Who&apos;s Real
          </h1>

          {/* Subheadline */}
          <p className="text-base mb-8 max-w-xl leading-relaxed"
            style={{ color: 'var(--muted)' }}>
            Stake $THESIS to Long or Skeptic founder projects. Rankings determined by on-chain capital, not votes.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-12">
            <Link href="/submit"
              className="px-6 py-3 rounded font-bold text-sm transition-opacity hover:opacity-80"
              style={{ background: 'var(--primary)', color: '#fff' }}>
              Submit Your Project
            </Link>
            <a href="#how-it-works"
              className="px-6 py-3 rounded font-bold text-sm transition-opacity hover:opacity-80"
              style={{ border: '1px solid var(--border)', color: 'var(--muted)', background: 'transparent' }}>
              How it Works
            </a>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
            {[
              { label: 'Projects Listed', value: projectCount.toString() },
              { label: 'THESIS Staked', value: `$${totalStaked.toLocaleString()}` },
              { label: 'Stakers', value: totalStakers.toLocaleString() },
            ].map(s => (
              <div key={s.label} className="px-6 py-4 rounded-lg border"
                style={{ background: '#0d0d14', borderColor: 'var(--border)', minWidth: '160px' }}>
                <p className="mono font-bold text-2xl mb-1" style={{ color: 'var(--secondary)' }}>{s.value}</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile bottom marquee row */}
        <div className="lg:hidden pb-4 px-4">
          <MarqueeRow projects={projects} />
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="px-6 py-16 border-b"
        style={{ borderColor: 'var(--border)' }}>
        <h2 className="text-2xl font-bold text-center mb-10" style={{ color: 'var(--text)' }}>
          How it Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              step: '01',
              icon: '🔗',
              title: 'Connect Your Wallet',
              desc: 'Connect your Phantom wallet to StampRank. You start with 1,000 $THESIS tokens to stake.',
            },
            {
              step: '02',
              icon: '📊',
              title: 'Stake Your Thesis',
              desc: 'Browse founder projects and stake $THESIS to Long (you believe in it) or Skeptic (you think it\'s overhyped). Your stake is recorded on Solana.',
            },
            {
              step: '03',
              icon: '🏆',
              title: 'Rankings Are Earned',
              desc: 'Market Cap = total $THESIS staked. The community decides who\'s real. No votes, no algorithms — just skin in the game.',
            },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="rounded-lg border p-6 flex flex-col gap-3"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-3xl">{icon}</span>
                <span className="mono text-xs font-bold" style={{ color: 'var(--primary)' }}>
                  STEP {step}
                </span>
              </div>
              <h3 className="font-bold text-base" style={{ color: 'var(--text)' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      {(() => {
        const trending = projects.length > 0
          ? projects.reduce((best, p) => (p.change_24h ?? 0) > (best.change_24h ?? 0) ? p : best, projects[0])
          : null
        const trendingLabel = trending
          ? `${trending.name} ↑${trending.change_24h ?? 0}%`
          : '—'
        return (
          <div className="border-b px-6 py-3 flex flex-wrap items-center gap-6"
            style={{ borderColor: 'var(--border)' }}>
            {[
              { label: 'TOTAL STAKED', value: `$${totalStaked.toLocaleString()}`, color: 'var(--text)' },
              { label: 'PROJECTS', value: projectCount.toString(), color: 'var(--text)' },
              { label: 'STAKERS', value: totalStakers.toLocaleString(), color: 'var(--text)' },
              { label: 'TRENDING', value: trendingLabel, color: 'var(--secondary)' },
            ].map(stat => (
              <div key={stat.label} className="flex flex-col">
                <span className="text-xs" style={{ color: 'var(--muted)' }}>{stat.label}</span>
                <span className="mono font-bold text-sm" style={{ color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        )
      })()}

      {/* Table */}
      <div className="flex-1 overflow-x-auto w-full">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              {['RANK', 'PROJECT', 'MARKET CAP', 'SENTIMENT', '24H', 'STAKERS', 'ACTION'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium"
                  style={{ color: 'var(--muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <span className="mono text-xs" style={{ color: 'var(--muted)' }}>Loading…</span>
                </td>
              </tr>
            ) : (
              projects.map(p => (
                <ProjectRow key={p.id} project={p} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <footer className="border-t px-6 py-3 flex items-center justify-between"
        style={{ borderColor: 'var(--border)' }}>
        <span className="mono text-xs" style={{ color: 'var(--muted)' }}>
          STAMPRANK · Powered by Solana · $THESIS token
        </span>
        <span className="mono text-xs" style={{ color: 'var(--muted)' }}>
          <ClientTime />
        </span>
      </footer>
    </div>
  )
}