import { Vocativo } from './enums'

export type EstadoCorreo = 'VIGENTE' | 'VENCIDO'

export interface Contacto {
    id: number
    nombres: string
    apellidos: string | null
    vocativo?: Vocativo
    cargo?: string | null
    correo: string
    correo2?: string | null
    telefono?: string | null
    comentarios?: string | null
    idOrganizacion: string
    idAuthor: number
    estado_correo: EstadoCorreo
    createdAt: string
    updatedAt: string
    organizacion_nombre?: string
}

export interface ContactoFormData {
    nombres: string
    apellidos?: string
    vocativo?: Vocativo
    cargo?: string
    correo: string
    correo2?: string
    telefono?: string
    comentarios?: string
    idOrganizacion: string
    estado_correo?: EstadoCorreo
}

export interface ContactoFiltros {
    search?: string
    page?: number
    limit?: number
}

export interface ContactosResponse {
    data: Contacto[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface LeadResumidoContacto {
    id: number
    servicio_interes: string
    estado: string
    created_at: string
    organizacion?: string
}
