import { useState } from 'react'
import { apiUrl, type CityStat, type Filters as FilterValues, type SpeciesStat } from './api'
import { FilterBar } from './components/FilterBar'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { InsightPanel } from './components/InsightPanel'
import { Legend } from './components/Legend'
import { MapSearch } from './components/MapSearch'
import { TickMap } from './components/TickMap'
import { VetBand } from './components/VetBand'
import { REGION_CITIES, regionOf, regionStats } from './regions'
import { useApi } from './useApi'

function App() {
  const [filters, setFilters] = useState<FilterValues>({})
  const [region, setRegion] = useState<string | null>(null)
  const [city, setCity] = useState<string | null>(null)

  // Species for the dropdown, and city counts that follow the filters
  const species = useApi<SpeciesStat[]>('/api/stats/species')
  const cityStats = useApi<CityStat[]>(apiUrl('/api/stats/cities', filters))

  const cities = cityStats.data ?? []
  const regions = regionStats(cities)
  const total = cities.reduce((sum, c) => sum + c.count, 0)
  // Every region and city name once (London is both)
  const places = [...new Set([...Object.keys(REGION_CITIES), ...cities.map((c) => c.city)])].sort()

  function chooseRegion(name: string | null) {
    setRegion(name)
    setCity(null)
  }

  // A city also selects its region, so the map zooms there
  function choosePlace(name: string) {
    if (name in REGION_CITIES) chooseRegion(name)
    else {
      setRegion(regionOf(name))
      setCity(name)
    }
  }
  const error = cityStats.error ?? species.error

  return (
    <>
      <Header />
      <main>
        <Hero />

        <h2 className="intro">
          TickTrack, <em>a free map of tick sightings</em>, shows where ticks are being found across the UK.
        </h2>

        <section className="tracker" id="map" aria-label="Tick sightings map">
          <div className="map-wrap">
            <TickMap regions={regions} selected={region} onSelect={chooseRegion} />
            <MapSearch places={places} onFound={choosePlace} />
            <Legend />
          </div>

          <aside className="side">
            <div className="side-banner">
              <svg viewBox="0 0 24 34" aria-hidden className="pin">
                <path d="M12 1a11 11 0 0 0-11 11c0 8 11 21 11 21s11-13 11-21A11 11 0 0 0 12 1z" fill="none" stroke="#fff" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" fill="none" stroke="#fff" strokeWidth="2" />
              </svg>
              <h2>Are ticks active near you?</h2>
            </div>
            <div className="side-body">
              <div className="side-actions">
                <a className="btn btn-filled" href="#report">Report a sighting</a>
                <a className="btn btn-outline" href="#learn">Learn about ticks</a>
              </div>
              <p>Click on your region in the map to see the number of tick sightings reported there.</p>

              <FilterBar value={filters} species={species.data ?? []} onChange={setFilters} />
              {error && <p role="alert" className="error">Could not load data: {error}. Is the server running?</p>}
              <p className="total" aria-live="polite">
                {cityStats.loading ? 'Updating…' : `${total.toLocaleString('en-GB')} sightings shown`}
              </p>

              <InsightPanel
                regions={regions}
                region={region}
                city={city}
                filters={filters}
                onRegion={chooseRegion}
                onCity={setCity}
              />
            </div>
          </aside>
        </section>

        <VetBand />
      </main>
      <Footer />
    </>
  )
}

export default App