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

// Máquina de estados del lead (backend: PATCH /leads/:id/status).
// Los estados de cierre YA NO son terminales: pueden volver a Ofertado o pasar al
// otro cierre. Nunca se puede regresar a "En prospecto".
const ALLOWED_LEAD_TRANSITIONS: Record<LeadState, LeadState[]> = {
  [LeadState.Prospecto]:      [LeadState.Ofertado],
  [LeadState.Ofertado]:       [LeadState.CierreVenta, LeadState.CierreSinVenta],
  [LeadState.CierreVenta]:    [LeadState.Ofertado, LeadState.CierreSinVenta],
  [LeadState.CierreSinVenta]: [LeadState.Ofertado, LeadState.CierreVenta],
}

// Estados destino estructuralmente válidos desde el estado actual (sin considerar
// el requisito de cotización). Útil para construir la UI de cambio de etapa.
export function getAllowedLeadTransitions(currentState: LeadState): LeadState[] {
  return ALLOWED_LEAD_TRANSITIONS[currentState] ?? []
}

export function validateLeadStateTransition(
  currentState: LeadState,
  targetState: LeadState,
  cotizaciones: Cotizacion[]
): LeadTransitionGuard {
  if (!Object.values(LeadState).includes(targetState)) {
    return { allowed: false, reason: 'Estado de pipeline no válido.' }
  }

  // Reenviar el mismo estado es un no-op válido (contrato backend).
  if (currentState === targetState) return { allowed: true }

  // Nunca se puede regresar a "En prospecto" una vez que el lead avanzó.
  if (targetState === LeadState.Prospecto) {
    return {
      allowed: false,
      reason: 'No se puede regresar un lead a "En prospecto".',
    }
  }

  if (!getAllowedLeadTransitions(currentState).includes(targetState)) {
    // Cierre directo desde prospecto: el backend responde 409.
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
    return {
      allowed: false,
      reason: 'Cambio de estado no permitido para el pipeline.',
    }
  }

  // Prospecto -> Ofertado ya NO exige una cotización previa: al pasar a OFERTADO
  // el backend genera automáticamente una cotización borrador PENDIENTE.

  // Cerrar DESDE Ofertado requiere una cotización que aceptar/rechazar. Entre
  // estados de cierre la cotización ya es terminal: solo cambia el estado del lead.
  if (
    currentState === LeadState.Ofertado &&
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
