export type TipoNotificacionProgramada = 'RECORDATORIO' | 'SEGUIMIENTO'
export type EstadoNotificacionProgramada =
  | 'PROGRAMADA'
  | 'VENCIDA'
  | 'CANCELADA'

export type EstadoNotificacionInApp = 'NO_LEIDA' | 'LEIDA'

export interface InstanciaSeguimiento {
  id: number
  orden: number
  asuntoInterno: string
  fechaEnvioInterno: string
  enviadoInterno: boolean
  asuntoExterno: string
  fechaEnvioExterno: string
  enviadoExterno: boolean
}

export interface NotificacionProgramada {
  id: number
  tipo: TipoNotificacionProgramada
  estado: EstadoNotificacionProgramada
  idActividad: number
  idLead: number
  idResponsable: number
  asuntoInterno: string | null
  fechaEnvioInterno: string | null
  enviadoInterno: boolean
  correoCliente: string | null
  instancias: InstanciaSeguimiento[] | null
  createdAt: string
}

export interface NotificacionesMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface NotificacionesPaginadas {
  data: NotificacionProgramada[]
  meta: NotificacionesMeta
}

export interface NotificacionInApp {
  id: number
  titulo: string
  mensaje: string
  estado: EstadoNotificacionInApp
  idLead: number | null
  idActividad: number | null
  createdAt: string
}

export interface FiltrosNotificacionesProgramadas {
  estado?: Extract<EstadoNotificacionProgramada, 'PROGRAMADA' | 'VENCIDA'>
  idLead?: number
  idResponsable?: number
  page?: number
  limit?: number
}

export interface CrearRecordatorioRequest {
  idLead: number
  minutosAntes: number
  idTemplate?: number | null
  asunto: string
  cuerpo: string
}

export interface MensajeSeguimientoRequest {
  fechaEnvio: string
  idTemplate?: number | null
  asunto: string
  cuerpo: string
}

export interface InstanciaSeguimientoRequest {
  internal: MensajeSeguimientoRequest
  external: MensajeSeguimientoRequest
}

export interface CrearSeguimientoRequest {
  idLead: number
  correoCliente: string
  instancias: InstanciaSeguimientoRequest[]
}

export interface EditarSeguimientoRequest {
  correoCliente?: string
  internal: MensajeSeguimientoRequest
  external: MensajeSeguimientoRequest
}
