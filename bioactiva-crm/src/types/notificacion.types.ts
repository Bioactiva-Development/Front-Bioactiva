import { EstadoNotif } from './enums'

// ─────────────────────────────────────────────────────────────────────────────
// Notificaciones programadas (correos) — contrato Mintlify:
// https://bioactiva.mintlify.app/api/notifications/overview
// ─────────────────────────────────────────────────────────────────────────────

export type TipoNotificacion = 'RECORDATORIO' | 'SEGUIMIENTO'

/**
 * Ciclo de vida según backend. Las canceladas se eliminan y nunca
 * vuelven a aparecer en `GET /notifications`.
 */
export type EstadoNotifProgramada = 'PROGRAMADA' | 'VENCIDA'

export interface NotificacionProgramada {
  id:                  number
  tipo:                TipoNotificacion
  estado:              EstadoNotifProgramada
  id_actividad:        number
  id_lead:             number
  id_responsable:      number
  asunto_interno:      string
  fecha_envio_interno: string
  enviado_interno:     boolean
  // Solo presentes en seguimientos (null en recordatorios)
  correo_cliente:      string | null
  asunto_externo:      string | null
  fecha_envio_externo: string | null
  enviado_externo:     boolean
  created_at:          string
  // Decoración de UI derivada en cliente; el backend no envía estos campos
  lead_codigo?:        string
  lead_org?:           string
  actividad_nombre?:   string
  destinatario?:       string
}

/** Query params soportados por `GET /notifications`. */
export interface NotificacionProgramadaFiltros {
  estado?:         EstadoNotifProgramada
  id_lead?:        number
  id_responsable?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Notificaciones in-app (campanita) — contrato Mintlify:
// https://bioactiva.mintlify.app/api/notifications/in-app
// ─────────────────────────────────────────────────────────────────────────────

export interface Notificacion {
  id:            number
  titulo:        string
  mensaje:       string
  estado:        EstadoNotif
  id_lead?:      number | null
  id_actividad?: number | null
  created_at:    string
  // Decoración de UI derivada en cliente
  lead_codigo?:  string
  lead_org?:     string
}

export interface NotificacionFiltros {
  estado?: EstadoNotif
  tipo?:   TipoNotificacion
}

// ─────────────────────────────────────────────────────────────────────────────
// Inputs de creación (desde formularios). El mapper traduce estos campos a los
// payloads documentados; cualquier campo extra de UI se descarta antes del POST
// porque el backend rechaza propiedades desconocidas.
// ─────────────────────────────────────────────────────────────────────────────

export interface CrearRecordatorioInput {
  id_actividad: number
  id_plantilla: number
  /** 'YYYY-MM-DD' o 'YYYY-MM-DDTHH:mm'; si viene sin hora se combina con `hora_envio`. */
  fecha_envio:  string
  hora_envio?:  string
  asunto:       string
  cuerpo:       string
  // Extras de UI usados solo por mocks/enriquecimiento local
  id_lead?:           number
  destinatario?:      string
  lead_codigo?:       string
  lead_org?:          string
  actividad_nombre?:  string
}

export interface CrearSeguimientoInput {
  id_actividad:         number
  id_plantilla_interno: number
  fecha_envio_interno:  string
  hora_envio_interno?:  string
  asunto_interno:       string
  cuerpo_interno:       string
  id_plantilla_externo: number
  /** Debe pertenecer al contacto del lead (el backend lo valida con 400). */
  correo_cliente:       string
  fecha_envio_externo:  string
  hora_envio_externo?:  string
  asunto_externo:       string
  cuerpo_externo:       string
  // Extras de UI usados solo por mocks/enriquecimiento local
  id_lead?:           number
  destinatario?:      string
  lead_codigo?:       string
  lead_org?:          string
  actividad_nombre?:  string
}

// ─────────────────────────────────────────────────────────────────────────────
// Agregado de UI para el centro de notificaciones. No existe un endpoint
// "centro" en el backend: se compone en cliente con `GET /notifications`
// (estado=PROGRAMADA) + `GET /notifications/in-app`.
// ─────────────────────────────────────────────────────────────────────────────

export interface CentroNotificaciones {
  programadas: NotificacionProgramada[]
  vencidas:    Notificacion[]
  sinLeer:     number
}
