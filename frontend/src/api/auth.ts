import { client } from './client'
import type { AuthResponse, AuthUser, Plan } from '../types/api'

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

/** POST /api/auth/register → 201. Todo usuario nuevo nace en plan CASUAL. */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>('/auth/register', payload)
  return data
}

/** POST /api/auth/login → 200 con JWT. */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>('/auth/login', payload)
  return data
}

/** GET /api/user/me → perfil del usuario autenticado. */
export async function fetchMe(): Promise<AuthUser> {
  const { data } = await client.get<AuthUser>('/user/me')
  return data
}

/**
 * POST /api/user/upgrade → cambia el plan y crea la suscripción.
 * Devuelve el usuario actualizado. El mismo token sigue siendo válido:
 * no hace falta volver a iniciar sesión.
 */
export async function upgradePlan(plan: Exclude<Plan, 'CASUAL'>): Promise<AuthUser> {
  const { data } = await client.post<AuthUser>('/user/upgrade', { plan })
  return data
}
