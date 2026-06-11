jest.mock('@/lib/constants/config', () => ({ USE_MOCK: false }))

const getMock = jest.fn()
const postMock = jest.fn()
const patchMock = jest.fn()
const deleteMock = jest.fn()

jest.mock('@/services/api/client', () => ({
  apiClient: { get: getMock, post: postMock, patch: patchMock, delete: deleteMock },
}))

import { notificacionesService } from '@/services/modules/notificaciones.service'

describe('notificaciones/notificaciones.service (API mode)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCentro', () => {
    it('fetches centro de notificaciones', async () => {
      getMock.mockResolvedValueOnce({
        data: {
          programadas: [{ id: 1, estado: 'Programada' }],
          vencidas: [],
          sinLeer: 1,
        },
      })

      const result = await notificacionesService.getCentro()
      expect(result.sinLeer).toBe(1)
      expect(result.programadas).toHaveLength(1)
    })

    it('returns empty centro on 404', async () => {
      getMock.mockRejectedValueOnce({ status: 404 })

      const result = await notificacionesService.getCentro()
      expect(result.programadas).toEqual([])
      expect(result.vencidas).toEqual([])
      expect(result.sinLeer).toBe(0)
    })

    it('re-throws non-404 errors', async () => {
      getMock.mockRejectedValueOnce({ status: 500 })

      await expect(notificacionesService.getCentro()).rejects.toEqual({ status: 500 })
    })
  })

  describe('getAll', () => {
    it('fetches all notifications', async () => {
      getMock.mockResolvedValueOnce({
        data: [
          { id: 1, titulo: 'Notificación 1', id_lead: 10, estado: 'No Leida' },
        ],
      })

      const result = await notificacionesService.getAll()
      expect(result).toHaveLength(1)
    })

    it('returns empty array on 404', async () => {
      getMock.mockRejectedValueOnce({ status: 404 })

      const result = await notificacionesService.getAll()
      expect(result).toEqual([])
    })

    it('re-throws non-404 errors', async () => {
      getMock.mockRejectedValueOnce({ status: 500 })

      await expect(notificacionesService.getAll()).rejects.toEqual({ status: 500 })
    })
  })

  describe('getByLead', () => {
    it('filters notifications by lead id', async () => {
      getMock.mockResolvedValueOnce({
        data: [
          { id: 1, titulo: 'N1', id_lead: 10 },
          { id: 2, titulo: 'N2', id_lead: 20 },
        ],
      })

      const result = await notificacionesService.getByLead(10)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })
  })

  describe('marcarLeida', () => {
    it('patches notification as read', async () => {
      patchMock.mockResolvedValueOnce({ data: { id: 1, estado: 'Leida' } })

      const result = await notificacionesService.marcarLeida(1)
      expect(patchMock).toHaveBeenCalledWith('/notificaciones/1/leer')
      expect(result.estado).toBe('Leida')
    })
  })

  describe('marcarTodasLeidas', () => {
    it('patches all notifications as read', async () => {
      patchMock.mockResolvedValueOnce({})
      await notificacionesService.marcarTodasLeidas()
      expect(patchMock).toHaveBeenCalledWith('/notificaciones/leer-todas')
    })
  })

  describe('cancelarProgramada', () => {
    it('deletes scheduled notification', async () => {
      deleteMock.mockResolvedValueOnce({})
      await notificacionesService.cancelarProgramada(1)
      expect(deleteMock).toHaveBeenCalledWith('/notificaciones/programadas/1')
    })
  })

  describe('cancelarPendientesPorActividad', () => {
    it('cancels all pending notifications for an activity', async () => {
      getMock.mockResolvedValueOnce({
        data: {
          programadas: [
            { id: 1, id_actividad: 5, estado: 'Programada' },
            { id: 2, id_actividad: 5, estado: 'Programada' },
            { id: 3, id_actividad: 10, estado: 'Programada' },
          ],
          vencidas: [],
          sinLeer: 3,
        },
      })
      deleteMock.mockResolvedValue({})

      await notificacionesService.cancelarPendientesPorActividad(5)
      expect(deleteMock).toHaveBeenCalledTimes(2)
      expect(deleteMock).toHaveBeenCalledWith('/notificaciones/programadas/1')
      expect(deleteMock).toHaveBeenCalledWith('/notificaciones/programadas/2')
    })
  })

  describe('createRecordatorio', () => {
    it('posts recordatorio', async () => {
      postMock.mockResolvedValueOnce({ data: { id: 1, asunto: 'Recordatorio' } })

      const result = await notificacionesService.createRecordatorio({
        asunto: 'Recordatorio', cuerpo: 'Cuerpo',
      })
      expect(postMock).toHaveBeenCalledWith('/notificaciones/recordatorio', {
        asunto: 'Recordatorio', cuerpo: 'Cuerpo',
      })
      expect(result.id).toBe(1)
    })
  })

  describe('createSeguimiento', () => {
    it('posts seguimiento', async () => {
      postMock.mockResolvedValueOnce({ data: { id: 1, asunto: 'Seguimiento' } })

      const result = await notificacionesService.createSeguimiento({
        asunto: 'Seguimiento', cuerpo: 'Cuerpo',
      })
      expect(postMock).toHaveBeenCalledWith('/notificaciones/seguimiento', {
        asunto: 'Seguimiento', cuerpo: 'Cuerpo',
      })
      expect(result.id).toBe(1)
    })
  })
})
