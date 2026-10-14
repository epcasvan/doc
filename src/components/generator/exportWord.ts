/**
 * Exporte les fiches d’impression (élève + corrigé) en vrai document Word (.docx).
 */
import {
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
  TextRun,
  type IImageOptions,
} from 'docx'

type DocChild = Paragraph

function slugFilename(raw: string): string {
  const base = raw
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('fr-FR')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return base || 'fiche-clairfle'
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 2_000)
}

function visibleText(el: Element): string {
  return (el.textContent || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
}

function isSkipped(el: Element): boolean {
  if (el instanceof HTMLElement) {
    if (el.classList.contains('no-print') || el.classList.contains('libre-item-reroll')) return true
    if (el.tagName === 'BUTTON' || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return true
    if (el.getAttribute('aria-hidden') === 'true' && !el.classList.contains('worksheet-sheet')) return true
  }
  return false
}

async function fetchImageBytes(src: string): Promise<{ bytes: Uint8Array; type: 'png' | 'jpg' | 'gif'; width: number; height: number } | null> {
  try {
    const abs = new URL(src, window.location.href).href
    const res = await fetch(abs)
    if (!res.ok) return null
    const blob = await res.blob()
    const bitmap = await createImageBitmap(blob)
    const width = bitmap.width
    const height = bitmap.height
    bitmap.close()
    const buf = new Uint8Array(await blob.arrayBuffer())
    const mime = blob.type || ''
    let type: 'png' | 'jpg' | 'gif' = 'png'
    if (mime.includes('jpeg') || mime.includes('jpg') || /\.jpe?g(\?|$)/i.test(abs)) type = 'jpg'
    else if (mime.includes('gif') || /\.gif(\?|$)/i.test(abs)) type = 'gif'
    else type = 'png'
    // docx n’accepte pas webp : convertir via canvas
    if (mime.includes('webp') || /\.webp(\?|$)/i.test(abs) || mime.includes('svg')) {
      const png = await rasterizeToPng(abs, width, height)
      if (!png) return null
      return { bytes: png.bytes, type: 'png', width: png.width, height: png.height }
    }
    return { bytes: buf, type, width, height }
  } catch {
    return null
  }
}

async function rasterizeToPng(
  src: string,
  fallbackW = 400,
  fallbackH = 300,
): Promise<{ bytes: Uint8Array; width: number; height: number } | null> {
  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('image load'))
      img.src = src
    })
    const width = img.naturalWidth || fallbackW
    const height = img.naturalHeight || fallbackH
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) return null
    return { bytes: new Uint8Array(await blob.arrayBuffer()), width, height }
  } catch {
    return null
  }
}

async function svgElementToPng(svg: SVGElement): Promise<{ bytes: Uint8Array; width: number; height: number } | null> {
  try {
    const clone = svg.cloneNode(true) as SVGElement
    if (!clone.getAttribute('xmlns')) clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    const bbox = svg.getBoundingClientRect()
    const width = Math.max(40, Math.round(bbox.width || Number(svg.getAttribute('width')) || 320))
    const height = Math.max(40, Math.round(bbox.height || Number(svg.getAttribute('height')) || 240))
    if (!clone.getAttribute('width')) clone.setAttribute('width', String(width))
    if (!clone.getAttribute('height')) clone.setAttribute('height', String(height))
    const xml = new XMLSerializer().serializeToString(clone)
    const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }))
    try {
      return await rasterizeToPng(url, width, height)
    } finally {
      URL.revokeObjectURL(url)
    }
  } catch {
    return null
  }
}

function fitImage(width: number, height: number, maxW = 480): { width: number; height: number } {
  if (width <= maxW) return { width, height }
  const ratio = maxW / width
  return { width: maxW, height: Math.max(1, Math.round(height * ratio)) }
}

async function imageRunFromSrc(src: string): Promise<ImageRun | null> {
  const data = await fetchImageBytes(src)
  if (!data) return null
  const size = fitImage(data.width, data.height)
  const opts = {
    type: data.type,
    data: data.bytes,
    transformation: size,
  } satisfies IImageOptions
  return new ImageRun(opts)
}

async function imageRunFromSvg(svg: SVGElement): Promise<ImageRun | null> {
  const data = await svgElementToPng(svg)
  if (!data) return null
  const size = fitImage(data.width, data.height)
  return new ImageRun({
    type: 'png',
    data: data.bytes,
    transformation: size,
  })
}

function headingLevel(tag: string): (typeof HeadingLevel)[keyof typeof HeadingLevel] | null {
  switch (tag) {
    case 'H1':
      return HeadingLevel.HEADING_1
    case 'H2':
      return HeadingLevel.HEADING_2
    case 'H3':
      return HeadingLevel.HEADING_3
    case 'H4':
      return HeadingLevel.HEADING_4
    default:
      return null
  }
}

