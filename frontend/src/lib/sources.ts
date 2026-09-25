import type { SpeciesSource } from '../types/api'

/**
 * Agrupación de fuentes por campo (SRS 5.1 / 6.6).
 *
 * El backend devuelve `sources` como filas de `species_sources` con el
 * nombre crudo del campo en la base de datos (por ejemplo
 * `conservation_status`). Este módulo traduce el nombre del campo que la
 * interfaz muestra al nombre persistido, sin inventar atribuciones:
 * si no existe una fila que corresponda, el campo se muestra SIN chip de
 * fuente, porque el principio de confiabilidad del SRS es explícito:
 * "Si un dato no tiene una fuente confiable, el campo simplemente no se
 * muestra, priorizando la honestidad sobre la completitud."
 */

/** Normaliza camelCase o snake_case a una clave comparable. */
function normalize(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

const FIELD_ALIASES: Record<string, string[]> = {
  conservationStatus: ['conservation_status', 'estado_conservacion', 'iucn_status'],
  imageUrl: ['image_url', 'imagen', 'photo_url'],
  taxonomy: ['ncbi_taxon_id', 'taxonomy', 'taxon', 'ncbi'],
  papers: ['paper', 'papers', 'semantic_scholar', 'publication'],
  habitat: ['habitat'],
  diet: ['diet', 'alimentacion'],
  morphology: ['morphology', 'fisionomia'],
  populationEstimate: ['population_estimate', 'population'],
  threats: ['threats', 'amenazas'],
  careWild: ['care_wild', 'conservation_in_wild'],
  careCaptivity: ['care_captivity', 'captivity'],
  observationsCount: ['observations_count', 'observation_count', 'observations'],
  commonNameEs: ['common_name_es', 'nombre_comun'],
  scientificName: ['scientific_name'],
}

/** Índice de fuentes normalizadas para resolver alias en O(1). */
export function groupSources(sources: SpeciesSource[]): Map<string, SpeciesSource[]> {
  const index = new Map<string, SpeciesSource[]>()
  for (const source of sources) {
    const key = normalize(source.fieldName)
    const bucket = index.get(key)
    if (bucket) bucket.push(source)
    else index.set(key, [source])
  }
  return index
}

/**
 * Devuelve las fuentes que respaldan un campo de la interfaz.
 * Array vacío = la base de datos no registra fuente para ese campo.
 */
export function sourcesForField(
  index: Map<string, SpeciesSource[]>,
  field: keyof typeof FIELD_ALIASES,
): SpeciesSource[] {
  const aliases = FIELD_ALIASES[field] ?? [field]
  const found: SpeciesSource[] = []
  for (const alias of aliases) {
    const bucket = index.get(normalize(alias))
    if (bucket) found.push(...bucket)
  }
  return found
}
