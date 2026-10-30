import type { SpeciesStat } from '../api'
import { SeasonChart } from './SeasonChart'
import { SpeciesCards } from './SpeciesCards'
import { TickTips } from './TickTips'

type Props = {
  species: SpeciesStat[]
  onShowOnMap: (species: string) => void
}

export function LearnSection({ species, onShowOnMap }: Props) {
  return (
    <section className="learn" id="learn" aria-labelledby="learn-title">
      <h2 id="learn-title">Learn about ticks</h2>
      <p className="learn-intro">
        Five types of tick turn up in the sightings data. Find out where each one lives, when ticks are reported
        most, and how to keep your pet safe.
      </p>

      <div className="tick-intro">
        <figure>
          <img src="/ticks/castor-bean-tick.webp" alt="A red and black castor bean tick on a white daisy petal" />
          <figcaption>A castor bean tick (Ixodes ricinus). Photo by Erik Karits on Unsplash.</figcaption>
        </figure>
        <div>
          <h3>What does a tick look like?</h3>
          <p>
            Ticks are tiny relatives of spiders, with eight legs and an oval body. Before feeding they are about the
            size of a sesame seed. Once they bite, they stay attached for several days and swell to the size of a pea.
          </p>
          <p>
            The tick in the photo is a castor bean tick, the one pet owners in the UK find most often. The guide
            below covers the five species that appear in the sightings data.
          </p>
        </div>
      </div>

      <h3>Tick species guide</h3>
      <SpeciesCards species={species} onShowOnMap={onShowOnMap} />

      <h3>When are ticks reported?</h3>
      <p>Sightings for each month of the year, across every year in the data.</p>
      <SeasonChart species={species} />

      <h3>How to protect your pet</h3>
      <TickTips />
    </section>
  )
}