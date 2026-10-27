import { interactionColumns, roleLabel } from '@/tcf/interaction-lines'
import type { TcfPoImageInteraction } from '@/tcf/types'

/** Corrigé d’interaction : page A4 séparée, deux colonnes selon les rôles du scénario. */
export function InteractionCorrigeSheet({ exercise }: { exercise: TcfPoImageInteraction }) {
  const s = exercise.support
  const { staff, guest } = interactionColumns(exercise)
  const scene = exercise.scene || exercise.theme || 'Interaction'
  return (
    <article className="worksheet-sheet sheet-even tcf-interaction-sheet">
      <div className="sheet-body">
        <p className="tcf-po-theme">Interaction — {scene}</p>
        <p className="tcf-text">
          Je suis {s.je_suis}. Vous êtes {s.vous_etes}. Nous sommes {s.lieu}. Vous voulez {s.vous_voulez}.
        </p>
        <div className="tcf-interaction-cols">
          <section>
            <b>{roleLabel(s.je_suis)}</b>
            <ul>
              {staff.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </section>
          <section>
            <b>{roleLabel(s.vous_etes)}</b>
            <ul>
              {guest.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </article>
  )
}
