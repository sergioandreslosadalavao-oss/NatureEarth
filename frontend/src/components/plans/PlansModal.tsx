import { useEffect, useState } from 'react'
import { apiErrorMessage } from '../../api/client'
import { PLAN_META } from '../../lib/categories'
import { useAuthStore } from '../../store/authStore'
import type { Plan } from '../../types/api'

interface PlansModalProps {
  open: boolean
  onClose: () => void
}

const ORDER: Plan[] = ['CASUAL', 'STUDENT', 'RESEARCHER']

/**
 * Modal de planes (SRS 4.1). El alta se resuelve contra
 * POST /api/user/upgrade: el backend cambia el plan y crea la suscripción,
 * y el mismo token empieza a devolver los campos del plan nuevo.
 */
export default function PlansModal({ open, onClose }: PlansModalProps) {
  const { user, upgradePlan } = useAuthStore()
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setError(null)
      setSuccess(null)
      setPendingPlan(null)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  async function handleChoose(plan: Plan) {
    if (plan === 'CASUAL' || !user) return
    setPendingPlan(plan)
    setError(null)
    setSuccess(null)
    try {
      await upgradePlan(plan)
      setSuccess(`Plan ${PLAN_META[plan].label} activado. Ya podés ver la información completa.`)
    } catch (cause) {
      setError(apiErrorMessage(cause, 'No pudimos activar el plan.'))
    } finally {
      setPendingPlan(null)
    }
  }

  const currentPlan: Plan = user?.plan ?? 'CASUAL'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-espacio/80 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Planes de Nature Earth"
        className="panel-vidrio animate-aparecer relative max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-3xl p-5 shadow-2xl scroll-fino"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-texto">Elegí tu plan</h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-texto-suave">
              Tu plan actual:
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] ${PLAN_META[currentPlan].chipClass}`}
              >
                {PLAN_META[currentPlan].label}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-borde p-1.5 text-texto-suave transition-colors hover:border-red-500/50 hover:text-red-400"
            aria-label="Cerrar planes"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {error ? (
          <p role="alert" className="mb-4 rounded-xl bg-red-500/10 p-2.5 text-xs text-red-300">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="mb-4 rounded-xl bg-emerald-500/10 p-2.5 text-xs text-emerald-300">
            {success}
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          {ORDER.map((plan) => {
            const meta = PLAN_META[plan]
            const isCurrent = plan === currentPlan
            const isPending = pendingPlan === plan
            return (
              <section
                key={plan}
                className={`flex flex-col rounded-2xl border p-4 ${
                  isCurrent ? `border-acento/50 bg-acento/5 ${meta.ringClass} ring-1` : 'border-borde bg-espacio/40'
                }`}
              >
                <header>
                  <h3 className="text-sm font-semibold text-texto">{meta.label}</h3>
                  <p className="mt-0.5 text-lg font-bold text-texto">{meta.price}</p>
                  <p className="mt-1 text-[11px] leading-snug text-texto-suave">{meta.tagline}</p>
                </header>

                <ul className="mt-3 flex flex-1 flex-col gap-1.5">
                  {meta.benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-1.5 text-[11px] leading-snug text-texto-suave">
                      <span aria-hidden="true" className={meta.textClass}>
                        ✓
                      </span>
                      {benefit}
                    </li>
                  ))}
                </ul>

                <div className="mt-4">
                  {plan === 'CASUAL' ? (
                    <p className="text-center text-[11px] text-texto-suave">
                      {isCurrent ? 'Tu plan actual' : 'Plan gratuito por defecto'}
                    </p>
                  ) : isCurrent ? (
                    <p className="text-center text-[11px] text-texto-suave">Tu plan actual</p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleChoose(plan)}
                      disabled={!user || pendingPlan != null}
                      className="boton-primario w-full"
                    >
                      {isPending ? 'Activando…' : 'Elegir este plan'}
                    </button>
                  )}
                </div>
              </section>
            )
          })}
        </div>

        {!user ? (
          <p className="mt-4 text-center text-xs text-texto-suave">
            Iniciá sesión desde el panel superior izquierdo para activar un plan.
          </p>
        ) : null}
      </div>
    </div>
  )
}
