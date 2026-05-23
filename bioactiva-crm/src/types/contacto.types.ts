import { Vocativo } from './enums'

export interface Contacto{
    id: number
    nombres: string
    apellidos: string
    vocativo?: Vocativo
    cargo?: string
    correo: string
    correo2?: string
    telefono?: string
    comentarios?: string
    id_organizacion: string
    organizacion_nombre?: string
    id_author: number
    created_at: string
    updated_at: string
}

export interface ContactoFormData{
    nombres: string
    apellidos: string
    vocativo?: Vocativo
    cargo?: string
    correo: string
    correo2?: string
    telefono?: string
    comentarios?: string
    id_organizacion: string
}

export interface ContactoFiltros {
    search?: string
    id_organizacion?: string
    page?: number
    limit?: number   
}

export interface ContactosResponse {
  data:  Contacto[]
  total: number
  page:  number
  limit: number
}

export interface LeadResumidoContacto{
    id: number
    servicio_interes: string
    estado: string
    created_at: string
    organizacion?: string
}

