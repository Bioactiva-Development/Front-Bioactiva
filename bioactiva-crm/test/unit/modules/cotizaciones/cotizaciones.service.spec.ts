jest.mock('@/lib/constants/config', () => ({ USE_MOCK: false }))

const getMock = jest.fn()
const postMock = jest.fn()
const patchMock = jest.fn()
const deleteMock = jest.fn()

jest.mock('@/services/api/client', () => ({
  apiClient: { get: getMock, post: postMock, patch: patchMock, delete: deleteMock },
}))

jest.mock('@/services/modules/leads.service', () => ({
  leadsService: {
    getPipeline: jest.fn(),
    updateEstado: jest.fn(),
  },
}))

jest.mock('@/lib/utils/lead-flow.utils', () => ({
  getLeadStateFromCotizacion: jest.fn(() => null),
}))

import { cotizacionesService } from '@/services/modules/cotizaciones.service'
import { leadsService } from '@/services/modules/leads.service'
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
    ;(leadsService.getPipeline as jest.Mock).mockResolvedValue({
      prospecto: [], ofertado: [], cierreVenta: [], cierreSinVenta: [], total: 0,
    })
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
    it('fetches and filters cotizaciones synced with pipeline', async () => {
      ;(leadsService.getPipeline as jest.Mock).mockResolvedValue({
        prospecto: [{ id: 2 }],
        ofertado: [],
        cierreVenta: [],
        cierreSinVenta: [],
        total: 1,
      })
      getMock.mockResolvedValueOnce({ data: { data: [rawCotizacion], meta: { total: 1 } } })

      const result = await cotizacionesService.getAll()
      expect(result.data).toHaveLength(1)
      expect(result.data[0].id).toBe(4)
    })

    it('returns empty array when no active leads match', async () => {
      ;(leadsService.getPipeline as jest.Mock).mockResolvedValue({
        prospecto: [], ofertado: [], cierreVenta: [], cierreSinVenta: [], total: 0,
      })
      getMock.mockResolvedValueOnce({ data: { data: [rawCotizacion], meta: { total: 1 } } })

      const result = await cotizacionesService.getAll()
      expect(result.data).toHaveLength(0)
    })

    it('filters by estado', async () => {
      ;(leadsService.getPipeline as jest.Mock).mockResolvedValue({
        prospecto: [{ id: 2 }], ofertado: [], cierreVenta: [], cierreSinVenta: [], total: 1,
      })
      getMock.mockResolvedValueOnce({ data: { data: [rawCotizacion], meta: { total: 1 } } })

      const result = await cotizacionesService.getAll({ estado: EstadoCot.Enviada })
      expect(result.data).toHaveLength(0)
    })
  })

  describe('create', () => {
    it('posts create payload and returns mapped cotizacion', async () => {
      postMock.mockResolvedValueOnce({ data: rawCotizacion })

      const result = await cotizacionesService.create({
        id_lead: 2, id_remitente: 1, fecha_cot: '2026-06-02',
        dirigido: 'Valeria Torres', nombre_servicio: 'Deducción I+D+i',
        monto: 6500, tipo: 'PEN' as const, estado: EstadoCot.Pendiente,
      })

      expect(postMock).toHaveBeenCalledWith('/quotations', expect.objectContaining({
        idLead: 2, nombreServicio: 'Deducción I+D+i',
      }))
      expect(result.id).toBe(4)
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
    it('computes KPIs from synced cotizaciones', async () => {
      ;(leadsService.getPipeline as jest.Mock).mockResolvedValue({
        prospecto: [{ id: 1 }, { id: 2 }],
        ofertado: [], cierreVenta: [], cierreSinVenta: [], total: 2,
      })
      getMock.mockResolvedValueOnce({
        data: {
          data: [
            { ...rawCotizacion, id: 1, idLead: 1, monto: '5000', estado: 'ACEPTADA' },
            { ...rawCotizacion, id: 2, idLead: 2, monto: '3000', estado: 'ENVIADA' },
            { ...rawCotizacion, id: 3, idLead: 2, monto: '2000', estado: 'RECHAZADA' },
          ],
          meta: { total: 3 },
        },
      })

      const kpis = await cotizacionesService.getKpis()
      expect(kpis.aceptadas).toBe(1)
      expect(kpis.enviadas).toBe(1)
      expect(kpis.rechazadas).toBe(1)
    })
  })
})
