# StampRank — On-Chain Reputation Markets for Founders

> **The community decides who's real. The blockchain proves it.**

---

## The Problem

Founders want visibility and status. The community wants to judge which projects are real value vs pure hype. No platform combines both with skin in the game.

Twitter clout is gameable. Product Hunt votes are bots. Follower counts are bought. There's no credible, manipulation-proof signal for founder reputation — until now.

---

## What is StampRank

A SocialFi prediction market on Solana where users stake **$THESIS tokens** to **Long** or **Skeptic** real founder projects.

Rankings are determined by staked capital, not votes. Every position is recorded on-chain — transparent, verifiable, manipulation-proof.

---

## How it Works

1. **Connect** your Phantom wallet
2. **Browse** the leaderboard of founder projects
3. **Stake $THESIS** to Long (you believe in it) or Skeptic (you think it's overhyped)
4. **Market Cap** = total $THESIS staked. That determines the ranking.
5. **Submit your own project** and let the market decide its real value

---

## Why Solana

- **Sub-second finality** makes staking feel instant
- **Low fees** mean micro-stakes are viable
- **Brings the entire Indie Hacker / Tech Twitter ecosystem onchain**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| Database | Supabase (off-chain metadata + user data) |
| Blockchain | Solana Testnet — $THESIS SPL token, on-chain stakes via wallet-adapter |
| Auth | Phantom Wallet + @solana/wallet-adapter |
| OG Images | Vercel Edge Functions (dynamic Bloomberg-style Hype Cards) |
| Deploy | Vercel |

---

## Live Demo

**[https://stamp-rank.vercel.app](https://stamp-rank.vercel.app)**

---

## Key Features

- **Live leaderboard** ranked by on-chain Market Cap
- **Long / Skeptic positions** recorded on Solana
- **Dynamic OG images** — share your Hype Card on X
- **Project submission** — any founder can list their project
- **Bloomberg Terminal aesthetic** built for Tech Twitter

---

## Running Locally

### 1. Clone and install

```bash
git clone https://github.com/EmeryPA-Code/StampRank.git
cd stamprank
npm install
```

### 2. Set environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Connect wallet

Install [Phantom](https://phantom.app) and switch to **Testnet** mode to interact with on-chain staking.

---

## Hackathon

Built for the **Solana Frontier Hackathon 2026** by [@EmeryPA](https://twitter.com/EmeryPA)
