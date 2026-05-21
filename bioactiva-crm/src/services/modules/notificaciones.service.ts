import { USE_MOCK } from '@/lib/constants/config'
import { apiClient } from '@/services/api/client'
import {
  mockGetCentro,
  mockGetNotificaciones,
  mockMarcarLeida,
  mockMarcarTodasLeidas,
  mockCancelarProgramada,
  mockCreateRecordatorio,
  mockCreateSeguimiento,
} from '@/services/mock/notificaciones.mock'
import {
  Notificacion,
  NotificacionProgramada,
  CentroNotificaciones,
} from '@/types/notificacion.types'

export const notificacionesService = {

  getCentro: async (): Promise<CentroNotificaciones> => {
    if (USE_MOCK) return mockGetCentro()
    const response = await apiClient.get<CentroNotificaciones>(
      '/api/notificaciones/centro'
    )
    return response.data
  },

  getAll: async (): Promise<Notificacion[]> => {
    if (USE_MOCK) return mockGetNotificaciones()
    const response = await apiClient.get<Notificacion[]>(
      '/api/notificaciones'
    )
    return response.data
  },

  marcarLeida: async (id: number): Promise<Notificacion> => {
    if (USE_MOCK) return mockMarcarLeida(id)
    const response = await apiClient.patch<Notificacion>(
      `/api/notificaciones/${id}/leer`
    )
    return response.data
  },

  marcarTodasLeidas: async (): Promise<void> => {
    if (USE_MOCK) return mockMarcarTodasLeidas()
    await apiClient.patch('/api/notificaciones/leer-todas')
  },

  cancelarProgramada: async (id: number): Promise<void> => {
    if (USE_MOCK) return mockCancelarProgramada(id)
    await apiClient.delete(`/api/notificaciones/programadas/${id}`)
  },

  createRecordatorio: async (
    data: Partial<NotificacionProgramada>
  ): Promise<NotificacionProgramada> => {
    if (USE_MOCK) return mockCreateRecordatorio(data)
    const response = await apiClient.post<NotificacionProgramada>(
      '/api/notificaciones/recordatorio',
      data
    )
    return response.data
  },

  createSeguimiento: async (
    data: Partial<NotificacionProgramada>
  ): Promise<NotificacionProgramada> => {
    if (USE_MOCK) return mockCreateSeguimiento(data)
    const response = await apiClient.post<NotificacionProgramada>(
      '/api/notificaciones/seguimiento',
      data
    )
    return response.data
  },
}