import { useState, type FormEvent } from 'react'
import type { CityStat, SpeciesStat } from '../api'
import { useApi } from '../useApi'

type Props = {
  species: SpeciesStat[]
  onReported: (city: string) => void
}

type Fields = { species: string; observedAt: string; city: string; notes: string }
type Errors = Partial<Record<keyof Fields | 'form', string>>
type Spot = { latitude: number; longitude: number }

const EMPTY: Fields = { species: '', observedAt: '', city: '', notes: '' }
const MAX_NOTES = 500
const today = () => new Date().toISOString().slice(0, 10)

// Same rules as the server, checked first so people get instant feedback
function validate(f: Fields): Errors {
  const errors: Errors = {}
  if (!f.species) errors.species = 'Choose a species'
  if (!f.observedAt) errors.observedAt = 'Enter the date you saw it'
  else if (f.observedAt > today()) errors.observedAt = 'Date cannot be in the future'
  else if (f.observedAt < '2000-01-01') errors.observedAt = 'Date must be after 2000'
  if (!f.city) errors.city = 'Choose the nearest city'
  if (f.notes.length > MAX_NOTES) errors.notes = `Notes must be ${MAX_NOTES} characters or fewer`
  return errors
}

// Rough distance, good enough to pick the closest of 14 cities
function nearestCity(spot: Spot, cities: CityStat[]) {
  let best: CityStat | undefined
  let bestDistance = Infinity
  for (const c of cities) {
    const d = (c.lat - spot.latitude) ** 2 + ((c.lng - spot.longitude) * Math.cos((spot.latitude * Math.PI) / 180)) ** 2
    if (d < bestDistance) {
      best = c
      bestDistance = d
    }
  }
  return best?.city
}

export function ReportForm({ species, onReported }: Props) {
  // The cities the API accepts, with their centres for the location button
  const cityList = useApi<CityStat[]>('/api/stats/cities')
  const cities = [...(cityList.data ?? [])].sort((a, b) => a.city.localeCompare(b.city))

  const [fields, setFields] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [spot, setSpot] = useState<Spot | null>(null)
  const [locating, setLocating] = useState(false)
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState<string | null>(null)

  const set = (field: keyof Fields, value: string) => {
    setFields({ ...fields, [field]: value })
    setErrors({ ...errors, [field]: undefined })
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setErrors({ ...errors, city: 'Your browser cannot share its location. Choose a city instead.' })
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false)
        const here = { latitude: coords.latitude, longitude: coords.longitude }
        // Same box the server allows: roughly the UK
        const inUk = here.latitude >= 49.8 && here.latitude <= 60.9 && here.longitude >= -8.7 && here.longitude <= 1.8
        if (!inUk) {
          setErrors({ ...errors, city: 'Your location looks like it is outside the UK. Choose a city instead.' })
          return
        }
        setSpot(here)
        const city = nearestCity(here, cities)
        if (city) set('city', city)
      },
      () => {
        setLocating(false)
        setErrors({ ...errors, city: 'We could not get your location. Choose a city instead.' })
      },
    )
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    const found = validate(fields)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSending(true)
    try {
      const res = await fetch('/api/sightings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          species: fields.species,
          latinName: species.find((s) => s.species === fields.species)?.latinName ?? undefined,
          observedAt: fields.observedAt,
          city: fields.city,
          notes: fields.notes.trim() || undefined,
          ...spot,
        }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        // Put each server message next to the field it belongs to
        const fromServer: Errors = { form: body?.error?.message ?? `Could not send your report (${res.status})` }
        for (const d of body?.error?.details ?? []) fromServer[d.field as keyof Fields] = d.message
        setErrors(fromServer)
        return
      }
      setDone(fields.city)
      onReported(fields.city)
    } catch {
      setErrors({ form: 'Could not reach the server. Check your connection and try again.' })
    } finally {
      setSending(false)
    }
  }

  function reportAnother() {
    setFields(EMPTY)
    setSpot(null)
    setErrors({})
    setDone(null)
  }

  return (
    <section className="report" id="report" aria-labelledby="report-title">
      <div className="report-intro">
        <h2 id="report-title">Report a sighting</h2>
        <p>
          Found a tick on your pet, or spotted one on a walk? Tell us where and when. Your report is added to the map
          straight away and helps other pet owners near you.
        </p>
      </div>

      {done ? (
        <div className="report-card report-done" role="status">
          <h3>Thank you, your sighting has been added</h3>
          <p>
            We've added your report in <strong>{done}</strong> to the map.
          </p>
          <div className="report-actions">
            <a className="btn btn-filled" href="#map">See it on the map</a>
            <button className="btn btn-outline" onClick={reportAnother}>Report another</button>
          </div>
        </div>
      ) : (
        <form className="report-card" onSubmit={submit} noValidate>
          {errors.form && <p role="alert" className="error">{errors.form}</p>}

          <div className="field">
            <label htmlFor="r-species">Species</label>
            <select
              id="r-species"
              value={fields.species}
              onChange={(e) => set('species', e.target.value)}
              aria-invalid={!!errors.species}
              aria-describedby={errors.species ? 'r-species-error' : undefined}
            >
              <option value="">Choose a species</option>
              {species.map((s) => (
                <option key={s.species} value={s.species}>
                  {s.species}
                </option>
              ))}
            </select>
            {errors.species && <p className="field-error" id="r-species-error">{errors.species}</p>}
          </div>

          <div className="field">
            <label htmlFor="r-date">Date seen</label>
            <input
              id="r-date"
              type="date"
              min="2000-01-01"
              max={today()}
              value={fields.observedAt}
              onChange={(e) => set('observedAt', e.target.value)}
              aria-invalid={!!errors.observedAt}
              aria-describedby={errors.observedAt ? 'r-date-error' : undefined}
            />
            {errors.observedAt && <p className="field-error" id="r-date-error">{errors.observedAt}</p>}
          </div>

          <div className="field">
            <label htmlFor="r-city">Nearest city</label>
            <div className="city-row">
              <select
                id="r-city"
                value={fields.city}
                onChange={(e) => {
                  setSpot(null)
                  set('city', e.target.value)
                }}
                aria-invalid={!!errors.city}
                aria-describedby={errors.city ? 'r-city-error' : undefined}
              >
                <option value="">Choose a city</option>
                {cities.map((c) => (
                  <option key={c.city} value={c.city}>
                    {c.city}
                  </option>
                ))}
              </select>
              <button type="button" className="btn btn-outline" onClick={useMyLocation} disabled={locating}>
                {locating ? 'Finding you…' : 'Use my location'}
              </button>
            </div>
            {spot && <p className="field-hint">Using your exact location, nearest city {fields.city}.</p>}
            {errors.city && <p className="field-error" id="r-city-error">{errors.city}</p>}
          </div>

          <div className="field">
            <label htmlFor="r-notes">
              Notes <span className="optional">(optional)</span>
            </label>
            <textarea
              id="r-notes"
              rows={4}
              value={fields.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="For example: found on my dog's ear after a walk in long grass"
              aria-invalid={!!errors.notes}
              aria-describedby="r-notes-count"
            />
            <p className={fields.notes.length > MAX_NOTES ? 'field-error' : 'field-hint'} id="r-notes-count">
              {fields.notes.length} / {MAX_NOTES} characters
            </p>
            {errors.notes && <p className="field-error">{errors.notes}</p>}
          </div>

          <button className="btn btn-filled report-submit" type="submit" disabled={sending}>
            {sending ? 'Sending…' : 'Submit sighting'}
          </button>
        </form>
      )}
    </section>
  )
}