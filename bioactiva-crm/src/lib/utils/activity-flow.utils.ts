import { Actividad } from '@/types/actividad.types'
import { Lead } from '@/types/lead.types'
import { EstadoActividad, LeadState } from '@/types/enums'

const STALE_LEAD_DAYS = 30

export function sortActivitiesDesc(actividades: Actividad[]) {
  return [...actividades].sort(
    (a, b) =>
      new Date(b.fecha_inicio ?? b.created_at).getTime() -
      new Date(a.fecha_inicio ?? a.created_at).getTime()
  )
}

export function getBlockingPendingActivity(
  actividades: Actividad[]
): Actividad | null {
  return (
    sortActivitiesDesc(actividades).find(
      (actividad) => actividad.estado === EstadoActividad.Pendiente
    ) ?? null
  )
}

export function hasOverdueActivity(actividades: Actividad[], now = new Date()) {
  return actividades.some(
    (actividad) =>
      actividad.estado === EstadoActividad.Pendiente &&
      new Date(actividad.fecha_fin) < now
  )
}

export function isLeadClosed(lead: Pick<Lead, 'estado'>) {
  return (
    lead.estado === LeadState.CierreVenta ||
    lead.estado === LeadState.CierreSinVenta
  )
}

export function isLeadStaleWithoutProgress(lead: Lead, now = new Date()) {
  if (isLeadClosed(lead)) return false

  const lastProgressAt = new Date(lead.updated_at ?? lead.created_at)
  const diffMs = now.getTime() - lastProgressAt.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  return diffDays > STALE_LEAD_DAYS
}

export function getLeadAlertLabel(
  lead: Lead,
  actividades: Actividad[],
  now = new Date()
) {
  if (hasOverdueActivity(actividades, now)) return 'Actividad vencida'
  if (isLeadStaleWithoutProgress(lead, now)) return '+30 días sin avance'
  return null
}
