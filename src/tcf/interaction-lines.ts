import type { WorksheetPage } from '@/math/types'
import type { TcfPoImageInteraction } from './types'

/** Interactions d’une feuille, pour le corrigé sur page séparée. */
export function imageInteractionsOf(page: WorksheetPage | undefined): TcfPoImageInteraction[] {
  if (!page) return []
  const items = page.blocks?.length ? page.blocks.flatMap((b) => b.items) : page.items
  const out: TcfPoImageInteraction[] = []
  for (const item of items) {
    const t = item.tcf
    if (t?.kind === 'support' && t.exercise.type_exercice === 'image_interaction') out.push(t.exercise)
  }
  return out
}

/** Première lettre en majuscule, pour le titre de colonne. */
export function roleLabel(raw: string): string {
  const t = raw.trim()
  if (!t) return 'Rôle'
  return t.charAt(0).toUpperCase() + t.slice(1)
}

function pushUnique(out: string[], line: string) {
  const t = line.replace(/\s+/g, ' ').trim()
  if (!t) return
  const key = t.toLowerCase()
  if (out.some((x) => x.toLowerCase() === key)) return
  out.push(t)
}

/**
 * Deux colonnes de répliques possibles (demander et répondre),
 * assez longues pour remplir la page du corrigé.
 * Les répliques déjà écrites dans la banque passent en premier.
 */
export function interactionColumns(ex: TcfPoImageInteraction): { staff: string[]; guest: string[] } {
  const s = ex.support
  const staff: string[] = []
  const guest: string[] = []
  for (const r of s.repliques) {
    const bucket = r.locuteur === 'eleve' ? guest : staff
    pushUnique(bucket, r.texte)
    for (const v of r.variantes ?? []) pushUnique(bucket, v)
  }

  const want = s.vous_voulez.trim() || 'faire cette démarche'
  const lieu = s.lieu.trim() || 'ici'
  const scene = (ex.scene || ex.theme || 'cette situation').trim()

  const staffExtra = [
    'Bonjour. Qu’est-ce que je peux faire pour vous ?',
    `Vous êtes ${lieu}, et vous voulez ${want}. C’est bien cela ?`,
    'Je peux vous proposer une solution simple et une solution plus rapide.',
    'Laquelle vous convient le mieux ?',
    'Vous avez un document ou une pièce d’identité ?',
    'Vous pouvez me montrer ça, s’il vous plaît ?',
    'Vous payez en espèces ou par carte ?',
    'Je vérifie tout de suite. Un petit instant.',
    `Pour « ${scene} », il me manque encore un détail.`,
    'Vous pouvez répéter plus lentement, s’il vous plaît ?',
    'Voilà, c’est noté.',
    'Le montant est indiqué ici.',
    'Vous voulez un reçu ou une confirmation écrite ?',
    'Vous préférez revenir demain, ou on termine aujourd’hui ?',
    'Autre chose pour vous ?',
    'Je vous remercie. Passez une bonne journée.',
    'Si vous avez encore une question, je suis là.',
    'Au revoir, et à bientôt.',
  ]
  const guestExtra = [
    `Bonjour. Je voudrais ${want}.`,
    `Je suis bien ${lieu} ?`,
    'C’est possible aujourd’hui ?',
    'Combien ça coûte ?',
    'Je préfère la solution la plus simple.',
    'Oui, j’ai mon document avec moi.',
    'Non, je n’ai pas de carte sur moi aujourd’hui.',
    'Par carte, s’il vous plaît.',
    'En espèces. Voilà.',
    'Vous pouvez répéter ? Je n’ai pas compris.',
    'D’accord, je prends la première option.',
    'À quelle heure est-ce que je dois revenir ?',
    'C’est pour quelle date ?',
    'Oui, je veux un reçu.',
    'Non merci, c’est tout.',
    'Merci beaucoup pour votre aide.',
    'Je reviendrai si j’ai encore une question.',
    'Au revoir.',
  ]

  for (const line of staffExtra) {
    if (staff.length >= 16) break
    pushUnique(staff, line)
  }
  for (const line of guestExtra) {
    if (guest.length >= 16) break
    pushUnique(guest, line)
  }
  return { staff: staff.slice(0, 16), guest: guest.slice(0, 16) }
}
