jest.mock('@/lib/constants/config', () => ({ USE_MOCK: false }))

const getMock = jest.fn()
const postMock = jest.fn()
const patchMock = jest.fn()
const deleteMock = jest.fn()

jest.mock('@/services/api/client', () => ({
  apiClient: { get: getMock, post: postMock, patch: patchMock, delete: deleteMock },
}))

import { leadsService } from '@/services/modules/leads.service'
import { LeadState } from '@/types/enums'

const rawLead = {
  id: 7,
  estado: 'EN_PROSPECTO',
  servicioInteres: 'Ley 30309',
  comentarios: null,
  desafioOportunidad: 'Optimizar I+D+i',
  canalCaptacion: 'Referido',
  idOrg: '123e4567-e89b-12d3-a456-426614174000',
  organizationName: 'Altomayo',
  idContacto: 4,
  contactName: 'Patricia Ccopa',
  idEncargado: 3,
  encargadoName: 'Administración',
  idAuthor: 1,
  createdAt: '2026-06-02T10:00:00.000Z',
  updatedAt: '2026-06-02T11:00:00.000Z',
  ultimoCambioEstado: '2026-06-02T12:00:00.000Z',
}

describe('leads/leads.service (API mode)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('getAll', () => {
    it('fetches leads and normalizes them', async () => {
      getMock.mockResolvedValueOnce({ data: [rawLead] })

      const result = await leadsService.getAll()
      expect(getMock).toHaveBeenCalledWith('/leads', { params: {} })
      expect(result.data).toHaveLength(1)
      expect(result.data[0].id).toBe(7)
      expect(result.data[0].estado).toBe(LeadState.Prospecto)
    })

    it('fetches leads from paginated response', async () => {
      getMock.mockResolvedValueOnce({
        data: { data: [rawLead], meta: { page: 1, limit: 10, total: 1, totalPages: 1 } },
      })

      const result = await leadsService.getAll({ page: 1, limit: 10 })
      expect(result.data).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('passes query params correctly', async () => {
      getMock.mockResolvedValueOnce({ data: [] })

      await leadsService.getAll({ search: 'innovación', page: 1, limit: 20 })
      expect(getMock).toHaveBeenCalledWith('/leads', {
        params: { search: 'innovación', page: 1, limit: 20 },
      })
    })
  })

  describe('getLeadsColumn', () => {
    it('fetches a paginated page for one estado and computes the meta', async () => {
      getMock.mockResolvedValueOnce({
        data: { data: [rawLead], meta: { page: 1, limit: 10, total: 23, totalPages: 3 } },
      })

      const result = await leadsService.getLeadsColumn(LeadState.Prospecto, undefined, 1)

      expect(getMock).toHaveBeenCalledWith('/leads', {
        params: { estado: 'EN_PROSPECTO', page: 1, limit: 10 },
      })
      expect(result.data).toHaveLength(1)
      expect(result.total).toBe(23)
      expect(result.totalPages).toBe(3)
      expect(result.data[0].estado).toBe(LeadState.Prospecto)
    })

    it('forwards filters together with the estado of the column', async () => {
      getMock.mockResolvedValueOnce({
        data: { data: [], meta: { page: 2, limit: 10, total: 0, totalPages: 1 } },
      })

      await leadsService.getLeadsColumn(
        LeadState.Ofertado,
        { id_encargado: 3, alerta_actividad: 'POR_VENCER' },
        2
      )

      expect(getMock).toHaveBeenCalledWith('/leads', {
        params: {
          estado: 'OFERTADO',
          idEncargado: 3,
          alertaActividad: 'POR_VENCER',
          page: 2,
          limit: 10,
        },
      })
    })
  })

  describe('getById', () => {
    it('fetches single lead by id', async () => {
      getMock.mockResolvedValueOnce({ data: rawLead })

      const result = await leadsService.getById(7)
      expect(getMock).toHaveBeenCalledWith('/leads/7')
      expect(result.id).toBe(7)
    })
  })

  describe('create', () => {
    it('posts create lead and returns mapped lead', async () => {
      postMock.mockResolvedValueOnce({ data: rawLead })

      const result = await leadsService.create({
        id_org: '123e4567-e89b-12d3-a456-426614174000',
        servicio_interes: 'Ley 30309',
        id_encargado: 3,
        estado: LeadState.Prospecto,
      })
      expect(postMock).toHaveBeenCalledWith('/leads', expect.objectContaining({
        idOrg: '123e4567-e89b-12d3-a456-426614174000',
      }))
      expect(result.id).toBe(7)
    })
  })

  describe('update', () => {
    it('patches lead and returns updated data', async () => {
      patchMock.mockResolvedValueOnce({ data: { ...rawLead, servicioInteres: 'Nuevo servicio' } })

      const result = await leadsService.update(7, { servicio_interes: 'Nuevo servicio' })
      expect(patchMock).toHaveBeenCalledWith('/leads/7', { servicioInteres: 'Nuevo servicio' })
      expect(result.servicio_interes).toBe('Nuevo servicio')
    })
  })

  describe('updateEstado', () => {
    it('patches lead estado', async () => {
      patchMock.mockResolvedValueOnce({ data: { ...rawLead, estado: 'OFERTADO' } })

      const result = await leadsService.updateEstado(7, LeadState.Ofertado)
      expect(patchMock).toHaveBeenCalledWith('/leads/7/status', { estado: 'OFERTADO' })
      expect(result.estado).toBe(LeadState.Ofertado)
    })
  })

  describe('delete', () => {
    it('deletes lead and cleans local fields', async () => {
      localStorage.setItem('bioactiva:lead-local-fields', JSON.stringify({ 7: { fecha_cierre: '2026-07-15' } }))
      deleteMock.mockResolvedValueOnce({})

      await leadsService.delete(7)
      expect(deleteMock).toHaveBeenCalledWith('/leads/7')
      expect(JSON.parse(localStorage.getItem('bioactiva:lead-local-fields') ?? '{}')).toEqual({})
    })
  })

  describe('getByContacto', () => {
    it('fetches leads filtered by contact id server-side', async () => {
      const leadWithContact = { ...rawLead, idContacto: 4 }
      getMock.mockResolvedValueOnce({
        data: { data: [leadWithContact], meta: { page: 1, limit: 100, total: 1, totalPages: 1 } },
      })

      const result = await leadsService.getByContacto(4)
      expect(getMock).toHaveBeenCalledWith('/leads', { params: { idContacto: 4 } })
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(7)
    })
  })

  describe('getPipeline', () => {
    it('builds pipeline from all leads', async () => {
      getMock.mockResolvedValueOnce({
        data: { data: [rawLead], meta: { page: 1, limit: 100, total: 1, totalPages: 1 } },
      })

      const pipeline = await leadsService.getPipeline()
      expect(pipeline.prospecto).toHaveLength(1)
      expect(pipeline.ofertado).toHaveLength(0)
      expect(pipeline.total).toBe(1)
    })
  })

  describe('local storage fields', () => {
    it('persists and merges fecha_cierre', async () => {
      postMock.mockResolvedValueOnce({ data: rawLead })

      await leadsService.create({
        id_org: 'org-001', servicio_interes: 'Test', id_encargado: 1,
        estado: LeadState.Prospecto, fecha_cierre: '2026-07-15',
      })

      const stored = JSON.parse(localStorage.getItem('bioactiva:lead-local-fields') ?? '{}')
      expect(stored[7].fecha_cierre).toBe('2026-07-15')
    })
  })
})
