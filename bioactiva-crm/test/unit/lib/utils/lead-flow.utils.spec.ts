import {
  getAllowedLeadTransitions,
  getCotizacionStateFromLeadState,
  getLeadStateFromCotizacion,
  getPrimaryCotizacion,
  getCotizacionStateFromLeadClosure,
  getCotizacionToResolveLeadClosure,
  getCotizacionToOfferLead,
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

const makeCot = (overrides: Partial<Cotizacion> = {}): Cotizacion => ({
  id: 1,
  codigo: 'COT-001',
  id_lead: 4,
  id_remitente: 1,
  fecha_cot: '2025-03-11T08:00:00Z',
  dirigido: 'Test',
  cliente: 'Test',
  nombre_remitente: 'Admin',
  nombre_servicio: 'Servicio',
  monto: 1000,
  tipo: TipoMoneda.Soles,
  estado: EstadoCot.Pendiente,
  id_author: 1,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-06-01T00:00:00Z',
  ...overrides,
})

describe('lead-flow.utils', () => {
  describe('getLeadStateFromCotizacion', () => {
    it('maps Enviada to Ofertado', () => {
      expect(getLeadStateFromCotizacion(EstadoCot.Enviada)).toBe(LeadState.Ofertado)
    })
    it('maps Aceptada to CierreVenta', () => {
      expect(getLeadStateFromCotizacion(EstadoCot.Aceptada)).toBe(LeadState.CierreVenta)
    })
    it('maps Rechazada to CierreSinVenta', () => {
      expect(getLeadStateFromCotizacion(EstadoCot.Rechazada)).toBe(LeadState.CierreSinVenta)
    })
    it('returns null for Pendiente', () => {
      expect(getLeadStateFromCotizacion(EstadoCot.Pendiente)).toBeNull()
    })
  })

  describe('getPrimaryCotizacion', () => {
    it('returns the most recently updated cotizacion', () => {
      const old = makeCot({ id: 1, updated_at: '2025-01-01T00:00:00Z' })
      const recent = makeCot({ id: 2, updated_at: '2025-06-15T00:00:00Z' })
      expect(getPrimaryCotizacion([old, recent])?.id).toBe(2)
    })

    it('returns null for empty array', () => {
      expect(getPrimaryCotizacion([])).toBeNull()
    })

    it('returns the only cotizacion when array has one element', () => {
      const cot = makeCot({ id: 5 })
      expect(getPrimaryCotizacion([cot])?.id).toBe(5)
    })
  })

  describe('getCotizacionStateFromLeadClosure', () => {
    it('maps CierreVenta to Aceptada', () => {
      expect(getCotizacionStateFromLeadClosure(LeadState.CierreVenta)).toBe(EstadoCot.Aceptada)
    })
    it('maps CierreSinVenta to Rechazada', () => {
      expect(getCotizacionStateFromLeadClosure(LeadState.CierreSinVenta)).toBe(EstadoCot.Rechazada)
    })
    it('returns null for Ofertado', () => {
      expect(getCotizacionStateFromLeadClosure(LeadState.Ofertado)).toBeNull()
    })
    it('returns null for Prospecto', () => {
      expect(getCotizacionStateFromLeadClosure(LeadState.Prospecto)).toBeNull()
    })
  })

  describe('getCotizacionToResolveLeadClosure', () => {
    it('returns already resolved cotizacion if one matches', () => {
      const aceptada = makeCot({ estado: EstadoCot.Aceptada })
      expect(getCotizacionToResolveLeadClosure(LeadState.CierreVenta, [aceptada])?.id).toBe(1)
    })

    it('returns viable cotizacion (Enviada) when no resolved one exists', () => {
      const enviada = makeCot({ id: 2, estado: EstadoCot.Enviada })
      const result = getCotizacionToResolveLeadClosure(LeadState.CierreVenta, [enviada])
      expect(result?.id).toBe(2)
    })

    it('returns viable cotizacion (Pendiente) when no resolved one exists', () => {
      const pendiente = makeCot({ id: 3, estado: EstadoCot.Pendiente })
      const result = getCotizacionToResolveLeadClosure(LeadState.CierreVenta, [pendiente])
      expect(result?.id).toBe(3)
    })

    it('returns primary cotizacion when no viable states exist', () => {
      const rechazada = makeCot({ estado: EstadoCot.Rechazada })
      const result = getCotizacionToResolveLeadClosure(LeadState.CierreVenta, [rechazada])
      expect(result?.id).toBe(1)
    })

    it('returns null for non-closure target state', () => {
      expect(getCotizacionToResolveLeadClosure(LeadState.Ofertado, [])).toBeNull()
    })
  })

  describe('getCotizacionToOfferLead', () => {
    it('returns Enviada cotizacion', () => {
      const enviada = makeCot({ estado: EstadoCot.Enviada })
      expect(getCotizacionToOfferLead([enviada])?.id).toBe(1)
    })

    it('returns Pendiente cotizacion', () => {
      const pendiente = makeCot({ estado: EstadoCot.Pendiente })
      expect(getCotizacionToOfferLead([pendiente])?.id).toBe(1)
    })

    it('returns null when no viable cotizacion exists', () => {
      const aceptada = makeCot({ estado: EstadoCot.Aceptada })
      expect(getCotizacionToOfferLead([aceptada])).toBeNull()
    })

    it('returns null for empty array', () => {
      expect(getCotizacionToOfferLead([])).toBeNull()
    })
  })

  describe('validateLeadStateTransition', () => {
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

  it('lets a closed lead move back to ofertado or to the other closing state', () => {
    // Los cierres ya no son terminales (sin requerir re-transición de cotización).
    expect(
      validateLeadStateTransition(LeadState.CierreVenta, LeadState.Ofertado, []).allowed
    ).toBe(true)
    expect(
      validateLeadStateTransition(LeadState.CierreVenta, LeadState.CierreSinVenta, []).allowed
    ).toBe(true)
    expect(
      validateLeadStateTransition(LeadState.CierreSinVenta, LeadState.CierreVenta, []).allowed
    ).toBe(true)
    expect(
      validateLeadStateTransition(LeadState.CierreSinVenta, LeadState.Ofertado, []).allowed
    ).toBe(true)
  })

  it('returns reason when blocking invalid target state', () => {
    const guard = validateLeadStateTransition(
      LeadState.Prospecto,
      'INVALID' as LeadState,
      []
    )
    expect(guard.allowed).toBe(false)
    expect(guard.reason).toContain('no válido')
  })

  it('blocks direct closure from prospecto with specific message', () => {
    const guard = validateLeadStateTransition(
      LeadState.CierreSinVenta,
      LeadState.Prospecto,
      []
    )
    expect(guard.allowed).toBe(false)
    expect(guard.reason).toContain('regresar')
  })

  it('blocks cierre directo desde prospecto with specific message', () => {
    const guard = validateLeadStateTransition(
      LeadState.Prospecto,
      LeadState.CierreSinVenta,
      []
    )
    expect(guard.allowed).toBe(false)
    expect(guard.reason).toContain('propuesta formal')
  })

  it('returns generic message for unallowed transition', () => {
    const guard = validateLeadStateTransition(
      LeadState.Ofertado,
      LeadState.Ofertado,
      []
    )
    expect(guard.allowed).toBe(true)
  })

  it('never allows returning to prospecto', () => {
    expect(
      validateLeadStateTransition(LeadState.Ofertado, LeadState.Prospecto, []).allowed
    ).toBe(false)
    expect(
      validateLeadStateTransition(LeadState.CierreVenta, LeadState.Prospecto, []).allowed
    ).toBe(false)
  })

  it('blocks closing directly from prospecto', () => {
    expect(
      validateLeadStateTransition(LeadState.Prospecto, LeadState.CierreVenta, []).allowed
    ).toBe(false)
  })

  it('exposes the structural transitions allowed per state', () => {
    expect(getAllowedLeadTransitions(LeadState.Prospecto)).toEqual([LeadState.Ofertado])
    expect(getAllowedLeadTransitions(LeadState.Ofertado)).toEqual([
      LeadState.CierreVenta,
      LeadState.CierreSinVenta,
    ])
    expect(getAllowedLeadTransitions(LeadState.CierreVenta)).toEqual([
      LeadState.Ofertado,
      LeadState.CierreSinVenta,
    ])
    expect(getAllowedLeadTransitions(LeadState.CierreSinVenta)).toEqual([
      LeadState.Ofertado,
      LeadState.CierreVenta,
    ])
  })
  })
})
