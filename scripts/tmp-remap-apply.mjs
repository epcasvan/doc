/**
 * Applique les rapprochements STT : chemins audio, transcriptions
 * raccourcies, et recolle les annonces / dialogues découpés.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const ROOT = process.cwd()
const FFMPEG = 'C:/Users/Phuoc/AppData/Local/Temp/asr-check/node_modules/ffmpeg-static/ffmpeg.exe'
const CO = join(ROOT, 'public/lib/audio/tcf/co')

const PATHS = {
  '/lib/audio/tcf/co/fetes/01-anniversaire-de-Driss.mp3': '/lib/audio/tcf/co/fetes/01-fêtes_anniversaire-de-Driss.mp3',
  '/lib/audio/tcf/co/fetes/02-anniversaire-de-Gerald.mp3': '/lib/audio/tcf/co/fetes/02-fêtes_anniversaire-de-Gerald.mp3',
  '/lib/audio/tcf/co/fetes/03-anniversaire-de-Lorie.mp3': '/lib/audio/tcf/co/fetes/03-fêtes_anniversaire-de-Lorie.mp3',
  '/lib/audio/tcf/co/fetes/04-anniversaire-de-Léa.mp3': '/lib/audio/tcf/co/fetes/04-fêtes_anniversaire-de-Léa.mp3',
  '/lib/audio/tcf/co/fetes/13-invitation-indication-nouveau-cinéma.mp3': '/lib/audio/tcf/co/fetes/13-invitation-nouveau-cinéma.mp3',
  '/lib/audio/tcf/co/fetes/17-anniversaire-de-Margot-objets.mp3': '/lib/audio/tcf/co/fetes/17-fêtes_anniversaire-de-Margot-objets.mp3',
  '/lib/audio/tcf/co/ecole/on-presente-nael-kervelek-1.mp3': '/lib/audio/tcf/co/ecole/30-école-presenter-nael-kervelek.mp3',
  '/lib/audio/tcf/co/ecole/on-presente-nael-kervelek-2.mp3': '/lib/audio/tcf/co/ecole/30-école-presenter-nael-kervelek.mp3',
  '/lib/audio/tcf/co/ecole/pour-l-expose-maitresse-demande.mp3': '/lib/audio/tcf/co/fetes/23-fêtes-anniversaire-Bastien.mp3',
  '/lib/audio/tcf/co/ecole/facile-a1__objet-18.mp3': '/lib/audio/tcf/co/ecole/32-école-cours-de-dessin-objets.mp3',
  '/lib/audio/tcf/co/ecole/moyen-a2__annonce-3.4.mp3': '/lib/audio/tcf/co/ecole/31-école-montrer-carte-d-identité.mp3',
  '/lib/audio/tcf/co/ecole/ecole-6.mp3': '/lib/audio/tcf/co/loisirs/07-loisirs-cours-de-tennis.mp3',
  '/lib/audio/tcf/co/ecole/comment-se-souviendra-notre.mp3': '/lib/audio/tcf/co/radio/10-radio-loisirs-préférés-des-adolescents.mp3',
  '/lib/audio/tcf/co/achats/14-achats-de-magasines.mp3': '/lib/audio/tcf/co/magasins/20-achats-de-magasines.mp3',
  '/lib/audio/tcf/co/vacances/le-sac-de-voyage.mp3': '/lib/audio/tcf/co/vacances/01-vacances-le-sac-de-voyage.mp3',
  '/lib/audio/tcf/co/loisirs/03-piscine-annonce-rappel-du-règlement.mp3': '/lib/audio/tcf/co/lieux-publics/03-piscine-annonce-rappel-du-règlement.mp3',
  '/lib/audio/tcf/co/loisirs/04-musée-annonce-rappel-du-règlement.mp3': '/lib/audio/tcf/co/lieux-publics/04-musée-annonce-rappel-du-règlement.mp3',
}
for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18]) {
  const nn = String(n).padStart(2, '0')
  const names = {
    1: '01-magasin-annonce-gagner-billet-cinéma.mp3',
    2: '02-magasin-annonce-promotion-télévision.mp3',
    3: '03-magasin-annonce-promotion-livres-de-recette.mp3',
    4: '04-magasin-annonce-fermeture-de-la-poste.mp3',
    5: '05-magasin-annonce-journée-de-la-femme.mp3',
    6: '06-magasin-annonce-offre-petit-déjeuner.mp3',
    7: '07-magasin-annonce-livraison-des-courses.mp3',
    8: '08-magasin-annonce-offre-incroyable.mp3',
    9: '09-magasin-annonce-printemps-du-cinéma.mp3',
    10: '10-magasin-annonce-nouveau-moyen-de-paiement.mp3',
    11: '11-magasin-annonce-remise-sur-les-bijoux.mp3',
    12: '12-magasin-annonce-enfant-perdu.mp3',
    13: '13-magasin-annonce-problème-de-caisse.mp3',
    15: '15-magasin-annonce-clé-retrouvé.mp3',
    16: '16-magasin-annonce-les-étages.mp3',
    17: '17-magasin-annonce-offre-électroménager.mp3',
    18: '18-magasin-annoncer-service-de-laverie.mp3',
  }
  PATHS[`/lib/audio/tcf/co/achats/${names[n]}`] = `/lib/audio/tcf/co/magasins/${names[n]}`
  void nn
}

const SCENARIO = {
  'tcf-ss-a2-s8-co-2': 'loisirs',
  'tcf-ss-b1-s2-co-4': 'radio',
  'tcf-ss-a1-s5-co-2': 'fetes',
  'tcf-ssx-a2-annonce-5-4-co-2': 'lieux-publics',
  'tcf-ssx-a2-annonce-7-2-co-2': 'lieux-publics',
}

const TEXT = {
  'tcf-ss-a1-s4-co-4':
    "Bonjour à tous ! Je suis votre professeur. Je m'appelle Naël Kervelek. Naël, N-A-E-L, c'est mon prénom. Et Kervelek, K-E-R-V-E-L-E-K, c'est mon nom. Je suis français et j'ai 34 ans.\n— Monsieur, vous pouvez répéter, s'il vous plaît ?",
  'tcf-ss-a2-s6-co-3':
    "Bonjour à tous ! Je suis votre professeur. Je m'appelle Naël Kervelek. Naël, N-A-E-L, c'est mon prénom. Et Kervelek, K-E-R-V-E-L-E-K, c'est mon nom. Je suis français et j'ai 34 ans.\n— Monsieur, vous pouvez répéter, s'il vous plaît ?",
  'tcf-ssx-a1-objet-18-co-1':
    "Bonjour, c'est Lidie. Pour le cours de dessin demain, le prof nous demande d'apporter des ciseaux et de la colle. Il faut aussi un grand cahier et des crayons de couleur. On va dessiner des fleurs. Ah oui, n'oublie pas ta règle. À demain.",
  'tcf-ss-a1-s5-co-2':
    "Coucou, c'est Claire !\nPour l'anniversaire de Bastien samedi, j'apporte son dessert préféré.\nUne tarte aux fraises, et aussi ma guitare.\nOn va jouer de la musique.\nTu peux prendre des jeux et des boissons ?\nBastien prépare des pizzas.\nBises, à samedi !",
  'tcf-a1-s1-co-5':
    "Allô ? Est-ce que tu peux m'aider à faire le sac pour ce week-end ?\nPrends des gants, s'il te plaît.\nIl faut aussi des serviettes.\nElles sont sur mon lit, dans ma chambre.\nMais aussi le dentifrice et les brosses à dents, dans le sac.\nPour nos vêtements, je vais apporter une valise.\nMerci.",
  'tcf-ss-a1-s5-co-1':
    "Situation numéro un.\n— Où sont les céréales ?\n— Au fond du magasin, madame.\n— D'accord, merci.\n\nSituation numéro deux.\n— Oh là là, où sont mes clés ?\n— Elles sont sur la table, comme d'habitude.\n\nSituation numéro trois.\n— Tu veux voir quel film ?\n— Je ne sais pas. Pourquoi pas une comédie ?\n— Une comédie… Pourquoi pas un film d'horreur ?\n— Ah non, je vais mal dormir cette nuit.\n\nSituation numéro quatre.\n— Qu'est-ce que tu veux manger ?\n— Je vais prendre un menu du jour.\n— Moi, je n'ai pas très faim. Je vais prendre un plat du jour.\n\nSituation numéro cinq.\n— Tu es prêt ?\n— Presque ! Je vais chercher mon casque.\n— Pas de problème, on a le temps.",
  'tcf-ss-a2-s8-co-1':
    "Dialogue 1.\n— Non, j'ai oublié mon livre de maths.\n— Je peux te prêter le mien, si tu veux.\n— Ah oui ! Merci, c'est très gentil.\n— Ne l'oublie pas la prochaine fois.\n\nDialogue 2.\n— On mange ensemble aujourd'hui à la cantine ?\n— Non, je ne peux pas. Je mange chez moi ce midi.\n— Ah, dommage. Une prochaine fois, alors.\n— Désolé. À plus tard.\n\nDialogue 3.\n— Monsieur, excusez-moi. Pourquoi devons-nous faire ces exercices pour mercredi ?\n— Nous devons les faire sur le livre ou sur le cahier ?\n— Sur le cahier, bien sûr.\n\nDialogue 4.\n— Qui est-ce qui t'accompagne mercredi au tournoi de basket ?\n— C'est mon père qui m'accompagne.\n— Tu crois que je pourrais venir avec vous ?\n— Oui, il y a de la place dans la voiture.",
}

function disk(publicPath) {
  return join(ROOT, 'public', publicPath.replace(/^\//, ''))
}

function concat(outPublic, parts) {
  const out = disk(outPublic)
  const args = []
  for (const p of parts) {
    const file = join(CO, p)
    if (!existsSync(file)) throw new Error('manque ' + file)
    args.push('-i', file)
  }
  const labels = parts.map((_, i) => `[${i}:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=mono[a${i}]`).join(';')
  const chain = parts.map((_, i) => `[a${i}]`).join('')
  args.push(
    '-filter_complex',
    `${labels};${chain}concat=n=${parts.length}:v=0:a=1[out]`,
    '-map',
    '[out]',
    '-y',
    out,
  )
  const r = spawnSync(FFMPEG, args, { encoding: 'utf8' })
  if (r.status !== 0) throw new Error(r.stderr?.slice(-800) || 'ffmpeg')
  console.log('concat', outPublic, parts.length)
}

concat('/lib/audio/tcf/co/ecole/ecole-4.mp3', [
  'ecole/39-école-fermeture-du-bâtiment-C.mp3',
  'ecole/40-école-concours-dessine-ton-école.mp3',
  'ecole/41-école-accueil-d-un-auteur.mp3',
  'ecole/42-école-alerte-au-feu.mp3',
  'ecole/43-école-absence-professeur-italien.mp3',
  'ecole/44-école-vente-de-livres.mp3',
])
concat('/lib/audio/tcf/co/ecole/ecole-5.mp3', [
  'ecole/33-école-horaire-cafétéria.mp3',
  'ecole/34-école-absence-professeur-histoire.mp3',
  'ecole/35-école-inscription-sortie-musée.mp3',
  'ecole/36-école-gagnant-concours-écriture.mp3',
  'ecole/37-école-activité-après-le-repas.mp3',
  'ecole/38-école-fermeture-de-la-bibliothèque.mp3',
])
concat('/lib/audio/tcf/co/ecole/paris-solidarite-rime-diversite-3.mp3', [
  'ecole/26-école-oublier-livre-mathématiques.mp3',
  'ecole/27-école-proposer-manger-cantine.mp3',
  'ecole/28-école-demander-explication-devoir.mp3',
  'ecole/29-école-tournoi-basketball.mp3',
])
concat('/lib/audio/tcf/co/ecole/paris-solidarite-rime-diversite-2.mp3', [
  'magasins/19-magasin-où-sont-céréales.mp3',
  'maison/01-maison-où-sont-clés.mp3',
  'lieux-publics/05-cinéma-quel-film-voir.mp3',
  'restaurant/02-restaurant-que-manger.mp3',
  'maison/02-maison-tu-es-prêt.mp3',
])

for (const level of ['a0-a1', 'a1-a2', 'a2-b1']) {
  const file = join(ROOT, 'src/tcf/content', level, 'co.json')
  const bank = JSON.parse(readFileSync(file, 'utf8'))
  let n = 0
  for (const ex of bank) {
    const audio = ex.support?.audio
    if (audio && PATHS[audio]) {
      const next = PATHS[audio]
      if (!existsSync(disk(next))) throw new Error('cible absente ' + next)
      ex.support.audio = next
      n++
    }
    if (SCENARIO[ex.id]) ex.scenario = SCENARIO[ex.id]
    if (TEXT[ex.id]) ex.support.transcription = TEXT[ex.id]
    if (ex.id === 'tcf-ss-a2-s7-co-2' || ex.id === 'tcf-ss-a2-s7-co-3') {
      const parts = ex.support.transcription.split(/\nAnnonce \d+\.\n/).slice(1)
      if (parts.length === 6) ex.support.transcription = parts.map((p) => p.trim()).join('\n\n')
    }
    if (ex.id === 'tcf-ss-a2-s8-co-2') {
      ex.support.transcription = ex.support.transcription
        .replace(
          /^Exercice 45\.\nLisez les questions\.\nÉcoutez l'enregistrement, puis répondez\.\nVous écoutez ce message de votre professeur de tennis sur votre répondeur\.\n/,
          '',
        )
        .replace(
          'Bonjour, c\'est votre professeur de tennis.',
          'Bonjour, c\'est Nathan, ton professeur de tennis.',
        )
    }
  }
  writeFileSync(file, JSON.stringify(bank, null, 2) + '\n', 'utf8')
  console.log(level, 'chemins', n)
}
