import {
  mapBackendCotizacion,
  mapBackendCotizacionesResponse,
  mapCotizacionFormToBackend,
  mapCotizacionUpdateToBackend,
  mapCotizacionFiltrosToBackend,
  mapEstadoCotToBackend,
  BackendCotizacion,
  BackendCotizacionesResponse,
} from '@/services/modules/cotizaciones.adapter'
import { CotizacionFormData, CotizacionFiltros } from '@/types/cotizacion.types'
import { EstadoCot, TipoMoneda } from '@/types/enums'

describe('cotizaciones.adapter', () => {
  const mockBackend: BackendCotizacion = {
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
  }

  describe('mapBackendCotizacion', () => {
    it('converts BackendCotizacion to Cotizacion correctly', () => {
      const result = mapBackendCotizacion(mockBackend)

      expect(result).toMatchObject({
        id: 4,
        codigo: 'COT-4',
        id_lead: 2,
        id_remitente: 1,
        fecha_cot: '2026-06-02T10:00:00.000Z',
        dirigido: 'Valeria Torres',
        cliente: 'Banco de Crédito del Perú S.A.',
        producto: 'Ley 30309',
        nombre_remitente: 'Admin Bioactiva',
        remitente_nombre: 'Admin Bioactiva',
        nombre_servicio: 'Deducción I+D+i',
        tipo: TipoMoneda.Soles,
        estado: EstadoCot.Enviada,
        observacion: null,
        link_propuesta: null,
        id_author: 1,
        created_at: '2026-06-02T10:00:00.000Z',
        updated_at: '2026-06-02T11:00:00.000Z',
        lead_servicio_interes: 'Ley 30309',
        lead_estado: 'OFERTADO',
        contacto_nombre: 'Valeria Torres',
        monto: 6500,
      })
    })

    it('parses monto as float', () => {
      const result = mapBackendCotizacion({ ...mockBackend, monto: '99.99' })
      expect(result.monto).toBe(99.99)
    })

    it('falls back to TipoMoneda.Soles for unknown tipo', () => {
      const result = mapBackendCotizacion({ ...mockBackend, tipo: 'EUR' })
      expect(result.tipo).toBe(TipoMoneda.Soles)
    })

    it('falls back to EstadoCot.Pendiente for unknown estado', () => {
      const result = mapBackendCotizacion({ ...mockBackend, estado: 'FAKE' })
      expect(result.estado).toBe(EstadoCot.Pendiente)
    })

    it('generates codigo as COT-{id}', () => {
      const result = mapBackendCotizacion(mockBackend)
      expect(result.codigo).toBe('COT-4')
    })

    it('sets contacto_nombre as undefined when contactName is null', () => {
      const result = mapBackendCotizacion({ ...mockBackend, contactName: null! })
      expect(result.contacto_nombre).toBeUndefined()
    })

    it('computes periodo from fechaCot', () => {
      const result = mapBackendCotizacion(mockBackend)
      expect(result.periodo).toBeDefined()
      expect(result.periodo).toEqual(
        new Date(mockBackend.fechaCot).toLocaleDateString('es-PE', {
          month: 'long',
          year: 'numeric',
        })
      )
    })
  })

  describe('mapBackendCotizacionesResponse', () => {
    it('maps paginated response correctly', () => {
      const backendResponse: BackendCotizacionesResponse = {
        data: [mockBackend],
        meta: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      }

      const result = mapBackendCotizacionesResponse(backendResponse)

      expect(result).toEqual({
        data: [expect.objectContaining({ id: 4, codigo: 'COT-4' })],
        total: 1,
        page: 1,
        limit: 20,
      })
    })
  })

  describe('mapCotizacionFormToBackend', () => {
    it('returns correct shape with monto.toFixed(2)', () => {
      const formData: CotizacionFormData = {
        id_lead: 2,
        id_remitente: 1,
        fecha_cot: '2026-06-02',
        cliente: 'Banco de Crédito del Perú S.A.',
        producto: 'Ley 30309',
        nombre_servicio: 'Deducción I+D+i',
        monto: 6500,
        tipo: TipoMoneda.Soles,
        observacion: 'Cotización inicial',
        link_propuesta: 'https://drive.google.com',
      }

      const result = mapCotizacionFormToBackend(formData)

      // dirigido/cliente/nombreRemitente los deriva el backend: no se envían al crear.
      expect(result).toEqual({
        fechaCot: '2026-06-02',
        nombreServicio: 'Deducción I+D+i',
        monto: '6500.00',
        tipo: 'PEN',
        idLead: 2,
        idRemitente: 1,
        producto: 'Ley 30309',
        observacion: 'Cotización inicial',
        linkPropuesta: 'https://drive.google.com',
      })
    })
  })

  describe('mapCotizacionUpdateToBackend', () => {
    it('only includes defined fields', () => {
      const result = mapCotizacionUpdateToBackend({
        cliente: 'New client',
        monto: 9999.5,
      })

      expect(result).toEqual({
        cliente: 'New client',
        monto: '9999.50',
      })
    })

    it('omits undefined fields', () => {
      const result = mapCotizacionUpdateToBackend({
        fecha_cot: undefined,
        cliente: undefined,
        producto: undefined,
        nombre_servicio: undefined,
        monto: undefined,
        tipo: undefined,
        observacion: undefined,
        link_propuesta: undefined,
      })

      expect(result).toEqual({})
    })
  })

  describe('mapCotizacionFiltrosToBackend', () => {
    it('returns empty object for undefined filtros', () => {
      expect(mapCotizacionFiltrosToBackend(undefined)).toEqual({})
    })

    it('returns empty object for empty filtros', () => {
      expect(mapCotizacionFiltrosToBackend({})).toEqual({})
    })

    it('maps estado through mapEstadoCotToBackend', () => {
      const filtros: CotizacionFiltros = { estado: EstadoCot.Aceptada }
      const result = mapCotizacionFiltrosToBackend(filtros)
      expect(result).toEqual({ estado: 'ACEPTADA' })
    })

    it('maps multiple fields correctly', () => {
      const filtros: CotizacionFiltros = {
        id_lead: 2,
        id_remitente: 1,
        fecha_desde: '2026-01-01',
        fecha_hasta: '2026-12-31',
        page: 1,
        limit: 20,
      }

      const result = mapCotizacionFiltrosToBackend(filtros)

      expect(result).toEqual({
        idLead: 2,
        idRemitente: 1,
        fechaDesde: '2026-01-01',
        fechaHasta: '2026-12-31',
        page: 1,
        limit: 20,
      })
    })
  })

  describe('mapEstadoCotToBackend', () => {
    it('maps each EstadoCot correctly', () => {
      expect(mapEstadoCotToBackend(EstadoCot.Pendiente)).toBe('PENDIENTE')
      expect(mapEstadoCotToBackend(EstadoCot.Enviada)).toBe('ENVIADA')
      expect(mapEstadoCotToBackend(EstadoCot.Aceptada)).toBe('ACEPTADA')
      expect(mapEstadoCotToBackend(EstadoCot.Rechazada)).toBe('RECHAZADA')
    })
  })
})
