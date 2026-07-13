import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  X,
  Check,
  Lightbulb,
  RotateCcw,
  Trophy,
  Grid3X3,
  ArrowLeft,
  Eye,
} from 'lucide-react'
import {
  ALL_PUZZLES,
  type Puzzle,
  type ClueDef,
  type Direction,
  isBlock,
  getAnswer,
  clueCells,
  buildNumberMap,
} from './crosswordData'
import './CrosswordGame.css'

type Phase = 'menu' | 'play'

type Props = {
  open: boolean
  onClose: () => void
}

function emptyFill(puzzle: Puzzle): string[][] {
  return Array.from({ length: puzzle.rows }, (_, r) =>
    Array.from({ length: puzzle.cols }, (_, c) => (isBlock(puzzle, r, c) ? '#' : ''))
  )
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function cellKey(r: number, c: number) {
  return `${r},${c}`
}

export default function CrosswordGame({ open, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('menu')
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [fill, setFill] = useState<string[][]>([])
  const [active, setActive] = useState<{ row: number; col: number } | null>(null)
  const [direction, setDirection] = useState<Direction>('across')
  const [activeClue, setActiveClue] = useState<ClueDef | null>(null)
  const [checked, setChecked] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [won, setWon] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [toast, setToast] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const numberMap = useMemo(
    () => (puzzle ? buildNumberMap(puzzle) : new Map<string, number>()),
    [puzzle]
  )

  const acrossClues = useMemo(
    () => puzzle?.clues.filter((c) => c.direction === 'across') ?? [],
    [puzzle]
  )
  const downClues = useMemo(
    () => puzzle?.clues.filter((c) => c.direction === 'down') ?? [],
    [puzzle]
  )

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }, [])

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const startPuzzle = (p: Puzzle) => {
    clearTimer()
    setPuzzle(p)
    setFill(emptyFill(p))
    setChecked(false)
    setWon(false)
    setHintsUsed(0)
    setSeconds(0)
    setPhase('play')
    setDirection('across')

    // Select first across clue
    const first = p.clues.find((c) => c.direction === 'across') ?? p.clues[0]
    setActiveClue(first)
    setActive({ row: first.row, col: first.col })

    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
  }

  const backToMenu = () => {
    clearTimer()
    setPhase('menu')
    setPuzzle(null)
    setWon(false)
  }

  // Progress
  const { filled, total, correctCount, isComplete } = useMemo(() => {
    if (!puzzle) return { filled: 0, total: 0, correctCount: 0, isComplete: false }
    let filled = 0
    let total = 0
    let correctCount = 0
    for (let r = 0; r < puzzle.rows; r++) {
      for (let c = 0; c < puzzle.cols; c++) {
        if (isBlock(puzzle, r, c)) continue
        total++
        const v = fill[r]?.[c] ?? ''
        if (v) {
          filled++
          if (v === getAnswer(puzzle, r, c)) correctCount++
        }
      }
    }
    const isComplete = total > 0 && correctCount === total
    return { filled, total, correctCount, isComplete }
  }, [puzzle, fill])

  // Win detection
  useEffect(() => {
    if (phase === 'play' && isComplete && !won) {
      clearTimer()
      setWon(true)
      setChecked(true)
    }
  }, [isComplete, phase, won])

  // Highlight cells for active word
  const highlightSet = useMemo(() => {
    const set = new Set<string>()
    if (!activeClue) return set
    for (const cell of clueCells(activeClue)) {
      set.add(cellKey(cell.row, cell.col))
    }
    return set
  }, [activeClue])

  const findClueAt = useCallback(
    (row: number, col: number, dir: Direction): ClueDef | null => {
      if (!puzzle) return null
      const list = puzzle.clues.filter((c) => c.direction === dir)
      for (const clue of list) {
        const cells = clueCells(clue)
        if (cells.some((cell) => cell.row === row && cell.col === col)) return clue
      }
      return null
    },
    [puzzle]
  )

  const selectCell = useCallback(
    (row: number, col: number, toggleDir = false) => {
      if (!puzzle || isBlock(puzzle, row, col)) return

      let dir = direction
      if (toggleDir && active?.row === row && active?.col === col) {
        dir = direction === 'across' ? 'down' : 'across'
        setDirection(dir)
      }

      let clue = findClueAt(row, col, dir)
      if (!clue) {
        dir = dir === 'across' ? 'down' : 'across'
        setDirection(dir)
        clue = findClueAt(row, col, dir)
      }

      setActive({ row, col })
      if (clue) setActiveClue(clue)
      inputRef.current?.focus()
    },
    [puzzle, direction, active, findClueAt]
  )

  const selectClue = (clue: ClueDef) => {
    setActiveClue(clue)
    setDirection(clue.direction)
    setActive({ row: clue.row, col: clue.col })
    inputRef.current?.focus()
  }

  const moveTo = (row: number, col: number) => {
    if (!puzzle) return
    if (row < 0 || col < 0 || row >= puzzle.rows || col >= puzzle.cols) return
    if (isBlock(puzzle, row, col)) return
    selectCell(row, col, false)
  }

  const nextInWord = (row: number, col: number, dir: Direction, step: 1 | -1) => {
    if (!puzzle) return
    let r = row
    let c = col
    for (let i = 0; i < 20; i++) {
      if (dir === 'across') c += step
      else r += step
      if (r < 0 || c < 0 || r >= puzzle.rows || c >= puzzle.cols) return
      if (isBlock(puzzle, r, c)) return
      setActive({ row: r, col: c })
      return
    }
  }

  const setLetter = (letter: string) => {
    if (!puzzle || !active || won) return
    const { row, col } = active
    if (isBlock(puzzle, row, col)) return

    setFill((prev) => {
      const next = prev.map((line) => [...line])
      next[row][col] = letter.toUpperCase()
      return next
    })
    setChecked(false)

    if (letter) {
      nextInWord(row, col, direction, 1)
    }
  }

  const clearLetter = () => {
    if (!puzzle || !active || won) return
    const { row, col } = active
    const current = fill[row]?.[col]

    if (current) {
      setFill((prev) => {
        const next = prev.map((line) => [...line])
        next[row][col] = ''
        return next
      })
      setChecked(false)
    } else {
      nextInWord(row, col, direction, -1)
      setFill((prev) => {
        const next = prev.map((line) => [...line])
        const r = direction === 'down' ? row - 1 : row
        const c = direction === 'across' ? col - 1 : col
        if (r >= 0 && c >= 0 && !isBlock(puzzle, r, c)) {
          next[r][c] = ''
        }
        return next
      })
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!puzzle || !active) return

    if (e.key === 'ArrowRight') {
      e.preventDefault()
      if (direction === 'down') {
        setDirection('across')
        const clue = findClueAt(active.row, active.col, 'across')
        if (clue) setActiveClue(clue)
      }
      moveTo(active.row, active.col + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      if (direction === 'down') {
        setDirection('across')
        const clue = findClueAt(active.row, active.col, 'across')
        if (clue) setActiveClue(clue)
      }
      moveTo(active.row, active.col - 1)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (direction === 'across') {
        setDirection('down')
        const clue = findClueAt(active.row, active.col, 'down')
        if (clue) setActiveClue(clue)
      }
      moveTo(active.row + 1, active.col)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (direction === 'across') {
        setDirection('down')
        const clue = findClueAt(active.row, active.col, 'down')
        if (clue) setActiveClue(clue)
      }
      moveTo(active.row - 1, active.col)
    } else if (e.key === 'Backspace') {
      e.preventDefault()
      clearLetter()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // next clue
      if (!activeClue || !puzzle) return
      const list = puzzle.clues
      const idx = list.findIndex(
        (c) =>
          c.num === activeClue.num &&
          c.direction === activeClue.direction &&
          c.answer === activeClue.answer
      )
      const next = list[(idx + (e.shiftKey ? -1 : 1) + list.length) % list.length]
      selectClue(next)
    } else if (e.key === ' ') {
      e.preventDefault()
      selectCell(active.row, active.col, true)
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault()
      setLetter(e.key)
    }
  }

  const checkAnswers = () => {
    if (!puzzle) return
    setChecked(true)
    if (isComplete) {
      showToast('Perfect! All correct.')
    } else {
      const wrong = filled - correctCount
      showToast(
        wrong > 0
          ? `${correctCount}/${total} correct · ${wrong} need fixing`
          : `Keep going — ${filled}/${total} filled`
      )
    }
  }

  const revealLetter = () => {
    if (!puzzle || !active || won) return
    const ans = getAnswer(puzzle, active.row, active.col)
    if (!ans) return
    setFill((prev) => {
      const next = prev.map((line) => [...line])
      next[active.row][active.col] = ans
      return next
    })
    setHintsUsed((h) => h + 1)
    setChecked(false)
    nextInWord(active.row, active.col, direction, 1)
  }

  const revealWord = () => {
    if (!puzzle || !activeClue || won) return
    setFill((prev) => {
      const next = prev.map((line) => [...line])
      for (const cell of clueCells(activeClue)) {
        const ans = getAnswer(puzzle, cell.row, cell.col)
        if (ans) next[cell.row][cell.col] = ans
      }
      return next
    })
    setHintsUsed((h) => h + 1)
    setChecked(false)
    showToast(`Revealed: ${activeClue.answer}`)
  }

  const resetPuzzle = () => {
    if (!puzzle) return
    if (!confirm('Clear all letters and restart the timer?')) return
    startPuzzle(puzzle)
  }

  const isClueSolved = (clue: ClueDef) => {
    if (!puzzle) return false
    return clueCells(clue).every((cell) => {
      const v = fill[cell.row]?.[cell.col]
      return v === getAnswer(puzzle, cell.row, cell.col)
    })
  }

  // Escape / body scroll
  useEffect(() => {
    if (!open) return
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (won) setWon(false)
        else if (phase === 'play') backToMenu()
        else onClose()
      }
    }
    window.addEventListener('keydown', onEsc)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onEsc)
      document.body.style.overflow = prev
    }
  }, [open, phase, won, onClose])

  useEffect(() => {
    if (!open) {
      clearTimer()
      setPhase('menu')
      setPuzzle(null)
      setWon(false)
    }
  }, [open])

  // Focus board when playing
  useEffect(() => {
    if (phase === 'play') inputRef.current?.focus()
  }, [phase, active])

  const cellSize = useMemo(() => {
    if (!puzzle) return 36
    if (puzzle.cols >= 10) return 32
    if (puzzle.cols <= 8) return 40
    return 36
  }, [puzzle])

  if (!open) return null

  return (
    <div
      className="xw-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="English Crossword"
      onKeyDown={phase === 'play' ? onKeyDown : undefined}
    >
      <header className="xw-header">
        <div className="xw-brand">
          <div className="xw-brand-mark">T</div>
          TTS English
          <em>Crossword</em>
        </div>
        <div className="xw-header-actions">
          {phase === 'play' && (
            <>
              <button className="btn btn-ghost" onClick={backToMenu}>
                <ArrowLeft size={14} /> Menu
              </button>
              <button className="btn btn-ghost" onClick={checkAnswers}>
                <Check size={14} /> Check
              </button>
              <button className="btn btn-ghost" onClick={revealLetter} title="Reveal letter">
                <Lightbulb size={14} /> Letter
              </button>
              <button className="btn btn-ghost" onClick={revealWord} title="Reveal word">
                <Eye size={14} /> Word
              </button>
              <button className="btn btn-ghost" onClick={resetPuzzle}>
                <RotateCcw size={14} /> Reset
              </button>
            </>
          )}
          <button className="xw-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
      </header>

      <div className="xw-body">
        {phase === 'menu' && (
          <div className="xw-menu">
            <h2>
              English <span className="gradient-text">Crossword</span>
            </h2>
            <p className="lead">
              Teka-teki silang berbahasa Inggris. Baca clue, isi huruf, latih vocabulary — 3
              level dari beginner sampai Web3 words.
            </p>

            <div className="xw-puzzle-grid">
              {ALL_PUZZLES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="xw-puzzle-card"
                  onClick={() => startPuzzle(p)}
                >
                  <div className="level">{p.level}</div>
                  <h3>{p.title}</h3>
                  <p>
                    {p.clues.length} clues · {p.rows}×{p.cols} grid
                  </p>
                </button>
              ))}
            </div>

            <ul className="xw-howto">
              <h4>How to play</h4>
              <li>Click a cell or clue, then type letters A–Z</li>
              <li>Click the same cell again (or press Space) to switch Across / Down</li>
              <li>Arrow keys move · Tab jumps to next clue · Backspace deletes</li>
              <li>Use Check to verify · Letter / Word for hints</li>
            </ul>

            <button className="btn btn-outline" onClick={onClose}>
              Back to Site
            </button>
          </div>
        )}

        {phase === 'play' && puzzle && (
          <div className="xw-play">
            <div className="xw-board-wrap">
              <div className="xw-meta">
                <span className="xw-chip">
                  {puzzle.level} · <strong>{puzzle.title}</strong>
                </span>
                <span className="xw-chip">
                  Time <strong>{formatTime(seconds)}</strong>
                </span>
                <span className={`xw-chip ${isComplete ? 'ok' : ''}`}>
                  Progress <strong>{correctCount}/{total}</strong>
                </span>
                {hintsUsed > 0 && (
                  <span className="xw-chip">
                    Hints <strong>{hintsUsed}</strong>
                  </span>
                )}
              </div>

              {activeClue && (
                <div className="xw-active-clue">
                  <div className="dir">
                    {activeClue.num} {activeClue.direction} · {activeClue.answer.length} letters
                  </div>
                  <p>
                    <strong>{activeClue.num}.</strong> {activeClue.clue}
                  </p>
                </div>
              )}

              <div
                className="xw-board"
                style={
                  {
                    gridTemplateColumns: `repeat(${puzzle.cols}, var(--cell-size))`,
                    '--cell-size': `${cellSize}px`,
                  } as React.CSSProperties
                }
                onClick={() => inputRef.current?.focus()}
              >
                {Array.from({ length: puzzle.rows }, (_, r) =>
                  Array.from({ length: puzzle.cols }, (_, c) => {
                    if (isBlock(puzzle, r, c)) {
                      return <div key={cellKey(r, c)} className="xw-cell block" />
                    }
                    const letter = fill[r]?.[c] ?? ''
                    const ans = getAnswer(puzzle, r, c)
                    const isActive = active?.row === r && active?.col === c
                    const inWord = highlightSet.has(cellKey(r, c))
                    let state = ''
                    if (checked && letter) {
                      state = letter === ans ? 'correct' : 'wrong'
                    } else if (letter && letter === ans && isComplete) {
                      state = 'correct'
                    }
                    const num = numberMap.get(cellKey(r, c))

                    return (
                      <div
                        key={cellKey(r, c)}
                        className={`xw-cell letter ${isActive ? 'active' : ''} ${inWord ? 'in-word' : ''} ${state}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          selectCell(r, c, true)
                        }}
                        role="gridcell"
                        aria-label={num ? `Cell ${num}` : `Cell ${r},${c}`}
                      >
                        {num != null && <span className="num">{num}</span>}
                        {letter}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Capture keyboard on mobile */}
              <input
                ref={inputRef}
                className="xw-hidden-input"
                value=""
                onChange={() => {}}
                onKeyDown={onKeyDown}
                autoCapitalize="characters"
                autoComplete="off"
                inputMode="text"
                aria-label="Type letters"
              />

              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                Space = flip direction · Esc = menu · {filled} letters entered
              </p>
            </div>

            <div className="xw-clues">
              <div className="xw-clue-section">
                <h4>Across</h4>
                {acrossClues.map((clue) => (
                  <button
                    key={`a-${clue.num}-${clue.answer}`}
                    type="button"
                    className={`xw-clue-item ${
                      activeClue?.num === clue.num &&
                      activeClue.direction === 'across' &&
                      activeClue.answer === clue.answer
                        ? 'active'
                        : ''
                    } ${isClueSolved(clue) ? 'solved' : ''}`}
                    onClick={() => selectClue(clue)}
                  >
                    <span className="xw-clue-num">{clue.num}</span>
                    <span className="xw-clue-text">{clue.clue}</span>
                  </button>
                ))}
              </div>
              <div className="xw-clue-section">
                <h4>Down</h4>
                {downClues.map((clue) => (
                  <button
                    key={`d-${clue.num}-${clue.answer}`}
                    type="button"
                    className={`xw-clue-item ${
                      activeClue?.num === clue.num &&
                      activeClue.direction === 'down' &&
                      activeClue.answer === clue.answer
                        ? 'active'
                        : ''
                    } ${isClueSolved(clue) ? 'solved' : ''}`}
                    onClick={() => selectClue(clue)}
                  >
                    <span className="xw-clue-num">{clue.num}</span>
                    <span className="xw-clue-text">{clue.clue}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {won && puzzle && (
        <div className="xw-win">
          <div className="xw-win-card">
            <Trophy size={40} color="#C6F700" style={{ marginBottom: 12 }} />
            <h2>
              Puzzle <span className="gradient-text">Solved!</span>
            </h2>
            <p>
              Great job — you finished <strong>{puzzle.title}</strong> in English.
            </p>
            <div className="xw-win-stats">
              <div className="xw-win-stat">
                <div className="v">{formatTime(seconds)}</div>
                <div className="l">Time</div>
              </div>
              <div className="xw-win-stat">
                <div className="v">{hintsUsed}</div>
                <div className="l">Hints used</div>
              </div>
              <div className="xw-win-stat">
                <div className="v">{puzzle.clues.length}</div>
                <div className="l">Clues</div>
              </div>
              <div className="xw-win-stat">
                <div className="v">{puzzle.level}</div>
                <div className="l">Level</div>
              </div>
            </div>
            <div className="xw-win-actions">
              <button className="btn btn-primary" onClick={backToMenu}>
                Choose Another Puzzle
              </button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setWon(false)
                  startPuzzle(puzzle)
                }}
              >
                Play Again
              </button>
              <button className="btn btn-ghost" onClick={onClose}>
                Back to Site
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </div>
  )
}

/** Launch card for landing */
export function CrosswordLaunchCard({ onPlay }: { onPlay: () => void }) {
  return (
    <div className="glass" style={{ padding: '32px', textAlign: 'center' }}>
      <span className="xw-launch-badge">TTS · English</span>
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
        <Grid3X3 size={26} />
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.35rem',
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        English Crossword
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
        Teka-teki silang berbahasa Inggris — 3 level: Word Power, School Life, Web3 Words.
      </p>
      <button className="btn btn-primary" onClick={onPlay}>
        <Grid3X3 size={18} />
        Play TTS English
      </button>
    </div>
  )
}
