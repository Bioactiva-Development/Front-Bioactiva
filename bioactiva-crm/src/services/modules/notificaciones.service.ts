import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
  mockCancelarProgramada,
  mockCreateRecordatorio,
  mockCreateSeguimiento,
  mockEditarSeguimiento,
  mockGetInApp,
  mockGetProgramadas,
  mockMarcarLeida,
} from '@/services/mock/notificaciones.mock'
import {
  CrearRecordatorioRequest,
  CrearSeguimientoRequest,
  EditarSeguimientoRequest,
  FiltrosNotificacionesProgramadas,
  NotificacionInApp,
  NotificacionProgramada,
  NotificacionesPaginadas,
} from '@/types/notificacion.types'

const toQueryParams = (filtros?: FiltrosNotificacionesProgramadas) => {
  const params: Record<string, string | number> = {}
  if (filtros?.estado) params.estado = filtros.estado
  if (filtros?.idLead) params.idLead = filtros.idLead
  if (filtros?.idResponsable) params.idResponsable = filtros.idResponsable
  if (filtros?.page) params.page = filtros.page
  if (filtros?.limit) params.limit = filtros.limit
  return params
}

export const notificacionesService = {
  getProgramadas: async (
    filtros?: FiltrosNotificacionesProgramadas
  ): Promise<NotificacionesPaginadas> => {
    if (USE_MOCK) return mockGetProgramadas(filtros)

    const response = await apiClient.get<NotificacionesPaginadas>(
      ENDPOINTS.notificaciones.list,
      { params: toQueryParams(filtros) }
    )
    return response.data
  },

  getInApp: async (): Promise<NotificacionInApp[]> => {
    if (USE_MOCK) return mockGetInApp()

    const response = await apiClient.get<NotificacionInApp[]>(
      ENDPOINTS.notificaciones.inApp
    )
    return response.data
  },

  marcarLeida: async (id: number): Promise<NotificacionInApp> => {
    if (USE_MOCK) return mockMarcarLeida(id)

    const response = await apiClient.patch<NotificacionInApp>(
      ENDPOINTS.notificaciones.readInApp(id)
    )
    return response.data
  },

  cancelarProgramada: async (id: number): Promise<NotificacionProgramada> => {
    if (USE_MOCK) return mockCancelarProgramada(id)

    const response = await apiClient.delete<NotificacionProgramada>(
      ENDPOINTS.notificaciones.cancel(id)
    )
    return response.data
  },

  createRecordatorio: async (
    data: CrearRecordatorioRequest
  ): Promise<NotificacionProgramada> => {
    if (USE_MOCK) return mockCreateRecordatorio(data)

    const response = await apiClient.post<NotificacionProgramada>(
      ENDPOINTS.notificaciones.recordatorio,
      data
    )
    return response.data
  },

  createSeguimiento: async (
    data: CrearSeguimientoRequest
  ): Promise<NotificacionProgramada> => {
    if (USE_MOCK) return mockCreateSeguimiento(data)

    const response = await apiClient.post<NotificacionProgramada>(
      ENDPOINTS.notificaciones.seguimiento,
      data
    )
    return response.data
  },

  editarSeguimiento: async (
    id: number,
    data: EditarSeguimientoRequest
  ): Promise<NotificacionProgramada> => {
    if (USE_MOCK) return mockEditarSeguimiento(id, data)

    const response = await apiClient.patch<NotificacionProgramada>(
      ENDPOINTS.notificaciones.editSeguimiento(id),
      data
    )
    return response.data
  },
}
