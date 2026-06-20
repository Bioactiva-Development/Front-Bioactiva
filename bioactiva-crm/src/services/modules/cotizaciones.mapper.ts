import {
  Cotizacion,
  CotizacionFiltros,
  CotizacionFormData,
} from '@/types/cotizacion.types'
import { EstadoCot, TipoMoneda } from '@/types/enums'

export interface CotizacionDtoOut {
  id: number
  fechaCot: string
  dirigido: string
  cliente: string | null
  producto: string | null
  nombreRemitente: string
  nombreServicio: string
  monto: string
  tipo: string
  estado: string
  observacion: string | null
  linkPropuesta: string | null
  idLead: number
  leadServicioInteres: string
  leadEstado: string
  contactName: string
  idRemitente: number
  remitenteName: string
  idAuthor: number
  createdAt: string
  updatedAt: string
}

export interface CotizacionesDtoResponse {
  data: CotizacionDtoOut[]
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CotizacionCreateDto {
  fechaCot: string
  dirigido: string
  nombreServicio: string
  monto: string
  tipo: string
  idLead: number
  idRemitente: number
  cliente?: string
  producto?: string
  observacion?: string
  linkPropuesta?: string
}

export type CotizacionUpdateDto = Partial<
  Omit<CotizacionCreateDto, 'idLead' | 'idRemitente'>
>

const ESTADO_DOMAIN_TO_BACKEND: Record<EstadoCot, string> = {
  [EstadoCot.Pendiente]: 'PENDIENTE',
  [EstadoCot.Enviada]: 'ENVIADA',
  [EstadoCot.Aceptada]: 'ACEPTADA',
  [EstadoCot.Rechazada]: 'RECHAZADA',
}

const ESTADO_BACKEND_TO_DOMAIN: Record<string, EstadoCot> = {
  PENDIENTE: EstadoCot.Pendiente,
  ENVIADA: EstadoCot.Enviada,
  ACEPTADA: EstadoCot.Aceptada,
  RECHAZADA: EstadoCot.Rechazada,
}

// El backend envía la moneda como string exacto "PEN" | "USD". Se mapea de forma
// explícita (no por cast) para soportar ambas monedas y no asumir soles. Bug
// "solo soles": el detalle/listado deben mostrar USD cuando corresponde.
const TIPO_BACKEND_TO_DOMAIN: Record<string, TipoMoneda> = {
  PEN: TipoMoneda.Soles,
  USD: TipoMoneda.Dolares,
}

const fromBackendTipo = (tipo: string | null | undefined): TipoMoneda =>
  TIPO_BACKEND_TO_DOMAIN[(tipo ?? '').toUpperCase()] ?? TipoMoneda.Soles

const trimOrUndefined = (value?: string | null): string | undefined => {
  if (value == null) return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const toIsoDateTime = (value: string): string => {
  if (value.includes('T')) return value
  return new Date(`${value}T00:00:00.000Z`).toISOString()
}

const codigoFromCotizacion = (
  dto: Pick<CotizacionDtoOut, 'id' | 'createdAt'>
) => {
  const year = dto.createdAt
    ? new Date(dto.createdAt).getFullYear()
    : new Date().getFullYear()
  return `COT-${year}-${String(dto.id).padStart(3, '0')}`
}

export const fromCotizacionDto = (dto: CotizacionDtoOut): Cotizacion => ({
  id: dto.id,
  codigo: codigoFromCotizacion(dto),
  id_lead: dto.idLead,
  id_remitente: dto.idRemitente,
  fecha_cot: dto.fechaCot,
  dirigido: dto.dirigido,
  cliente: dto.cliente ?? '',
  producto: dto.producto ?? undefined,
  nombre_remitente: dto.nombreRemitente || dto.remitenteName,
  nombre_servicio: dto.nombreServicio,
  monto: Number(dto.monto),
  tipo: fromBackendTipo(dto.tipo),
  estado: ESTADO_BACKEND_TO_DOMAIN[dto.estado] ?? EstadoCot.Pendiente,
  observacion: dto.observacion ?? undefined,
  link_propuesta: dto.linkPropuesta ?? undefined,
  id_author: dto.idAuthor,
  created_at: dto.createdAt,
  updated_at: dto.updatedAt,
  contacto_nombre: dto.contactName || undefined,
  organizacion_nombre: dto.cliente ?? undefined,
  periodo: new Date(dto.fechaCot).toLocaleDateString('es-PE', { month: 'short', year: 'numeric' }),
})

export const toBackendCotizacionState = (estado: EstadoCot) =>
  ESTADO_DOMAIN_TO_BACKEND[estado]

export const toCotizacionQueryParams = (
  filtros?: CotizacionFiltros & { idLead?: number }
) => {
  const params: Record<string, string | number> = {}

  if (filtros?.estado) params.estado = toBackendCotizacionState(filtros.estado)
  if (filtros?.page) params.page = filtros.page
  if (filtros?.limit) params.limit = filtros.limit
  if (filtros?.idLead) params.idLead = filtros.idLead
  // Filtra por la organización del lead asociado (server-side).
  if (filtros?.id_org) params.idOrg = filtros.id_org
  if (filtros?.id_remitente) params.idRemitente = filtros.id_remitente
  if (filtros?.fecha_desde) params.fechaDesde = filtros.fecha_desde
  if (filtros?.fecha_hasta) params.fechaHasta = filtros.fecha_hasta

  return params
}

export const toCreateCotizacionDto = (
  data: CotizacionFormData
): CotizacionCreateDto => {
  const dto: CotizacionCreateDto = {
    fechaCot: toIsoDateTime(data.fecha_cot),
    dirigido: data.dirigido,
    nombreServicio: data.nombre_servicio,
    monto: String(data.monto),
    tipo: data.tipo,
    idLead: data.id_lead,
    idRemitente: data.id_remitente,
  }

  const cliente = trimOrUndefined(data.cliente)
  if (cliente !== undefined) dto.cliente = cliente

  const producto = trimOrUndefined(data.producto)
  if (producto !== undefined) dto.producto = producto

  const observacion = trimOrUndefined(data.observacion)
  if (observacion !== undefined) dto.observacion = observacion

  const linkPropuesta = trimOrUndefined(data.link_propuesta)
  if (linkPropuesta !== undefined) dto.linkPropuesta = linkPropuesta

  return dto
}

export const toUpdateCotizacionDto = (
  data: Partial<CotizacionFormData>
): CotizacionUpdateDto => {
  const dto: CotizacionUpdateDto = {}

  if (data.fecha_cot !== undefined) dto.fechaCot = toIsoDateTime(data.fecha_cot)
  if (data.dirigido !== undefined) dto.dirigido = data.dirigido
  if (data.nombre_servicio !== undefined) dto.nombreServicio = data.nombre_servicio
  if (data.monto !== undefined) dto.monto = String(data.monto)
  if (data.tipo !== undefined) dto.tipo = data.tipo

  const cliente = trimOrUndefined(data.cliente)
  if (cliente !== undefined) dto.cliente = cliente

  const producto = trimOrUndefined(data.producto)
  if (producto !== undefined) dto.producto = producto

  const observacion = trimOrUndefined(data.observacion)
  if (observacion !== undefined) dto.observacion = observacion

  const linkPropuesta = trimOrUndefined(data.link_propuesta)
  if (linkPropuesta !== undefined) dto.linkPropuesta = linkPropuesta

  return dto
}
