import type { Difficulty } from './types'
import type { Rng } from './rng'
import { PROBLEM_BANKS } from './problem-banks'
import { generateWordProblem } from './word-problems'

export type ProblemKind =
  | 'addition'
  | 'soustraction'
  | 'multiplication'
  | 'division'
  | 'add-sub'
  | 'melange'

export function makeWordProblem(rng: Rng, difficulty: Difficulty, kind: ProblemKind) {
  return generateWordProblem(rng, difficulty, kind)
}

/** Vérification : l’ancienne banque générée reste complète si on s’en sert encore. */
export function assertProblemBanksIntegrity(): { cells: number; prompts: number } {
  const keys = Object.keys(PROBLEM_BANKS)
  const all = new Set<string>()
  for (const key of keys) {
    const bank = PROBLEM_BANKS[key]!
    if (bank.length < 100) throw new Error(`${key} : ${bank.length} < 100`)
    const local = new Set(bank.map((e) => e.prompt))
    if (local.size !== bank.length) throw new Error(`${key} : doublons internes`)
    for (const p of local) {
      if (all.has(p)) throw new Error(`Prompt dupliqué entre cellules : ${p.slice(0, 60)}`)
      all.add(p)
    }
  }
  return { cells: keys.length, prompts: all.size }
}
