import { useCallback, useEffect, useState } from 'react'
import { fetchGlobeMarkers } from '../api/species'
import { apiErrorMessage } from '../api/client'
import type { GlobeMarker } from '../types/api'

type Status = 'loading' | 'ready' | 'error'

/**
 * Carga los marcadores reales del globo desde GET /api/globe/markers.
 * Vive en un hook para que la pantalla principal sea la única dueña del
 * estado: el globo, la búsqueda y la leyenda comparten la misma lista.
 */
export function useGlobeMarkers() {
  const [markers, setMarkers] = useState<GlobeMarker[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const data = await fetchGlobeMarkers()
      setMarkers(data)
      setStatus('ready')
    } catch (cause) {
      setError(apiErrorMessage(cause, 'No pudimos cargar los marcadores del globo.'))
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { markers, status, error, reload: load }
}
