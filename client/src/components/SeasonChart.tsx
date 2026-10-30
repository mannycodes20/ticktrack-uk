import { useState } from 'react'
import { apiUrl, type SpeciesStat } from '../api'
import { useApi } from '../useApi'

type MonthCount = { month: number; count: number }

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function SeasonChart({ species }: { species: SpeciesStat[] }) {
  const [chosen, setChosen] = useState('')
  const { data, error, loading } = useApi<MonthCount[]>(apiUrl('/api/stats/seasonal', { species: chosen }))

  const months = data ?? []
  const highest = Math.max(1, ...months.map((m) => m.count))
  const busiest = months.reduce<MonthCount | null>((best, m) => (best && best.count >= m.count ? best : m), null)
  const thisMonth = new Date().getMonth() + 1

  return (
    <div className="season">
      <label className="season-filter">
        Species
        <select value={chosen} onChange={(e) => setChosen(e.target.value)}>
          <option value="">All species</option>
          {species.map((s) => (
            <option key={s.species} value={s.species}>
              {s.species}
            </option>
          ))}
        </select>
      </label>

      {error && <p role="alert" className="error">Could not load the seasonal data: {error}</p>}

      <ol className="bars" aria-busy={loading}>
        {months.map((m) => (
          <li key={m.month} className={m.month === thisMonth ? 'now' : undefined}>
            <span className="bar-count">{m.count}</span>
            {/* Bar height is the month's share of the busiest month */}
            <span className="bar" style={{ height: `${(m.count / highest) * 100}%` }} aria-hidden />
            <span className="bar-month" aria-hidden>{MONTHS[m.month - 1].slice(0, 3)}</span>
            <span className="visually-hidden">{MONTHS[m.month - 1]}: {m.count} sightings</span>
          </li>
        ))}
      </ol>

      {busiest && busiest.count > 0 && (
        <p aria-live="polite">
          The busiest month is <strong>{MONTHS[busiest.month - 1]}</strong> with {busiest.count} sightings. This month
          is highlighted in orange.
        </p>
      )}
    </div>
  )
}