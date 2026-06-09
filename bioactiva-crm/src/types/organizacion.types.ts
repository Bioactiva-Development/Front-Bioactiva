import { TipoEmpresa, TamanoEmpresa, Sector } from './enums'

export interface Organizacion {
    id: string
    codigo_cliente: string
    nombre: string
    nombre_comercial: string
    sub_area?: string
    ruc?: string
    tipo: TipoEmpresa
    linkedin?: string
    ubicacion?: string
    sector: Sector
    tamano: TamanoEmpresa
    actividad_economica?: string
    alianzas_estrategicas?: string
    id_contacto_activo?: number
    id_author: number
    created_at: string
    updated_at: string
}

export interface OrganizacionFormData {
    codigo_cliente?: string
    nombre: string
    nombre_comercial?: string
    sub_area?: string
    ruc?: string
    tipo: TipoEmpresa
    linkedin?: string
    ubicacion?: string
    sector: Sector
    tamano: TamanoEmpresa
    actividad_economica?: string
    alianzas_estrategicas?: string
    id_contacto_activo?: number
}

export interface OrganizacionFiltros {
    search?: string
    sector?: Sector
    tamano?: TamanoEmpresa
    tipo?: TipoEmpresa
    page?: number
    limit?: number
}

export interface OrganizacionesResponse {
    data: Organizacion[]
    total: number
    page: number
    limit: number
}

export interface SunatRucResult {
    ruc: string
    nombre: string
    nombreCompleto?: string
    tipo?: TipoEmpresa
    ubicacion?: string
    estado?: string
    condicion?: string
    actividades?: string
    tamano?: TamanoEmpresa
    sector?: Sector
    _raw?: Record<string, string>
}

export interface SunatNombreResult {
    ruc: string
    nombre: string
    ubicacion?: string
    estado?: string
}

export interface ContactoResumido {
  id:       number
  nombres:  string
  apellidos: string
  vocativo?: string
  cargo?:   string
  correo:   string
  telefono?: string
}

export interface LeadResumido {
  id:               number
  servicio_interes: string
  estado:           string
  created_at:       string
  encargado?:       string
}

export interface CotizacionResumida {
  id:              number
  nombre_servicio: string
  monto:           number
  tipo:            string
  estado:          string
  fecha_cot:       string
  dirigido?:       string
  nombre_remitente?: string
  observacion?:    string
  id_lead?:        number
  codigo_lead?:    string
}

export interface OrganizacionConRelaciones extends Organizacion {
  contactos:      ContactoResumido[]
  totalContactos: number
  leads:          LeadResumido[]
  cotizaciones:   CotizacionResumida[]
}
