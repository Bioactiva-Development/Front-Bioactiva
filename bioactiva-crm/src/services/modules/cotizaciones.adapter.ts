import {
  Cotizacion,
  CotizacionFormData,
  CotizacionesResponse,
  CotizacionFiltros,
} from '@/types/cotizacion.types'
import { EstadoCot, TipoMoneda } from '@/types/enums'

// ── Backend response shapes ────────────────────────────────────────────────

export interface BackendCotizacion {
  id:                  number
  fechaCot:            string
  dirigido:            string
  cliente:             string | null
  producto:            string | null
  nombreRemitente:     string
  nombreServicio:      string
  monto:               string        // decimal string e.g. "15000.00"
  tipo:                string        // PEN | USD
  estado:              string        // PENDIENTE | ENVIADA | ACEPTADA | RECHAZADA
  observacion:         string | null
  linkPropuesta:       string | null
  idLead:              number
  leadServicioInteres: string
  leadEstado:          string
  contactName:         string
  idRemitente:         number
  remitenteName:       string
  idAuthor:            number
  createdAt:           string
  updatedAt:           string
}

export interface BackendCotizacionesResponse {
  data: BackendCotizacion[]
  meta: {
    page:       number
    limit:      number
    total:      number
    totalPages: number
  }
}

// ── Enum mappers ───────────────────────────────────────────────────────────

const ESTADO_BACKEND_A_FRONTEND: Record<string, EstadoCot> = {
  PENDIENTE: EstadoCot.Pendiente,
  ENVIADA:   EstadoCot.Enviada,
  ACEPTADA:  EstadoCot.Aceptada,
  RECHAZADA: EstadoCot.Rechazada,
}

const ESTADO_FRONTEND_A_BACKEND: Record<EstadoCot, string> = {
  [EstadoCot.Pendiente]: 'PENDIENTE',
  [EstadoCot.Enviada]:   'ENVIADA',
  [EstadoCot.Aceptada]:  'ACEPTADA',
  [EstadoCot.Rechazada]: 'RECHAZADA',
}

const TIPO_BACKEND_A_FRONTEND: Record<string, TipoMoneda> = {
  PEN: TipoMoneda.Soles,
  USD: TipoMoneda.Dolares,
}

export function mapEstadoCotToBackend(estado: EstadoCot): string {
  return ESTADO_FRONTEND_A_BACKEND[estado]
}

// ── Response mappers ───────────────────────────────────────────────────────

export function mapBackendCotizacion(raw: BackendCotizacion): Cotizacion {
  return {
    id:               raw.id,
    codigo:           `COT-${raw.id}`,
    id_lead:          raw.idLead,
    id_remitente:     raw.idRemitente,
    fecha_cot:        raw.fechaCot,
    dirigido:         raw.dirigido,
    cliente:          raw.cliente,
    producto:         raw.producto,
    nombre_remitente: raw.nombreRemitente,
    remitente_nombre: raw.remitenteName,
    nombre_servicio:  raw.nombreServicio,
    monto:            parseFloat(raw.monto),
    tipo:             TIPO_BACKEND_A_FRONTEND[raw.tipo] ?? TipoMoneda.Soles,
    estado:           ESTADO_BACKEND_A_FRONTEND[raw.estado] ?? EstadoCot.Pendiente,
    observacion:      raw.observacion,
    link_propuesta:   raw.linkPropuesta,
    id_author:        raw.idAuthor,
    created_at:       raw.createdAt,
    updated_at:       raw.updatedAt,
    lead_servicio_interes: raw.leadServicioInteres,
    lead_estado:      raw.leadEstado,
    contacto_nombre:  raw.contactName || undefined,
    periodo: new Date(raw.fechaCot).toLocaleDateString('es-PE', {
      month: 'long',
      year:  'numeric',
    }),
  }
}

export function mapBackendCotizacionesResponse(
  raw: BackendCotizacionesResponse
): CotizacionesResponse {
  return {
    data:  raw.data.map(mapBackendCotizacion),
    total: raw.meta.total,
    page:  raw.meta.page,
    limit: raw.meta.limit,
  }
}

// ── Request mappers ────────────────────────────────────────────────────────

export function mapCotizacionFormToBackend(
  data: CotizacionFormData
): Record<string, unknown> {
  return {
    fechaCot:       data.fecha_cot,
    dirigido:       data.dirigido,
    nombreServicio: data.nombre_servicio,
    monto:          data.monto.toFixed(2),    // backend espera string decimal
    tipo:           data.tipo,                // PEN | USD — ya coinciden
    idLead:         data.id_lead,
    idRemitente:    data.id_remitente,
    cliente:        data.cliente,
    producto:       data.producto,
    observacion:    data.observacion,
    linkPropuesta:  data.link_propuesta,
  }
}

export function mapCotizacionUpdateToBackend(
  data: Partial<CotizacionFormData>
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (data.fecha_cot       !== undefined) out.fechaCot       = data.fecha_cot
  if (data.dirigido        !== undefined) out.dirigido       = data.dirigido
  if (data.cliente         !== undefined) out.cliente        = data.cliente
  if (data.producto        !== undefined) out.producto       = data.producto
  if (data.nombre_servicio !== undefined) out.nombreServicio = data.nombre_servicio
  if (data.monto           !== undefined) out.monto          = data.monto.toFixed(2)
  if (data.tipo            !== undefined) out.tipo           = data.tipo
  if (data.observacion     !== undefined) out.observacion    = data.observacion
  if (data.link_propuesta  !== undefined) out.linkPropuesta  = data.link_propuesta
  return out
}

export function mapCotizacionFiltrosToBackend(
  filtros?: CotizacionFiltros
): Record<string, unknown> {
  if (!filtros) return {}
  const out: Record<string, unknown> = {}
  if (filtros.id_lead      !== undefined) out.idLead      = filtros.id_lead
  if (filtros.estado       !== undefined) out.estado      = mapEstadoCotToBackend(filtros.estado)
  if (filtros.id_remitente !== undefined) out.idRemitente = filtros.id_remitente
  if (filtros.fecha_desde  !== undefined) out.fechaDesde  = filtros.fecha_desde
  if (filtros.fecha_hasta  !== undefined) out.fechaHasta  = filtros.fecha_hasta
  if (filtros.page         !== undefined) out.page        = filtros.page
  if (filtros.limit        !== undefined) out.limit       = filtros.limit
  return out
}
