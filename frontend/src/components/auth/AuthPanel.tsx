import { useState, type FormEvent } from 'react'
import { apiErrorMessage } from '../../api/client'
import { PLAN_META } from '../../lib/categories'
import { useAuthStore } from '../../store/authStore'

interface AuthPanelProps {
  onOpenPlans: () => void
}

type Tab = 'login' | 'register'

export default function AuthPanel({ onOpenPlans }: AuthPanelProps) {
  const { user, isSubmitting, login, register, logout } = useAuthStore()
  const [tab, setTab] = useState<Tab>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    try {
      if (tab === 'login') {
        await login(email, password)
      } else {
        await register(name, email, password)
      }
      setPassword('')
    } catch (cause) {
      setError(apiErrorMessage(cause))
    }
  }

  // --- Sesión iniciada: perfil, plan y cierre de sesión (SRS 3.1) ---------
  if (user) {
    const plan = PLAN_META[user.plan]
    const initials = user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')

    return (
      <div className="panel-vidrio w-full rounded-2xl p-3 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-acento/20 text-xs font-bold text-acento">
            {initials || 'NE'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-texto">{user.name}</p>
            <p className="truncate text-[11px] text-texto-suave">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Cerrar sesión"
            className="rounded-lg border border-borde p-1.5 text-texto-suave transition-colors hover:border-red-500/50 hover:text-red-400"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17l5-5-5-5M20 12H9M12 3H6a2 2 0 00-2 2v14a2 2 0 002 2h6" />
            </svg>
            <span className="sr-only">Cerrar sesión</span>
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${plan.chipClass}`}>
            Plan {plan.label}
          </span>
          {user.plan === 'CASUAL' ? (
            <button
              type="button"
              onClick={onOpenPlans}
              className="boton-primario ml-auto text-[11px]"
            >
              Mejorar plan
            </button>
          ) : (
            <span className="ml-auto text-[11px] text-texto-suave">
              {user.role === 'ADMIN' ? 'Administrador' : 'Suscripción activa'}
            </span>
          )}
        </div>
      </div>
    )
  }

  // --- Sin sesión: formulario de ingreso o registro (SRS 6.2) --------------
  return (
    <div className="panel-vidrio w-full rounded-2xl p-3 shadow-2xl">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-base leading-none">🌍</span>
        <span className="text-sm font-semibold tracking-wide text-texto">Nature Earth</span>
      </div>

      <div className="mb-2.5 grid grid-cols-2 gap-1 rounded-lg bg-espacio/60 p-1">
        {(['login', 'register'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setTab(value)
              setError(null)
            }}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              tab === value
                ? 'bg-superficie-2 text-texto'
                : 'text-texto-suave hover:text-texto'
            }`}
          >
            {value === 'login' ? 'Ingresar' : 'Registrarse'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {tab === 'register' ? (
          <input
            className="campo-base"
            aria-label="Nombre"
            placeholder="Nombre"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
          />
        ) : null}
        <input
          className="campo-base"
          type="email"
          aria-label="Correo electrónico"
          placeholder="Correo electrónico"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
        <input
          className="campo-base"
          type="password"
          aria-label="Contraseña"
          placeholder="Contraseña"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
          minLength={6}
          required
        />

        {error ? (
          <p role="alert" className="rounded-md bg-red-500/10 px-2 py-1 text-[11px] text-red-300">
            {error}
          </p>
        ) : null}

        <button type="submit" className="boton-primario" disabled={isSubmitting}>
          {isSubmitting
            ? 'Un momento…'
            : tab === 'login'
              ? 'Ingresar'
              : 'Crear cuenta gratis'}
        </button>
      </form>

      <p className="mt-2 text-center text-[10px] leading-snug text-texto-suave">
        El registro crea una cuenta <span className="text-texto">Casual</span> gratuita. Podés mejorarla
        cuando quieras.
      </p>
    </div>
  )
}
