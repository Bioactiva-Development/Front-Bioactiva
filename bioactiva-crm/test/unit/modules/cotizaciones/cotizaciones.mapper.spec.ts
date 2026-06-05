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
