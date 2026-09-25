import { CATEGORIES, CATEGORY_META } from '../../lib/categories'

/**
 * Leyenda de categorías taxonómicas (SRS 6.1): el usuario debe poder
 * interpretar el color de cada marcador sin adivinar.
 */
export default function CategoryLegend() {
  return (
    <div className="panel-vidrio rounded-2xl px-3 py-2.5 shadow-xl">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-texto-suave">
        Categorías
      </p>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-1">
        {CATEGORIES.map((category) => {
          const meta = CATEGORY_META[category]
          return (
            <li key={category} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: meta.hex, boxShadow: `0 0 8px ${meta.glow}` }}
              />
              <span className="text-[11px] text-texto-suave">{meta.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
