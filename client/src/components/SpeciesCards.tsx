import { useEffect, useRef, useState } from 'react'
import type { SpeciesStat } from '../api'
import { SPECIES_GUIDE } from '../species'

type Props = {
  species: SpeciesStat[]
  onShowOnMap: (species: string) => void
}

// One solid colour per card, taken in turn from the site's blues
const COLOURS = ['#003be8', '#0b1f44', '#2b6cd8', '#1a3a8f', '#5b8cff']

export function SpeciesCards({ species, onShowOnMap }: Props) {
  const track = useRef<HTMLUListElement>(null)
  const [current, setCurrent] = useState(0)
  const [perView, setPerView] = useState(3)

  // How many cards fit side by side (3, 2 or 1 depending on screen width).
  // Re-measured whenever the row changes size.
  useEffect(() => {
    const row = track.current
    if (!row) return
    const observer = new ResizeObserver(() => {
      const first = row.children[0] as HTMLElement | undefined
      if (first) setPerView(Math.max(1, Math.round(row.clientWidth / (first.offsetWidth + 24))))
    })
    observer.observe(row)
    return () => observer.disconnect()
  }, [species.length])

  // With 5 cards and 3 on screen there are only 3 places to scroll to
  const stops = Math.max(1, species.length - perView + 1)

  // Scroll the row so card number `i` is at the left edge
  function goTo(i: number) {
    const row = track.current
    const card = row?.children[i] as HTMLElement | undefined
    if (row && card) row.scrollTo({ left: card.offsetLeft - row.offsetLeft, behavior: 'smooth' })
  }

  // Work out which card is first in view, for the dots
  function onScroll() {
    const row = track.current
    const first = row?.children[0] as HTMLElement | undefined
    if (row && first) setCurrent(Math.round(row.scrollLeft / (first.offsetWidth + 24)))
  }

  return (
    <div className="carousel">
      <ul className="species-row" ref={track} onScroll={onScroll} aria-label="Tick species">
        {species.map((s, i) => {
          const guide = SPECIES_GUIDE[s.species]
          return (
            <li className="species-card" key={s.species}>
              <div className="species-art" style={{ background: COLOURS[i % COLOURS.length] }}>
                {guide?.image && (
                  <img className="species-photo" src={guide.image} alt={`${s.species} (${s.latinName ?? 'tick'})`} />
                )}
                {guide?.credit && <span className="photo-credit">{guide.credit}</span>}
                <h4>{s.species}</h4>
                {s.latinName && <p className="latin">{s.latinName}</p>}
              </div>
              <div className="species-body">
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
                <button className="btn btn-filled" onClick={() => onShowOnMap(s.species)}>
                  Show on map
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="carousel-controls">
        <button className="arrow" onClick={() => goTo(Math.max(0, current - 1))} aria-label="Previous species">
          ←
        </button>
        <div className="dots">
          {Array.from({ length: stops }, (_, i) => (
            <button
              key={i}
              className={i === current ? 'dot active' : 'dot'}
              onClick={() => goTo(i)}
              aria-label={`Go to position ${i + 1} of ${stops}`}
              aria-current={i === current}
            />
          ))}
        </div>
        <button className="arrow" onClick={() => goTo(Math.min(stops - 1, current + 1))} aria-label="Next species">
          →
        </button>
      </div>
    </div>
  )
}