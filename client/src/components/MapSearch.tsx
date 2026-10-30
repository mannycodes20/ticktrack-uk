import { useState } from 'react'

type Props = {
  places: string[]
  onFound: (place: string) => void
}

export function MapSearch({ places, onFound }: Props) {
  const [text, setText] = useState('')
  const [notFound, setNotFound] = useState(false)

  function search(e: React.FormEvent) {
    e.preventDefault()
    // Match the typed name to a city or region, ignoring upper or lower case
    const match = places.find((p) => p.toLowerCase() === text.trim().toLowerCase())
    setNotFound(!match)
    if (match) onFound(match)
  }

  return (
    <form className="map-search" role="search" onSubmit={search}>
      <label htmlFor="place-search" className="visually-hidden">Search for a city or region</label>
      <input
        id="place-search"
        list="place-names"
        placeholder="Search a city or region, e.g. Leeds"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <datalist id="place-names">
        {places.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
      <button type="submit">Search</button>
      {notFound && <p role="alert" className="search-error">We don't have data for that place yet.</p>}
    </form>
  )
}