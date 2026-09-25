import type { Plan, SpeciesCategory } from '../types/api'

/**
 * Colores por categoría taxonómica (SRS 6.1):
 * "Los marcadores deben mostrar especies con colores diferentes según su
 * categoría taxonómica."
 */
export const CATEGORIES: readonly SpeciesCategory[] = [
  'Mammalia',
  'Aves',
  'Reptilia',
  'Amphibia',
  'Actinopterygii',
]

export interface CategoryMeta {
  /** Etiqueta en español para los filtros y la leyenda. */
  label: string
  /** Emoji del marcador. */
  emoji: string
  /** Color principal del marcador. */
  hex: string
  /** Versión con alfa para halos y degradados. */
  glow: string
  /** Clase de texto de Tailwind para el badge de la leyenda. */
  textClass: string
  /** Clase de fondo/borde de Tailwind para el badge de la leyenda. */
  chipClass: string
}

export const CATEGORY_META: Record<SpeciesCategory, CategoryMeta> = {
  Mammalia: {
    label: 'Mamíferos',
    emoji: '🐾',
    hex: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.55)',
    textClass: 'text-amber-400',
    chipClass: 'border-amber-500/40 bg-amber-500/10',
  },
  Aves: {
    label: 'Aves',
    emoji: '🕊️',
    hex: '#10b981',
    glow: 'rgba(16, 185, 129, 0.55)',
    textClass: 'text-emerald-400',
    chipClass: 'border-emerald-500/40 bg-emerald-500/10',
  },
  Reptilia: {
    label: 'Reptiles',
    emoji: '🦎',
    hex: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.55)',
    textClass: 'text-red-400',
    chipClass: 'border-red-500/40 bg-red-500/10',
  },
  Amphibia: {
    label: 'Anfibios',
    emoji: '🐸',
    hex: '#22d3ee',
    glow: 'rgba(34, 211, 238, 0.55)',
    textClass: 'text-cyan-400',
    chipClass: 'border-cyan-500/40 bg-cyan-500/10',
  },
  Actinopterygii: {
    label: 'Peces óseos',
    emoji: '🐟',
    hex: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.55)',
    textClass: 'text-blue-400',
    chipClass: 'border-blue-500/40 bg-blue-500/10',
  },
}

export function categoryMeta(category: SpeciesCategory): CategoryMeta {
  return CATEGORY_META[category] ?? CATEGORY_META.Mammalia
}

export interface PlanMeta {
  label: string
  price: string
  tagline: string
  /** Si el plan habilita el chatbot asistente (SRS 6.4). */
  chatbot: boolean
  /** Beneficios exactos del SRS 4.1. */
  benefits: string[]
  chipClass: string
  textClass: string
  ringClass: string
}

export const PLAN_META: Record<Plan, PlanMeta> = {
  CASUAL: {
    label: 'Casual',
    price: 'Gratis',
    tagline: 'La puerta de entrada al contenido',
    chatbot: false,
    benefits: [
      'Explora el globo 3D completo',
      'Nombre común y nombre científico',
      'Número de observaciones',
      'Información básica de las especies',
      'Imágenes verificadas por la comunidad',
    ],
    chipClass: 'border-slate-400/40 bg-slate-500/10 text-slate-300',
    textClass: 'text-slate-400',
    ringClass: 'ring-slate-500/30',
  },
  STUDENT: {
    label: 'Estudiante',
    price: '$15.000 COP / mes',
    tagline: 'Una herramienta de estudio completa',
    chatbot: true,
    benefits: [
      'Todo lo del plan Casual',
      'Asistente conversacional (chatbot)',
      'Fisionomía, hábitat y alimentación',
      'Estado de conservación según IUCN',
      'Categoría taxonómica',
    ],
    chipClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    textClass: 'text-emerald-400',
    ringClass: 'ring-emerald-500/30',
  },
  RESEARCHER: {
    label: 'Investigador',
    price: '$35.000 COP / mes',
    tagline: 'Ahorra horas de búsqueda en fuentes dispersas',
    chatbot: true,
    benefits: [
      'Todo lo del plan Estudiante',
      'Datos taxonómicos exactos según NCBI',
      'Población estimada y amenazas',
      'Papers científicos (Semantic Scholar)',
      'Guías de conservación en la naturaleza',
      'Protocolos de cuidados en cautiverio',
    ],
    chipClass: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    textClass: 'text-amber-400',
    ringClass: 'ring-amber-500/30',
  },
}

/** Únicos planes con chatbot (SRS 6.4). */
export const CHAT_PLANS: readonly Plan[] = ['STUDENT', 'RESEARCHER']

export function canUseChatbot(plan: Plan | null | undefined): boolean {
  return plan != null && CHAT_PLANS.includes(plan)
}
