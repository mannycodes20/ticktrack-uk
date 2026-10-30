import type { SpeciesStat } from '../api'
import { SPECIES_GUIDE } from '../species'

type Props = {
  species: SpeciesStat[]
  onShowOnMap: (species: string) => void
}

export function SpeciesCards({ species, onShowOnMap }: Props) {
  return (
    <div className="species-grid">
      {species.map((s) => {
        const guide = SPECIES_GUIDE[s.species]
        return (
          <article className="species-card" key={s.species}>
            <h4>{s.species}</h4>
            {s.latinName && <p className="latin">{s.latinName}</p>}
            {guide ? (
              <dl>
                <dt>Lives in</dt>
                <dd>{guide.lives}</dd>
                <dt>Feeds on</dt>
                <dd>{guide.feeds}</dd>
                <dt>Pets</dt>
                <dd>{guide.pets}</dd>
              </dl>
            ) : (
              <p>We don't have guide notes for this species yet.</p>
            )}
            <p className="species-count">{s.count.toLocaleString('en-GB')} sightings reported</p>
            <button className="btn btn-outline" onClick={() => onShowOnMap(s.species)}>
              Show on map
            </button>
          </article>
        )
      })}
    </div>
  )
}