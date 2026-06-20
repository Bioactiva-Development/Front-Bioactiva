import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
  mockCancelarProgramada,
  mockCreateRecordatorio,
  mockCreateSeguimiento,
  mockGetInApp,
  mockGetProgramadas,
  mockMarcarLeida,
} from '@/services/mock/notificaciones.mock'
import {
  CrearRecordatorioRequest,
  CrearSeguimientoRequest,
  FiltrosNotificacionesProgramadas,
  NotificacionInApp,
  NotificacionProgramada,
} from '@/types/notificacion.types'

// El backend pagina `GET /notifications` con un `limit` por defecto de 10. Estas
// vistas muestran listas completas filtradas (por lead, responsable o estado),
// así que pedimos un límite alto para no truncar resultados.
const PROGRAMADAS_PAGE_SIZE = 100

// `GET /notifications` ahora responde paginado `{ data, meta }`. Se tolera el
// arreglo plano legacy por compatibilidad.
type ProgramadasResponse =
  | NotificacionProgramada[]
  | {
      data: NotificacionProgramada[]
      meta?: { page: number; limit: number; total: number; totalPages: number }
    }

const toQueryParams = (filtros?: FiltrosNotificacionesProgramadas) => {
  const params: Record<string, string | number> = { limit: PROGRAMADAS_PAGE_SIZE }
  if (filtros?.estado) params.estado = filtros.estado
  if (filtros?.idLead) params.idLead = filtros.idLead
  if (filtros?.idResponsable) params.idResponsable = filtros.idResponsable
  return params
}

export const notificacionesService = {
  getProgramadas: async (
    filtros?: FiltrosNotificacionesProgramadas
  ): Promise<NotificacionProgramada[]> => {
    if (USE_MOCK) return mockGetProgramadas(filtros)

    const response = await apiClient.get<ProgramadasResponse>(
      ENDPOINTS.notificaciones.list,
      { params: toQueryParams(filtros) }
    )
    const body = response.data
    return Array.isArray(body) ? body : body.data ?? []
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
}
