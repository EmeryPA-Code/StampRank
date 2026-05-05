'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Zap, Activity } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(m => m.WalletMultiButton),
  { ssr: false }
)
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

  useEffect(() => {
    supabase.from('projects').select('*').order('rank').then(({ data }) => {
      if (data) setProjects(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>

      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
            STAMPRANK
          </span>
          <span className="mono text-xs px-2 py-0.5 rounded"
            style={{ background: 'var(--border)', color: 'var(--secondary)' }}>
            DEVNET
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Activity size={12} style={{ color: 'var(--secondary)' }} />
            <span className="mono text-xs" style={{ color: 'var(--muted)' }}>
              Solana · 400ms
            </span>
          </div>
          <div className="wallet-adapter-button-wrapper" style={{ ['--wallet-adapter-button-background' as string]: '#9945FF' }}>
            <WalletMultiButton />
          </div>
        </div>
      </header>

      {/* Ticker */}
      <Ticker />

      {/* Stats bar */}
      <div className="border-b px-6 py-3 flex items-center gap-8"
        style={{ borderColor: 'var(--border)' }}>
        {[
          { label: 'TOTAL STAKED', value: '$309,800', color: 'var(--text)' },
          { label: 'PROJECTS', value: '8', color: 'var(--text)' },
          { label: 'STAKERS', value: '4,590', color: 'var(--text)' },
          { label: 'TRENDING', value: 'Supabase ↑31%', color: 'var(--secondary)' },
        ].map(stat => (
          <div key={stat.label} className="flex flex-col">
            <span className="text-xs" style={{ color: 'var(--muted)' }}>{stat.label}</span>
            <span className="mono font-bold text-sm" style={{ color: stat.color }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
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