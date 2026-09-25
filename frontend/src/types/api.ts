/**
 * Contrato de datos de Nature Earth.
 *
 * Cada tipo refleja EXACTAMENTE lo que devuelve el backend Spring Boot
 * (verificado contra http://localhost:8080). Los campos opcionales del
 * detalle son los que el servidor omite según el plan del usuario
 * (SRS 4.1): nunca se inventan en el frontend.
 */

export type Plan = 'CASUAL' | 'STUDENT' | 'RESEARCHER'

export type UserRole = 'COMMON' | 'ADMIN'

/** Categorías taxonómicas admitidas por el endpoint de búsqueda. */
export type SpeciesCategory =
  | 'Mammalia'
  | 'Aves'
  | 'Reptilia'
  | 'Amphibia'
  | 'Actinopterygii'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  plan: Plan
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

/** Fila de `species_sources`: garantiza que todo dato mostrado tenga fuente. */
export interface SpeciesSource {
  fieldName: string
  sourceName: string
  reference: string
}

/** Taxonomía NCBI, exclusiva del plan Investigador. */
export interface TaxonomyEntry {
  kingdom: string
  phylum: string
  className: string
  orderName: string
  family: string
  genus: string
  ncbiTaxonId: number
}

/** Paper de Semantic Scholar, exclusivo del plan Investigador. */
export interface Paper {
  id: string
  title: string
  authors: string
  year: number
  doi: string
  url: string
}

/** Fila de la lista paginada de especies (SRS 6.5). */
export interface SpeciesSummary {
  id: string
  scientificName: string
  commonNameEs: string
  commonNameEn: string
  category: SpeciesCategory
  imageUrl: string | null
  observationsCount: number
}

/** Detalle de especie. Los campos extra dependen del plan activo. */
export interface SpeciesDetail extends SpeciesSummary {
  plan: Plan
  // --- Plan Estudiante ---
  conservationStatus?: string
  habitat?: string
  diet?: string
  morphology?: string
  // --- Plan Investigador ---
  populationEstimate?: number
  threats?: string
  careWild?: string
  careCaptivity?: string
  taxonomy?: TaxonomyEntry[]
  papers?: Paper[]
  /** Siempre presente: la fuente de cada campo (SRS 5.1 / 6.6). */
  sources: SpeciesSource[]
}

export interface SpeciesPage {
  content: SpeciesSummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

/** Marcador del globo: una especie con coordenadas (SRS 6.1). */
export interface GlobeMarker {
  speciesId: string
  commonNameEs: string
  scientificName: string
  category: SpeciesCategory
  lat: number
  lng: number
  placeName: string
}
