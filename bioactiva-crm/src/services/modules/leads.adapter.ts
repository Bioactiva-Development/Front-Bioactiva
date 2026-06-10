import { Lead, LeadFormData, LeadsResponse } from '@/types/lead.types'
import { LeadState } from '@/types/enums'

// ── Backend response shapes ────────────────────────────────────────────────

export interface BackendLead {
  id:                 number
  estado:             string
  servicioInteres:    string
  comentarios:        string | null
  desafioOportunidad: string | null
  notasContacto:      string | null
  canalCaptacion:     string | null
  idOrg:              string
  organizationName:   string
  idContacto:         number | null
  contactName:        string | null
  idEncargado:        number
  encargadoName:      string
  idAuthor:           number
  createdAt:          string
  updatedAt:          string
  ultimoCambioEstado: string
  tieneAlerta?:       boolean
  codigo?:            string
}

export interface BackendLeadsResponse {
  data: BackendLead[]
  meta: {
    page:       number
    limit:      number
    total:      number
    totalPages: number
  }
}

// ── Status enum mappers ────────────────────────────────────────────────────

const ESTADO_BACKEND_A_FRONTEND: Record<string, LeadState> = {
  EN_PROSPECTO:    LeadState.Prospecto,
  OFERTADO:        LeadState.Ofertado,
  CIERRE_CON_VENTA:    LeadState.CierreVenta,
  CIERRE_SIN_VENTA: LeadState.CierreSinVenta,
}

const ESTADO_FRONTEND_A_BACKEND: Record<LeadState, string> = {
  [LeadState.Prospecto]:      'EN_PROSPECTO',
  [LeadState.Ofertado]:       'OFERTADO',
  [LeadState.CierreVenta]:    'CIERRE_CON_VENTA',
  [LeadState.CierreSinVenta]: 'CIERRE_SIN_VENTA',
}

export function mapEstadoToBackend(estado: LeadState): string {
  return ESTADO_FRONTEND_A_BACKEND[estado]
}

// ── Response mappers ───────────────────────────────────────────────────────

export function mapBackendLead(raw: BackendLead): Lead {
  return {
    id:                  raw.id,
    codigo:              raw.codigo ?? `LEAD-${raw.id}`,
    id_org:              raw.idOrg,
    id_contacto:         raw.idContacto ?? undefined,
    estado:              ESTADO_BACKEND_A_FRONTEND[raw.estado] ?? LeadState.Prospecto,
    servicio_interes:    raw.servicioInteres,
    comentarios:         raw.comentarios ?? undefined,
    desafio_oportunidad: raw.desafioOportunidad ?? undefined,
    notas_contacto:      raw.notasContacto ?? undefined,
    id_encargado:        raw.idEncargado,
    canal_captacion:     raw.canalCaptacion ?? undefined,
    id_author:           raw.idAuthor,
    created_at:          raw.createdAt,
    updated_at:          raw.updatedAt,
    organizacion_nombre: raw.organizationName,
    contacto_nombre:     raw.contactName ?? undefined,
    encargado_nombre:    raw.encargadoName,
    tiene_alerta:        raw.tieneAlerta ?? false,
  }
}

export function mapBackendLeadsResponse(raw: BackendLeadsResponse): LeadsResponse {
  return {
    data:  raw.data.map(mapBackendLead),
    total: raw.meta.total,
    page:  raw.meta.page,
    limit: raw.meta.limit,
  }
}

// ── Request mappers ────────────────────────────────────────────────────────

export function mapLeadFormToBackend(
  data: Partial<LeadFormData>
): Record<string, unknown> {
  const out: Record<string, unknown> = {}

  if (data.id_org            !== undefined) out.idOrg              = data.id_org
  if (data.id_contacto       !== undefined) out.idContacto         = data.id_contacto ?? null
  if (data.servicio_interes  !== undefined) out.servicioInteres     = data.servicio_interes
  if (data.comentarios       !== undefined) out.comentarios         = data.comentarios
  if (data.desafio_oportunidad !== undefined) out.desafioOportunidad = data.desafio_oportunidad
  if (data.notas_contacto    !== undefined) out.notasContacto       = data.notas_contacto
  if (data.id_encargado      !== undefined) out.idEncargado         = data.id_encargado
  if (data.canal_captacion   !== undefined) out.canalCaptacion      = data.canal_captacion

  return out
}
