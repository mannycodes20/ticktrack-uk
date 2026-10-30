export type Filters = {
  species?: string
  from?: string
  to?: string
}

export type CityStat = {
  city: string
  count: number
  lastSeen: string | null
  lat: number
  lng: number
}

export type SpeciesStat = {
  species: string
  latinName: string | null
  count: number
}

export type Sighting = {
  id: string
  source: 'ELANCO' | 'USER'
  species: string
  latinName: string | null
  observedAt: string
  city: string
  notes: string | null
}

export type SightingPage = {
  data: Sighting[]
  page: number
  limit: number
  total: number
}

// Builds a URL like /api/sightings?city=Leeds&species=Marsh+tick, skipping empty values
export function apiUrl(path: string, params: Record<string, string | number | undefined> = {}) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') query.set(key, String(value))
  }
  const qs = query.toString()
  return qs ? `${path}?${qs}` : path
}

// Fetches JSON and turns our API's error shape into a readable Error
export async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(body?.error?.message ?? `Request failed (${res.status})`)
  }
  return body as T
}