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
    expect(getCotizacionStateFromLeadState(LeadState.Prospecto)).toBeNull()
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

  it('allows moving to ofertado without a quotation (backend auto-creates the draft)', () => {
    // PR #121: al pasar a OFERTADO el backend genera la cotización borrador, así
    // que el front ya no exige una cotización previa para esta transición.
    expect(
      validateLeadStateTransition(LeadState.Prospecto, LeadState.Ofertado, []).allowed
    ).toBe(true)
  })

  it('allows moving to ofertado when a pendiente quotation exists', () => {
    expect(
      validateLeadStateTransition(LeadState.Prospecto, LeadState.Ofertado, [
        cotizacion(EstadoCot.Pendiente),
      ]).allowed
    ).toBe(true)
  })

  it('blocks closing with sale without a quotation', () => {
    expect(
      validateLeadStateTransition(LeadState.Ofertado, LeadState.CierreVenta, []).allowed
    ).toBe(false)
  })

  it('allows closing with sale when an enviada quotation exists', () => {
    expect(
      validateLeadStateTransition(LeadState.Ofertado, LeadState.CierreVenta, [
        cotizacion(EstadoCot.Enviada),
      ]).allowed
    ).toBe(true)
  })
})
