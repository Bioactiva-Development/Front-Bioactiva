import { EstadoCot, TipoMoneda } from './enums'

export interface Cotizacion {
  id: number
  codigo: string       
  id_lead: number
  id_remitente: number
  fecha_cot: string
  dirigido: string
  cliente: string
  producto?: string
  nombre_remitente: string
  nombre_servicio: string
  monto: number
  tipo: TipoMoneda
  estado: EstadoCot
  observacion?: string
  link_propuesta?: string
  id_author: number
  created_at: string
  updated_at: string
  lead_codigo?: string
  contacto_nombre?: string
  organizacion_nombre?: string
  periodo?: string        
}

export interface CotizacionFormData {
  id_lead: number
  id_remitente: number
  fecha_cot: string
  dirigido:string
  cliente: string
  producto?: string
  nombre_remitente: string
  nombre_servicio: string
  monto: number
  tipo: TipoMoneda
  estado: EstadoCot
  observacion?:string
  link_propuesta?: string
}


export interface CotizacionFiltros {
  search?: string
  estado?: EstadoCot
  page?: number
  limit?: number
}


export interface CotizacionesResponse {
  data:  Cotizacion[]
  total: number
  page:  number
  limit: number
}


export interface CotizacionKpis {
  totalActivo:  number
  aceptadas:    number
  enviadas:     number
  conversion:   number
}