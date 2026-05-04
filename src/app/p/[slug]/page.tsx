import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import ProjectPageClient from './ProjectPageClient'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params

  const { data: project } = await supabase
    .from('projects')
    .select('name, long_pct, market_cap, rank')
    .eq('slug', slug)
    .single()

  const name = project?.name ?? slug
  const long_pct = project?.long_pct ?? 0
  const market_cap: number = project?.market_cap ?? 0
  const rank = project?.rank ?? '—'

  const title = `${name} — Hype Score | StampRank`
  const description = `${long_pct}% Long · $${market_cap.toLocaleString()} CRED Market Cap · #${rank} ranked on StampRank. Is ${name} real value or pure hype?`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`/p/${slug}/opengraph-image`],
      url: `https://stamp-rank.vercel.app/p/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function ProjectPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  return <ProjectPageClient slug={slug} />
}
