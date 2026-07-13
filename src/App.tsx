import { useState, useEffect, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  BookOpen,
  Brain,
  ShoppingBag,
  Users,
  Coins,
  FileText,
  Sparkles,
  Languages,
  FileSearch,
  Wand2,
  BookMarked,
  GraduationCap,
  Code2,
  TrendingUp,
  Palette,
  Gamepad2,
  Landmark,
  PenLine,
  Zap,
  Vote,
  Gift,
  Lock,
  Menu,
  X,
  ArrowRight,
  Check,
  Wallet,
  MessageCircle,
  Globe,
  Layers,
  Package,
  ScrollText,
  Lightbulb,
  Network,
  Grid3X3,
} from 'lucide-react'
import {
  getAccounts,
  getChainId,
  hasWallet,
  METAMASK_DOWNLOAD,
  parseWalletError,
  requestAccounts,
  shortenAddress,
  subscribeWallet,
} from './wallet'
import GameDemo, { GameLaunchCard } from './game/GameDemo'
import CrosswordGame, { CrosswordLaunchCard } from './game/CrosswordGame'
import './App.css'

/* ─── Animation helpers ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

function FadeIn({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={fadeUp}
      custom={delay}
    >
      {children}
    </motion.div>
  )
}

/* ─── Data ─── */
const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'AI Tools', href: '#ai' },
  { label: 'Library', href: '#library' },
  { label: 'Games', href: '#game' },
  { label: 'TTS English', href: '#crossword' },
  { label: 'Tokenomics', href: '#tokenomics' },
  { label: 'Roadmap', href: '#roadmap' },
]

const FEATURES = [
  {
    icon: FileText,
    title: 'TXT Publish',
    desc: 'Publish articles, blogs, tutorials, whitepapers, research, and prompt libraries with permanent blockchain ownership.',
  },
  {
    icon: BookOpen,
    title: 'TXT Library',
    desc: 'A decentralized knowledge archive across AI, crypto, trading, programming, design, finance, education, and gaming.',
  },
  {
    icon: Brain,
    title: 'TXT AI',
    desc: 'AI Writer, Editor, Translator, Summarizer, Prompt Generator, and Documentation Assistant — powered by $TXT.',
  },
  {
    icon: ShoppingBag,
    title: 'TXT Marketplace',
    desc: 'Monetize premium articles, prompt packs, research reports, templates, courses, and digital books in $TXT.',
  },
  {
    icon: Users,
    title: 'TXT DAO',
    desc: 'Community governance over featured content, ecosystem grants, creator incentives, upgrades, and treasury.',
  },
  {
    icon: Coins,
    title: '$TXT Utility',
    desc: 'Publish, buy, tip, stake, unlock AI tools, access exclusive libraries, and participate in governance.',
  },
]

const AI_TOOLS = [
  { icon: PenLine, title: 'AI Writer', desc: 'Generate long-form content with context-aware AI trained on Web3 knowledge.' },
  { icon: Sparkles, title: 'AI Editor', desc: 'Polish tone, structure, and clarity — keep your voice while elevating quality.' },
  { icon: Languages, title: 'AI Translator', desc: 'Translate knowledge across languages while preserving technical accuracy.' },
  { icon: FileSearch, title: 'AI Summarizer', desc: 'Distill research papers and docs into actionable insights in seconds.' },
  { icon: Wand2, title: 'Prompt Generator', desc: 'Craft high-performance prompts for any model or creative workflow.' },
  { icon: BookMarked, title: 'Docs Assistant', desc: 'Build structured documentation from raw notes and code automatically.' },
]

const CATEGORIES = [
  { icon: Brain, label: 'AI' },
  { icon: Coins, label: 'Crypto' },
  { icon: TrendingUp, label: 'Trading' },
  { icon: Code2, label: 'Programming' },
  { icon: Palette, label: 'Design' },
  { icon: Landmark, label: 'Finance' },
  { icon: GraduationCap, label: 'Education' },
  { icon: Gamepad2, label: 'Gaming' },
]

