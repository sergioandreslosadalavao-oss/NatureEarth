import { CATEGORY_META, PLAN_META } from '../../lib/categories'
import { iucnMeta } from '../../lib/iucn'
import { groupSources, sourcesForField } from '../../lib/sources'
import SourceChip from './SourceChip'
import type { Paper, SpeciesDetail, SpeciesSource, TaxonomyEntry } from '../../types/api'

const numberFormat = new Intl.NumberFormat('es-CO')

type SourceField = Parameters<typeof sourcesForField>[1]

/** Un dato con su fuente citada al lado. */
function Field({
  label,
  sources,
  field,
  children,
}: {
  label: string
  sources: Map<string, SpeciesSource[]>
  field: SourceField
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-texto-suave">
          {label}
        </dt>
        <SourceChip sources={sourcesForField(sources, field)} fieldLabel={label} />
      </div>
      <dd className="mt-0.5 text-sm leading-relaxed text-texto">{children}</dd>
    </div>
  )
}

function Section({
  title,
  plan,
  children,
}: {
  title: string
  plan?: string
  children: React.ReactNode
}) {
  return (
    <section className="border-t border-borde/70 pt-3">
      <h3 className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-texto-suave">
        {title}
        {plan ? (
          <span className="rounded-full border border-borde px-1.5 py-0.5 text-[9px] font-normal normal-case tracking-normal text-texto-suave">
            {plan}
          </span>
        ) : null}
      </h3>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}

function TaxonomyList({ entries }: { entries: TaxonomyEntry[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {entries.map((entry) => (
        <li key={entry.ncbiTaxonId} className="text-sm">
          {(
            [
              ['Reino', entry.kingdom],
              ['Filo', entry.phylum],
              ['Clase', entry.className],
              ['Orden', entry.orderName],
              ['Familia', entry.family],
              ['Género', entry.genus],
            ] as const
          )
            .filter(([, value]) => Boolean(value))
            .map(([label, value], index) => (
              <span key={label}>
                <span className="text-texto-suave">{label}: </span>
                <span className={label === 'Clase' ? 'cientifico' : undefined}>{value}</span>
                {index < 5 ? ' · ' : ''}
              </span>
            ))}
          <span className="text-texto-suave">
            {' '}
            · NCBI ID {entry.ncbiTaxonId}
          </span>
        </li>
      ))}
    </ul>
  )
}

function PaperList({ papers }: { papers: Paper[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {papers.map((paper) => (
        <li key={paper.id} className="rounded-xl border border-borde/70 bg-espacio/40 p-2.5">
          <a
            href={paper.url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-sm font-medium text-texto hover:text-acento hover:underline"
          >
            {paper.title}
          </a>
          <p className="mt-0.5 text-[11px] text-texto-suave">{paper.authors}</p>
          <p className="text-[11px] text-texto-suave">
            {paper.year} · DOI {paper.doi}
          </p>
        </li>
      ))}
    </ul>
  )
}

interface SpeciesFieldsProps {
  species: SpeciesDetail
  /** `true` en la ficha ampliada: muestra imágenes y papers más grandes. */
  expanded?: boolean
}

/**
 * Cuerpo del detalle de especie compartido por el overlay del globo y la
 * ficha ampliada `/especies/:id`.
 *
 * Solo se renderiza lo que el backend envió: los campos bloqueados por el
 * plan no llegan en la respuesta, así que acá no se inventan (SRS 7.4).
 */
export default function SpeciesFields({ species }: SpeciesFieldsProps) {
  const sources = groupSources(species.sources)
  const meta = CATEGORY_META[species.category]
  const planMeta = PLAN_META[species.plan]
  const conservation = iucnMeta(species.conservationStatus)
  const hasStudentFields =
    Boolean(species.conservationStatus) ||
    Boolean(species.habitat) ||
    Boolean(species.diet) ||
    Boolean(species.morphology)
  const hasResearcherFields =
    Boolean(species.populationEstimate) ||
    Boolean(species.threats) ||
    Boolean(species.careWild) ||
    Boolean(species.careCaptivity) ||
    (species.taxonomy?.length ?? 0) > 0 ||
    (species.papers?.length ?? 0) > 0

  return (
    <div className="flex flex-col gap-4">
      {/* Identificación: siempre visible en todos los planes (SRS 4.1.1). */}
      <section className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] ${meta.chipClass}`}>
            {meta.emoji} {meta.label}
          </span>
          <span className="rounded-full border border-borde px-2 py-0.5 text-[10px] text-texto-suave">
            Plan {planMeta.label}
          </span>
        </div>

        <dl className="flex flex-col gap-2.5">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-texto-suave">
              Nombre común
            </dt>
            <dd className="text-lg font-semibold text-texto">{species.commonNameEs}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-texto-suave">
              Nombre científico
              <SourceChip sources={sourcesForField(sources, 'scientificName')} fieldLabel="Nombre científico" />
            </dt>
            <dd className="cientifico text-sm text-texto">{species.scientificName}</dd>
          </div>
          {species.commonNameEn ? (
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-texto-suave">
                Nombre en inglés
              </dt>
              <dd className="text-sm text-texto-suave">{species.commonNameEn}</dd>
            </div>
          ) : null}
          <div>
            <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-texto-suave">
              Observaciones registradas
              <SourceChip sources={sourcesForField(sources, 'observationsCount')} fieldLabel="Observaciones" />
            </dt>
            <dd className="text-sm text-texto">{numberFormat.format(species.observationsCount)}</dd>
          </div>
        </dl>
      </section>

      {/* Plan Estudiante: estado de conservación, hábitat, dieta, fisionomía. */}
      {hasStudentFields ? (
        <Section title="Ecología" plan="Plan Estudiante">
          {species.conservationStatus ? (
            <div>
              <div className="flex items-center gap-1.5">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-texto-suave">
                  Estado de conservación (IUCN)
                </dt>
                <SourceChip
                  sources={sourcesForField(sources, 'conservationStatus')}
                  fieldLabel="Estado de conservación"
                />
              </div>
              <dd className="mt-1">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${conservation.chipClass}`}
                >
                  <span aria-hidden="true" className={`h-2 w-2 rounded-full ${conservation.dotClass}`} />
                  {conservation.label} · {conservation.description}
                </span>
              </dd>
            </div>
          ) : null}

          {species.habitat ? (
            <Field label="Hábitat" sources={sources} field="habitat">
              {species.habitat}
            </Field>
          ) : null}
          {species.diet ? (
            <Field label="Alimentación" sources={sources} field="diet">
              {species.diet}
            </Field>
          ) : null}
          {species.morphology ? (
            <Field label="Fisionomía" sources={sources} field="morphology">
              {species.morphology}
            </Field>
          ) : null}
        </Section>
      ) : null}

      {/* Plan Investigador: población, amenazas, cuidados y taxonomía NCBI. */}
      {hasResearcherFields ? (
        <>
          <Section title="Datos avanzados" plan="Plan Investigador">
            {species.populationEstimate != null ? (
              <Field
                label="Población estimada"
                sources={sources}
                field="populationEstimate"
              >
                {numberFormat.format(species.populationEstimate)} individuos
              </Field>
            ) : null}
            {species.threats ? (
              <Field label="Amenazas" sources={sources} field="threats">
                {species.threats}
              </Field>
            ) : null}
          </Section>

          {species.careWild || species.careCaptivity ? (
            <Section title="Cuidados y conservación" plan="Plan Investigador">
              {species.careWild ? (
                <Field
                  label="Conservación en la naturaleza"
                  sources={sources}
                  field="careWild"
                >
                  {species.careWild}
                </Field>
              ) : null}
              {species.careCaptivity ? (
                <Field
                  label="Cuidados en cautiverio"
                  sources={sources}
                  field="careCaptivity"
                >
                  {species.careCaptivity}
                </Field>
              ) : null}
            </Section>
          ) : null}

          {species.taxonomy && species.taxonomy.length > 0 ? (
            <Section title="Taxonomía (NCBI)" plan="Plan Investigador">
              <div>
                <div className="flex items-center gap-1.5">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-texto-suave">
                    Clasificación
                  </dt>
                  <SourceChip sources={sourcesForField(sources, 'taxonomy')} fieldLabel="Taxonomía" />
                </div>
                <dd className="mt-1">
                  <TaxonomyList entries={species.taxonomy} />
                </dd>
              </div>
            </Section>
          ) : null}

          {species.papers && species.papers.length > 0 ? (
            <Section title="Papers científicos" plan="Plan Investigador">
              <div>
                <div className="flex items-center gap-1.5">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-texto-suave">
                    Semantic Scholar
                  </dt>
                  <SourceChip sources={sourcesForField(sources, 'papers')} fieldLabel="Papers" />
                </div>
                <dd className="mt-1">
                  <PaperList papers={species.papers} />
                </dd>
              </div>
            </Section>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
