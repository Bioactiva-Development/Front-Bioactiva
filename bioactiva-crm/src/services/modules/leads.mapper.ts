import { ActivityAlert, Lead, LeadFiltros, LeadFormData } from '@/types/lead.types'
import { LeadState } from '@/types/enums'

export interface LeadDtoOut {
  id: number
  estado: string
  servicioInteres: string
  comentarios: string | null
  desafioOportunidad: string | null
  notasContacto: string | null
  canalCaptacion: string | null
  idOrg: string
  organizationName: string
  idContacto: number | null
  contactName: string | null
  idEncargado: number
  encargadoName: string
  idAuthor: number
  createdAt: string
  updatedAt: string
  ultimoCambioEstado: string
  fechaCierre?: string | null
  fechaCierreEstimada?: string | null
  fecha_cierre?: string | null
  activityAlert?: string | null
}

const ACTIVITY_ALERTS = new Set<ActivityAlert>(['VERDE', 'AMARILLO', 'ROJO'])

const toActivityAlert = (value?: string | null): ActivityAlert | undefined =>
  value && ACTIVITY_ALERTS.has(value as ActivityAlert)
    ? (value as ActivityAlert)
    : undefined

export interface LeadsDtoResponse {
  data: LeadDtoOut[]
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface LeadCreateDto {
  idOrg: string
  servicioInteres: string
  idEncargado: number
  idContacto?: number
  comentarios?: string
  desafioOportunidad?: string
  notasContacto?: string
  canalCaptacion?: string
}

export type LeadUpdateDto = Partial<LeadCreateDto>

const LEAD_STATE_DOMAIN_TO_BACKEND: Record<LeadState, string> = {
  [LeadState.Prospecto]: 'EN_PROSPECTO',
  [LeadState.Ofertado]: 'OFERTADO',
  [LeadState.CierreVenta]: 'CIERRE_CON_VENTA',
  [LeadState.CierreSinVenta]: 'CIERRE_SIN_VENTA',
}

const LEAD_STATE_BACKEND_TO_DOMAIN: Record<string, LeadState> = {
  EN_PROSPECTO: LeadState.Prospecto,
  OFERTADO: LeadState.Ofertado,
  CIERRE_CON_VENTA: LeadState.CierreVenta,
  CIERRE_SIN_VENTA: LeadState.CierreSinVenta,
}

const trimOrUndefined = (value?: string | null): string | undefined => {
  if (value == null) return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const codigoFromLead = (dto: Pick<LeadDtoOut, 'id' | 'createdAt'>) => {
  const year = dto.createdAt ? new Date(dto.createdAt).getFullYear() : new Date().getFullYear()
  return `LEAD-${year}-${String(dto.id).padStart(3, '0')}`
}

export const fromLeadDto = (dto: LeadDtoOut): Lead => ({
  id: dto.id,
  codigo: codigoFromLead(dto),
  id_org: dto.idOrg,
  id_contacto: dto.idContacto ?? undefined,
  estado: LEAD_STATE_BACKEND_TO_DOMAIN[dto.estado] ?? LeadState.Prospecto,
  servicio_interes: dto.servicioInteres,
  comentarios: dto.comentarios ?? undefined,
  desafio_oportunidad: dto.desafioOportunidad ?? undefined,
  notas_contacto: dto.notasContacto ?? undefined,
  id_encargado: dto.idEncargado,
  canal_captacion: dto.canalCaptacion ?? undefined,
  fecha_cierre:
    dto.fechaCierre ??
    dto.fechaCierreEstimada ??
    dto.fecha_cierre ??
    undefined,
  id_author: dto.idAuthor,
  created_at: dto.createdAt,
  updated_at: dto.ultimoCambioEstado ?? dto.updatedAt,
  organizacion_nombre: dto.organizationName,
  contacto_nombre: dto.contactName ?? undefined,
  encargado_nombre: dto.encargadoName,
  activity_alert: toActivityAlert(dto.activityAlert),
})

export const toBackendLeadState = (estado: LeadState) =>
  LEAD_STATE_DOMAIN_TO_BACKEND[estado]

export const toLeadQueryParams = (filtros?: LeadFiltros) => {
  const params: Record<string, string | number | boolean> = {}

  if (filtros?.estado) params.estado = toBackendLeadState(filtros.estado)
  if (filtros?.id_encargado) params.idEncargado = filtros.id_encargado
  if (filtros?.id_org) params.idOrg = filtros.id_org
  if (filtros?.search) params.search = filtros.search
  // Enum TODAS | POR_VENCER | VENCIDAS. Se omite para traer todos los leads.
  if (filtros?.alerta_actividad) params.alertaActividad = filtros.alerta_actividad
  if (filtros?.fecha_desde) params.fechaDesde = filtros.fecha_desde
  if (filtros?.fecha_hasta) params.fechaHasta = filtros.fecha_hasta
  if (filtros?.page) params.page = filtros.page
  if (filtros?.limit) params.limit = filtros.limit

  return params
}

export const toCreateLeadDto = (data: LeadFormData): LeadCreateDto => {
  const dto: LeadCreateDto = {
    idOrg: data.id_org,
    servicioInteres: data.servicio_interes,
    idEncargado: data.id_encargado,
  }

  if (data.id_contacto !== undefined) dto.idContacto = data.id_contacto

  const comentarios = trimOrUndefined(data.comentarios)
  if (comentarios !== undefined) dto.comentarios = comentarios

  const desafioOportunidad = trimOrUndefined(data.desafio_oportunidad)
  if (desafioOportunidad !== undefined) dto.desafioOportunidad = desafioOportunidad

  const notasContacto = trimOrUndefined(data.notas_contacto)
  if (notasContacto !== undefined) dto.notasContacto = notasContacto

  const canalCaptacion = trimOrUndefined(data.canal_captacion)
  if (canalCaptacion !== undefined) dto.canalCaptacion = canalCaptacion

  return dto
}

export const toUpdateLeadDto = (data: Partial<LeadFormData>): LeadUpdateDto => {
  const dto: LeadUpdateDto = {}

  if (data.id_org !== undefined) dto.idOrg = data.id_org
  if (data.servicio_interes !== undefined) dto.servicioInteres = data.servicio_interes
  if (data.id_encargado !== undefined) dto.idEncargado = data.id_encargado
  if (data.id_contacto !== undefined) dto.idContacto = data.id_contacto

  const comentarios = trimOrUndefined(data.comentarios)
  if (comentarios !== undefined) dto.comentarios = comentarios

  const desafioOportunidad = trimOrUndefined(data.desafio_oportunidad)
  if (desafioOportunidad !== undefined) dto.desafioOportunidad = desafioOportunidad

  const notasContacto = trimOrUndefined(data.notas_contacto)
  if (notasContacto !== undefined) dto.notasContacto = notasContacto

  const canalCaptacion = trimOrUndefined(data.canal_captacion)
  if (canalCaptacion !== undefined) dto.canalCaptacion = canalCaptacion

  return dto
}
