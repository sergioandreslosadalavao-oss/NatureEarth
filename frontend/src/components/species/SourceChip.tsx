import { useEffect, useRef, useState } from 'react'
import type { SpeciesSource } from '../../types/api'

interface SourceChipProps {
  sources: SpeciesSource[]
  /** Etiqueta del campo al que se atribuyen las fuentes. */
  fieldLabel: string
}

/**
 * Cita de fuente de un dato (SRS 6.6 / 7.2).
 *
 * El chip se abre al pasar el mouse, al enfocarlo o al tocarlo, y lista la fuente
 * (`sourceName`) con su referencia enlazada. Si no hay filas en
 * `species_sources` para el campo, no se renderiza ningún chip: el
 * principio de confiabilidad del SRS prohíbe atribuir una fuente inventada.
 */
export default function SourceChip({ sources, fieldLabel }: SourceChipProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    function handlePointerDownOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDownOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  /**
   * El click sólo abre (nunca alterna): en un click real el `focus` se
   * dispara primero, así que un toggle lo cerraría en el mismo gesto.
   * Cerrar corre por `mouseleave`, click afuera o Escape.
   */
  function handleBlur(event: React.FocusEvent<HTMLButtonElement>) {
    const next = event.relatedTarget
    if (next instanceof Node && wrapperRef.current?.contains(next)) return
    setOpen(false)
  }

  if (sources.length === 0) return null

  return (
    <span ref={wrapperRef} className="relative inline-flex">
      <button
        type="button"
        aria-label={`Fuentes de ${fieldLabel}`}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        onClick={() => setOpen(true)}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-borde text-[9px] text-texto-suave transition-colors hover:border-acento hover:text-acento"
      >
        <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" d="M9.5 14.5 14.5 9.5M8 12l-1.5 1.5a3.5 3.5 0 0 0 5 5L13 17M16 12l1.5-1.5a3.5 3.5 0 0 0-5-5L11 7" />
        </svg>
      </button>

      {open ? (
        <span className="panel-vidrio animate-aparecer absolute bottom-full left-1/2 z-30 mb-1.5 w-60 -translate-x-1/2 rounded-xl p-2.5 shadow-2xl">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-texto-suave">
            Fuente de {fieldLabel}
          </span>
          <ul className="mt-1.5 flex flex-col gap-1.5">
            {sources.map((source) => (
              <li key={`${source.fieldName}-${source.reference}`} className="text-[11px] leading-snug">
                <span className="font-medium text-texto">{source.sourceName}</span>
                <a
                  href={source.reference}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-0.5 block truncate text-accent hover:underline"
                  title={source.reference}
                >
                  {source.reference}
                </a>
              </li>
            ))}
          </ul>
        </span>
      ) : null}
    </span>
  )
}
