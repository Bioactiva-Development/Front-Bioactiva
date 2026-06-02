import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
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

/**
 * Servicio de notificaciones.
 *
 * NOTA: el módulo `notifications` del backend NestJS está marcado como
 * **Pendiente** en la doc oficial (no hay controlador HTTP visible aún). Hasta
 * que el backend exponga los endpoints, `getCentro` y `getAll` van a recibir
 * 404. Para no ensuciar la UI ni la consola con ese estado transitorio:
 *
 * - `getCentro` retorna un estado vacío seguro cuando recibe 404, en vez de
 *   propagar el error.
 * - El hook `useCentroNotificaciones` debe usar `retry: false` para no
 *   reintentar requests que sabemos que van a fallar mientras se implementa.
 */

const isAppError404 = (err: unknown): boolean => {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { status?: number }).status === 404
  )
}

const CENTRO_VACIO: CentroNotificaciones = {
  programadas: [],
  vencidas:    [],
  sinLeer:     0,
}

export const notificacionesService = {

  getCentro: async (): Promise<CentroNotificaciones> => {
    if (USE_MOCK) return mockGetCentro()
    try {
      const response = await apiClient.get<CentroNotificaciones>(
        ENDPOINTS.notificaciones.centro,
      )
      return response.data
    } catch (err) {
      // Degradación elegante mientras el backend no exponga el módulo.
      if (isAppError404(err)) return CENTRO_VACIO
      throw err
    }
  },

  getAll: async (): Promise<Notificacion[]> => {
    if (USE_MOCK) return mockGetNotificaciones()
    try {
      const response = await apiClient.get<Notificacion[]>(
        ENDPOINTS.notificaciones.list,
      )
      return response.data
    } catch (err) {
      if (isAppError404(err)) return []
      throw err
    }
  },

  marcarLeida: async (id: number): Promise<Notificacion> => {
    if (USE_MOCK) return mockMarcarLeida(id)
    const response = await apiClient.patch<Notificacion>(
      ENDPOINTS.notificaciones.leer(id),
    )
    return response.data
  },

  marcarTodasLeidas: async (): Promise<void> => {
    if (USE_MOCK) return mockMarcarTodasLeidas()
    await apiClient.patch(ENDPOINTS.notificaciones.leerTodas)
  },

  cancelarProgramada: async (id: number): Promise<void> => {
    if (USE_MOCK) return mockCancelarProgramada(id)
    await apiClient.delete(ENDPOINTS.notificaciones.programada(id))
  },

  createRecordatorio: async (
    data: Partial<NotificacionProgramada>,
  ): Promise<NotificacionProgramada> => {
    if (USE_MOCK) return mockCreateRecordatorio(data)
    const response = await apiClient.post<NotificacionProgramada>(
      ENDPOINTS.notificaciones.recordatorio,
      data,
    )
    return response.data
  },

  createSeguimiento: async (
    data: Partial<NotificacionProgramada>,
  ): Promise<NotificacionProgramada> => {
    if (USE_MOCK) return mockCreateSeguimiento(data)
    const response = await apiClient.post<NotificacionProgramada>(
      ENDPOINTS.notificaciones.seguimiento,
      data,
    )
    return response.data
  },
}
