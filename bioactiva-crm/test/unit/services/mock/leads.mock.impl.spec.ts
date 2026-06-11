import {
  mockGetPipeline,
  mockGetLeads,
  mockGetLead,
  mockCreateLead,
  mockUpdateLead,
  mockUpdateEstadoLead,
  mockDeleteLead,
  mockGetActividades,
  mockCreateActividad,
  mockUpdateActividad,
} from '@/services/mock/leads.mock'
import { LeadState } from '@/types/enums'

describe('mocks/leads.mock (implementation)', () => {
  describe('mockGetPipeline', () => {
    it('returns pipeline structure with leads in each column', async () => {
      const result = await mockGetPipeline()
      expect(result).toHaveProperty('prospecto')
      expect(result).toHaveProperty('ofertado')
      expect(result).toHaveProperty('cierreVenta')
      expect(result).toHaveProperty('cierreSinVenta')
      expect(result).toHaveProperty('total')
      expect(result.total).toBeGreaterThan(0)
    })

    it('filters by responsable', async () => {
      const result = await mockGetPipeline({ responsable: 4 })
      expect(result.total).toBeGreaterThan(0)
    })
  })

  describe('mockGetLeads', () => {
    it('returns paginated leads', async () => {
      const result = await mockGetLeads()
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('total')
      expect(result.data.length).toBeGreaterThan(0)
      expect(result.total).toBeGreaterThan(0)
    })
  })

  describe('mockGetLead', () => {
    it('returns lead by id', async () => {
      const result = await mockGetLead(1)
      expect(result.id).toBe(1)
      expect(result).toHaveProperty('estado')
    })

    it('throws 404 for unknown id', async () => {
      await expect(mockGetLead(999)).rejects.toMatchObject({ status: 404 })
    })
  })

  describe('mockCreateLead', () => {
    it('creates lead with Prospecto state', async () => {
      const result = await mockCreateLead({ nombre_empresa: 'Test' } as any)
      expect(result.estado).toBe(LeadState.Prospecto)
      expect(result.id).toBeDefined()
    })
  })

  describe('mockUpdateLead', () => {
    it('updates lead fields', async () => {
      const result = await mockUpdateLead(1, { comentarios: 'Updated' })
      expect(result.comentarios).toBe('Updated')
    })
  })

  describe('mockUpdateEstadoLead', () => {
    it('updates lead state', async () => {
      const result = await mockUpdateEstadoLead(4, LeadState.Ofertado)
      expect(result.estado).toBe(LeadState.Ofertado)
    })
  })

  describe('mockDeleteLead', () => {
    it('deletes lead successfully', async () => {
      await expect(mockDeleteLead(1)).resolves.toBeUndefined()
    })
  })

  describe('mockGetActividades', () => {
    it('returns activities for a lead', async () => {
      const result = await mockGetActividades(1)
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('mockCreateActividad', () => {
    it('creates actividad for a lead without existing pending', async () => {
      const result = await mockCreateActividad({ id_lead: 10, nombre_actividad: 'Test' } as any)
      expect(result).toHaveProperty('id')
      expect(result.id_lead).toBe(10)
    })

    it('throws for lead with existing pending actividad', async () => {
      await expect(
        mockCreateActividad({ id_lead: 1, nombre_actividad: 'Duplicada' } as any)
      ).rejects.toMatchObject({ status: 409 })
    })
  })

  describe('mockUpdateActividad', () => {
    it('updates actividad fields', async () => {
      const result = await mockUpdateActividad(1, { notas: 'Updated' })
      expect(result.notas).toBe('Updated')
    })
  })
})
