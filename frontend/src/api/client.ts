import axios, { AxiosError } from 'axios'

export const TOKEN_STORAGE_KEY = 'nature-earth:token'

/**
 * Evento que dispara el store de autenticación cuando el backend
 * responde 401. Se usa un evento en lugar de importar el store para evitar
 * una dependencia circular entre `client` y `authStore`.
 */
export const UNAUTHORIZED_EVENT = 'nature-earth:unauthorized'

let currentToken: string | null = readStoredToken()

function readStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function getToken(): string | null {
  return currentToken
}

export function setToken(token: string | null): void {
  currentToken = token
  if (typeof window === 'undefined') return
  if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
  else window.localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 20_000,
})

// Sesión: agrega el JWT si existe. Los endpoints públicos funcionan igual sin token.
client.interceptors.request.use((config) => {
  if (currentToken) {
    config.headers.set('Authorization', `Bearer ${currentToken}`)
  }
  return config
})

// 401: la sesión expiró o es inválida → se limpia y la app vuelve al estado público.
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && currentToken) {
      setToken(null)
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT))
    }
    return Promise.reject(error)
  },
)

/** Cuerpo de error que devuelve Spring Boot en este proyecto. */
interface ApiErrorBody {
  status?: number
  message?: string
  [key: string]: unknown
}

/**
 * Convierte cualquier error de la API en un mensaje en español que se
 * pueda mostrar en la interfaz. El backend responde, por ejemplo:
 * 409 {"message":"Email is already registered"}
 * 400 {"message":"Validation failed","email":"email must be a valid address"}
 * 401 {"message":"Invalid email or password"}
 */
export function apiErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback
  }

  const axiosError = error as AxiosError<ApiErrorBody>
  const status = axiosError.response?.status
  const body = axiosError.response?.data

  if (!status) {
    return 'No pudimos conectar con el servidor. Revisá tu conexión.'
  }

  // Los errores de validación de Spring traen un mensaje por campo.
  if (status === 400 && body) {
    const fieldMessages = Object.entries(body)
      .filter(([key]) => key !== 'status' && key !== 'message')
      .map(([, value]) => String(value))
    if (fieldMessages.length > 0) return fieldMessages.join(' · ')
  }

  const serverMessage = typeof body?.message === 'string' ? body.message : undefined

  switch (status) {
    case 400:
      return serverMessage === 'Validation failed'
        ? 'Revisá los datos del formulario.'
        : (serverMessage ?? 'Los datos enviados no son válidos.')
    case 401:
      return serverMessage === 'Invalid email or password'
        ? 'Correo o contraseña incorrectos.'
        : 'Tu sesión expiró. Iniciá sesión de nuevo.'
    case 403:
      return 'Tu plan no incluye esta información.'
    case 404:
      return serverMessage ?? 'No encontramos ese recurso.'
    case 409:
      return 'Ese correo ya está registrado.'
    default:
      return serverMessage ?? `Error del servidor (${status}).`
  }
}
