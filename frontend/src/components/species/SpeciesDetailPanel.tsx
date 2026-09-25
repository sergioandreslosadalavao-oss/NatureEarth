import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchSpecies } from '../../api/species'
import { apiErrorMessage } from '../../api/client'
import type { SpeciesDetail } from '../../types/api'
import { useAuthStore } from '../../store/authStore'
import SpeciesFields from './SpeciesFields'

interface SpeciesDetailPanelProps {
  speciesId: string | null
  onClose: () => void
  /** Abre el panel de planes (para los campos bloqueados del plan Casual). */
  onOpenPlans: () => void
}

/**
 * Detalle de especie como panel deslizable sobre el globo (SRS 3.1 y 6.6).
 * Es el acceso principal a una especie: se abre al hacer click en un
 * marcador del globo o al elegir un resultado de la búsqueda.
 */
export default function SpeciesDetailPanel({
  speciesId,
  onClose,
  onOpenPlans,
}: SpeciesDetailPanelProps) {
  const navigate = useNavigate()
  // El plan forma parte de la consulta: al mejorar el plan, la ficha abierta
  // se vuelve a pedir al backend y muestra los campos nuevos sin recargar.
  const plan = useAuthStore((state) => state.user?.plan ?? null)
  const [species, setSpecies] = useState<SpeciesDetail | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!speciesId) {
      setSpecies(null)
      setStatus('idle')
      return
    }

    let cancelled = false
    setStatus('loading')
    setError(null)
    // El mismo cliente axios adjunta el token si hay sesión: el backend
    // decide qué campos devolver según el plan (SRS 7.4).
    fetchSpecies(speciesId)
      .then((detail) => {
        if (cancelled) return
        setSpecies(detail)
        setStatus('idle')
      })
      .catch((cause) => {
        if (cancelled) return
        setStatus('error')
        setError(apiErrorMessage(cause, 'No pudimos cargar la ficha de la especie.'))
      })

    return () => {
      cancelled = true
    }
  }, [speciesId, plan])

  // Escape cierra el panel.
  useEffect(() => {
    if (!speciesId) return
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [speciesId, onClose])

  const isOpen = speciesId != null

  return (
    <aside
        // `inert` saca el panel cerrado del tab order y del árbol de
        // accesibilidad sin desmontarlo, para que el deslizamiento se vea.
        inert={!isOpen}
        aria-label="Detalle de la especie"
        className={`panel-vidrio absolute bottom-0 right-0 top-0 z-30 flex w-full max-w-[26rem] flex-col rounded-l-3xl shadow-2xl transition-transform duration-300 ease-out sm:max-w-[27rem] ${
          isOpen ? 'pointer-events-auto translate-x-0' : 'pointer-events-none translate-x-full'
        }`}
      >
        <header className="flex items-start gap-3 border-b border-borde/70 p-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-texto-suave">
              Ficha de especie
            </p>
            <h2 className="mt-0.5 truncate text-base font-semibold text-texto">
              {species?.commonNameEs ?? 'Cargando…'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-borde p-1.5 text-texto-suave transition-colors hover:border-red-500/50 hover:text-red-400"
            aria-label="Cerrar detalle"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div className="scroll-fino flex-1 overflow-y-auto p-4">
          {status === 'loading' ? (
            <div className="flex h-40 items-center justify-center">
              <span
                aria-hidden="true"
                className="h-6 w-6 animate-spin rounded-full border-2 border-borde border-t-acento"
              />
            </div>
          ) : status === 'error' ? (
            <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </p>
          ) : species ? (
            <div className="flex flex-col gap-4">
              {species.imageUrl ? (
                <img
                  src={species.imageUrl}
                  alt={species.commonNameEs}
                  className="h-44 w-full rounded-2xl border border-borde object-cover"
                />
              ) : null}

              <SpeciesFields species={species} />

              {species.plan === 'CASUAL' && plan !== 'STUDENT' && plan !== 'RESEARCHER' ? (
                <div className="rounded-2xl border border-acento/30 bg-acento/5 p-3">
                  <p className="text-xs font-medium text-texto">
                    Tu plan Casual muestra la información básica
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-texto-suave">
                    Con el plan Estudiante desbloqueás fisionomía, hábitat, alimentación y estado
                    de conservación IUCN. Con el Investigador, además, población, amenazas y papers.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenPlans}
                    className="boton-primario mt-2 w-full"
                  >
                    Ver planes
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {species ? (
          <footer className="border-t border-borde/70 p-3">
            <button
              type="button"
              onClick={() => navigate(`/especies/${species.id}`)}
              className="boton-secundario w-full"
            >
              Ver ficha completa →
            </button>
          </footer>
        ) : null}
    </aside>
  )
}
