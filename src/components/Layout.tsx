'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(m => m.WalletMultiButton),
  { ssr: false }
)
import { useWallet } from '@solana/wallet-adapter-react'
import { Zap, Activity, User } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
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

function ClientTime() {
  const [time, setTime] = useState<string | null>(null)
  useEffect(() => { setTime(new Date().toUTCString()) }, [])
  if (!time) return null
  return <>{time}</>
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number | null>(null)
  const [tickerIndex, setTickerIndex] = useState(0)
  const { publicKey } = useWallet()

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex(i => (i + 1) % TICKER_EVENTS.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!publicKey) { setBalance(null); return }
    supabase
      .from('users')
      .select('thesis_balance')
      .eq('wallet_address', publicKey.toBase58())
      .single()
      .then(({ data, error }) => {
        if (!error && data) setBalance(data.thesis_balance)
      })
  }, [publicKey])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>

      <header className="border-b px-6 py-4 flex items-center justify-between"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-center gap-3">
          <Link href="/">
            <Image src="/logo.png" width={160} height={40} alt="StampRank" style={{ objectFit: 'contain' }} />
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

      <div className="flex-1 flex flex-col">
        {children}
      </div>

      <footer className="border-t px-6 py-3 flex items-center justify-between"
        style={{ borderColor: 'var(--border)' }}>
        <span className="mono text-xs" style={{ color: 'var(--muted)' }}>
          StampRank · Powered by Solana · $THESIS token
        </span>
        <span className="mono text-xs" style={{ color: 'var(--muted)' }}>
          <ClientTime />
        </span>
      </footer>
    </div>
  )
}
