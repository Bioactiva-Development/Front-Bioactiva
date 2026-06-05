import { Cotizacion } from '@/types/cotizacion.types'
import { EstadoCot, LeadState } from '@/types/enums'

export interface LeadTransitionGuard {
  allowed: boolean
  reason?: string
}

export function getLeadStateFromCotizacion(
  estado: EstadoCot
): LeadState | null {
  if (estado === EstadoCot.Enviada) return LeadState.Ofertado
  if (estado === EstadoCot.Aceptada) return LeadState.CierreVenta
  if (estado === EstadoCot.Rechazada) return LeadState.CierreSinVenta
  return null
}

export function getCotizacionStateFromLeadState(
  targetState: LeadState
): EstadoCot | null {
  if (targetState === LeadState.Prospecto) return EstadoCot.Pendiente
  if (targetState === LeadState.Ofertado) return EstadoCot.Enviada
  if (targetState === LeadState.CierreVenta) return EstadoCot.Aceptada
  if (targetState === LeadState.CierreSinVenta) return EstadoCot.Rechazada
  return null
}

export function getPrimaryCotizacion(
  cotizaciones: Cotizacion[]
): Cotizacion | null {
  return [...cotizaciones].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )[0] ?? null
}

export function getCotizacionStateFromLeadClosure(
  targetState: LeadState
): EstadoCot | null {
  return targetState === LeadState.CierreVenta ||
    targetState === LeadState.CierreSinVenta
    ? getCotizacionStateFromLeadState(targetState)
    : null
}

export function getCotizacionToResolveLeadClosure(
  targetState: LeadState,
  cotizaciones: Cotizacion[]
): Cotizacion | null {
  const targetCotState = getCotizacionStateFromLeadClosure(targetState)
  if (!targetCotState) return null

  const alreadyResolved = cotizaciones.find(
    (cotizacion) => cotizacion.estado === targetCotState
  )
  if (alreadyResolved) return alreadyResolved

  const viableStates = [EstadoCot.Enviada, EstadoCot.Pendiente]
  const viableCotizacion = cotizaciones
    .filter((cotizacion) => viableStates.includes(cotizacion.estado))
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )[0]

  return viableCotizacion ?? getPrimaryCotizacion(cotizaciones)
}

export function validateLeadStateTransition(
  targetState: LeadState,
  cotizaciones: Cotizacion[]
): LeadTransitionGuard {
  void cotizaciones

  return Object.values(LeadState).includes(targetState)
    ? { allowed: true }
    : { allowed: false, reason: 'Estado de pipeline no válido.' }
}
