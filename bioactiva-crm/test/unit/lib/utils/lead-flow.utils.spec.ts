import {
  getCotizacionStateFromLeadState,
  validateLeadStateTransition,
} from '@/lib/utils/lead-flow.utils'
import { Cotizacion } from '@/types/cotizacion.types'
import {
  EstadoCot,
  LeadState,
  TipoMoneda,
} from '@/types/enums'

const cotizacion = (estado: EstadoCot): Cotizacion => ({
  id: 1,
  codigo: 'COT-2025-004',
  id_lead: 4,
  id_remitente: 1,
  fecha_cot: '2025-03-11T08:00:00Z',
  dirigido: 'Patricia Ccopa Mamani',
  cliente: 'Altomayo',
  nombre_remitente: 'Administracion',
  nombre_servicio: 'Diagnostico de innovacion',
  monto: 6500,
  tipo: TipoMoneda.Soles,
  estado,
  id_author: 1,
  created_at: '2025-03-11T08:00:00Z',
  updated_at: '2025-03-11T08:00:00Z',
})

describe('lead-flow.utils', () => {
  it('maps each pipeline state to its coherent quotation state', () => {
    expect(getCotizacionStateFromLeadState(LeadState.Prospecto)).toBe(
      EstadoCot.Pendiente
    )
    expect(getCotizacionStateFromLeadState(LeadState.Ofertado)).toBe(
      EstadoCot.Enviada
    )
    expect(getCotizacionStateFromLeadState(LeadState.CierreVenta)).toBe(
      EstadoCot.Aceptada
    )
    expect(getCotizacionStateFromLeadState(LeadState.CierreSinVenta)).toBe(
      EstadoCot.Rechazada
    )
  })

  it('requires an associated quotation before moving a lead to ofertado', () => {
    expect(
      validateLeadStateTransition(LeadState.Ofertado, []).allowed
    ).toBe(false)

    expect(
      validateLeadStateTransition(LeadState.Ofertado, [
        cotizacion(EstadoCot.Pendiente),
      ]).allowed
    ).toBe(true)
  })

  it('allows closing with sale when a quotation can be accepted by the move', () => {
    expect(
      validateLeadStateTransition(LeadState.CierreVenta, []).allowed
    ).toBe(false)

    expect(
      validateLeadStateTransition(LeadState.CierreVenta, [
        cotizacion(EstadoCot.Enviada),
      ]).allowed
    ).toBe(true)
  })
})
