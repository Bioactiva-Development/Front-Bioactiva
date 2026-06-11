import { EstadoNotif } from '@/types/enums'
import {
  CrearRecordatorioInput,
  CrearSeguimientoInput,
  EstadoNotifProgramada,
  Notificacion,
  NotificacionProgramada,
  NotificacionProgramadaFiltros,
  TipoNotificacion,
} from '@/types/notificacion.types'

// ─────────────────────────────────────────────────────────────────────────────
// DTOs del backend (camelCase) según la doc Mintlify:
// - https://bioactiva.mintlify.app/api/notifications/overview
// - https://bioactiva.mintlify.app/api/notifications/in-app
// El backend rechaza propiedades desconocidas: los payloads de salida deben
// contener exactamente los campos documentados.
// ─────────────────────────────────────────────────────────────────────────────

export interface NotificationDto {
  id:                number
  tipo:              TipoNotificacion
  estado:            EstadoNotifProgramada
  idActividad:       number
  idLead:            number
  idResponsable:     number
  asuntoInterno:     string
  fechaEnvioInterno: string
  enviadoInterno:    boolean
  correoCliente:     string | null
  asuntoExterno:     string | null
  fechaEnvioExterno: string | null
  enviadoExterno:    boolean
  createdAt:         string
}

export interface InAppNotificationDto {
  id:          number
  titulo:      string
  mensaje:     string
  estado:      'NO_LEIDA' | 'LEIDA'
  idLead:      number | null
  idActividad: number | null
  createdAt:   string
}

/** Body de `POST /notifications/reminders`. */
export interface ReminderPayload {
  idActividad: number
  fechaEnvio:  string
  idTemplate:  number
  asunto:      string
  cuerpo:      string
}

interface FollowUpEmailPayload {
  fechaEnvio: string
  idTemplate: number
  asunto:     string
  cuerpo:     string
}

/** Body de `POST /notifications/follow-ups`. */
export interface FollowUpPayload {
  idActividad: number
  internal:    FollowUpEmailPayload
  external:    FollowUpEmailPayload & { correoCliente: string }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Combina fecha y hora del formulario en un ISO 8601 (UTC) para el backend.
 * Acepta tanto 'YYYY-MM-DD' + hora separada como 'YYYY-MM-DDTHH:mm' ya unido.
 */
export const toFechaEnvioIso = (fecha: string, hora?: string): string => {
  const valorLocal = fecha.includes('T') || !hora ? fecha : `${fecha}T${hora}`
  return new Date(valorLocal).toISOString()
}

// ─────────────────────────────────────────────────────────────────────────────
// Backend → dominio
// ─────────────────────────────────────────────────────────────────────────────

export const notificacionProgramadaFromBackend = (
  dto: NotificationDto,
): NotificacionProgramada => ({
  id:                  dto.id,
  tipo:                dto.tipo,
  estado:              dto.estado,
  id_actividad:        dto.idActividad,
  id_lead:             dto.idLead,
  id_responsable:      dto.idResponsable,
  asunto_interno:      dto.asuntoInterno,
  fecha_envio_interno: dto.fechaEnvioInterno,
  enviado_interno:     dto.enviadoInterno,
  correo_cliente:      dto.correoCliente,
  asunto_externo:      dto.asuntoExterno,
  fecha_envio_externo: dto.fechaEnvioExterno,
  enviado_externo:     dto.enviadoExterno,
  created_at:          dto.createdAt,
})

export const notificacionInAppFromBackend = (
  dto: InAppNotificationDto,
): Notificacion => ({
  id:           dto.id,
  titulo:       dto.titulo,
  mensaje:      dto.mensaje,
  estado:       dto.estado === 'LEIDA' ? EstadoNotif.Leida : EstadoNotif.NoLeida,
  id_lead:      dto.idLead,
  id_actividad: dto.idActividad,
  created_at:   dto.createdAt,
})

// ─────────────────────────────────────────────────────────────────────────────
// Dominio → backend
// ─────────────────────────────────────────────────────────────────────────────

export const toReminderPayload = (
  input: CrearRecordatorioInput,
): ReminderPayload => ({
  idActividad: input.id_actividad,
  fechaEnvio:  toFechaEnvioIso(input.fecha_envio, input.hora_envio),
  idTemplate:  input.id_plantilla,
  asunto:      input.asunto,
  cuerpo:      input.cuerpo,
})

export const toFollowUpPayload = (
  input: CrearSeguimientoInput,
): FollowUpPayload => ({
  idActividad: input.id_actividad,
  internal: {
    fechaEnvio: toFechaEnvioIso(input.fecha_envio_interno, input.hora_envio_interno),
    idTemplate: input.id_plantilla_interno,
    asunto:     input.asunto_interno,
    cuerpo:     input.cuerpo_interno,
  },
  external: {
    correoCliente: input.correo_cliente,
    fechaEnvio:    toFechaEnvioIso(input.fecha_envio_externo, input.hora_envio_externo),
    idTemplate:    input.id_plantilla_externo,
    asunto:        input.asunto_externo,
    cuerpo:        input.cuerpo_externo,
  },
})

/** Query params de `GET /notifications` (solo incluye los definidos). */
export const toScheduledParams = (
  filtros?: NotificacionProgramadaFiltros,
): Record<string, string | number> => {
  const params: Record<string, string | number> = {}
  if (filtros?.estado) params.estado = filtros.estado
  if (filtros?.id_lead != null) params.idLead = filtros.id_lead
  if (filtros?.id_responsable != null) params.idResponsable = filtros.id_responsable
  return params
}
