'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(m => m.WalletMultiButton),
  { ssr: false }
)
import { useWallet } from '@solana/wallet-adapter-react'
import { TrendingUp, TrendingDown, Activity, Zap, User } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const TICKER_EVENTS = [
  'anon_whale staked 500 $THESIS on Notion',
  'marc_builder went SKEPTIC on Loom',
  'founder_xyz staked 200 $THESIS on Supabase',
  'cryptovc went LONG on Raycast',
  'indie_maker staked 150 $THESIS on Linear',
  'buildoor went SKEPTIC on Cal.com',
  'solana_dev staked 800 $THESIS on Framer',
]

type Stake = {
  id: number
  wallet: string
  project_slug: string
  amount: number
  type: 'long' | 'skeptic'
  created_at: string
}

type StakeWithName = Stake & { project_name: string }

function truncate(addr: string) {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`
}

export default function ProfilePage() {
  const { publicKey } = useWallet()
  const [stakes, setStakes] = useState<StakeWithName[]>([])
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [tickerIndex, setTickerIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex(i => (i + 1) % TICKER_EVENTS.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!publicKey) { setStakes([]); setBalance(null); return }
    const wallet = publicKey.toBase58()
    setLoading(true)

    Promise.all([
      supabase.from('stakes').select('*').eq('wallet', wallet).order('created_at', { ascending: false }),
      supabase.from('users').select('thesis_balance').eq('wallet_address', wallet).single(),
      supabase.from('projects').select('slug, name'),
    ]).then(([stakesRes, userRes, projectsRes]) => {
      if (!userRes.error && userRes.data) setBalance(userRes.data.thesis_balance)

      const projectMap: Record<string, string> = {}
      for (const p of projectsRes.data ?? []) {
        projectMap[p.slug] = p.name
      }

      const enriched: StakeWithName[] = (stakesRes.data ?? []).map(s => ({
        ...s,
        project_name: projectMap[s.project_slug] ?? s.project_slug,
      }))
      setStakes(enriched)
      setLoading(false)
    })
  }, [publicKey])

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
        {publicKey && balance !== null && (
          <span className="mono text-xs hidden md:inline" style={{ color: 'var(--secondary)' }}>
            {balance.toLocaleString()} $THESIS
          </span>
        )}
        <div className="wallet-adapter-button-wrapper" style={{ ['--wallet-adapter-button-background' as string]: '#9945FF' }}>
          <WalletMultiButton />
        </div>
      </div>
    </header>
  )

  if (!publicKey) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
        {header}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center flex flex-col items-center gap-4">
            <User size={40} style={{ color: 'var(--muted)' }} />
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Connect your wallet to view your profile
            </p>
            <div className="wallet-adapter-button-wrapper" style={{ ['--wallet-adapter-button-background' as string]: '#9945FF' }}>
              <WalletMultiButton />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const addr = publicKey.toBase58()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      {header}

      <div className="max-w-3xl mx-auto w-full px-6 py-8 flex flex-col gap-6">

        {/* Identity card */}
        <div className="rounded-lg border p-6 flex flex-col gap-4"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'var(--border)' }}>
              <User size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <div className="flex flex-col">
              <span className="mono text-sm font-bold" style={{ color: 'var(--text)' }}>
                {truncate(addr)}
              </span>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>Solana Wallet</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg p-4 border"
              style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>$THESIS BALANCE</p>
              <p className="mono text-2xl font-bold" style={{ color: 'var(--secondary)' }}>
                {balance !== null ? balance.toLocaleString() : '—'}
              </p>
            </div>
            <div className="rounded-lg p-4 border"
              style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>TOTAL STAKES</p>
              <p className="mono text-2xl font-bold" style={{ color: 'var(--text)' }}>
                {loading ? '—' : stakes.length}
              </p>
            </div>
          </div>
        </div>

        {/* Stakes list */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-medium" style={{ color: 'var(--muted)' }}>STAKE HISTORY</h2>

          {loading ? (
            <div className="py-12 text-center">
              <span className="mono text-xs" style={{ color: 'var(--muted)' }}>Loading…</span>
            </div>
          ) : stakes.length === 0 ? (
            <div className="py-12 text-center rounded-lg border"
              style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>No stakes yet</p>
              <Link href="/" className="text-sm mt-2 block" style={{ color: 'var(--primary)' }}>
                Browse the leaderboard →
              </Link>
            </div>
          ) : (
            stakes.map(stake => {
              const isLong = stake.type === 'long'
              const date = stake.created_at
                ? new Date(stake.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '—'
              return (
                <Link key={stake.id} href={`/p/${stake.project_slug}`}
                  className="rounded-lg border p-4 flex items-center justify-between transition-opacity hover:opacity-80"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded flex items-center justify-center shrink-0"
                      style={{ background: isLong ? 'rgba(20,241,149,0.1)' : 'rgba(239,68,68,0.1)' }}>
                      {isLong
                        ? <TrendingUp size={14} style={{ color: 'var(--long)' }} />
                        : <TrendingDown size={14} style={{ color: 'var(--skeptic)' }} />}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                        {stake.project_name}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>{date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="mono text-xs font-bold px-2 py-0.5 rounded"
                      style={{
                        background: isLong ? 'rgba(20,241,149,0.15)' : 'rgba(239,68,68,0.15)',
                        color: isLong ? 'var(--long)' : 'var(--skeptic)',
                      }}>
                      {isLong ? '▲ LONG' : '▼ SKEPTIC'}
                    </span>
                    <span className="mono text-sm font-bold" style={{ color: 'var(--text)' }}>
                      {stake.amount.toLocaleString()} $THESIS
                    </span>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
