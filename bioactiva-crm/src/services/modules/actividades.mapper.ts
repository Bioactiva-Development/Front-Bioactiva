import { Actividad, ActividadFiltros, ActividadFormData } from '@/types/actividad.types'
import { EstadoActividad, TipoActividad } from '@/types/enums'

export interface ActividadDtoOut {
  id: number
  nombreActividad: string
  tipo: string
  estado: string
  fechaInicio: string
  fechaFin: string
  notas: string | null
  idLead: number
  leadServicioInteres?: string
  leadEstado?: string
  idResponsable: number
  responsableName?: string | null
  outlookEventId?: string | null
  outlookImported?: boolean
  teamsMeetingUrl?: string | null
  seguimientoAutomatico?: boolean
  idAuthor?: number
  createdAt: string
  updatedAt: string
}

export interface ActividadesDtoResponse {
  data: ActividadDtoOut[]
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ActividadCreateDto {
  idLead: number
  nombreActividad: string
  fechaInicio: string
  fechaFin: string
  tipo: string
  idResponsable: number
  notas?: string
}

export type ActividadUpdateDto = Partial<
  Pick<
    ActividadCreateDto,
    'nombreActividad' | 'fechaInicio' | 'fechaFin' | 'idResponsable' | 'notas'
  >
>

const TIPO_DOMAIN_TO_BACKEND: Record<TipoActividad, string> = {
  [TipoActividad.Email]: 'EMAIL',
  [TipoActividad.Reunion]: 'REUNION',
  [TipoActividad.Llamada]: 'LLAMADA',
  [TipoActividad.Otro]: 'OTRO',
}

const TIPO_BACKEND_TO_DOMAIN: Record<string, TipoActividad> = {
  EMAIL: TipoActividad.Email,
  REUNION: TipoActividad.Reunion,
  LLAMADA: TipoActividad.Llamada,
  OTRO: TipoActividad.Otro,
}

const ESTADO_BACKEND_TO_DOMAIN: Record<string, EstadoActividad> = {
  PENDIENTE: EstadoActividad.Pendiente,
  REALIZADA: EstadoActividad.Completada,
}

const trimOrUndefined = (value?: string | null): string | undefined => {
  if (value == null) return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const toIsoDateTime = (value: string): string => {
  if (value.endsWith('Z')) return value
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return `${value}:00.000Z`
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)) {
    return `${value}.000Z`
  }
  return new Date(value).toISOString()
}

export const fromActividadDto = (dto: ActividadDtoOut): Actividad => ({
  id: dto.id,
  id_lead: dto.idLead,
  id_responsable: dto.idResponsable,
  nombre_actividad: dto.nombreActividad,
  fecha_inicio: dto.fechaInicio,
  fecha_fin: dto.fechaFin,
  tipo: TIPO_BACKEND_TO_DOMAIN[dto.tipo] ?? TipoActividad.Otro,
  estado: ESTADO_BACKEND_TO_DOMAIN[dto.estado] ?? EstadoActividad.Pendiente,
  notas: dto.notas ?? undefined,
  outlook_event_id: dto.outlookEventId ?? undefined,
  outlook_imported: dto.outlookImported ?? Boolean(dto.outlookEventId),
  teamsMeetingUrl: dto.teamsMeetingUrl ?? undefined,
  seguimiento_automatico: dto.seguimientoAutomatico ?? false,
  id_author: dto.idAuthor ?? 0,
  created_at: dto.createdAt,
  updated_at: dto.updatedAt,
  responsable_nombre: dto.responsableName ?? undefined,
})

export const toActividadQueryParams = (filtros?: ActividadFiltros) => {
  const params: Record<string, string | number> = {}

  if (filtros?.id_lead) params.idLead = filtros.id_lead
  if (filtros?.id_responsable) params.idResponsable = filtros.id_responsable
  if (filtros?.tipo) params.tipo = TIPO_DOMAIN_TO_BACKEND[filtros.tipo]
  if (filtros?.estado) {
    params.estado =
      filtros.estado === EstadoActividad.Completada ? 'REALIZADA' : 'PENDIENTE'
  }

  return params
}

export const toCreateActividadDto = (
  data: ActividadFormData
): ActividadCreateDto => {
  const dto: ActividadCreateDto = {
    idLead: data.id_lead,
    nombreActividad: data.nombre_actividad,
    fechaInicio: toIsoDateTime(data.fecha_inicio),
    fechaFin: toIsoDateTime(data.fecha_fin),
    tipo: TIPO_DOMAIN_TO_BACKEND[data.tipo],
    idResponsable: data.id_responsable,
  }

  const notas = trimOrUndefined(data.notas)
  if (notas !== undefined) dto.notas = notas

  return dto
}

export const toUpdateActividadDto = (
  data: Partial<ActividadFormData>
): ActividadUpdateDto => {
  const dto: ActividadUpdateDto = {}

  if (data.nombre_actividad !== undefined) {
    dto.nombreActividad = data.nombre_actividad
  }
  if (data.fecha_inicio !== undefined) {
    dto.fechaInicio = toIsoDateTime(data.fecha_inicio)
  }
  if (data.fecha_fin !== undefined) {
    dto.fechaFin = toIsoDateTime(data.fecha_fin)
  }
  if (data.id_responsable !== undefined) {
    dto.idResponsable = data.id_responsable
  }

  const notas = trimOrUndefined(data.notas)
  if (notas !== undefined) dto.notas = notas

  return dto
}
