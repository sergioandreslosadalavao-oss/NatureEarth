import { client } from './client'
import type { GlobeMarker, SpeciesCategory, SpeciesDetail, SpeciesPage } from '../types/api'

export interface ListSpeciesParams {
  search?: string
  category?: SpeciesCategory | ''
  page?: number
  size?: number
}

/** GET /api/species → lista paginada pública (SRS 6.5). */
export async function listSpecies(params: ListSpeciesParams = {}): Promise<SpeciesPage> {
  const { data } = await client.get<SpeciesPage>('/species', {
    params: {
      search: params.search?.trim() || undefined,
      category: params.category || undefined,
      page: params.page ?? 0,
      size: params.size ?? 20,
    },
  })
  return data
}

/**
 * GET /api/species/{id} → detalle.
 * Sin token devuelve la información básica; con token el backend agrega
 * los campos del plan del usuario (SRS 4.1, 7.4).
 */
export async function fetchSpecies(id: string): Promise<SpeciesDetail> {
  const { data } = await client.get<SpeciesDetail>(`/species/${id}`)
  return data
}

/** GET /api/globe/markers → especies con coordenadas para el globo (SRS 6.1). */
export async function fetchGlobeMarkers(): Promise<GlobeMarker[]> {
  const { data } = await client.get<GlobeMarker[]>('/globe/markers')
  return data
}
