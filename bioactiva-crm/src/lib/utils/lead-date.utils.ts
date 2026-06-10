const MS_PER_DAY = 24 * 60 * 60 * 1000
const DATE_PREFIX_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/

export interface LeadCloseDateStatus {
  label:     string
  className: string
}

function toLocalDateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function parseLeadDateOnly(fecha: string) {
  const match = DATE_PREFIX_PATTERN.exec(fecha)
  if (match) {
    const [, year, month, day] = match
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  return new Date(fecha)
}

export function toLeadDateInputValue(fecha?: string | null) {
  if (!fecha) return ''
  const match = DATE_PREFIX_PATTERN.exec(fecha)
  return match?.[0] ?? ''
}

export function formatLeadDateOnly(
  fecha?: string,
  options: Intl.DateTimeFormatOptions = {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  }
) {
  if (!fecha) return '—'

  const date = parseLeadDateOnly(fecha)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('es-PE', options)
}

export function getLeadCloseDateStatus(fecha?: string): LeadCloseDateStatus | null {
  if (!fecha) return null

  const closeDate = parseLeadDateOnly(fecha)
  if (Number.isNaN(closeDate.getTime())) return null

  const today = toLocalDateOnly(new Date())
  const target = toLocalDateOnly(closeDate)
  const diffDays = Math.round((target.getTime() - today.getTime()) / MS_PER_DAY)

  if (diffDays > 0) {
    return {
      label:     diffDays === 1 ? 'Falta 1 día' : `Faltan ${diffDays} días`,
      className: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    }
  }

  if (diffDays === 0) {
    return {
      label:     'Cierra hoy',
      className: 'border-amber-100 bg-amber-50 text-amber-700',
    }
  }

  const elapsedDays = Math.abs(diffDays)
  return {
    label: elapsedDays === 1
      ? 'Pasó hace 1 día'
      : `Pasó hace ${elapsedDays} días`,
    className: 'border-red-100 bg-red-50 text-red-700',
  }
}
