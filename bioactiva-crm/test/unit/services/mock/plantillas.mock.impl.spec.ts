import {
  mockGetPlantillas,
  mockGetPlantillasActivas,
  mockGetPlantilla,
  mockCreatePlantilla,
  mockUpdatePlantilla,
  mockDeletePlantilla,
} from '@/services/mock/plantillas.mock'

describe('mocks/plantillas.mock (implementation)', () => {
  describe('mockGetPlantillas', () => {
    it('returns plantillas list', async () => {
      const result = await mockGetPlantillas()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    it('filters by includeInactive', async () => {
      const result = await mockGetPlantillas(true)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('mockGetPlantillasActivas', () => {
    it('returns active plantillas', async () => {
      const result = await mockGetPlantillasActivas()
      expect(result.every((p: any) => p.activo === true)).toBe(true)
    })
  })

  describe('mockGetPlantilla', () => {
    it('returns plantilla by id', async () => {
      const result = await mockGetPlantilla(1)
      expect(result.id).toBe(1)
    })

    it('throws 404 for unknown id', async () => {
      await expect(mockGetPlantilla(999)).rejects.toMatchObject({ status: 404 })
    })
  })

  describe('mockCreatePlantilla', () => {
    it('creates plantilla', async () => {
      const result = await mockCreatePlantilla({ nombre: 'Nueva' } as any)
      expect(result).toHaveProperty('id')
      expect(result.nombre).toBe('Nueva')
    })
  })

  describe('mockUpdatePlantilla', () => {
    it('updates plantilla', async () => {
      const result = await mockUpdatePlantilla(1, { nombre: 'Updated' })
      expect(result.nombre).toBe('Updated')
    })
  })

  describe('mockDeletePlantilla', () => {
    it('throws for plantilla associated with notification', async () => {
      await expect(mockDeletePlantilla(1)).rejects.toThrow(
        'No se puede eliminar la plantilla porque está asociada a una notificación',
      )
    })
  })
})
