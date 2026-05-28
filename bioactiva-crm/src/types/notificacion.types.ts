import { EstadoNotif } from './enums'

export type TipoNotificacion =
  | 'Recordatorio'
  | 'Seguimiento'
  | 'Alerta'

export interface Notificacion {
  id: number
  id_usuario: number
  id_actividad?: number
  id_lead?:number
  titulo:string
  mensaje: string
  tipo: TipoNotificacion
  estado: EstadoNotif
  created_at:string
  lead_codigo?:string
  lead_org?: string
}

export interface NotificacionProgramada {
  id: number
  id_actividad: number
  id_lead: number
  tipo:TipoNotificacion
  fecha_envio: string
  asunto: string
  cuerpo: string
  destinatario: string
  estado: 'Programada' | 'Cancelada' | 'Enviada'
  created_at:string
  lead_codigo?:string
  lead_org?: string
  actividad_nombre?: string
}

export interface NotificacionFiltros {
  estado?: EstadoNotif
  tipo?:   TipoNotificacion
}

export interface CentroNotificaciones {
  programadas: NotificacionProgramada[]
  vencidas:    Notificacion[]
  sinLeer:     number
}