const LIBRARY_ITEMS = [
  {
    tag: 'AI',
    title: 'Building RAG Systems for On-Chain Data',
    desc: 'A complete guide to retrieval-augmented generation using decentralized storage.',
    author: '0xNova',
    reads: '12.4K',
  },
  {
    tag: 'Crypto',
    title: 'Robinhood Chain Deep Dive',
    desc: 'Architecture, consensus, and developer tooling for the next-gen L1.',
    author: 'ChainLabs',
    reads: '8.9K',
    featured: true,
  },
  {
    tag: 'Trading',
    title: 'On-Chain Order Flow Strategies',
    desc: 'How smart money moves liquidity — and how to read the signals.',
    author: 'AlphaDesk',
    reads: '15.2K',
  },
  {
    tag: 'Programming',
    title: 'Smart Contract Patterns 2026',
    desc: 'Upgradeable proxies, account abstraction, and gas-efficient designs.',
    author: 'DevForge',
    reads: '6.7K',
  },
  {
    tag: 'Finance',
    title: 'KnowledgeFi: The New Asset Class',
    desc: 'Why tokenized intellectual property is reshaping creator economies.',
    author: 'TXT Research',
    reads: '21.1K',
    featured: true,
  },
  {
    tag: 'Education',
    title: 'Web3 Writing for Beginners',
    desc: 'From first draft to on-chain publication — a step-by-step playbook.',
    author: 'EduDAO',
    reads: '9.3K',
  },
]

const MARKET_ITEMS = [
  { icon: ScrollText, title: 'Premium Articles', desc: 'Exclusive long-form research and analysis unlocked with $TXT.', price: '50 $TXT' },
  { icon: Wand2, title: 'Prompt Packs', desc: 'Curated, battle-tested prompt libraries for creators and builders.', price: '120 $TXT' },
  { icon: FileSearch, title: 'Research Reports', desc: 'Deep industry reports from verified on-chain analysts.', price: '200 $TXT' },
  { icon: Package, title: 'Templates', desc: 'Ready-to-use templates for docs, decks, and product launches.', price: '80 $TXT' },
  { icon: GraduationCap, title: 'Courses', desc: 'Structured learning paths with certificates on-chain.', price: '500 $TXT' },
  { icon: BookOpen, title: 'Digital Books', desc: 'Own forever editions of books minted as digital assets.', price: '150 $TXT' },
]

const CREATOR_STEPS = [
  { num: '01', title: 'Write & Publish', desc: 'Create content and mint it as an on-chain knowledge asset with permanent ownership.' },
  { num: '02', title: 'Get Discovered', desc: 'Reach readers via TXT Library categories, AI recommendations, and community curation.' },
  { num: '03', title: 'Monetize & Earn', desc: 'Sell premium work, receive tips, and earn from staking and creator incentives.' },
  { num: '04', title: 'Govern the Future', desc: 'Stake $TXT to vote on grants, featured content, and protocol upgrades.' },
]

const UTILITIES = [
  { icon: PenLine, title: 'Publish Content', desc: 'Pay gas and fees to mint knowledge assets on-chain.' },
  { icon: ShoppingBag, title: 'Buy Publications', desc: 'Unlock premium articles, books, and research.' },
  { icon: Brain, title: 'AI Writing Tools', desc: 'Access the full suite of TXT AI features.' },
  { icon: Lock, title: 'Exclusive Libraries', desc: 'Enter gated knowledge vaults and archives.' },
  { icon: Gift, title: 'Tip Creators', desc: 'Reward valuable writing instantly in $TXT.' },
  { icon: Layers, title: 'Stake for Rewards', desc: 'Earn yield by securing the knowledge network.' },
  { icon: Vote, title: 'Governance', desc: 'Shape protocol decisions through the DAO.' },
  { icon: GraduationCap, title: 'Education Access', desc: 'Purchase courses and learning resources.' },
]

const ROADMAP = [
  {
    phase: 'Phase 01',
    title: 'Genesis',
    items: ['Token launch on Robinhood Chain', 'Core publishing protocol', 'TXT Library v1', 'Community channels live'],
  },
  {
    phase: 'Phase 02',
    title: 'Intelligence',
    items: ['TXT AI suite launch', 'Prompt marketplace', 'Creator staking', 'Mobile-responsive app'],
  },
  {
    phase: 'Phase 03',
    title: 'Economy',
    items: ['Full marketplace live', 'Premium content rails', 'DAO governance portal', 'Ecosystem grants program'],
  },
  {
    phase: 'Phase 04',
    title: 'Expansion',
    items: ['Cross-chain knowledge bridges', 'Enterprise docs tools', 'AI knowledge graph', 'Global creator network'],
  },
]

