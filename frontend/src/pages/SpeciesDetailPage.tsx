import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiErrorMessage } from '../api/client'
import { fetchSpecies } from '../api/species'
import { CATEGORY_META, PLAN_META } from '../lib/categories'
import { iucnMeta } from '../lib/iucn'
import SpeciesFields from '../components/species/SpeciesFields'
import { useAuthStore } from '../store/authStore'
import type { SpeciesDetail } from '../types/api'

/**
 * Ficha ampliada de especie en `/especies/:id` (SRS 6.6).
 *
 * El acceso principal a una especie sigue siendo el marcador del globo;
 * esta ruta sirve para la vista completa y para volver al globo con la
 * especie ya seleccionada.
 */
export default function SpeciesDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const plan = useAuthStore((state) => state.user?.plan ?? null)

  const [species, setSpecies] = useState<SpeciesDetail | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setStatus('loading')
    // El cliente axios adjunta el token si hay sesión: el backend decide
    // el nivel de detalle según el plan (SRS 7.4).
    fetchSpecies(id)
      .then((detail) => {
        if (cancelled) return
        setSpecies(detail)
        setStatus('ready')
      })
      .catch((cause) => {
        if (cancelled) return
        setError(apiErrorMessage(cause, 'No pudimos cargar la ficha de la especie.'))
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const meta = species ? CATEGORY_META[species.category] : null
  const conservation = iucnMeta(species?.conservationStatus)

  return (
    <div className="min-h-screen w-full bg-espacio">
      <header className="sticky top-0 z-10 border-b border-borde bg-espacio/85 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate('/', { state: { focusSpeciesId: id } })}
            className="boton-secundario shrink-0"
          >
            ← Volver al globo
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-texto">
              {species?.commonNameEs ?? 'Ficha de especie'}
            </p>
            {species ? (
              <p className="cientifico truncate text-xs text-texto-suave">{species.scientificName}</p>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-col gap-5 px-4 py-6">
        {status === 'loading' ? (
          <div className="flex h-48 items-center justify-center">
            <span
              aria-hidden="true"
              className="h-6 w-6 animate-spin rounded-full border-2 border-borde border-t-acento"
            />
          </div>
        ) : status === 'error' ? (
          <div className="flex flex-col items-start gap-3">
            <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </p>
            <button type="button" onClick={() => navigate('/')} className="boton-secundario">
              Volver al globo
            </button>
          </div>
        ) : species && meta ? (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {species.imageUrl ? (
                <img
                  src={species.imageUrl}
                  alt={species.commonNameEs}
                  className="h-44 w-full rounded-2xl border border-borde object-cover sm:h-36 sm:w-56"
                />
              ) : null}

              <div className="flex flex-1 flex-col gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`rounded-full border px-2.5 py-0.5 text-[11px] ${meta.chipClass}`}>
                    {meta.emoji} {meta.label}
                  </span>
                  {species.conservationStatus ? (
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${conservation.chipClass}`}
                    >
                      IUCN {conservation.label} · {conservation.description}
                    </span>
                  ) : null}
                  <span className="rounded-full border border-borde px-2.5 py-0.5 text-[11px] text-texto-suave">
                    Plan {PLAN_META[species.plan].label}
                  </span>
                </div>

                <SpeciesFields species={species} />
              </div>
            </div>

            {/*
              Los campos bloqueados no llegan desde el backend, así que no se
              inventan: sólo se informa qué habilita cada plan cuando el
              usuario todavía no lo tiene.
            */}
            {plan === 'CASUAL' ? (
              <section className="rounded-2xl border border-borde bg-superficie/40 p-4">
                <h2 className="text-sm font-semibold text-texto">
                  Hay más información de esta especie en los planes pagos
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-texto-suave">
                  El plan Estudiante suma fisionomía, hábitat, alimentación, estado de conservación
                  IUCN y el chatbot asistente. El plan Investigador agrega población estimada,
                  amenazas, taxonomía NCBI, papers y protocolos de cuidados.
                </p>
                <button type="button" onClick={() => navigate('/')} className="boton-secundario mt-3">
                  Explorar el globo
                </button>
              </section>
            ) : null}

            <footer className="border-t border-borde pt-4">
              <button
                type="button"
                onClick={() => navigate('/', { state: { focusSpeciesId: species.id } })}
                className="boton-secundario"
              >
                ← Volver al globo con esta especie seleccionada
              </button>
            </footer>
          </>
        ) : null}
      </main>
    </div>
  )
}
