/**
 * Affiche un libellé vocabulaire lisible (espaces, pas de tirets de slug).
 * Ex. `table-de-nuit` → `table de nuit`, `boucles-d-oreilles` → `boucles d'oreilles`.
 * Les chemins fichier / lookup gardent le slug avec tirets.
 */
export function displayVocabLabel(raw: string): string {
  let s = raw.trim()
  if (!s || !s.includes('-')) return s

  // Prépositions / articles élidés (ordre : formes longues d’abord).
  s = s.replace(/-des-/gi, ' des ')
  s = s.replace(/-de-/gi, ' de ')
  s = s.replace(/-du-/gi, ' du ')
  s = s.replace(/-aux-/gi, ' aux ')
  s = s.replace(/-au-/gi, ' au ')
  s = s.replace(/-en-/gi, ' en ')
  s = s.replace(/-a-/gi, ' à ')
  s = s.replace(/-d-/gi, " d'")
  s = s.replace(/-l-/gi, " l'")

  // Tirets restants → espaces (sac-a-dos déjà traité ; centre-ville → centre ville).
  s = s.replace(/-/g, ' ')
  s = s.replace(/\s+/g, ' ').trim()
  // « d' oreilles » → « d'oreilles »
  s = s.replace(/([dlmnstc])'\s+/gi, "$1'")
  return s
}

/**
 * Mot composé / multi-mots (ex. machine à laver, agente d’entretien).
 * Soutien types 1 / 5 / 9 : un seul mot simple.
 */
export function isCompoundVocabLabel(raw: string): boolean {
  return /\s/.test(displayVocabLabel(raw))
}
