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

export interface OrgnaizacionFormData {
    codigo_cliente?: string
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
    ubicacion?: string
    estado?: string
    condicion?: string
    actividades?: string
    _raw?: Record<string, string>
}

export interface SunatNombreResult {
    ruc: string
    nombre: string
    ubicacion?: string
    estado?: string
}
