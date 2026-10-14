/**
 * Exporte les fiches d’impression (élève + corrigé) en document Word (.doc HTML).
 * Word / LibreOffice ouvrent ce format sans dépendance npm.
 */

function absolutizeUrl(url: string, base: string): string {
  const trimmed = url.trim()
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed
  try {
    return new URL(trimmed, base).href
  } catch {
    return trimmed
  }
}

function absolutizeHtml(root: HTMLElement, base: string) {
  root.querySelectorAll<HTMLImageElement>('img[src]').forEach((img) => {
    img.setAttribute('src', absolutizeUrl(img.getAttribute('src') || '', base))
  })
  root.querySelectorAll<HTMLSourceElement>('source[src]').forEach((el) => {
    el.setAttribute('src', absolutizeUrl(el.getAttribute('src') || '', base))
  })
  root.querySelectorAll<HTMLElement>('[style*="url("]').forEach((el) => {
    const style = el.getAttribute('style') || ''
    el.setAttribute(
      'style',
      style.replace(/url\((['"]?)([^)'"]+)\1\)/g, (_m, q: string, u: string) => {
        return `url(${q}${absolutizeUrl(u, base)}${q})`
      }),
    )
  })
  // Retirer contrôles UI non imprimables s’ils trainent
  root.querySelectorAll('.no-print, .libre-item-reroll, button').forEach((el) => el.remove())
}

function collectStylesheetText(): string {
  const chunks: string[] = []
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = sheet.cssRules
      if (!rules) continue
      for (const rule of Array.from(rules)) {
        chunks.push(rule.cssText)
      }
    } catch {
      // Feuilles cross-origin ignorées
    }
  }
  return chunks.join('\n')
}

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

/** Télécharge un .doc Word à partir du bloc `.print-only-sheets`. */
export function exportPrintSheetsToWord(filenameHint?: string): boolean {
  const source = document.querySelector('.print-only-sheets')
  if (!(source instanceof HTMLElement) || !source.querySelector('.worksheet-sheet')) {
    return false
  }

  const clone = source.cloneNode(true) as HTMLElement
  clone.classList.remove('print-only-sheets')
  clone.style.display = 'block'
  clone.removeAttribute('aria-hidden')
  absolutizeHtml(clone, window.location.href)

  const css = collectStylesheetText()
  const title = (filenameHint || 'Fiche ClairFLE').trim() || 'Fiche ClairFLE'
  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<title>${title.replace(/</g, '')}</title>
<!--[if gte mso 9]>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
    <w:DoNotOptimizeForBrowser/>
  </w:WordDocument>
</xml>
<![endif]-->
<style>
@page { size: A4 portrait; margin: 12mm 15mm; }
body { margin: 0; background: #fff; }
.print-export-root .worksheet-sheet {
  width: 210mm;
  min-height: 297mm;
  page-break-after: always;
  break-after: page;
  box-shadow: none !important;
  border: none !important;
}
.print-export-root .worksheet-sheet:last-child {
  page-break-after: auto;
  break-after: auto;
}
${css}
</style>
</head>
<body>
<div class="print-export-root sheet-stage">
${clone.innerHTML}
</div>
</body>
</html>`

  const blob = new Blob(['\ufeff', html], {
    type: 'application/msword;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${slugFilename(title)}.doc`
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 2_000)
  return true
}
