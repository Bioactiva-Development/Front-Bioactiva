import { LeadState, Sector, TipoEmpresa } from './enums'

// Semáforo de actividades del lead (backend: activityAlert).
// Severidad de menor a mayor: SIN_ACTIVIDADES < PENDIENTE < EN_RIESGO < POR_VENCER.
//  · SIN_ACTIVIDADES = el lead no tiene actividades pendientes.
//  · PENDIENTE       = tiene pendientes, pero ninguna en riesgo ni próxima a vencer.
//  · EN_RIESGO       = al menos una pendiente pasó la mitad de su ventana de tiempo.
//  · POR_VENCER      = al menos una pendiente vence en ≤4 días o ya está vencida.
export type ActivityAlert =
  | 'SIN_ACTIVIDADES'
  | 'PENDIENTE'
  | 'EN_RIESGO'
  | 'POR_VENCER'

// Filtro de alerta de actividades (GET /leads?alertaActividad=...). Acepta los
// mismos valores que el campo de respuesta. Omitir el param trae todos los
// leads; valores inválidos => 400.
export type ActivityAlertFilter = ActivityAlert

export interface Lead {
  id:number
  codigo: string
  id_org: string
  id_contacto?: number
  estado: LeadState
  servicio_interes: string
  comentarios?: string
  desafio_oportunidad?: string
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
  // Filtra por el sector de la organización vinculada (GET /leads?sector=).
  sector?: Sector
  // Filtra por el tipo de organización vinculada (GET /leads?tipo=).
  tipo_org?: TipoEmpresa
  canal_captacion?: string
  solo_alerta?: boolean
  // Filtro de semáforo de actividades (backend: alertaActividad).
  alerta_actividad?: ActivityAlertFilter
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
  id_encargado: number
  encargado_correo?: string
  canal_captacion?: string
  fecha_cierre?: string
}
