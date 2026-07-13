/** English crossword puzzles (TTS Inggris) */

export type Direction = 'across' | 'down'

export type ClueDef = {
  num: number
  direction: Direction
  clue: string
  answer: string
  row: number
  col: number
}

export type Puzzle = {
  id: string
  title: string
  level: string
  rows: number
  cols: number
  /** row strings: '#' = block, A–Z = answer letter */
  grid: string[]
  clues: ClueDef[]
}

/** Beginner — everyday English */
export const PUZZLE_1: Puzzle = {
  id: 'word-power',
  title: 'Word Power',
  level: 'Beginner',
  rows: 9,
  cols: 9,
  grid: [
    '##WRITE##',
    '##O##A###',
    'BOOK#L###',
    '##D##K###',
    'READ#####',
    'O########',
    'LEARN####',
    'E########',
    '##WORD###',
  ],
  clues: [
    {
      num: 1,
      direction: 'across',
      answer: 'WRITE',
      row: 0,
      col: 2,
      clue: 'To put words on paper or a screen',
    },
    {
      num: 1,
      direction: 'down',
      answer: 'WOOD',
      row: 0,
      col: 2,
      clue: 'Hard material that comes from trees',
    },
    {
      num: 2,
      direction: 'down',
      answer: 'TALK',
      row: 0,
      col: 5,
      clue: 'To speak with another person',
    },
    {
      num: 3,
      direction: 'across',
      answer: 'BOOK',
      row: 2,
      col: 0,
      clue: 'A set of printed pages bound together',
    },
    {
      num: 4,
      direction: 'across',
      answer: 'READ',
      row: 4,
      col: 0,
      clue: 'To look at words and understand them',
    },
    {
      num: 4,
      direction: 'down',
      answer: 'ROLE',
      row: 4,
      col: 0,
      clue: "An actor's part in a film or play",
    },
    {
      num: 5,
      direction: 'across',
      answer: 'LEARN',
      row: 6,
      col: 0,
      clue: 'To gain knowledge or a new skill',
    },
    {
      num: 6,
      direction: 'across',
      answer: 'WORD',
      row: 8,
      col: 2,
      clue: 'A single unit of language',
    },
  ],
}

/** Intermediate — school English */
export const PUZZLE_2: Puzzle = {
  id: 'school-life',
  title: 'School Life',
  level: 'Intermediate',
  rows: 9,
  cols: 10,
  grid: [
    'SCHOOL####',
    'T##P######',
    'U#READ####',
    'D##N######',
    'Y#BOOK####',
    '##########',
    'PENCIL####',
    '##########',
    '##SMART###',
  ],
  clues: [
    {
      num: 1,
      direction: 'across',
      answer: 'SCHOOL',
      row: 0,
      col: 0,
      clue: 'A place where children go to learn',
    },
    {
      num: 1,
      direction: 'down',
      answer: 'STUDY',
      row: 0,
      col: 0,
      clue: 'To spend time learning a subject',
    },
    {
      num: 2,
      direction: 'down',
      answer: 'OPEN',
      row: 0,
      col: 3,
      clue: 'Not closed; ready to use or enter',
    },
    {
      num: 3,
      direction: 'across',
      answer: 'READ',
      row: 2,
      col: 2,
      clue: 'To look at and understand written words',
    },
    {
      num: 4,
      direction: 'across',
      answer: 'BOOK',
      row: 4,
      col: 2,
      clue: 'Something with pages that you can read',
    },
    {
      num: 5,
      direction: 'across',
      answer: 'PENCIL',
      row: 6,
      col: 0,
      clue: 'A writing tool that you can erase',
    },
    {
      num: 6,
      direction: 'across',
      answer: 'SMART',
      row: 8,
      col: 2,
      clue: 'Intelligent; clever',
    },
  ],
}

/** Advanced — Web3 / $TXT vocabulary in English */
export const PUZZLE_3: Puzzle = {
  id: 'web3-words',
  title: 'Web3 Words',
  level: 'Advanced',
  rows: 7,
  cols: 8,
  grid: [
    'WRITE###',
    'A##O####',
    'L##K####',
    'L##E####',
    'EARN####',
    'T#######',
    '#STAKE##',
  ],
  clues: [
    {
      num: 1,
      direction: 'across',
      answer: 'WRITE',
      row: 0,
      col: 0,
      clue: 'To create text; first word of TXT motto',
    },
    {
      num: 1,
      direction: 'down',
      answer: 'WALLET',
      row: 0,
      col: 0,
      clue: 'A digital place to keep cryptocurrency',
    },
    {
      num: 2,
      direction: 'down',
      answer: 'TOKEN',
      row: 0,
      col: 3,
      clue: 'A digital coin or unit on a blockchain',
    },
    {
      num: 3,
      direction: 'across',
      answer: 'EARN',
      row: 4,
      col: 0,
      clue: 'To get money or rewards for your work',
    },
    {
      num: 4,
      direction: 'across',
      answer: 'STAKE',
      row: 6,
      col: 1,
      clue: 'To lock tokens in order to earn rewards',
    },
  ],
}

export const ALL_PUZZLES = [PUZZLE_1, PUZZLE_2, PUZZLE_3]

export function isBlock(puzzle: Puzzle, row: number, col: number): boolean {
  if (row < 0 || col < 0 || row >= puzzle.rows || col >= puzzle.cols) return true
  return puzzle.grid[row][col] === '#'
}

export function getAnswer(puzzle: Puzzle, row: number, col: number): string | null {
  if (isBlock(puzzle, row, col)) return null
  return puzzle.grid[row][col].toUpperCase()
}

export function clueCells(clue: ClueDef): { row: number; col: number }[] {
  return Array.from({ length: clue.answer.length }, (_, i) => ({
    row: clue.direction === 'across' ? clue.row : clue.row + i,
    col: clue.direction === 'across' ? clue.col + i : clue.col,
  }))
}

/** Map cell -> clue numbers for display */
export function buildNumberMap(puzzle: Puzzle): Map<string, number> {
  const map = new Map<string, number>()
  for (const c of puzzle.clues) {
    const key = `${c.row},${c.col}`
    if (!map.has(key)) map.set(key, c.num)
  }
  return map
}
