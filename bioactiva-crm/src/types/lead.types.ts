import { LeadState } from './enums'

// Semáforo de actividades del lead (backend: activityAlert).
// VERDE = al día · AMARILLO = vence dentro de 3 días · ROJO = pendiente vencida.
export type ActivityAlert = 'VERDE' | 'AMARILLO' | 'ROJO'

export interface Lead {
  id:number
  codigo: string
  id_org: string
  id_contacto?: number
  estado: LeadState
  servicio_interes: string
  comentarios?: string
  desafio_oportunidad?: string
  notas_contacto?: string
  id_encargado: number
  canal_captacion?: string
  sector?: string
  tipo_org?: string
  tamano?: string
  fecha_cierre?: string
  id_author: number
  created_at: string
  updated_at: string
  organizacion_nombre?: string
  contacto_nombre?: string
  encargado_nombre?: string
  encargado_correo?: string
  tiene_alerta?:boolean
  alerta_motivo?: string
  activity_alert?: ActivityAlert
}

export interface LeadFiltros {
  search?: string
  estado?: LeadState
  id_encargado?: number
  id_org?: string
  canal_captacion?: string
  solo_alerta?: boolean
  // Solo leads con semáforo AMARILLO o ROJO (actividades por vencer o vencidas).
  con_actividades_por_vencer?: boolean
  // Filtran por fecha de creación del lead (createdAt). ISO 8601.
  fecha_desde?: string
  fecha_hasta?: string
  page?: number
  limit?: number
}

// Página de leads de una columna del pipeline (GET /leads paginado por estado).
export interface PaginatedLeads<T = Lead> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface LeadsResponse {
  data:  Lead[]
  total: number
  page:  number
  limit: number
}

export interface PipelineData {
  prospecto: Lead[]
  ofertado: Lead[]
  cierreVenta: Lead[]
  cierreSinVenta: Lead[]
  total: number
}

export interface LeadFormData {
  id_org: string
  id_contacto?: number
  estado?: LeadState
  servicio_interes: string
  comentarios?: string
  desafio_oportunidad?: string
  notas_contacto?: string
  id_encargado: number
  encargado_correo?: string
  canal_captacion?: string
  fecha_cierre?: string
}
