import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { X, Gamepad2, Trophy, Zap, Target, Flame, RotateCcw, Play } from 'lucide-react'
import { pickWord, difficultyFromScore } from './words'
import './GameDemo.css'

const ROUND_SECONDS = 60
const HS_KEY = 'txt-knowledge-rush-hs'

type Phase = 'menu' | 'countdown' | 'playing' | 'result'

type FloatScore = { id: number; value: number }

function loadHighScore(): number {
  try {
    return Number(localStorage.getItem(HS_KEY) || 0)
  } catch {
    return 0
  }
}

function saveHighScore(score: number) {
  try {
    localStorage.setItem(HS_KEY, String(score))
  } catch {
    /* ignore */
  }
}

function rankFromScore(score: number): string {
  if (score >= 2000) return 'KNOWLEDGE LEGEND'
  if (score >= 1200) return 'PROTOCOL PRO'
  if (score >= 700) return 'CREATOR'
  if (score >= 300) return 'SCRIBE'
  return 'NOVICE WRITER'
}

function ParticleBurst({ trigger }: { trigger: number }) {
  const particles = useMemo(() => {
    if (!trigger) return []
    return Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2
      const dist = 40 + Math.random() * 50
      return {
        id: `${trigger}-${i}`,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - 20,
        left: 45 + Math.random() * 10,
        top: 40 + Math.random() * 10,
      }
    })
  }, [trigger])

  if (!trigger) return null

  return (
    <div className="particles" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={
            {
              left: `${p.left}%`,
              top: `${p.top}%`,
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

type Props = {
  open: boolean
  onClose: () => void
}

export default function GameDemo({ open, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('menu')
  const [countdown, setCountdown] = useState(3)
  const [word, setWord] = useState('')
  const [typed, setTyped] = useState('')
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [wordsOk, setWordsOk] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [highScore, setHighScore] = useState(loadHighScore)
  const [isNewRecord, setIsNewRecord] = useState(false)
  const [comboMsg, setComboMsg] = useState('')
  const [floatScores, setFloatScores] = useState<FloatScore[]>([])
  const [burst, setBurst] = useState(0)
  const [wrongFlash, setWrongFlash] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const usedWords = useRef(new Set<string>())
  const floatId = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phaseRef = useRef(phase)

  phaseRef.current = phase

  const difficulty = difficultyFromScore(score)

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const nextWord = useCallback((currentScore: number) => {
    const w = pickWord(currentScore, usedWords.current)
    usedWords.current.add(w)
    if (usedWords.current.size > 40) usedWords.current.clear()
    setWord(w)
    setTyped('')
  }, [])

  const endGame = useCallback(
    (finalScore: number) => {
      clearTimer()
      setPhase('result')
      const hs = loadHighScore()
      if (finalScore > hs) {
        saveHighScore(finalScore)
        setHighScore(finalScore)
        setIsNewRecord(true)
      } else {
        setIsNewRecord(false)
        setHighScore(hs)
      }
    },
    []
  )

  const startCountdown = () => {
    clearTimer()
    usedWords.current.clear()
    setScore(0)
    setCombo(0)
    setMaxCombo(0)
    setWordsOk(0)
    setMistakes(0)
    setTimeLeft(ROUND_SECONDS)
    setTyped('')
    setComboMsg('')
    setFloatScores([])
    setIsNewRecord(false)
    setPhase('countdown')
    setCountdown(3)
  }

  // Countdown 3-2-1-GO
  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown < 0) {
      setPhase('playing')
      nextWord(0)
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), countdown === 0 ? 500 : 700)
    return () => clearTimeout(t)
  }, [phase, countdown, nextWord])

  // Round timer
  useEffect(() => {
    if (phase !== 'playing') return
    clearTimer()
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          clearTimer()
          return 0
        }
        return Math.max(0, t - 0.1)
      })
    }, 100)
    return clearTimer
  }, [phase])

  // End when time hits 0
  useEffect(() => {
    if (phase === 'playing' && timeLeft <= 0) {
      endGame(score)
    }
  }, [timeLeft, phase, score, endGame])

  // Focus input while playing
  useEffect(() => {
    if (phase === 'playing') {
      inputRef.current?.focus()
    }
  }, [phase, word])

  // Escape to close / pause back to menu
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (phaseRef.current === 'playing' || phaseRef.current === 'countdown') {
          clearTimer()
          setPhase('menu')
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Reset when closed
  useEffect(() => {
    if (!open) {
      clearTimer()
      setPhase('menu')
    } else {
      setHighScore(loadHighScore())
    }
  }, [open])

  // Lock body scroll
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const onCorrectWord = (currentTyped: string) => {
    const base = currentTyped.length * 10
    const comboBonus = Math.min(combo, 10) * 5
    const mult = difficulty.mult
    const gained = Math.round((base + comboBonus) * mult)

    const newCombo = combo + 1
    const newScore = score + gained
    const newWords = wordsOk + 1

    setScore(newScore)
    setCombo(newCombo)
    setMaxCombo((m) => Math.max(m, newCombo))
    setWordsOk(newWords)
    setTimeLeft((t) => Math.min(ROUND_SECONDS, t + difficulty.timeBonus))
    setBurst((b) => b + 1)

    floatId.current += 1
    const id = floatId.current
    setFloatScores((fs) => [...fs, { id, value: gained }])
    setTimeout(() => {
      setFloatScores((fs) => fs.filter((f) => f.id !== id))
    }, 800)

    if (newCombo >= 3) {
      setComboMsg(`${newCombo}x COMBO!`)
    } else {
      setComboMsg('')
    }
    if (newCombo === 5) setComboMsg('ON FIRE 🔥')
    if (newCombo === 10) setComboMsg('UNSTOPPABLE')
    if (newCombo === 15) setComboMsg('KNOWLEDGE GOD')

    nextWord(newScore)
  }

  const handleInput = (value: string) => {
    if (phase !== 'playing') return
    const lower = value.toLowerCase()

    // Only allow progressive correct typing or show wrong
    if (lower.length > 0 && !word.startsWith(lower)) {
      setWrongFlash(true)
      setMistakes((m) => m + 1)
      setCombo(0)
      setComboMsg('')
      setTimeout(() => setWrongFlash(false), 200)
      // Keep previous correct prefix
      setTyped(word.slice(0, typed.length))
      return
    }

    setTyped(lower)

    if (lower === word && word.length > 0) {
      onCorrectWord(lower)
    }
  }

  const timerPct = (timeLeft / ROUND_SECONDS) * 100
  const timerLow = timeLeft < 10

  const chars = word.split('').map((ch, i) => {
    let cls = 'pending'
    if (i < typed.length) {
      cls = typed[i] === ch ? 'done' : 'wrong'
    } else if (i === typed.length) {
      cls = wrongFlash ? 'wrong' : 'current'
    }
    return (
      <span key={`${word}-${i}`} className={`char ${cls}`}>
        {ch}
      </span>
    )
  })

  if (!open) return null

  return (
    <div className="game-overlay" role="dialog" aria-modal="true" aria-label="TXT Knowledge Rush">
      <div className="game-orb" />

      <header className="game-header">
        <div className="game-brand">
          <div className="game-brand-mark">T</div>
          Knowledge Rush
          <span>Demo Game</span>
        </div>
        <button className="game-close" onClick={onClose} aria-label="Close game">
          <X size={20} />
        </button>
      </header>

      <div className="game-body">
        {/* MENU */}
        {phase === 'menu' && (
          <div className="game-screen">
            <div className="highscore-pill">
              <Trophy size={16} />
              High Score: {highScore.toLocaleString()} $TXT
            </div>
            <h2>
              Type. Own. <span className="gradient-text">Earn.</span>
            </h2>
            <p className="lead">
              Type Web3 & knowledge words as fast as you can. Build combos, race the clock, and
              mint demo $TXT points.
            </p>
            <ul className="game-rules">
              <h4>How to play</h4>
              <li>Type the glowing word completely — no typos</li>
              <li>Each word earns $TXT points + time bonus</li>
              <li>Combos multiply your score</li>
              <li>You have {ROUND_SECONDS}s — go for a high score</li>
            </ul>
            <div className="game-actions">
              <button className="btn btn-primary" onClick={startCountdown}>
                <Play size={18} />
                Start Game
              </button>
              <button className="btn btn-outline" onClick={onClose}>
                Back to Site
              </button>
            </div>
          </div>
        )}

        {/* COUNTDOWN */}
        {phase === 'countdown' && (
          <div className="game-screen">
            <div className="countdown" key={countdown}>
              {countdown <= 0 ? 'GO' : countdown}
            </div>
            <div className="countdown-label">Get ready to write</div>
          </div>
        )}

        {/* PLAYING */}
        {phase === 'playing' && (
          <>
            <div className="game-hud">
              <div className="hud-card">
                <div className="hud-val">{score.toLocaleString()}</div>
                <div className="hud-lbl">$TXT Score</div>
              </div>
              <div className="hud-card">
                <div className={`hud-val ${timerLow ? 'danger' : ''}`}>{Math.ceil(timeLeft)}s</div>
                <div className="hud-lbl">Time Left</div>
              </div>
              <div className="hud-card">
                <div className="hud-val">{combo}x</div>
                <div className="hud-lbl">Combo</div>
              </div>
              <div className="hud-card">
                <div className="hud-val">{difficulty.label}</div>
                <div className="hud-lbl">Rank</div>
              </div>
            </div>

            <div className="timer-track">
              <div
                className={`timer-fill ${timerLow ? 'low' : ''}`}
                style={{ width: `${timerPct}%` }}
              />
            </div>

            <div className="play-area" style={{ position: 'relative' }}>
              <ParticleBurst trigger={burst} />
              <div className="combo-banner">{comboMsg || '\u00A0'}</div>
              <div className="word-prompt">Type this knowledge asset</div>
              <div className="word-display" aria-live="polite">
                {chars}
              </div>
              <div className="game-input-wrap">
                {floatScores.map((f) => (
                  <span key={f.id} className="float-score">
                    +{f.value}
                  </span>
                ))}
                <input
                  ref={inputRef}
                  className="game-input"
                  value={typed}
                  onChange={(e) => handleInput(e.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  placeholder="start typing…"
                  aria-label="Type the word"
                />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                <Zap size={12} style={{ verticalAlign: -1, marginRight: 4 }} />
                {wordsOk} words · {mistakes} misses · Esc to menu
              </p>
            </div>
          </>
        )}

        {/* RESULT */}
        {phase === 'result' && (
          <div className="game-screen">
            {isNewRecord && <div className="rank-badge">NEW HIGH SCORE</div>}
            {!isNewRecord && <div className="rank-badge">{rankFromScore(score)}</div>}
            <h2>
              Run <span className="gradient-text">complete</span>
            </h2>
            <p className="lead">
              You minted demo knowledge points. Keep writing, own your score, earn bragging rights.
            </p>
            <div className="result-stats">
              <div className="result-stat wide">
                <div className="val">{score.toLocaleString()} $TXT</div>
                <div className="lbl">Final Score</div>
              </div>
              <div className="result-stat">
                <div className="val">{wordsOk}</div>
                <div className="lbl">
                  <Target size={12} style={{ verticalAlign: -1 }} /> Words
                </div>
              </div>
              <div className="result-stat">
                <div className="val">{maxCombo}x</div>
                <div className="lbl">
                  <Flame size={12} style={{ verticalAlign: -1 }} /> Max Combo
                </div>
              </div>
              <div className="result-stat">
                <div className="val">{mistakes}</div>
                <div className="lbl">Mistakes</div>
              </div>
              <div className="result-stat">
                <div className="val">{highScore.toLocaleString()}</div>
                <div className="lbl">
                  <Trophy size={12} style={{ verticalAlign: -1 }} /> Best
                </div>
              </div>
            </div>
            <div className="game-actions">
              <button className="btn btn-primary" onClick={startCountdown}>
                <RotateCcw size={18} />
                Play Again
              </button>
              <button className="btn btn-outline" onClick={onClose}>
                Back to Site
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/** Compact CTA card for landing page */
export function GameLaunchCard({ onPlay }: { onPlay: () => void }) {
  const hs = loadHighScore()
  return (
    <div className="glass" style={{ padding: '32px', textAlign: 'center' }}>
      <div
        style={{
          width: 56,
          height: 56,
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--primary-dim)',
          border: '1px solid var(--border-primary)',
          borderRadius: 14,
          color: 'var(--primary)',
        }}
      >
        <Gamepad2 size={26} />
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.35rem',
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        Knowledge Rush
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
        Demo mini-game — type Web3 words, build combos, earn $TXT points.
        {hs > 0 && (
          <>
            {' '}
            Best: <strong style={{ color: 'var(--primary)' }}>{hs.toLocaleString()}</strong>
          </>
        )}
      </p>
      <button className="btn btn-primary play-demo-btn" onClick={onPlay}>
        <Play size={18} />
        Play Demo
      </button>
    </div>
  )
}
