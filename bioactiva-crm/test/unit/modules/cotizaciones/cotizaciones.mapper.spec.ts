import {
  fromCotizacionDto,
  toCotizacionQueryParams,
  toCreateCotizacionDto,
} from '@/services/modules/cotizaciones.mapper'
import { EstadoCot, TipoMoneda } from '@/types/enums'

describe('cotizaciones.mapper', () => {
  it('maps backend quotation DTOs to frontend cotizaciones', () => {
    const cotizacion = fromCotizacionDto({
      id: 4,
      fechaCot: '2026-06-02T10:00:00.000Z',
      dirigido: 'Valeria Torres',
      cliente: 'Banco de Crédito del Perú S.A.',
      producto: 'Ley 30309',
      nombreRemitente: 'Admin Bioactiva',
      nombreServicio: 'Deducción I+D+i',
      monto: '6500.00',
      tipo: 'PEN',
      estado: 'ENVIADA',
      observacion: null,
      linkPropuesta: null,
      idLead: 2,
      leadServicioInteres: 'Ley 30309',
      leadEstado: 'OFERTADO',
      contactName: 'Valeria Torres',
      idRemitente: 1,
      remitenteName: 'Admin Bioactiva',
      idAuthor: 1,
      createdAt: '2026-06-02T10:00:00.000Z',
      updatedAt: '2026-06-02T11:00:00.000Z',
    })

    expect(cotizacion).toMatchObject({
      id: 4,
      codigo: 'COT-2026-004',
      id_lead: 2,
      id_remitente: 1,
      estado: EstadoCot.Enviada,
      monto: 6500,
      tipo: TipoMoneda.Soles,
      cliente: 'Banco de Crédito del Perú S.A.',
      contacto_nombre: 'Valeria Torres',
    })
  })

  it('maps the USD currency type (bug "solo soles": debe soportar ambas monedas)', () => {
    const base = {
      id: 9,
      fechaCot: '2026-06-02T10:00:00.000Z',
      dirigido: 'Dr. Martinez',
      cliente: 'TechCorp SA',
      producto: 'Licencia Pro',
      nombreRemitente: 'Juan Perez',
      nombreServicio: 'Desarrollo',
      monto: '5000.00',
      estado: 'PENDIENTE',
      observacion: null,
      linkPropuesta: null,
      idLead: 10,
      leadServicioInteres: 'Consultoría',
      leadEstado: 'EN_PROSPECTO',
      contactName: 'María Gómez',
      idRemitente: 7,
      remitenteName: 'Carlos López',
      idAuthor: 3,
      createdAt: '2026-01-15T10:30:00.000Z',
      updatedAt: '2026-01-15T10:30:00.000Z',
    }

    expect(fromCotizacionDto({ ...base, tipo: 'USD' }).tipo).toBe(TipoMoneda.Dolares)
    expect(fromCotizacionDto({ ...base, tipo: 'PEN' }).tipo).toBe(TipoMoneda.Soles)
    // Tolerante a casing inesperado del backend.
    expect(fromCotizacionDto({ ...base, tipo: 'usd' }).tipo).toBe(TipoMoneda.Dolares)
  })

  it('maps frontend filters and create payload to backend quotations', () => {
    expect(toCotizacionQueryParams({
      estado: EstadoCot.Aceptada,
      idLead: 2,
      page: 1,
      limit: 20,
    })).toEqual({
      estado: 'ACEPTADA',
      idLead: 2,
      page: 1,
      limit: 20,
    })

    // Filtros server-side adicionales soportados por GET /quotations.
    expect(toCotizacionQueryParams({
      id_org: 'org-uuid-1',
      id_remitente: 3,
      fecha_desde: '2026-01-01',
      fecha_hasta: '2026-06-30',
    })).toEqual({
      idOrg: 'org-uuid-1',
      idRemitente: 3,
      fechaDesde: '2026-01-01',
      fechaHasta: '2026-06-30',
    })

    expect(toCreateCotizacionDto({
      id_lead: 2,
      id_remitente: 1,
      fecha_cot: '2026-06-02',
      dirigido: 'Valeria Torres',
      cliente: 'Banco de Crédito del Perú S.A.',
      producto: '',
      nombre_remitente: 'Admin Bioactiva',
      nombre_servicio: 'Deducción I+D+i',
      monto: 0,
      tipo: TipoMoneda.Soles,
      estado: EstadoCot.Pendiente,
      observacion: 'Cotización inicial',
    })).toEqual({
      idLead: 2,
      idRemitente: 1,
      fechaCot: '2026-06-02T00:00:00.000Z',
      dirigido: 'Valeria Torres',
      cliente: 'Banco de Crédito del Perú S.A.',
      nombreServicio: 'Deducción I+D+i',
      monto: '0',
      tipo: 'PEN',
      observacion: 'Cotización inicial',
    })
  })
})
