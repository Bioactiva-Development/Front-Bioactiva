import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
  mockGetCentro,
  mockGetNotificaciones,
  mockGetProgramadas,
  mockMarcarLeida,
  mockMarcarTodasLeidas,
  mockCancelarProgramada,
  mockCancelarPendientesPorActividad,
  mockCreateRecordatorio,
  mockCreateSeguimiento,
} from '@/services/mock/notificaciones.mock'
import {
  InAppNotificationDto,
  NotificationDto,
  notificacionInAppFromBackend,
  notificacionProgramadaFromBackend,
  toFollowUpPayload,
  toReminderPayload,
  toScheduledParams,
} from '@/services/modules/notificaciones.mapper'
import {
  CentroNotificaciones,
  CrearRecordatorioInput,
  CrearSeguimientoInput,
  Notificacion,
  NotificacionProgramada,
  NotificacionProgramadaFiltros,
} from '@/types/notificacion.types'
import { EstadoNotif } from '@/types/enums'

/**
 * Servicio de notificaciones, alineado al contrato Mintlify:
 * - Programadas (correos): POST /notifications/reminders | /follow-ups,
 *   GET /notifications, DELETE /notifications/:id.
 * - In-app (campanita): GET /notifications/in-app,
 *   PATCH /notifications/in-app/:id/read.
 *
 * Reglas del backend a tener presentes desde la UI:
 * - Una sola notificación PROGRAMADA por actividad (409 al duplicar).
 * - DELETE sobre una VENCIDA responde 409 ("ya fue ejecutada").
 * - fechaEnvio fuera de 09:00–18:00 se reagenda automáticamente a las 09:00.
 */
export const notificacionesService = {

  /** Notificaciones programadas (correos), con filtros del contrato. */
  getProgramadas: async (
    filtros?: NotificacionProgramadaFiltros,
  ): Promise<NotificacionProgramada[]> => {
    if (USE_MOCK) return mockGetProgramadas(filtros)
    const response = await apiClient.get<NotificationDto[]>(
      ENDPOINTS.notificaciones.list,
      { params: toScheduledParams(filtros) },
    )
    return response.data.map(notificacionProgramadaFromBackend)
  },

  /** Notificaciones in-app (campanita) del usuario autenticado. */
  getAll: async (): Promise<Notificacion[]> => {
    if (USE_MOCK) return mockGetNotificaciones()
    const response = await apiClient.get<InAppNotificationDto[]>(
      ENDPOINTS.notificaciones.inApp,
    )
    return response.data.map(notificacionInAppFromBackend)
  },

  getByLead: async (leadId: number): Promise<Notificacion[]> => {
    const notificaciones = await notificacionesService.getAll()
    return notificaciones.filter((notificacion) => notificacion.id_lead === leadId)
  },

  /**
   * Agregado para la UI del centro. El backend no expone un endpoint "centro":
   * se compone con programadas PROGRAMADA + bandeja in-app.
   */
  getCentro: async (): Promise<CentroNotificaciones> => {
    if (USE_MOCK) return mockGetCentro()
    const [programadas, inApp] = await Promise.all([
      notificacionesService.getProgramadas({ estado: 'PROGRAMADA' }),
      notificacionesService.getAll(),
    ])
    return {
      programadas,
      vencidas: inApp,
      sinLeer:  inApp.filter((n) => n.estado === EstadoNotif.NoLeida).length,
    }
  },

  marcarLeida: async (id: number): Promise<Notificacion> => {
    if (USE_MOCK) return mockMarcarLeida(id)
    const response = await apiClient.patch<InAppNotificationDto>(
      ENDPOINTS.notificaciones.inAppRead(id),
    )
    return notificacionInAppFromBackend(response.data)
  },

  marcarTodasLeidas: async (): Promise<void> => {
    if (USE_MOCK) return mockMarcarTodasLeidas()
    // El contrato no expone un endpoint read-all: se marca una por una.
    const noLeidas = (await notificacionesService.getAll()).filter(
      (n) => n.estado === EstadoNotif.NoLeida,
    )
    await Promise.all(
      noLeidas.map((n) =>
        apiClient.patch(ENDPOINTS.notificaciones.inAppRead(n.id)),
      ),
    )
  },

  /** Cancela (elimina) una programada. El backend responde 409 si ya venció. */
  cancelarProgramada: async (id: number): Promise<void> => {
    if (USE_MOCK) return mockCancelarProgramada(id)
    await apiClient.delete(ENDPOINTS.notificaciones.cancel(id))
  },

  cancelarPendientesPorActividad: async (actividadId: number): Promise<void> => {
    if (USE_MOCK) return mockCancelarPendientesPorActividad(actividadId)

    const programadas = await notificacionesService.getProgramadas({
      estado: 'PROGRAMADA',
    })
    const pendientes = programadas.filter(
      (programada) => programada.id_actividad === actividadId,
    )

    await Promise.all(
      pendientes.map((programada) =>
        apiClient.delete(ENDPOINTS.notificaciones.cancel(programada.id)),
      ),
    )
  },

  createRecordatorio: async (
    data: CrearRecordatorioInput,
  ): Promise<NotificacionProgramada> => {
    if (USE_MOCK) return mockCreateRecordatorio(data)
    const response = await apiClient.post<NotificationDto>(
      ENDPOINTS.notificaciones.reminders,
      toReminderPayload(data),
    )
    return notificacionProgramadaFromBackend(response.data)
  },

  createSeguimiento: async (
    data: CrearSeguimientoInput,
  ): Promise<NotificacionProgramada> => {
    if (USE_MOCK) return mockCreateSeguimiento(data)
    const response = await apiClient.post<NotificationDto>(
      ENDPOINTS.notificaciones.followUps,
      toFollowUpPayload(data),
    )
    return notificacionProgramadaFromBackend(response.data)
  },
}
