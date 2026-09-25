import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import AuthPanel from '../components/auth/AuthPanel'
import Chatbot from '../components/chat/Chatbot'
import CategoryLegend from '../components/globe/CategoryLegend'
import GlobeView, { type GlobeFocus } from '../components/globe/GlobeView'
import PlansModal from '../components/plans/PlansModal'
import SearchBar from '../components/search/SearchBar'
import SpeciesDetailPanel from '../components/species/SpeciesDetailPanel'
import { useGlobeMarkers } from '../hooks/useGlobeMarkers'
import type { GlobeMarker, SpeciesSummary } from '../types/api'

interface LocationState {
  /** Especie a la que volver desde la ficha ampliada (SRS 6.6). */
  focusSpeciesId?: string
}

/**
 * Pantalla principal de Nature Earth (SRS 3.1).
 *
 * El globo ES la interfaz: ocupa todo el viewport y todo lo demás flota
 * encima (login arriba-izquierda, búsqueda arriba-centro, detalle a la
 * derecha, chatbot abajo-derecha). No hay páginas de inicio separadas.
 */
export default function GlobeScreen() {
  const location = useLocation()
  const { markers, status, error, reload } = useGlobeMarkers()

  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(null)
  const [focus, setFocus] = useState<GlobeFocus | null>(null)
  const [plansOpen, setPlansOpen] = useState(false)
  const focusToken = useRef(0)
  const handledFocusRef = useRef<string | null>(null)

  /** Vuela el globo a una coordenada (SRS 6.1: animación de vuelo). */
  const flyTo = useCallback((lat: number, lng: number) => {
    focusToken.current += 1
    setFocus({ lat, lng, token: focusToken.current })
  }, [])

  /** Click en un marcador del globo. */
  const handleSelectMarker = useCallback(
    (marker: GlobeMarker) => {
      setSelectedSpeciesId(marker.speciesId)
      flyTo(marker.lat, marker.lng)
    },
    [flyTo],
  )

  /**
   * Búsqueda y chatbot llegan acá como `SpeciesSummary`: si la especie tiene
   * marcador en el globo, volamos hasta él y abrimos el detalle; si no, la
   * ficha se abre igual desde su posición actual.
   */
  const handleSelectSpecies = useCallback(
    (species: SpeciesSummary) => {
      setSelectedSpeciesId(species.id)
      const marker = markers.find((item) => item.speciesId === species.id)
      if (marker) flyTo(marker.lat, marker.lng)
    },
    [markers, flyTo],
  )

  /**
   * Vuelve desde `/especies/:id`: centra el globo en esa especie (SRS 6.6).
   *
   * Al volver, esta pantalla se monta de cero y los marcadores todavía no
   * llegaron del backend, así que el efecto espera a que estén disponibles.
   * `handledFocusRef` evita repetir el vuelo si más tarde cambia la lista.
   */
  useEffect(() => {
    const state = location.state as LocationState | null
    const speciesId = state?.focusSpeciesId
    if (!speciesId) return
    setSelectedSpeciesId(speciesId)
    const marker = markers.find((item) => item.speciesId === speciesId)
    if (marker && handledFocusRef.current !== speciesId) {
      handledFocusRef.current = speciesId
      flyTo(marker.lat, marker.lng)
    }
  }, [location.state, markers, flyTo])

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-espacio">
      {/* El globo ocupa todo el fondo. */}
      <GlobeView
        markers={markers}
        selectedId={selectedSpeciesId}
        focus={focus}
        onSelectMarker={handleSelectMarker}
        onGlobeBackgroundClick={() => setSelectedSpeciesId(null)}
      />

      {status === 'loading' ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="panel-vidrio flex items-center gap-2.5 rounded-2xl px-4 py-3 shadow-2xl">
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-borde border-t-acento"
            />
            <span className="text-xs text-texto-suave">Cargando el globo…</span>
          </div>
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-4">
          <div className="panel-vidrio flex max-w-sm flex-col items-center gap-2 rounded-2xl px-4 py-3 text-center shadow-2xl">
            <p className="text-xs text-red-300">{error}</p>
            <button type="button" onClick={reload} className="boton-secundario">
              Reintentar
            </button>
          </div>
        </div>
      ) : null}

      {/* Capa de overlays: no bloquea los clics que llegan al globo. */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {/*
          En pantallas chicas el acceso y la búsqueda se apilan (si no se
          pisan: ambos arrancan en la esquina superior izquierda). Desde `sm`
          el contenedor desaparece del layout y cada bloque se posiciona
          absoluto en su esquina, como manda el SRS 3.1.
        */}
        <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-col gap-2 sm:contents">
          {/* Autenticación: esquina superior izquierda (máx. 25% del ancho). */}
          <div className="pointer-events-auto w-full sm:absolute sm:left-4 sm:top-4 sm:w-[min(21rem,calc(100vw-1.5rem))]">
            <AuthPanel onOpenPlans={() => setPlansOpen(true)} />
          </div>

          {/* Búsqueda: arriba al centro. */}
          <div className="pointer-events-auto w-full sm:absolute sm:left-1/2 sm:top-4 sm:w-[min(34rem,calc(100vw-1.5rem))] sm:-translate-x-1/2">
            <div className="mx-auto w-full max-w-[30rem]">
              <SearchBar onSelectSpecies={handleSelectSpecies} />
            </div>
          </div>
        </div>

        {/* Leyenda de categorías: abajo a la izquierda. */}
        <div className="pointer-events-auto absolute bottom-4 left-3 sm:bottom-5 sm:left-4">
          <CategoryLegend />
        </div>

      </div>

      {/* Detalle de especie: panel deslizable sobre el globo. */}
      <div className="pointer-events-none absolute inset-0 z-30">
        <SpeciesDetailPanel
          speciesId={selectedSpeciesId}
          onClose={() => setSelectedSpeciesId(null)}
          onOpenPlans={() => setPlansOpen(true)}
        />
      </div>

      {/*
        Chatbot: esquina inferior derecha (SRS 3.1). Va en su propia capa por
        encima del detalle, porque el panel de ficha ocupa toda la franja
        derecha y no debe taparle el acceso al asistente.
      */}
      <div className="pointer-events-none absolute inset-0 z-40">
        <div className="pointer-events-auto absolute bottom-4 right-3 sm:bottom-5 sm:right-5">
          <Chatbot onSelectSpecies={handleSelectSpecies} />
        </div>
      </div>

      <PlansModal open={plansOpen} onClose={() => setPlansOpen(false)} />
    </div>
  )
}
