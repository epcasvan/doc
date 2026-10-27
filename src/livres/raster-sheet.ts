/**
 * Photo d’une feuille déjà rendue, avec les mêmes règles que l’impression
 * (marges miroir, pas de réduction d’aperçu).
 */

let frame: HTMLIFrameElement | null = null
let stylesReady: Promise<void> | null = null

function printOverridesCss(): string {
  const parts: string[] = []
  const visit = (rules: CSSRuleList) => {
    for (const rule of rules) {
      if (rule instanceof CSSMediaRule && /\bprint\b/.test(rule.media.mediaText)) {
        for (const inner of rule.cssRules) parts.push(inner.cssText)
      } else if (rule instanceof CSSImportRule && rule.styleSheet) {
        try {
          visit(rule.styleSheet.cssRules)
        } catch {
          /* feuille distante */
        }
      }
    }
  }
  for (const sheet of document.styleSheets) {
    try {
      visit(sheet.cssRules)
    } catch {
      /* feuille distante */
    }
  }
  return parts.join('\n')
}

function copyDocumentStyles(doc: Document) {
  for (const node of document.querySelectorAll('link[rel="stylesheet"], style')) {
    doc.head.appendChild(node.cloneNode(true))
  }
  for (const sheet of document.adoptedStyleSheets ?? []) {
    const style = doc.createElement('style')
    style.textContent = [...sheet.cssRules].map((rule) => rule.cssText).join('\n')
    doc.head.appendChild(style)
  }
  const print = doc.createElement('style')
  print.textContent = `${printOverridesCss()}
html,body{margin:0;background:#fff}
.print-only-sheets{display:block!important}
`
  doc.head.appendChild(print)
}

async function waitAssets(doc: Document, root: ParentNode) {
  const links = [...doc.querySelectorAll('link[rel="stylesheet"]')]
  await Promise.all(
    links.map(
      (link) =>
        new Promise<void>((resolve) => {
          const el = link as HTMLLinkElement
          if (el.sheet) {
            resolve()
            return
          }
          el.addEventListener('load', () => resolve(), { once: true })
          el.addEventListener('error', () => resolve(), { once: true })
        }),
    ),
  )
  const images = [...root.querySelectorAll('img')]
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
  if (doc.fonts?.ready) await doc.fonts.ready
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

function ensureFrame(): Promise<Document> {
  if (frame?.contentDocument && stylesReady) {
    return stylesReady.then(() => {
      const doc = frame?.contentDocument
      if (!doc) throw new Error('La fiche n’a pas pu être préparée.')
      return doc
    })
  }
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.cssText =
    'position:fixed;left:0;top:0;width:210mm;height:297mm;border:0;z-index:70;background:#fff;pointer-events:none'
  document.body.appendChild(iframe)
  frame = iframe
  const doc = iframe.contentDocument
  if (!doc) throw new Error('La fiche n’a pas pu être préparée.')
  doc.open()
  doc.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><base href="${location.origin}/"></head><body></body></html>`,
  )
  doc.close()
  copyDocumentStyles(doc)
  stylesReady = waitAssets(doc, doc)
  return stylesReady.then(() => doc)
}

export function closePrintFrame() {
  frame?.remove()
  frame = null
  stylesReady = null
}

export async function rasterWorksheet(sheet: HTMLElement): Promise<HTMLCanvasElement> {
  const doc = await ensureFrame()
  doc.body.innerHTML = `<div class="sheet-stage print-only-sheets">${sheet.outerHTML}</div>`
  const node = doc.querySelector('.worksheet-sheet')
  if (!(node instanceof HTMLElement)) throw new Error('La fiche n’a pas pu être préparée.')
  await waitAssets(doc, node)
  const { domToCanvas } = await import('modern-screenshot')
  return domToCanvas(node, {
    scale: 2,
    backgroundColor: '#ffffff',
  })
}
