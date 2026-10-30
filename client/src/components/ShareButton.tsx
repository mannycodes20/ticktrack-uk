import { useState } from 'react'

type Props = { region: string; city?: string | null }

// Shares a link that opens the site on this region (and city).
// Uses the phone's share sheet when there is one, otherwise copies the link.
export function ShareButton({ region, city }: Props) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const params = new URLSearchParams({ region })
    if (city) params.set('city', city)
    const url = `${window.location.origin}${window.location.pathname}?${params}#map`
    const title = `Tick sightings in ${city ?? region}`

    if (navigator.share) {
      // People can close the share sheet without sharing, which throws; that's fine
      await navigator.share({ title, url }).catch(() => {})
      return
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <button className="btn btn-outline share-button" onClick={share}>
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
        <path d="M12 3v12M7 8l5-5 5 5M5 13v6h14v-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span aria-live="polite">{copied ? 'Link copied' : 'Share'}</span>
    </button>
  )
}