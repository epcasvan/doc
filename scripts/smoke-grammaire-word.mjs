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
    'gram-ex-a1-qcm-verbe',
    'gram-ex-famille-fill-conj',
    'gram-ex-famille-ordre',
    'gram-ex-famille-qcm-verbe',
    'gram-ex-description-physique-fill-conj',
    'gram-ex-description-physique-ecrire',
    'gram-ex-er-fill-conj',
    'gram-ex-etre-fill-conj',
    'gram-ex-avoir-fill-conj',
    'gram-ex-modaux-fill-conj',
    'gram-ex-pronominaux-fill-conj',
    'gram-ex-f9-fill-conj',
    'gram-ex-g5-fill-conj',
    'gram-ex-c4-fill-conj',
    'gram-ex-k9-fill-conj',
    'gram-ex-l12-fill-conj',
    'gram-ex-imparfait-fill-conj',
    'gram-ex-futur-simple-fill-conj',
    'gram-ex-j8-fill-conj',
    'gram-ex-j3-fill-conj',
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
    'gram-ex-d1-negatif',
    'gram-ex-d1-ecrire',
    'gram-ex-pc-avoir-fill-conj',
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
    const enonces = (items) =>
      (items ?? []).map((item) => item.tcf?.enonce ?? item.prompt ?? item.tcf?.kind ?? '')
    const same = JSON.stringify(enonces(page?.items)) === JSON.stringify(enonces(page2?.items))
    const sample = page?.items.find((item) => item.tcf?.kind === 'qcm' || item.tcf?.kind === 'lignes')
    const dual = (page?.items ?? []).some((item) => {
      const text = item.tcf?.enonce ?? ''
      const blanks = text.split('___').length - 1
      return blanks > 1
    })
    const tcfLayout = (page?.items ?? []).every((item) => item.layout === 'tcf' || item.layout === 'text')
    const audioCount = les?.items.filter((item) => item.audioSrc).length ?? 0
    console.log(
      [
        n >= 4 && tcfLayout && !dual ? 'OK' : 'LOW',
        id,
        `n=${n}`,
        `label=${les?.label ?? '?'}`,
        `det=${same}`,
        `tcf=${tcfLayout}`,
        `dual=${dual}`,
        `audioItems=${audioCount}`,
        `layout=${sample?.layout ?? page?.items[0]?.layout}`,
        `prompt=${JSON.stringify(sample?.tcf?.enonce ?? '').slice(0, 90)}`,
      ].join(' | '),
    )
  }
} finally {
  await vite.close()
}
