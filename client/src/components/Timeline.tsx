import { apiUrl, type Filters } from '../api'
import { useApi } from '../useApi'

type Trends = { interval: string; data: { period: string; count: number }[] }

type Props = {
  place: string
  cities: string[]
  filters: Filters
}

// Sightings per year for the chosen area, so you can see if activity is rising or falling
export function Timeline({ place, cities, filters }: Props) {
  const { data, error, loading } = useApi<Trends>(
    cities.length > 0 ? apiUrl('/api/stats/trends', { ...filters, interval: 'month', city: cities.join(',') }) : null,
  )

  // The API gives months like "2023-04"; add them up into years
  const byYear = new Map<number, number>()
  for (const { period, count } of data?.data ?? []) {
    const year = Number(period.slice(0, 4))
    byYear.set(year, (byYear.get(year) ?? 0) + count)
  }
  // Fill in quiet years with 0 so the timeline has no gaps
  const years = [...byYear.keys()]
  const first = Math.min(...years)
  const last = Math.max(...years)
  const rows = years.length === 0 ? [] : Array.from({ length: last - first + 1 }, (_, i) => ({ year: first + i, count: byYear.get(first + i) ?? 0 }))
  const highest = Math.max(1, ...rows.map((r) => r.count))
  const busiest = rows.reduce<(typeof rows)[number] | null>((best, r) => (best && best.count >= r.count ? best : r), null)

  return (
    <div className="timeline">
      <h4>Tick activity over time</h4>
      {error && <p role="alert" className="error">Could not load the timeline: {error}</p>}
      {loading && <p>Loading…</p>}
      {rows.length > 0 && (
        <>
          <ol className="timeline-bars" aria-label={`Sightings per year in ${place}`}>
            {rows.map((r) => (
              <li key={r.year}>
                <span className="timeline-bar" style={{ height: `${(r.count / highest) * 100}%` }} aria-hidden />
                <span className="visually-hidden">{r.year}: {r.count} sightings</span>
              </li>
            ))}
          </ol>
          <div className="timeline-axis" aria-hidden>
            <span>{first}</span>
            <span>{last}</span>
          </div>
          {busiest && (
            <p className="timeline-note">
              Busiest year: <strong>{busiest.year}</strong> with {busiest.count} sightings.
            </p>
          )}
        </>
      )}
      {!loading && !error && rows.length === 0 && <p>No sightings match these filters.</p>}
    </div>
  )
}