'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Layout from '@/components/Layout'

const CATEGORIES = ['Productivity', 'Developer Tools', 'Design', 'Marketing', 'AI', 'SaaS', 'Other']

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function SubmitPage() {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('Productivity')
  const [twitter, setTwitter] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const slug = slugify(name)

    const { error: sbError } = await supabase.from('projects').insert({
      name,
      slug,
      description: desc,
      url,
      category,
      twitter,
      market_cap: 0,
      rank: 99,
      change_24h: 0,
      long_pct: 50,
      stakers: 0,
      plan: 'free',
    })

    setSubmitting(false)

    if (sbError) {
      setError(sbError.message)
      return
    }

    setSuccess(true)
  }

  const inputStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '10px 14px',
    color: 'var(--text)',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
  } as React.CSSProperties

  const labelStyle = {
    fontSize: '11px',
    letterSpacing: '1px',
    color: 'var(--muted)',
    marginBottom: '6px',
    display: 'block',
  } as React.CSSProperties

  return (
    <Layout>
      <div className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-lg">

          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
              Submit Your Project
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              List your project on StampRank and let the market decide its real value.
            </p>
          </div>

          {success ? (
            <div className="rounded-lg border p-6 text-center"
              style={{ background: 'var(--surface)', borderColor: 'var(--secondary)' }}>
              <p className="text-lg font-bold mb-2" style={{ color: 'var(--secondary)' }}>
                Submission received!
              </p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Your project has been submitted! It will appear on the leaderboard shortly.
              </p>
              <Link href="/"
                className="inline-block mt-4 text-sm font-bold transition-opacity hover:opacity-70"
                style={{ color: 'var(--primary)' }}>
                ← Back to leaderboard
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              <div>
                <label style={labelStyle}>PROJECT NAME</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Notion"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>ONE-LINE DESCRIPTION</label>
                <input
                  required
                  type="text"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="e.g. The all-in-one workspace"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>WEBSITE URL</label>
                <input
                  required
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://yourproject.com"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>CATEGORY</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>TWITTER / X HANDLE</label>
                <input
                  type="text"
                  value={twitter}
                  onChange={e => setTwitter(e.target.value)}
                  placeholder="@yourproject"
                  style={inputStyle}
                />
              </div>

              {error && (
                <p className="text-sm" style={{ color: 'var(--skeptic)' }}>
                  Error: {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="py-3 rounded font-bold text-sm transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{ background: 'var(--primary)', color: '#fff' }}>
                {submitting ? 'Submitting…' : 'Submit Project'}
              </button>

            </form>
          )}
        </div>
      </div>
    </Layout>
  )
}