async function elementToParagraphs(el: Element): Promise<DocChild[]> {
  if (isSkipped(el)) return []

  const tag = el.tagName

  if (tag === 'IMG') {
    const src = (el as HTMLImageElement).currentSrc || el.getAttribute('src') || ''
    if (!src) return []
    const run = await imageRunFromSrc(src)
    return run ? [new Paragraph({ children: [run], spacing: { after: 160 } })] : []
  }

  if (tag === 'SVG') {
    const run = await imageRunFromSvg(el as SVGElement)
    return run ? [new Paragraph({ children: [run], spacing: { after: 160 } })] : []
  }

  // Conteneurs : parcourir les enfants, éviter de dupliquer le texte des blocs imbriqués
  const blockTags = new Set([
    'DIV',
    'SECTION',
    'ARTICLE',
    'HEADER',
    'FOOTER',
    'MAIN',
    'UL',
    'OL',
    'TABLE',
    'TBODY',
    'THEAD',
    'TR',
  ])

  if (tag === 'BR') {
    return [new Paragraph({ children: [] })]
  }

  if (tag === 'LI' || tag === 'P' || tag === 'TD' || tag === 'TH' || headingLevel(tag)) {
    // Images / SVG directs dans le paragraphe
    const childrenRuns: Array<TextRun | ImageRun> = []
    const walk = async (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const t = (node.textContent || '').replace(/\s+/g, ' ')
        if (t.trim()) childrenRuns.push(new TextRun({ text: t }))
        return
      }
      if (!(node instanceof Element)) return
      if (isSkipped(node)) return
      if (node.tagName === 'IMG') {
        const src = (node as HTMLImageElement).currentSrc || node.getAttribute('src') || ''
        const run = src ? await imageRunFromSrc(src) : null
        if (run) childrenRuns.push(run)
        return
      }
      if (node.tagName === 'SVG') {
        const run = await imageRunFromSvg(node as SVGElement)
        if (run) childrenRuns.push(run)
        return
      }
      if (node.tagName === 'BR') {
        childrenRuns.push(new TextRun({ break: 1 }))
        return
      }
      for (const child of Array.from(node.childNodes)) await walk(child)
    }
    await walk(el)
    if (childrenRuns.length === 0) {
      const t = visibleText(el)
      if (!t) return []
      childrenRuns.push(new TextRun({ text: t }))
    }
    const heading = headingLevel(tag)
    return [
      new Paragraph({
        children: childrenRuns,
        heading: heading ?? undefined,
        spacing: { after: 120 },
        bullet: tag === 'LI' ? { level: 0 } : undefined,
      }),
    ]
  }

  if (blockTags.has(tag) || tag === 'BODY') {
    const out: DocChild[] = []
    for (const child of Array.from(el.children)) {
      out.push(...(await elementToParagraphs(child)))
    }
    // Si aucun enfant bloc n’a produit de contenu mais le nœud a du texte direct
    if (out.length === 0) {
      const t = visibleText(el)
      if (t) out.push(new Paragraph({ children: [new TextRun({ text: t })], spacing: { after: 120 } }))
    }
    return out
  }

  // Autres balises inline enveloppantes
  const t = visibleText(el)
  if (!t) return []
  return [new Paragraph({ children: [new TextRun({ text: t })], spacing: { after: 120 } })]
}

async function sheetToParagraphs(sheet: Element, addPageBreakBefore: boolean): Promise<DocChild[]> {
  const parts = await elementToParagraphs(sheet)
  if (parts.length === 0) return []
  if (!addPageBreakBefore) return parts
  return [new Paragraph({ children: [new PageBreak()] }), ...parts]
}

/** Télécharge un vrai .docx à partir du bloc `.print-only-sheets`. */
export async function exportPrintSheetsToWord(filenameHint?: string): Promise<boolean> {
  const source = document.querySelector('.print-only-sheets')
  if (!(source instanceof HTMLElement)) return false
  const sheets = Array.from(source.querySelectorAll('.worksheet-sheet'))
  if (sheets.length === 0) return false

  const children: DocChild[] = []
  for (let i = 0; i < sheets.length; i++) {
    children.push(...(await sheetToParagraphs(sheets[i]!, i > 0)))
  }
  if (children.length === 0) {
    children.push(new Paragraph({ children: [new TextRun({ text: 'Fiche vide.' })] }))
  }

  const title = (filenameHint || 'Fiche ClairFLE').trim() || 'Fiche ClairFLE'
  const doc = new Document({
    creator: 'ClairFLE',
    title,
    sections: [
      {
        properties: {
          page: {
            size: {
              // A4 en twentieths of a point (1440 twip = 1 inch)
              width: 11906,
              height: 16838,
            },
            margin: {
              top: 720,
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  downloadBlob(blob, `${slugFilename(title)}.docx`)
  return true
}
