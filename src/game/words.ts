/** Web3 / KnowledgeFi vocabulary for the typing demo */

export const WORD_BANK = [
  // Core brand
  'txt',
  'write',
  'own',
  'earn',
  'knowledge',
  'publish',
  'creator',
  // Crypto / chain
  'blockchain',
  'web3',
  'token',
  'wallet',
  'mint',
  'stake',
  'dao',
  'defi',
  'nft',
  'ledger',
  'hash',
  'node',
  'gas',
  'yield',
  'liquidity',
  'governance',
  'protocol',
  'oracle',
  'bridge',
  'layer',
  'consensus',
  'validator',
  'airdrop',
  // Knowledge / AI
  'article',
  'tutorial',
  'research',
  'prompt',
  'library',
  'archive',
  'editor',
  'summary',
  'translate',
  'whitepaper',
  'documentation',
  'marketplace',
  'premium',
  'course',
  'template',
  // Power words
  'decentralized',
  'ownership',
  'incentive',
  'ecosystem',
  'treasury',
  'community',
  'onchain',
  'sovereignty',
  'intelligence',
  'network',
]

export const HARD_WORDS = [
  'knowledgefi',
  'tokenomics',
  'accountabstraction',
  'decentralized',
  'permissionless',
  'cryptography',
  'interoperability',
  'proofofstake',
  'smartcontract',
  'promptengineering',
]

export function pickWord(score: number, used: Set<string>): string {
  const bank = score >= 800 ? [...WORD_BANK, ...HARD_WORDS] : WORD_BANK
  const pool = bank.filter((w) => !used.has(w))
  const source = pool.length > 0 ? pool : bank
  return source[Math.floor(Math.random() * source.length)]
}

export function difficultyFromScore(score: number): {
  label: string
  timeBonus: number
  mult: number
} {
  if (score >= 1500) return { label: 'LEGEND', timeBonus: 0.6, mult: 3 }
  if (score >= 900) return { label: 'PRO', timeBonus: 0.8, mult: 2.5 }
  if (score >= 400) return { label: 'RISING', timeBonus: 1, mult: 2 }
  return { label: 'NOVICE', timeBonus: 1.2, mult: 1.5 }
}
