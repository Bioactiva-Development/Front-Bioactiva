jest.mock('@/lib/constants/config', () => ({ USE_MOCK: false }))

const getMock = jest.fn()
const postMock = jest.fn()
const patchMock = jest.fn()
const deleteMock = jest.fn()

jest.mock('@/services/api/client', () => ({
  apiClient: { get: getMock, post: postMock, patch: patchMock, delete: deleteMock },
}))

import { cotizacionesService } from '@/services/modules/cotizaciones.service'
import { EstadoCot } from '@/types/enums'

const rawCotizacion = {
  id: 4,
  fechaCot: '2026-06-02T10:00:00.000Z',
  dirigido: 'Valeria Torres',
  cliente: 'Banco de Crédito',
  producto: 'Ley 30309',
  nombreRemitente: 'Admin',
  nombreServicio: 'Deducción I+D+i',
  monto: '6500.00',
  tipo: 'PEN',
  estado: 'PENDIENTE',
  observacion: null,
  linkPropuesta: null,
  idLead: 2,
  leadServicioInteres: 'Ley 30309',
  leadEstado: 'OFERTADO',
  contactName: 'Valeria Torres',
  idRemitente: 1,
  remitenteName: 'Admin',
  idAuthor: 1,
  createdAt: '2026-06-02T10:00:00.000Z',
  updatedAt: '2026-06-02T11:00:00.000Z',
}