const ALLOCATIONS = [
  { name: 'Community Rewards', pct: 40, color: '#C6F700' },
  { name: 'Ecosystem Development', pct: 25, color: '#A8D600' },
  { name: 'Creator Incentives', pct: 15, color: '#8AB800' },
  { name: 'Liquidity', pct: 10, color: '#6B9900' },
  { name: 'Team & Advisors', pct: 10, color: '#4D7A00' },
]

/* ─── Donut chart SVG ─── */
function DonutChart({ allocations }: { allocations: typeof ALLOCATIONS }) {
  const size = 280
  const stroke = 28
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="token-chart">
      <svg className="chart-ring" viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {allocations.map((a) => {
          const len = (a.pct / 100) * circumference
          const dash = `${len} ${circumference - len}`
          const el = (
            <circle
              key={a.name}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={a.color}
              strokeWidth={stroke}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              opacity={0.9}
            />
          )
          offset += len
          return el
        })}
      </svg>
      <div className="chart-center">
        <div className="supply">1B</div>
        <div className="label">Total Supply</div>
      </div>
    </div>
  )
}

/* ─── Main App ─── */
export default function App() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeAi, setActiveAi] = useState(0)
  const [activeCat, setActiveCat] = useState('All')
  const [walletAddr, setWalletAddr] = useState('')
  const [chainId, setChainId] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [toast, setToast] = useState('')
  const [gameOpen, setGameOpen] = useState(false)
  const [crosswordOpen, setCrosswordOpen] = useState(false)

  const walletConnected = Boolean(walletAddr)
  const displayAddr = walletAddr ? shortenAddress(walletAddr) : ''

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3200)
  }, [])

  const applyAccount = useCallback((accounts: string[]) => {
    if (accounts[0]) {
      setWalletAddr(accounts[0])
    } else {
      setWalletAddr('')
      setChainId(null)
    }
  }, [])

  // Restore session if already authorized; listen for account / chain changes
  useEffect(() => {
    let cancelled = false

    ;(async () => {
      if (!hasWallet()) return
      const accounts = await getAccounts()
      if (cancelled) return
      if (accounts[0]) {
        setWalletAddr(accounts[0])
        setChainId(await getChainId())
      }
    })()

    const unsub = subscribeWallet(
      (accounts) => {
        applyAccount(accounts)
        if (accounts.length === 0) {
          showToast('Wallet disconnected')
        }
      },
      (id) => setChainId(id)
    )

    return () => {
      cancelled = true
      unsub()
    }
  }, [applyAccount, showToast])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setActiveAi((i) => (i + 1) % AI_TOOLS.length), 3500)
    return () => clearInterval(id)
  }, [])

  const connectWallet = async () => {
    if (walletConnected) {
      // EIP-1193 has no standard disconnect; clear local session
      setWalletAddr('')
      setChainId(null)
      showToast('Disconnected from this site. Revoke access in your wallet if needed.')
      setMenuOpen(false)
      return
    }

    if (!hasWallet()) {
      showToast('No wallet detected — opening MetaMask download…')
      window.open(METAMASK_DOWNLOAD, '_blank', 'noopener,noreferrer')
      return
    }

    setConnecting(true)
    try {
      const accounts = await requestAccounts()
      if (accounts[0]) {
        setWalletAddr(accounts[0])
        setChainId(await getChainId())
        showToast(`Connected ${shortenAddress(accounts[0])}`)
      }
      setMenuOpen(false)
    } catch (err) {
      const { message } = parseWalletError(err)
      showToast(message)
    } finally {
      setConnecting(false)
    }
  }

  const walletButtonLabel = connecting
    ? 'Connecting…'
    : walletConnected
      ? displayAddr
      : 'Connect Wallet'

  const filteredLibrary =
    activeCat === 'All' ? LIBRARY_ITEMS : LIBRARY_ITEMS.filter((i) => i.tag === activeCat)

  return (
    <>
      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-inner">
          <a href="#" className="logo">
            <div className="logo-mark">T</div>
            <span>
              TXT<em>.</em>
            </span>
          </a>

          <div className="nav-links">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </div>

          <div className="nav-actions">
            <a href="#community" className="btn btn-outline">
              Community
            </a>
            <button
              className="btn btn-primary"
              onClick={connectWallet}
              disabled={connecting}
              title={walletConnected ? walletAddr : 'Connect browser wallet'}
            >
              <Wallet size={16} />
              {walletButtonLabel}
            </button>
            <button
              className="menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <div className={`nav-mobile ${menuOpen ? 'open' : ''}`}>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href="#community" onClick={() => setMenuOpen(false)}>
            Community
          </a>
          <button
            className="btn btn-primary"
            onClick={connectWallet}
            disabled={connecting}
          >
            <Wallet size={16} />
            {walletButtonLabel}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="grid-bg" />
        <div className="glow-orb hero-orb-1" />
        <div className="glow-orb hero-orb-2" />

        <div className="container">
          <div className="hero-content">
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="hero-badge-dot" />
              KnowledgeFi · Creator Economy · Robinhood Chain
            </motion.div>

            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="word">WRITE.</span>
              <span className="word accent">OWN.</span>
              <span className="word">EARN.</span>
            </motion.h1>

            <motion.p
              className="hero-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              The decentralized protocol where knowledge becomes an asset.
              Publish to Web3, own your content forever, and get rewarded by the community.
            </motion.p>

            <motion.div
              className="hero-cta"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <a href="#features" className="btn btn-primary">
                Explore Protocol <ArrowRight size={18} />
              </a>
              <button className="btn btn-ghost" onClick={() => setCrosswordOpen(true)}>
                <Grid3X3 size={18} />
                TTS English
              </button>
              <button className="btn btn-ghost" onClick={() => setGameOpen(true)}>
                <Gamepad2 size={18} />
                Typing Demo
              </button>
              <button
                className="btn btn-ghost"
                onClick={connectWallet}
                disabled={connecting}
              >
                <Wallet size={18} />
                {walletConnected ? displayAddr : connecting ? 'Connecting…' : 'Connect Wallet'}
              </button>
            </motion.div>

            <motion.div
              className="hero-stats"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {[
                { value: '1B', label: 'Total Supply' },
                { value: '5', label: 'Core Modules' },
                { value: '8', label: 'Knowledge Domains' },
                { value: 'DAO', label: 'Community Owned' },
              ].map((s) => (
                <div key={s.label} className="stat-card glass">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </motion.div>

            <motion.div
              className="hero-terminal glass"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
            >
              <div className="terminal-bar">
                <span className="terminal-dot red" />
                <span className="terminal-dot yellow" />
                <span className="terminal-dot green" />
                <span className="terminal-title">txt-protocol — knowledge node</span>
              </div>
              <div className="terminal-body">
                <div>
                  <span className="prompt">$</span> <span className="cmd">txt publish --asset article.md</span>
                </div>
                <div className="output">→ Minting knowledge asset on Robinhood Chain…</div>
                <div className="output">
                  → Ownership: <span className="highlight">0xCreator…a91f</span>
                </div>
                <div className="output">
                  → Status: <span className="highlight">ON-CHAIN · PERMANENT</span>
                </div>
                <div>
                  <span className="prompt">$</span> <span className="cmd">txt earn --tip</span>
                  <span className="cursor-blink" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* GAMES */}
      <section className="section" id="game">
        <div className="container">
          <FadeIn>
            <div className="section-header">
              <div className="section-label">Interactive Demos</div>
              <h2 className="section-title">
                Play & <span className="gradient-text">learn</span>
              </h2>
              <p className="section-desc">
                Mini-games for the $TXT universe — English crossword (TTS) and a knowledge typing
                blitz.
              </p>
            </div>
          </FadeIn>
          <div
            id="crossword"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
              marginTop: 40,
              maxWidth: 900,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <FadeIn>
              <CrosswordLaunchCard onPlay={() => setCrosswordOpen(true)} />
            </FadeIn>
            <FadeIn delay={0.1}>
              <GameLaunchCard onPlay={() => setGameOpen(true)} />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="container">
          <FadeIn>
            <div className="section-header">
              <div className="section-label">Core Ecosystem</div>
              <h2 className="section-title">
                Everything you need to <span className="gradient-text">own knowledge</span>
              </h2>
              <p className="section-desc">
                Five interconnected modules powering the decentralized knowledge network — from publish to profit.
              </p>
            </div>
          </FadeIn>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.05}>
                <div className="feature-card glass">
                  <div className="feature-icon">
                    <f.icon size={22} />
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* AI TOOLS */}
      <section className="section ai-section" id="ai">
        <div className="container">
          <FadeIn>
            <div className="section-header">
              <div className="section-label">TXT AI</div>
              <h2 className="section-title">
                AI-powered <span className="gradient-text">writing tools</span>
              </h2>
              <p className="section-desc">
                Create, edit, translate, and organize knowledge with an AI suite built for creators and researchers.
              </p>
            </div>
          </FadeIn>

          <div className="ai-layout">
            <FadeIn>
              <div className="ai-tools-list">
                {AI_TOOLS.map((tool, i) => (
                  <div
                    key={tool.title}
                    className={`ai-tool-item glass ${activeAi === i ? 'active' : ''}`}
                    onMouseEnter={() => setActiveAi(i)}
                  >
                    <div className="ai-tool-icon">
                      <tool.icon size={18} />
                    </div>
                    <div>
                      <h4>{tool.title}</h4>
                      <p>{tool.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="ai-preview glass">
                <div className="ai-preview-header">
                  <span>{AI_TOOLS[activeAi].title}</span>
                  <Sparkles size={16} color="#C6F700" />
                </div>
                <div className="ai-preview-body">
                  <div className="line gen">
                    <strong style={{ color: '#C6F700' }}>TXT AI ›</strong> Generating with context…
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <div className="skeleton" />
                    <div className="skeleton" />
                    <div className="skeleton" />
                    <div className="skeleton" />
                  </div>
                  <div className="line" style={{ marginTop: 20, color: '#a0a0a0' }}>
                    Unlock full AI suite with <span style={{ color: '#C6F700' }}>$TXT</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* LIBRARY */}
      <section className="section" id="library">
        <div className="container">
          <FadeIn>
            <div className="section-header">
              <div className="section-label">TXT Library</div>
              <h2 className="section-title">
                Decentralized <span className="gradient-text">knowledge archive</span>
              </h2>
              <p className="section-desc">
                Search and discover verified information across eight domains — every piece an on-chain asset.
              </p>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="library-categories">
              <button
                className={`category-chip ${activeCat === 'All' ? 'active' : ''}`}
                onClick={() => setActiveCat('All')}
              >
                All
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.label}
                  className={`category-chip ${activeCat === c.label ? 'active' : ''}`}
                  onClick={() => setActiveCat(c.label)}
                >
                  <c.icon size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                  {c.label}
                </button>
              ))}
            </div>
          </FadeIn>

          <div className="library-grid">
            {filteredLibrary.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.05}>
                <article className="library-card glass">
                  <div className="library-card-thumb">
                    <Lightbulb size={32} strokeWidth={1.5} />
                    {item.featured && <span className="badge">Featured</span>}
                  </div>
                  <div className="library-card-body">
                    <div className="tag">{item.tag}</div>
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                    <div className="library-card-meta">
                      <span>{item.author}</span>
                      <span>{item.reads} reads</span>
                    </div>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* MARKETPLACE */}
      <section className="section" id="marketplace">
        <div className="container">
          <FadeIn>
            <div className="section-header">
              <div className="section-label">TXT Marketplace</div>
              <h2 className="section-title">
                Monetize what you <span className="gradient-text">create</span>
              </h2>
              <p className="section-desc">
                Premium content rails for creators — payments settled in $TXT, ownership on-chain.
              </p>
            </div>
          </FadeIn>

          <div className="marketplace-grid">
            {MARKET_ITEMS.map((m, i) => (
              <FadeIn key={m.title} delay={i * 0.05}>
                <div className="market-card glass">
                  <div className="market-icon">
                    <m.icon size={22} />
                  </div>
                  <h3>{m.title}</h3>
                  <p>{m.desc}</p>
                  <div className="market-price">
                    <span className="price">{m.price}</span>
                    <span className="label">from</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CREATOR ECONOMY */}
      <section className="section" id="creators">
        <div className="container">
          <FadeIn>
            <div className="section-header">
              <div className="section-label">Creator Economy</div>
              <h2 className="section-title">
                From draft to <span className="gradient-text">digital asset</span>
              </h2>
              <p className="section-desc">
                TXT transforms writing into ownership. Publish once, earn forever.
              </p>
            </div>
          </FadeIn>

          <div className="creator-layout">
            <FadeIn>
              <div className="creator-steps">
                {CREATOR_STEPS.map((s) => (
                  <div key={s.num} className="creator-step">
                    <div className="step-num">{s.num}</div>
                    <div>
                      <h4>{s.title}</h4>
                      <p>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="creator-visual glass">
                <div className="creator-visual-header">
                  <div className="creator-avatar">TX</div>
                  <div className="creator-info">
                    <h4>Creator Dashboard</h4>
                    <span>@knowledge_builder</span>
                  </div>
                </div>
                <div className="earnings-grid">
                  <div className="earning-box">
                    <div className="val">24.8K</div>
                    <div className="lbl">$TXT Earned</div>
                  </div>
                  <div className="earning-box">
                    <div className="val">142</div>
                    <div className="lbl">Publications</div>
                  </div>
                  <div className="earning-box">
                    <div className="val">8.2K</div>
                    <div className="lbl">Readers</div>
                  </div>
                  <div className="earning-box">
                    <div className="val">96%</div>
                    <div className="lbl">Ownership</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* TOKEN UTILITY */}
      <section className="section" id="utility">
        <div className="container">
          <FadeIn>
            <div className="section-header">
              <div className="section-label">$TXT Utility</div>
              <h2 className="section-title">
                One token. <span className="gradient-text">Every interaction.</span>
              </h2>
              <p className="section-desc">
                $TXT powers publishing, AI tools, marketplace, staking, tips, and governance.
              </p>
            </div>
          </FadeIn>

          <div className="utility-grid">
            {UTILITIES.map((u, i) => (
              <FadeIn key={u.title} delay={i * 0.04}>
                <div className="utility-card glass">
                  <div className="utility-icon">
                    <u.icon size={20} />
                  </div>
                  <h4>{u.title}</h4>
                  <p>{u.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="section" id="roadmap">
        <div className="container">
          <FadeIn>
            <div className="section-header">
              <div className="section-label">Roadmap</div>
              <h2 className="section-title">
                Building the future of <span className="gradient-text">KnowledgeFi</span>
              </h2>
              <p className="section-desc">
                A clear path from genesis to global knowledge network.
              </p>
            </div>
          </FadeIn>

          <div className="roadmap">
            <div className="roadmap-line" />
            {ROADMAP.map((r, i) => (
              <FadeIn key={r.phase} delay={i * 0.08}>
                <div className="roadmap-item">
                  <div className="roadmap-dot" />
                  <div className="roadmap-content glass">
                    <div className="roadmap-phase">{r.phase}</div>
                    <h4>{r.title}</h4>
                    <ul>
                      {r.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* TOKENOMICS */}
      <section className="section" id="tokenomics">
        <div className="container">
          <FadeIn>
            <div className="section-header">
              <div className="section-label">Tokenomics</div>
              <h2 className="section-title">
                Designed for <span className="gradient-text">creators & community</span>
              </h2>
              <p className="section-desc">
                Fixed supply of 1,000,000,000 $TXT on Robinhood Chain — majority allocated to community and ecosystem.
              </p>
            </div>
          </FadeIn>

          <div className="tokenomics-layout">
            <FadeIn>
              <DonutChart allocations={ALLOCATIONS} />
              <div className="token-info">
                <div className="token-info-item glass">
                  <div className="val">$TXT</div>
                  <div className="lbl">Ticker</div>
                </div>
                <div className="token-info-item glass">
                  <div className="val">Robinhood</div>
                  <div className="lbl">Blockchain</div>
                </div>
                <div className="token-info-item glass">
                  <div className="val">1,000,000,000</div>
                  <div className="lbl">Total Supply</div>
                </div>
                <div className="token-info-item glass">
                  <div className="val">KnowledgeFi</div>
                  <div className="lbl">Category</div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="allocation-list">
                {ALLOCATIONS.map((a) => (
                  <div key={a.name} className="allocation-item glass">
                    <div className="alloc-dot" style={{ background: a.color }} />
                    <div className="alloc-bar-wrap">
                      <div className="alloc-header">
                        <span className="alloc-name">{a.name}</span>
                        <span className="alloc-pct">{a.pct}%</span>
                      </div>
                      <div className="alloc-bar">
                        <div className="alloc-fill" style={{ width: `${a.pct}%`, background: a.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* COMMUNITY / DAO */}
      <section className="section" id="community">
        <div className="container">
          <FadeIn>
            <div className="section-header">
              <div className="section-label">TXT DAO</div>
              <h2 className="section-title">
                Governed by the <span className="gradient-text">community</span>
              </h2>
              <p className="section-desc">
                Knowledge should belong to everyone. The DAO steers content, grants, incentives, and the treasury.
              </p>
            </div>
          </FadeIn>

          <div className="community-grid">
            <FadeIn>
              <div className="dao-card glass">
                <h3>
                  <span className="icon">
                    <Vote size={18} />
                  </span>
                  What you govern
                </h3>
                <p>Stake $TXT to shape the protocol with real on-chain votes.</p>
                <ul>
                  {['Featured content curation', 'Ecosystem grants', 'Creator incentives', 'Platform upgrades', 'Treasury allocation'].map(
                    (item) => (
                      <li key={item}>
                        <Check size={16} />
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="dao-card glass">
                <h3>
                  <span className="icon">
                    <Network size={18} />
                  </span>
                  Join the network
                </h3>
                <p>Connect with writers, researchers, builders, and AI enthusiasts worldwide.</p>
                <ul>
                  {[
                    'Discord community hub',
                    'X / Twitter updates',
                    'GitHub open development',
                    'Weekly knowledge spaces',
                    'Creator office hours',
                  ].map((item) => (
                    <li key={item}>
                      <Check size={16} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CONNECT WALLET CTA */}
      <section className="section cta-section" id="connect">
        <div className="container">
          <FadeIn>
            <div className="cta-box glass">
              <div className="section-label" style={{ justifyContent: 'center' }}>
                Get Started
              </div>
              <h2>
                Write the Future.
                <br />
                Own Your Knowledge.
                <br />
                <span className="gradient-text">Earn with $TXT.</span>
              </h2>
              <p>
                Connect your wallet on Robinhood Chain and join the decentralized knowledge protocol.
              </p>
              <div className="cta-actions">
                <button
                  className="btn btn-primary"
                  onClick={connectWallet}
                  disabled={connecting}
                >
                  <Wallet size={18} />
                  {connecting
                    ? 'Connecting…'
                    : walletConnected
                      ? 'Disconnect'
                      : 'Connect Wallet'}
                </button>
                <a href="#features" className="btn btn-outline">
                  Learn More <ArrowRight size={16} />
                </a>
              </div>
              <div className={`wallet-status ${walletConnected ? 'connected' : ''}`}>
                {walletConnected ? (
                  <>
                    <Zap size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
                    Connected: {displayAddr}
                    {chainId ? ` · chain ${chainId}` : ''}
                  </>
                ) : (
                  'MetaMask / EIP-1193 · Robinhood Chain ready'
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="#" className="logo">
                <div className="logo-mark">T</div>
                <span>
                  TXT<em>.</em>
                </span>
              </a>
              <p>
                The Web3 Knowledge & Creator Protocol. Every article, tutorial, and publication becomes an on-chain asset.
              </p>
            </div>
            <div className="footer-col">
              <h5>Protocol</h5>
              <a href="#features">Features</a>
              <a href="#ai">AI Tools</a>
              <a href="#library">Library</a>
              <a href="#marketplace">Marketplace</a>
            </div>
            <div className="footer-col">
              <h5>Token</h5>
              <a href="#tokenomics">Tokenomics</a>
              <a href="#utility">Utility</a>
              <a href="#roadmap">Roadmap</a>
              <a href="#community">DAO</a>
            </div>
            <div className="footer-col">
              <h5>Resources</h5>
              <a href="#crossword">TTS English</a>
              <a href="#game">Games</a>
              <a href="#creators">Creators</a>
              <a href="#connect">Connect Wallet</a>
              <a href="#">Whitepaper</a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} TXT Protocol. Write. Own. Earn. · $TXT on Robinhood Chain</p>
            <div className="social-links">
              <a href="#" aria-label="X / Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                </svg>
              </a>
              <a href="#" aria-label="Discord">
                <MessageCircle size={16} />
              </a>
              <a href="#" aria-label="GitHub">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
              <a href="#" aria-label="Website">
                <Globe size={16} />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Toast */}
      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>

      {/* Game overlays */}
      <GameDemo open={gameOpen} onClose={() => setGameOpen(false)} />
      <CrosswordGame open={crosswordOpen} onClose={() => setCrosswordOpen(false)} />
    </>
  )
}
