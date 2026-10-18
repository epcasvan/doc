import { useEffect, useMemo, useRef, useState } from 'react'
import { WorksheetSheet } from '@/components/generator/WorksheetSheet'
import type { InstitutionalHeader } from '@/components/math/PrintDocumentChrome'
import { createFiche } from '@/fiches/api'
import { buildFicheRecipe } from '@/fiches/recipe'
import { closePrintFrame, rasterWorksheet } from '@/livres/raster-sheet'
import { bookDisplayName, bookFolderName, planBook, type BookKind } from '@/livres/plan'
import { buildWorksheets } from '@/math/generate'
import { randomSeed } from '@/math/rng'

export type BookRequest = {
  kind: BookKind
  /** Absent : nouveau tirage. Présent : même livre. */
  seed?: number
  institutional: InstitutionalHeader
  evalMode: boolean
  pointsPerQuestion: number
  saveCopy: boolean
}

type DirHandle = {
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<DirHandle>
  getFileHandle(
    name: string,
    options?: { create?: boolean },
  ): Promise<{
    createWritable(): Promise<{ write(data: Blob): Promise<void>; close(): Promise<void> }>
  }>
}

function picker(): (() => Promise<DirHandle>) | null {
  const fn = (window as Window & { showDirectoryPicker?: () => Promise<DirHandle> }).showDirectoryPicker
  return typeof fn === 'function' ? () => fn() : null
}

async function waitForSheet(node: HTMLElement) {
  const images = [...node.querySelectorAll('img')]
  await Promise.all(
    images.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener('load', () => resolve(), { once: true })
              img.addEventListener('error', () => resolve(), { once: true })
            }),
    ),
  )
  if (document.fonts?.ready) await document.fonts.ready
  await new Promise((resolve) => window.setTimeout(resolve, 450))
}

const pdfs = new Map<string, import('jspdf').jsPDF>()

