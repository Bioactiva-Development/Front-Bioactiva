import { LeadState } from './enums'

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
}

export interface LeadFiltros {
  search?: string
  estado?: LeadState
  id_encargado?: number
  canal_captacion?: string
  solo_alerta?: boolean
  page?: number
  limit?: number
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
  estado: LeadState
  servicio_interes: string
  comentarios?: string
  desafio_oportunidad?: string
  notas_contacto?: string
  id_encargado: number
  encargado_correo?: string
  canal_captacion?: string
  fecha_cierre?: string
}
