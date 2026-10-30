import { activityLevel } from '../activity'
import { apiUrl, type Filters, type SightingPage } from '../api'
import type { RegionStat } from '../regions'
import { useApi } from '../useApi'

type Props = {
  regions: RegionStat[]
  region: string | null
  city: string | null
  filters: Filters
  onRegion: (region: string | null) => void
  onCity: (city: string | null) => void
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

// The big number and risk sentence, used for both regions and cities
function Summary({ place, count, lastSeen }: { place: string; count: number; lastSeen?: string | null }) {
  return (
    <>
      <div className="summary">
        <h3>{place}</h3>
        <p className="big-number">{count}</p>
        <p>tick sightings reported</p>
      </div>
      <p className="risk">
        There is currently a <strong>{activityLevel(count).label.toLowerCase()}</strong> risk of ticks in {place}.
        {lastSeen && <> The most recent sighting was on {formatDate(lastSeen)}.</>}
      </p>
    </>
  )
}

export function InsightPanel({ regions, region, city, filters, onRegion, onCity }: Props) {
  // Latest 20 sightings for the chosen city, using the same filters as the map
  const sightings = useApi<SightingPage>(city ? apiUrl('/api/sightings', { ...filters, city, limit: 20 }) : null)
  const current = regions.find((r) => r.region === region)

  // 1. Nothing chosen: every region, busiest first, which also works with a keyboard
  if (!current) {
    const sorted = [...regions].sort((a, b) => b.count - a.count)
    return (
      <div className="insights">
        <h3>Sightings by region</h3>
        <PlaceList items={sorted.map((r) => ({ name: r.region, count: r.count }))} onPick={onRegion} />
      </div>
    )
  }

  // 2. A region: its total, then its cities
  const cityStat = current.cities.find((c) => c.city === city)
  if (!cityStat) {
    const lastSeen = current.cities.map((c) => c.lastSeen ?? '').sort().pop()
    return (
      <div className="insights" aria-live="polite">
        <button className="link-button" onClick={() => onRegion(null)}>← All regions</button>
        <Summary place={current.region} count={current.count} lastSeen={lastSeen} />
        {current.cities.length > 0 ? (
          <>
            <h4>Cities in this region</h4>
            <PlaceList items={current.cities.map((c) => ({ name: c.city, count: c.count }))} onPick={onCity} />
          </>
        ) : (
          <p>We don't have any sightings from this region yet.</p>
        )}
      </div>
    )
  }

  // 3. A city: its total and its latest sightings
  const page = sightings.data
  return (
    <div className="insights" aria-live="polite">
      <button className="link-button" onClick={() => onCity(null)}>← Back to {current.region}</button>
      <Summary place={cityStat.city} count={cityStat.count} lastSeen={cityStat.lastSeen} />

      {sightings.error && <p role="alert" className="error">Could not load sightings: {sightings.error}</p>}
      {sightings.loading && <p>Loading…</p>}

      {page && page.data.length > 0 && (
        <>
          <h4>Latest {page.data.length} of {page.total}</h4>
          <ul className="sightings">
            {page.data.map((s) => (
              <li key={s.id}>
                <div className="species">
                  {s.species}
                  {s.latinName && <em> ({s.latinName})</em>}
                </div>
                <div className="meta">
                  {formatDate(s.observedAt)} · {s.source === 'USER' ? 'Reported by a user' : 'Elanco data'}
                </div>
                {s.notes && <div className="notes">{s.notes}</div>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function PlaceList({ items, onPick }: { items: { name: string; count: number }[]; onPick: (name: string) => void }) {
  return (
    <ul className="place-list">
      {items.map((item) => (
        <li key={item.name}>
          <button onClick={() => onPick(item.name)}>
            <span className="swatch" style={{ background: activityLevel(item.count).color }} aria-hidden />
            {item.name}
            <span className="count">{item.count}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}