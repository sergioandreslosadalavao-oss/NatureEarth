import { useEffect, useRef, useState, type FormEvent } from 'react'
import { chatService, type ChatMessage } from '../../api/chatService'
import { canUseChatbot, CATEGORY_META } from '../../lib/categories'
import { useAuthStore } from '../../store/authStore'
import type { SpeciesSummary } from '../../types/api'

interface ChatbotProps {
  /** Lleva el globo a la especie que el asistente menciona. */
  onSelectSpecies: (species: SpeciesSummary) => void
}

let messageCounter = 0
const nextId = () => `msg-${++messageCounter}`

const GREETING: ChatMessage = {
  id: 'greeting',
  role: 'assistant',
  text: 'Hola, soy el asistente de Nature Earth. Preguntame por una especie: puedo buscar por nombre común o científico y mostrarte su ficha.',
}

/**
 * Chatbot flotante en la esquina inferior derecha (SRS 3.1 y 6.4).
 *
 * El SRS es explícito: es "visible únicamente para usuarios con plan
 * Estudiante o Investigador" y el plan Casual "no tiene acceso al chatbot".
 * Por eso el componente no se monta sin plan, en lugar de mostrar un ícono
 * bloqueado. El camino de conversión queda en el panel de acceso y en el
 * detalle de la especie, no aquí.
 */
export default function Chatbot({ onSelectSpecies }: ChatbotProps) {
  const plan = useAuthStore((state) => state.user?.plan ?? null)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const unlocked = canUseChatbot(plan)

  // Si se pierde el plan (logout o baja), la ventana tampoco queda colgando.
  useEffect(() => {
    if (!unlocked) setOpen(false)
  }, [unlocked])

  useEffect(() => {
    if (open) listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages, pending, open])

  if (!unlocked) return null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const question = input.trim()
    if (!question || pending) return

    setInput('')
    setMessages((current) => [...current, { id: nextId(), role: 'user', text: question }])
    setPending(true)
    try {
      const reply = await chatService.send(question)
      setMessages((current) => [
        ...current,
        { id: nextId(), role: 'assistant', text: reply.text, species: reply.species },
      ])
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: nextId(),
          role: 'assistant',
          text: 'No pudimos consultar la base en este momento. Intentá de nuevo en un instante.',
        },
      ])
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {open ? (
        <div className="panel-vidrio flex h-[26rem] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl shadow-2xl">
          <header className="flex items-center gap-2 border-b border-borde/70 p-3">
            <span aria-hidden="true" className="text-base">
              💬
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-texto">Asistente Nature Earth</p>
              <p className="text-[10px] text-texto-suave">Responde con datos de la base curada</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Minimizar chat"
              className="rounded-lg border border-borde p-1.5 text-texto-suave transition-colors hover:border-red-500/50 hover:text-red-400"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </header>

          <div ref={listRef} className="scroll-fino flex-1 space-y-2.5 overflow-y-auto p-3">
            {messages.map((message) => (
              <div key={message.id} className="space-y-1.5">
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    message.role === 'user'
                      ? 'ml-auto bg-acento/15 text-texto'
                      : 'bg-superficie-2/80 text-texto'
                  }`}
                >
                  {message.text}
                </div>

                {message.species && message.species.length > 0 ? (
                  <ul className="flex flex-col gap-1">
                    {message.species.map((species) => {
                      const meta = CATEGORY_META[species.category]
                      return (
                        <li key={species.id}>
                          <button
                            type="button"
                            onClick={() => onSelectSpecies(species)}
                            className="flex w-full items-center gap-2 rounded-xl border border-borde/80 bg-espacio/50 px-2.5 py-1.5 text-left transition-colors hover:border-acento/60"
                          >
                            <span aria-hidden="true" className="text-sm">
                              {meta.emoji}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[11px] font-medium text-texto">
                                {species.commonNameEs}
                              </span>
                              <span className="cientifico block truncate text-[10px] text-texto-suave">
                                {species.scientificName}
                              </span>
                            </span>
                            <span className="shrink-0 text-[10px] text-acento">Ver →</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                ) : null}
              </div>
            ))}

            {pending ? (
              <div className="flex gap-1 pl-1">
                {[0, 1, 2].map((index) => (
                  <span
                    key={index}
                    className="h-1.5 w-1.5 animate-latido rounded-full bg-texto-suave"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-borde/70 p-2.5">
            <input
              className="campo-base min-w-0 flex-1"
              placeholder="Escribí tu consulta…"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              aria-label="Mensaje para el asistente"
              maxLength={300}
            />
            <button
              type="submit"
              className="boton-primario shrink-0"
              disabled={pending || input.trim().length === 0}
              aria-label="Enviar mensaje"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 12l16-8-6 16-2.5-6.5L4 12z" />
              </svg>
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente'}
        className="boton-primario flex h-12 w-12 items-center justify-center rounded-full text-lg shadow-2xl"
      >
        {open ? '✕' : '💬'}
      </button>
    </div>
  )
}
