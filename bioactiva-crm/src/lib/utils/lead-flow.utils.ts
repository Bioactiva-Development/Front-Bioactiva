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

  const viableStates = new Set([EstadoCot.Enviada, EstadoCot.Pendiente])
  const viableCotizacion = cotizaciones
    .filter((cotizacion) => viableStates.has(cotizacion.estado))
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )[0]

  return viableCotizacion ?? getPrimaryCotizacion(cotizaciones)
}

export function getCotizacionToOfferLead(
  cotizaciones: Cotizacion[]
): Cotizacion | null {
  const viableStates = new Set([EstadoCot.Enviada, EstadoCot.Pendiente])
  return cotizaciones
    .filter((cotizacion) => viableStates.has(cotizacion.estado))
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )[0] ?? null
}

export function validateLeadStateTransition(
  currentState: LeadState,
  targetState: LeadState,
  cotizaciones: Cotizacion[]
): LeadTransitionGuard {
  if (!Object.values(LeadState).includes(targetState)) {
    return { allowed: false, reason: 'Estado de pipeline no válido.' }
  }

  if (currentState === targetState) return { allowed: true }

  if (
    currentState === LeadState.CierreVenta ||
    currentState === LeadState.CierreSinVenta
  ) {
    return {
      allowed: false,
      reason: 'Los estados de cierre son finales. No se puede mover el lead desde un cierre.',
    }
  }

  if (targetState === LeadState.Prospecto) {
    return {
      allowed: false,
      reason: 'Un lead nuevo inicia en prospecto. No se puede regresar un lead avanzado a prospecto.',
    }
  }

  if (
    currentState === LeadState.Prospecto &&
    (targetState === LeadState.CierreVenta ||
      targetState === LeadState.CierreSinVenta)
  ) {
    return {
      allowed: false,
      reason: 'Antes de cerrar un lead debe existir una propuesta formal en estado Ofertado.',
    }
  }

  // Prospecto -> Ofertado ya NO exige una cotización previa: al pasar a OFERTADO
  // el backend genera automáticamente una cotización borrador PENDIENTE
  // (PR #121). El front solo cambia el estado y luego consume ese borrador.

  if (
    (targetState === LeadState.CierreVenta ||
      targetState === LeadState.CierreSinVenta) &&
    !getCotizacionToResolveLeadClosure(targetState, cotizaciones)
  ) {
    return {
      allowed: false,
      reason: 'Para cerrar el lead debe existir una cotización asociada que pueda aceptarse o rechazarse.',
    }
  }

  return { allowed: true }
}
