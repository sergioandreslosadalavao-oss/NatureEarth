import { client, apiErrorMessage } from './client'
import { listSpecies } from './species'
import type { SpeciesSummary } from '../types/api'

/**
 * Servicio del chatbot asistente (SRS 6.4).
 *
 * El backend todavía NO expone el endpoint de chat, así que hoy el
 * asistente responde con la búsqueda sobre la base curada. Cuando exista
 * `POST /api/chat`, alcanza con poner `CHAT_ENDPOINT_HABILITADO` en `true`
 * e implementar `mapChatReply`: el componente `Chatbot` no cambia.
 *
 * No se sondea el endpoint a ciegas: una ruta inexistente en Spring Security
 * responde 401 y el interceptor de sesión lo interpretaría como un token
 * vencido, cerrando la sesión del usuario.
 *
 * La regla del SRS es estricta: el asistente responde únicamente con datos
 * existentes en la base curada; si no encuentra información verificada,
 * lo dice.
 */
const CHAT_ENDPOINT = '/chat'
const CHAT_ENDPOINT_HABILITADO = false

export interface ChatReply {
  text: string
  /** Especies encontradas, para que la UI ofrezca llevarlas al globo. */
  species: SpeciesSummary[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  species?: SpeciesSummary[]
}

interface ChatApiResponse {
  answer?: string
  species?: SpeciesSummary[]
}

function mapChatReply(data: ChatApiResponse): ChatReply {
  return {
    text: data.answer ?? 'No tengo datos verificados sobre esa consulta.',
    species: data.species ?? [],
  }
}

export const chatService = {
  async send(message: string): Promise<ChatReply> {
    const question = message.trim()

    if (CHAT_ENDPOINT_HABILITADO) {
      const { data } = await client.post<ChatApiResponse>(CHAT_ENDPOINT, { message: question })
      return mapChatReply(data)
    }

    // Fallback funcional: búsqueda en la base curada (SRS 6.4).
    const page = await listSpecies({ search: question, size: 5 })
    if (page.content.length === 0) {
      return {
        text: `No tengo datos verificados sobre “${question}” en la base curada de Nature Earth. Probá con el nombre común o científico de una especie.`,
        species: [],
      }
    }

    const found = page.content
    const noun = found.length === 1 ? 'especie coincide' : 'especies coinciden'
    return {
      text: `Encontré ${found.length} ${noun} con “${question}” en la base curada:`,
      species: found,
    }
  },
}

/** Reexportado para que la UI pueda mostrar errores del servicio. */
export { apiErrorMessage }
