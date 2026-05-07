'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(m => m.WalletMultiButton),
  { ssr: false }
)
import { useWallet } from '@solana/wallet-adapter-react'
import { TrendingUp, TrendingDown, User } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Layout from '@/components/Layout'

type Stake = {
  id: number
  wallet: string
  project_slug: string
  amount: number
  type: 'long' | 'skeptic'
  created_at: string
  projects: { name: string; slug: string } | null
}

function truncate(addr: string) {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`
}

export default function ProfilePage() {
  const { publicKey } = useWallet()
  const [stakes, setStakes] = useState<Stake[]>([])
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!publicKey) { setStakes([]); setBalance(null); return }
    const wallet = publicKey.toBase58()
    setLoading(true)

    Promise.all([
      supabase.from('stakes').select('*, projects(name, slug)').eq('wallet', wallet).order('created_at', { ascending: false }),
      supabase.from('users').select('thesis_balance').eq('wallet_address', wallet).single(),
    ]).then(([stakesRes, userRes]) => {
      if (!userRes.error && userRes.data) setBalance(userRes.data.thesis_balance)
      setStakes((stakesRes.data ?? []) as Stake[])
      setLoading(false)
    })
  }, [publicKey])

  if (!publicKey) {
    return (
      <Layout>
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
      </Layout>
    )
  }

  const addr = publicKey.toBase58()

  return (
    <Layout>
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
                        {stake.projects?.name ?? stake.project_slug}
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
    </Layout>
  )
}
