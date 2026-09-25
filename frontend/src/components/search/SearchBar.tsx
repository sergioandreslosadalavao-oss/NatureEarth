import { useEffect, useRef, useState } from 'react'
import { listSpecies } from '../../api/species'
import { apiErrorMessage } from '../../api/client'
import { CATEGORIES, CATEGORY_META } from '../../lib/categories'
import type { SpeciesCategory, SpeciesSummary } from '../../types/api'

const DEBOUNCE_MS = 300
const MAX_RESULTS = 8

interface SearchBarProps {
  /** Se dispara al elegir un resultado: vuela el globo y abre el detalle. */
  onSelectSpecies: (species: SpeciesSummary) => void
}

export default function SearchBar({ onSelectSpecies }: SearchBarProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<SpeciesCategory | ''>('')
  const [results, setResults] = useState<SpeciesSummary[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Búsqueda en vivo con debounce de 300 ms (SRS 6.5).
  useEffect(() => {
    const term = search.trim()
    if (!term && !category) {
      setResults([])
      setStatus('idle')
      return
    }

    let cancelled = false
    setStatus('loading')
    const timer = setTimeout(() => {
      listSpecies({ search: term, category, size: MAX_RESULTS })
        .then((page) => {
          if (cancelled) return
          setResults(page.content)
          setStatus('idle')
          setError(null)
        })
        .catch((cause) => {
          if (cancelled) return
          setStatus('error')
          setError(apiErrorMessage(cause, 'No pudimos buscar especies.'))
        })
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [search, category])

  // Cierra el desplegable al hacer click fuera del buscador.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const showDropdown = open && (search.trim().length > 0 || category !== '')

  return (
    <div ref={containerRef} className="w-full">
      <div className="panel-vidrio flex items-center gap-2 rounded-2xl px-3 py-2 shadow-2xl">
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-texto-suave" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="m20 20-3.5-3.5" />
        </svg>

        <input
          className="min-w-0 flex-1 bg-transparent py-1 text-sm text-texto outline-none placeholder:text-texto-suave/70"
          placeholder="Buscar especie por nombre común o científico…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          aria-label="Buscar especie"
        />

        <select
          value={category}
          onChange={(event) => {
            setCategory(event.target.value as SpeciesCategory | '')
            setOpen(true)
          }}
          aria-label="Filtrar por categoría taxonómica"
          className="shrink-0 rounded-lg border border-borde bg-espacio/70 px-2 py-1 text-xs text-texto-suave outline-none focus:border-accent"
        >
          <option value="">Todas</option>
          {CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {CATEGORY_META[value].label}
            </option>
          ))}
        </select>

        {status === 'loading' ? (
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-borde border-t-acento"
          />
        ) : null}
      </div>

      {showDropdown ? (
        <div className="panel-vidrio animate-aparecer mt-2 max-h-[22rem] overflow-y-auto rounded-2xl p-1.5 shadow-2xl scroll-fino">
          {status === 'error' ? (
            <p className="px-3 py-2 text-xs text-red-300">{error}</p>
          ) : results.length === 0 && status !== 'loading' ? (
            <p className="px-3 py-2 text-xs text-texto-suave">
              No encontramos especies con ese criterio.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {results.map((species) => {
                const meta = CATEGORY_META[species.category]
                return (
                  <li key={species.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSpecies(species)
                        setOpen(false)
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-superficie-2/70"
                    >
                      {species.imageUrl ? (
                        <img
                          src={species.imageUrl}
                          alt=""
                          loading="lazy"
                          className="h-9 w-9 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm"
                          style={{ backgroundColor: `${meta.hex}22` }}
                        >
                          {meta.emoji}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-texto">
                          {species.commonNameEs}
                        </span>
                        <span className="cientifico block truncate text-[11px] text-texto-suave">
                          {species.scientificName}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] ${meta.chipClass}`}
                      >
                        {meta.label}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}