describe('cotizaciones/cotizaciones.service (API mode)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getById', () => {
    it('fetches cotizacion by id and maps it', async () => {
      getMock.mockResolvedValueOnce({ data: rawCotizacion })
      const result = await cotizacionesService.getById(4)
      expect(getMock).toHaveBeenCalledWith('/quotations/4')
      expect(result.id).toBe(4)
      expect(result.estado).toBe(EstadoCot.Pendiente)
    })

    it('maps estado ENVIADA correctly', async () => {
      getMock.mockResolvedValueOnce({ data: { ...rawCotizacion, estado: 'ENVIADA' } })
      const result = await cotizacionesService.getById(4)
      expect(result.estado).toBe(EstadoCot.Enviada)
    })
  })

  describe('getAll', () => {
    it('fetches cotizaciones directly from the API', async () => {
      getMock.mockResolvedValueOnce({ data: { data: [rawCotizacion], meta: { total: 1 } } })

      const result = await cotizacionesService.getAll()
      expect(getMock).toHaveBeenCalledWith('/quotations', { params: {} })
      expect(result.data).toHaveLength(1)
      expect(result.data[0].id).toBe(4)
    })

    it('returns empty array when the API returns no results', async () => {
      getMock.mockResolvedValueOnce({ data: { data: [], meta: { total: 0 } } })

      const result = await cotizacionesService.getAll()
      expect(result.data).toHaveLength(0)
    })

    it('forwards estado as a query param', async () => {
      getMock.mockResolvedValueOnce({ data: { data: [], meta: { total: 0 } } })

      await cotizacionesService.getAll({ estado: EstadoCot.Enviada })

      expect(getMock).toHaveBeenCalledWith('/quotations', {
        params: { estado: 'ENVIADA' },
      })
    })

    it('forwards idOrg and page as query params', async () => {
      getMock.mockResolvedValueOnce({ data: { data: [rawCotizacion], meta: { total: 1 } } })

      await cotizacionesService.getAll({ id_org: 'org-uuid-1', page: 2 })

      expect(getMock).toHaveBeenCalledWith('/quotations', {
        params: { idOrg: 'org-uuid-1', page: 2 },
      })
    })
  })

  describe('create', () => {
    it('posts create payload and returns mapped cotizacion', async () => {
      postMock.mockResolvedValueOnce({ data: rawCotizacion })

      const result = await cotizacionesService.create({
        id_lead: 2, id_remitente: 1, fecha_cot: '2026-06-02',
        nombre_servicio: 'Deducción I+D+i',
        monto: 6500, tipo: 'PEN' as const, estado: EstadoCot.Pendiente,
      })

      expect(postMock).toHaveBeenCalledWith('/quotations', expect.objectContaining({
        idLead: 2, nombreServicio: 'Deducción I+D+i',
      }))
      // El backend deriva dirigido/cliente/nombreRemitente: no se envían al crear.
      const body = postMock.mock.calls[0][1]
      expect(body).not.toHaveProperty('dirigido')
      expect(body).not.toHaveProperty('cliente')
      expect(body).not.toHaveProperty('nombreRemitente')
      expect(result.id).toBe(4)
    })
  })

  describe('getByLead', () => {
    it('fetches cotizaciones by lead id with limit 100', async () => {
      getMock.mockResolvedValueOnce({ data: { data: [rawCotizacion], meta: { total: 1 } } })

      const result = await cotizacionesService.getByLead(2)
      expect(getMock).toHaveBeenCalledWith('/quotations', {
        params: { idLead: 2, limit: 100 },
      })
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(4)
    })

    it('handles array response', async () => {
      getMock.mockResolvedValueOnce({ data: [rawCotizacion] })

      const result = await cotizacionesService.getByLead(2)
      expect(result).toHaveLength(1)
    })
  })

  describe('enviar', () => {
    it('sends quotation via lifecycle endpoint', async () => {
      patchMock.mockResolvedValueOnce({ data: { ...rawCotizacion, estado: 'ENVIADA' } })

      const result = await cotizacionesService.enviar(4)
      expect(patchMock).toHaveBeenCalledWith('/quotations/4/send')
      expect(result.estado).toBe(EstadoCot.Enviada)
    })
  })

  describe('aceptar', () => {
    it('accepts quotation via lifecycle endpoint', async () => {
      patchMock.mockResolvedValueOnce({ data: { ...rawCotizacion, estado: 'ACEPTADA' } })

      const result = await cotizacionesService.aceptar(4)
      expect(patchMock).toHaveBeenCalledWith('/quotations/4/accept')
      expect(result.estado).toBe(EstadoCot.Aceptada)
    })
  })

  describe('rechazar', () => {
    it('rejects quotation via lifecycle endpoint', async () => {
      patchMock.mockResolvedValueOnce({ data: { ...rawCotizacion, estado: 'RECHAZADA' } })

      const result = await cotizacionesService.rechazar(4)
      expect(patchMock).toHaveBeenCalledWith('/quotations/4/reject')
      expect(result.estado).toBe(EstadoCot.Rechazada)
    })
  })

  describe('update', () => {
    it('patches cotizacion and returns updated data', async () => {
      patchMock.mockResolvedValueOnce({ data: { ...rawCotizacion, monto: '8000.00', updatedAt: '2026-06-03T10:00:00.000Z' } })

      const result = await cotizacionesService.update(4, { monto: 8000 })
      expect(patchMock).toHaveBeenCalledWith('/quotations/4', { monto: '8000' })
      expect(result.monto).toBe(8000)
    })
  })

  describe('delete', () => {
    it('deletes cotizacion', async () => {
      deleteMock.mockResolvedValueOnce({})
      await cotizacionesService.delete(4)
      expect(deleteMock).toHaveBeenCalledWith('/quotations/4')
    })
  })

  describe('getKpis', () => {
    it('fetches KPIs from the dedicated endpoint', async () => {
      getMock.mockResolvedValueOnce({
        data: { pendientes: 3, enviadas: 2, aceptadas: 1, rechazadas: 4 },
      })

      const kpis = await cotizacionesService.getKpis()
      expect(getMock).toHaveBeenCalledWith('/quotations/kpis')
      expect(kpis.aceptadas).toBe(1)
      expect(kpis.enviadas).toBe(2)
      expect(kpis.rechazadas).toBe(4)
    })
  })
})
