import { readFileSync, existsSync } from 'node:fs'
import { isTcfExerciseShape, validateTcfExercise, tcfMediaPaths } from '../src/tcf/validate.ts'

let bad = 0
for (const level of ['a0-a1', 'a1-a2', 'a2-b1']) {
  const bank = JSON.parse(readFileSync(`src/tcf/content/${level}/co.json`, 'utf-8')) as unknown[]
  for (const raw of bank) {
    const ex = raw as { id: string }
    if (!isTcfExerciseShape(raw)) {
      bad++
      console.log('FORME', level, ex.id)
      continue
    }
    const v = validateTcfExercise(raw) as unknown as { errors?: string[] }
    if (v.errors?.length) {
      bad++
      console.log('ERREUR', level, ex.id, v.errors)
    }
    for (const p of tcfMediaPaths(raw)) {
      if (p.includes('/audio/tcf/co/') && !existsSync(`public${p}`)) console.log('AUDIO ABSENT', level, ex.id, p)
    }
  }
}
console.log('FIN', bad)