export function BookStudio({
  request,
  onClose,
}: {
  request: BookRequest | null
  onClose: () => void
}) {
  const [phase, setPhase] = useState<'confirm' | 'run' | 'done' | 'error' | 'cancelled'>('confirm')
  const [message, setMessage] = useState<string | null>(null)
  const [askCancel, setAskCancel] = useState(false)
  const [sheetPos, setSheetPos] = useState({ file: 0, sheet: 0 })
  const hostRef = useRef<HTMLDivElement>(null)
  const dirRef = useRef<DirHandle | null>(null)
  const seedRef = useRef(0)
  const folderRef = useRef('')
  const busy = useRef(false)
  const abortRef = useRef(false)

  const files = useMemo(
    () => (request ? planBook(request.kind, seedRef.current || request.seed || 1) : []),
    [request, phase],
  )
  const file = files[sheetPos.file]
  const sheets = useMemo(() => (file ? buildWorksheets(file.pages, file.seed) : []), [file])
  const page = sheets[sheetPos.sheet]

  useEffect(() => {
    if (!request) return
    setPhase('confirm')
    setMessage(null)
    setSheetPos({ file: 0, sheet: 0 })
    seedRef.current = request.seed ?? randomSeed()
    folderRef.current = ''
    dirRef.current = null
    busy.current = false
    abortRef.current = false
    setAskCancel(false)
  }, [request])

  useEffect(() => {
    if (phase !== 'run' || !request || !file || !page || !hostRef.current || !dirRef.current) return
    if (busy.current) return
    busy.current = true
    const host = hostRef.current
    const directory = dirRef.current
    const folder = folderRef.current
    let cancelled = false
    const run = async () => {
      try {
        await waitForSheet(host)
        if (cancelled || abortRef.current) return
        const sheet = host.querySelector('.worksheet-sheet')
        if (!(sheet instanceof HTMLElement)) throw new Error('La fiche n’a pas pu être préparée.')
        const { jsPDF } = await import('jspdf')
        const canvas = await rasterWorksheet(sheet)
        if (cancelled || abortRef.current) return
        const key = `${folder}/${file.themeDir}/${file.fileName}`
        const existing = pdfs.get(key)
        const pdf = existing ?? new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
        if (existing) pdf.addPage()
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297)
        const last = sheetPos.sheet >= sheets.length - 1
        if (!last) {
          if (cancelled || abortRef.current) return
          pdfs.set(key, pdf)
          busy.current = false
          setSheetPos((pos) => ({ ...pos, sheet: pos.sheet + 1 }))
          return
        }
        pdfs.delete(key)
        const rootDir = await directory.getDirectoryHandle(folder, { create: true })
        const letterDir = await rootDir.getDirectoryHandle(file.themeDir, { create: true })
        const handle = await letterDir.getFileHandle(file.fileName, { create: true })
        const writable = await handle.createWritable()
        await writable.write(pdf.output('blob'))
        await writable.close()
        if (cancelled || abortRef.current) return
        if (sheetPos.file >= files.length - 1) {
          if (request.saveCopy && !abortRef.current && !cancelled) {
            try {
              await createFiche(
                bookDisplayName(request.kind),
                buildFicheRecipe({
                  pages: files[0]!.pages.slice(0, 1),
                  seed: seedRef.current,
                  institutional: request.institutional,
                  evalMode: request.evalMode,
                  pointsPerQuestion: request.pointsPerQuestion,
                  libreMode: false,
                  libreSnapshot: null,
                  bookKind: request.kind,
                }),
              )
            } catch {
              setMessage('Le dossier est enregistré. La copie du livre n’a pas pu être ajoutée à la page des livres.')
            }
          }
          if (cancelled || abortRef.current) return
          setPhase('done')
          busy.current = false
          return
        }
        if (cancelled || abortRef.current) return
        busy.current = false
        setSheetPos({ file: sheetPos.file + 1, sheet: 0 })
      } catch (error) {
        busy.current = false
        if (cancelled || abortRef.current) return
        setPhase('error')
        setMessage(error instanceof Error ? error.message : 'Le livre n’a pas pu être enregistré.')
      }
    }
    void run()
    return () => {
      cancelled = true
      busy.current = false
    }
  }, [file, files, page, phase, request, sheetPos.file, sheetPos.sheet, sheets.length])

  useEffect(() => {
    if (phase === 'run') return
    closePrintFrame()
  }, [phase])

  useEffect(() => () => closePrintFrame(), [])

  if (!request) return null

  const title = request.kind === 'alpha' ? 'Livre alphabétisation' : 'Livre soutien'
  const totalSheets = files.reduce((sum, item) => sum + item.pages.length, 0)
  const doneBefore = files.slice(0, sheetPos.file).reduce((sum, item) => sum + item.pages.length, 0)
  const shownSheet = Math.min(totalSheets, doneBefore + sheetPos.sheet + 1)
  const progress = totalSheets === 0 ? 0 : Math.round((shownSheet / totalSheets) * 100)

  const confirmAbort = () => {
    abortRef.current = true
    pdfs.clear()
    setAskCancel(false)
    setPhase('cancelled')
  }

  const start = async () => {
    const choose = picker()
    if (!choose) {
      setPhase('error')
      setMessage('Le choix du dossier fonctionne dans Chrome ou Edge.')
      return
    }
    try {
      dirRef.current = await choose()
      folderRef.current = bookFolderName(request.kind)
      pdfs.clear()
      abortRef.current = false
      setAskCancel(false)
      setPhase('run')
    } catch {
      onClose()
    }
  }

  return (
    <>
      {phase !== 'run' ? (
        <div className="save-fiche-backdrop" role="presentation" onClick={onClose}>
          <div
            className="save-fiche-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="topbar-icon-btn save-fiche-close" type="button" aria-label="Fermer" onClick={onClose}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                <path
                  fill="currentColor"
                  d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4z"
                />
              </svg>
            </button>
            <h2 id="book-title">{title}</h2>
            {phase === 'confirm' ? (
              <p className="save-fiche-lead">
                Une fiche complète est tirée pour chaque lettre, puis enregistrée en PDF dans un dossier
                daté. Vous choisirez l’emplacement ensuite.
              </p>
            ) : null}
            {phase === 'done' ? (
              <p className="save-fiche-lead">
                Le livre est enregistré dans le dossier {folderRef.current}.
                {message ? ` ${message}` : ''}
              </p>
            ) : null}
            {phase === 'cancelled' ? (
              <p className="save-fiche-lead">
                L’impression est annulée. Les fiches déjà enregistrées restent dans le dossier.
              </p>
            ) : null}
            {phase === 'error' && message ? (
              <p className="access-error" role="alert">
                {message}
              </p>
            ) : null}
            {phase === 'confirm' ? (
              <button className="button full" type="button" onClick={() => void start()}>
                Choisir le dossier
              </button>
            ) : (
              <button className="button full" type="button" onClick={onClose}>
                Fermer
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="save-fiche-backdrop book-run-backdrop" role="presentation">
          <div
            className="save-fiche-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-run-title"
          >
            {askCancel ? (
              <>
                <h2 id="book-run-title">Annuler l’impression ?</h2>
                <p className="save-fiche-lead">
                  Les fiches déjà enregistrées restent dans le dossier. L’impression du livre s’arrête.
                </p>
                <div className="save-fiche-actions">
                  <button className="button full" type="button" onClick={() => setAskCancel(false)}>
                    Continuer l’impression
                  </button>
                  <button className="button secondary full" type="button" onClick={confirmAbort}>
                    Annuler l’impression
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 id="book-run-title">Impression du livre</h2>
                <p className="save-fiche-lead">{file?.documentTitle ?? 'Préparation de la fiche'}</p>
                <div className="book-meter-label">
                  <span>
                    {shownSheet} / {totalSheets}
                  </span>
                  <span>{progress} %</span>
                </div>
                <div
                  className="book-meter"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                  aria-label="Avancement de l’impression"
                >
                  <span style={{ width: `${progress}%` }} />
                </div>
                <div className="save-fiche-actions">
                  <button className="button secondary full" type="button" onClick={() => setAskCancel(true)}>
                    Annuler
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {phase === 'run' && page && file ? (
        <div className="book-capture" ref={hostRef} aria-hidden>
          <WorksheetSheet
              page={page}
              mode="student"
              institutional={{
                ...request.institutional,
                documentTitle: file.documentTitle,
              }}
              evalMode={request.evalMode}
              pageNumber={sheetPos.sheet + 1}
              total={sheets.length}
              sheetIndex={sheetPos.sheet + 1}
              documentTotalPoints={0}
              pointsPerQuestion={request.pointsPerQuestion}
              showExerciseRefresh={false}
            />
        </div>
      ) : null}
    </>
  )
}
