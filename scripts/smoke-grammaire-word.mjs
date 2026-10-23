import { createServer } from 'vite'

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
})

try {
  const { lessonForType, bankSize, GRAM_LESSON_BY_TYPE } = await vite.ssrLoadModule(
    '/src/grammaire/exercises/bank/index.ts',
  )
  const { tryGenerateGrammaireExerciseBlock } = await vite.ssrLoadModule(
    '/src/grammaire/exercises/generate.ts',
  )
  const { ALL_GRAM_SUBTHEMES, buildGrammairePracticeTypes } = await vite.ssrLoadModule(
    '/src/grammaire/exercises/catalog-exercises.ts',
  )

  const wanted = [
    'gram-ex-a1-fill-conj',
    'gram-ex-a2-fill-conj',
    'gram-ex-a6-fill-conj',
    'gram-ex-a7-negatif',
    'gram-ex-a7-ordre',
    'gram-ex-a7-fill-conj',
    'gram-ex-etre-negatif',
    'gram-ex-avoir-negatif',
    'gram-ex-er-negatif',
    'gram-ex-a8-fill-conj',
    'gram-ex-f3-associer',
    'gram-ex-identite-fill-conj',
    'gram-ex-famille-fill-conj',
    'gram-ex-famille-ordre',
    'gram-ex-situation-familiale-qcm-verbe',
    'gram-ex-description-physique-fill-conj',
    'gram-ex-description-physique-ecrire',
    'gram-ex-er-fill-conj',
    'gram-ex-e2-fill-conj',
    'gram-ex-e2-qcm-verbe',
    'gram-ex-e2-ordre',
    'gram-ex-f2-fill-conj',
    'gram-ex-f3-qcm-verbe',
    'gram-ex-f3-ecrire',
    'gram-ex-f3-fill-conj',
    'gram-ex-er-associer',
    'gram-ex-e4-qcm-verbe',
    'gram-ex-e4-fill-conj',
    'gram-ex-e5-fill-conj',
    'gram-ex-d1-associer',
    'gram-ex-d1-fill-conj',
    'gram-ex-f6-fill-conj',
    'gram-ex-g1-fill-conj',
    'gram-ex-g2-fill-conj',
    'gram-ex-i7-fill-conj',
    'gram-ex-e1-associer',
    'gram-ex-d1-ordre',
    'gram-ex-f5-qcm-verbe',
  ]

  const sePresenter = ALL_GRAM_SUBTHEMES.filter((s) => s.topic === 'gram-se-presenter')
  const decrire = ALL_GRAM_SUBTHEMES.filter((s) => s.topic === 'gram-decrire')
  const types = buildGrammairePracticeTypes()

  console.log('subthemes se-presenter', sePresenter.map((s) => s.id).join(', '))
  console.log('subthemes decrire', decrire.map((s) => s.id).join(', '))
  console.log('practice types', types.length)
  console.log('lessons loaded', Object.keys(GRAM_LESSON_BY_TYPE).length)

  for (const id of wanted) {
    const n = bankSize(id)
    const les = lessonForType(id)
    const page = tryGenerateGrammaireExerciseBlock(
      { exerciseType: id, count: 4, topic: 'gram-se-presenter', domain: 'grammaire' },
      42,
    )
    const page2 = tryGenerateGrammaireExerciseBlock(
      { exerciseType: id, count: 4, topic: 'gram-se-presenter', domain: 'grammaire' },
      42,
    )
    const same =
      JSON.stringify(page?.items.map((i) => i.prompt)) ===
      JSON.stringify(page2?.items.map((i) => i.prompt))
    const sample = page?.items[0]
    const audioCount = les?.items.filter((item) => item.audioSrc).length ?? 0
    console.log(
      [
        n >= 4 ? 'OK' : 'LOW',
        id,
        `n=${n}`,
        `label=${les?.label ?? '?'}`,
        `det=${same}`,
        `audioItems=${audioCount}`,
        `sampleAudio=${Boolean(sample?.audioSrc)}`,
        `prompt=${JSON.stringify(sample?.prompt ?? '').slice(0, 90)}`,
      ].join(' | '),
    )
  }
} finally {
  await vite.close()
}
