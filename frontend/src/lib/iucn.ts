/**
 * Estado de conservación según la IUCN Red List.
 * Categorías oficiales: CR, EN, VU, NT, LC, DD, NE.
 */

export interface IucnMeta {
  label: string
  description: string
  chipClass: string
  dotClass: string
}

const UNKNOWN: IucnMeta = {
  label: '—',
  description: 'Sin datos de la IUCN',
  chipClass: 'border-slate-600/50 bg-slate-700/20 text-slate-400',
  dotClass: 'bg-slate-500',
}

export const IUCN_META: Record<string, IucnMeta> = {
  CR: {
    label: 'CR',
    description: 'En peligro crítico',
    chipClass: 'border-red-500/60 bg-red-500/15 text-red-300',
    dotClass: 'bg-red-500',
  },
  EN: {
    label: 'EN',
    description: 'En peligro',
    chipClass: 'border-orange-500/60 bg-orange-500/15 text-orange-300',
    dotClass: 'bg-orange-500',
  },
  VU: {
    label: 'VU',
    description: 'Vulnerable',
    chipClass: 'border-amber-500/60 bg-amber-500/15 text-amber-300',
    dotClass: 'bg-amber-500',
  },
  NT: {
    label: 'NT',
    description: 'Casi amenazada',
    chipClass: 'border-yellow-500/60 bg-yellow-500/15 text-yellow-300',
    dotClass: 'bg-yellow-400',
  },
  LC: {
    label: 'LC',
    description: 'Preocupación menor',
    chipClass: 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300',
    dotClass: 'bg-emerald-500',
  },
  DD: {
    label: 'DD',
    description: 'Datos insuficientes',
    chipClass: 'border-slate-500/60 bg-slate-500/15 text-slate-300',
    dotClass: 'bg-slate-400',
  },
  NE: {
    label: 'NE',
    description: 'No evaluada',
    chipClass: 'border-slate-500/60 bg-slate-500/15 text-slate-300',
    dotClass: 'bg-slate-400',
  },
}

export function iucnMeta(status: string | null | undefined): IucnMeta {
  if (!status) return UNKNOWN
  return IUCN_META[status.toUpperCase()] ?? { ...UNKNOWN, label: status }
}
