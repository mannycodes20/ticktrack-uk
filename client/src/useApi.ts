import { useEffect, useState } from 'react'
import { getJson } from './api'

type State<T> = { url: string | null; data?: T; error?: string }

// Loads JSON from a URL and reloads whenever the URL changes.
// Pass null to load nothing. Old requests are cancelled so a slow
// response can never overwrite a newer one.
export function useApi<T>(url: string | null) {
  const [state, setState] = useState<State<T>>({ url: null })

  useEffect(() => {
    if (url === null) return
    const controller = new AbortController()
    getJson<T>(url, controller.signal)
      .then((data) => setState({ url, data }))
      .catch((err: Error) => {
        if (err.name !== 'AbortError') setState({ url, error: err.message })
      })
    return () => controller.abort()
  }, [url])

  // Only trust the stored result if it belongs to the URL we are showing now
  const current = state.url === url
  return {
    data: current ? state.data : undefined,
    error: current ? state.error : undefined,
    loading: url !== null && !current,
  }
}