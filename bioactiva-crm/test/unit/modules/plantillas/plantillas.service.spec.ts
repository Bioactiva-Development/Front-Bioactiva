jest.mock('@/lib/constants/config', () => ({ USE_MOCK: false }))

const getMock = jest.fn()
const postMock = jest.fn()
const patchMock = jest.fn()
const deleteMock = jest.fn()

jest.mock('@/services/api/client', () => ({
  apiClient: { get: getMock, post: postMock, patch: patchMock, delete: deleteMock },
}))

import { plantillasService } from '@/services/modules/plantillas.service'

describe('plantillas/plantillas.service (API mode)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAll', () => {
    it('fetches all plantillas', async () => {
      getMock.mockResolvedValueOnce({
        data: [
          { id: 1, nombre: 'Plantilla 1', asunto: 'Asunto 1', cuerpo: '<p>Body</p>', activo: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
        ],
      })

      const result = await plantillasService.getAll()
      expect(getMock).toHaveBeenCalledWith('/templates', { params: {} })
      expect(result).toHaveLength(1)
      expect(result[0].nombre).toBe('Plantilla 1')
    })

    it('passes includeInactive param when requested', async () => {
      getMock.mockResolvedValueOnce({ data: [] })

      await plantillasService.getAll(true)
      expect(getMock).toHaveBeenCalledWith('/templates', { params: { includeInactive: true } })
    })

    it('handles missing fields with defaults', async () => {
      getMock.mockResolvedValueOnce({ data: [{ id: '1' }] })

      const result = await plantillasService.getAll()
      expect(result[0].nombre).toBe('')
      expect(result[0].activo).toBe(true)
    })
  })

  describe('getActivas', () => {
    it('fetches only active plantillas', async () => {
      getMock.mockResolvedValueOnce({
        data: [
          { id: 1, nombre: 'Activa', asunto: 'A', cuerpo: 'C', activo: true, createdAt: '', updatedAt: '' },
        ],
      })

      const result = await plantillasService.getActivas()
      expect(getMock).toHaveBeenCalledWith('/notifications/templates')
      expect(result).toHaveLength(1)
    })
  })

  describe('getById', () => {
    it('fetches plantilla by id', async () => {
      getMock.mockResolvedValueOnce({
        data: { id: 1, nombre: 'Plantilla', asunto: 'Asunto', cuerpo: 'Cuerpo', activo: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      })

      const result = await plantillasService.getById(1)
      expect(getMock).toHaveBeenCalledWith('/templates/1')
      expect(result.nombre).toBe('Plantilla')
    })
  })

  describe('create', () => {
    it('posts create plantilla and returns mapped result', async () => {
      postMock.mockResolvedValueOnce({
        data: { id: 1, nombre: 'Nueva', asunto: 'Asunto', cuerpo: 'Cuerpo', activo: true, createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
      })

      const result = await plantillasService.create({
        nombre: 'Nueva', asunto: 'Asunto', cuerpo: 'Cuerpo',
      })
      expect(postMock).toHaveBeenCalledWith('/templates', { nombre: 'Nueva', asunto: 'Asunto', cuerpo: 'Cuerpo' })
      expect(result.nombre).toBe('Nueva')
    })
  })

  describe('update', () => {
    it('patches plantilla and returns updated data', async () => {
      patchMock.mockResolvedValueOnce({
        data: { id: 1, nombre: 'Updated', asunto: 'Asunto', cuerpo: 'Cuerpo', activo: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
      })

      const result = await plantillasService.update(1, { nombre: 'Updated' })
      expect(patchMock).toHaveBeenCalledWith('/templates/1', { nombre: 'Updated' })
      expect(result.nombre).toBe('Updated')
    })
  })

  describe('delete', () => {
    it('deletes plantilla', async () => {
      deleteMock.mockResolvedValueOnce({})
      await plantillasService.delete(1)
      expect(deleteMock).toHaveBeenCalledWith('/templates/1')
    })
  })

  describe('desactivar', () => {
    it('sets activo to false via update', async () => {
      patchMock.mockResolvedValueOnce({
        data: { id: 1, nombre: 'P', asunto: 'A', cuerpo: 'C', activo: false, createdAt: '', updatedAt: '' },
      })

      const result = await plantillasService.desactivar(1)
      expect(patchMock).toHaveBeenCalledWith('/templates/1', { activo: false })
      expect(result.activo).toBe(false)
    })
  })
})
