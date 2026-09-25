import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { fetchMe, login as loginRequest, register as registerRequest, upgradePlan as upgradeRequest } from '../api/auth'
import { setToken, getToken, UNAUTHORIZED_EVENT } from '../api/client'
import type { AuthUser, Plan } from '../types/api'

interface AuthState {
  user: AuthUser | null
  token: string | null
  /** `true` cuando la sesión persistida ya se rehidrató desde localStorage. */
  hydrated: boolean
  isSubmitting: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  upgradePlan: (plan: Exclude<Plan, 'CASUAL'>) => Promise<void>
  /** Revalida el perfil contra el backend al arrancar la app. */
  refreshProfile: () => Promise<void>
  setHydrated: () => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      hydrated: false,
      isSubmitting: false,

      setHydrated: () => {
        // Sincroniza el token persistido con el interceptor de axios.
        setToken(get().token)
        set({ hydrated: true })
        if (getToken() && !get().user) void get().refreshProfile()
      },

      login: async (email, password) => {
        set({ isSubmitting: true })
        try {
          const { token, user } = await loginRequest({ email, password })
          setToken(token)
          set({ token, user, isSubmitting: false })
        } catch (error) {
          set({ isSubmitting: false })
          throw error
        }
      },

      register: async (name, email, password) => {
        set({ isSubmitting: true })
        try {
          const { token, user } = await registerRequest({ name, email, password })
          setToken(token)
          set({ token, user, isSubmitting: false })
        } catch (error) {
          set({ isSubmitting: false })
          throw error
        }
      },

      logout: () => {
        setToken(null)
        set({ token: null, user: null })
      },

      upgradePlan: async (plan) => {
        const updated = await upgradeRequest(plan)
        // El token no cambia: el mismo JWT ya devuelve datos mejorados.
        set({ user: updated })
      },

      refreshProfile: async () => {
        try {
          const user = await fetchMe()
          set({ user })
        } catch {
          // Si el token dejó de ser válido, el interceptor ya limpió la sesión.
        }
      },

      clearSession: () => {
        setToken(null)
        set({ token: null, user: null })
      },
    }),
    {
      name: 'nature-earth:auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    },
  ),
)

// El interceptor de axios no puede importar el store (dependencia circular),
// así que notifica la sesión expirada con un evento.
if (typeof window !== 'undefined') {
  window.addEventListener(UNAUTHORIZED_EVENT, () => {
    useAuthStore.getState().clearSession()
  })
}

export const selectPlan = (state: AuthState): Plan | null => state.user?.plan ?? null
