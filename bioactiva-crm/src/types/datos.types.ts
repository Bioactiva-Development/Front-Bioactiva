import { Sector, TipoEmpresa, TamanoEmpresa, LeadState, EstadoCot } from '@/types/enums'

export type EntidadExportable = 'organizaciones' | 'contactos' | 'leads' | 'cotizaciones'

export type TipoConflicto = 'error' | 'advertencia' | 'duplicado'

export interface ConflictoImportacion {
    fila: number
    campo: string
    valor: string
    mensaje: string
    tipo: TipoConflicto
}

export type RegistroPreview = Record<string, string | number | null>

export interface ImportPreviewResult {
    entidad: EntidadExportable
    registros: RegistroPreview[]
    conflictos: ConflictoImportacion[]
    totalFilas: number
    filasValidas: number
    filasConError: number
}

export interface ConfirmarImportRequest {
    entidad: EntidadExportable
    registros: RegistroPreview[]
    omitirConflictos: boolean
}

export interface ConfirmarImportResult {
    exitosos: number
    errores: number
    mensaje: string
}

export interface FiltrosOrganizacion {
    sector: Sector | ''
    tipo: TipoEmpresa | ''
    tamano: TamanoEmpresa | ''
}

export interface FiltrosContacto {
    organizacion: string
}

export interface FiltrosLead {
    estado: LeadState | ''
}

export interface FiltrosCotizacion {
    estado: EstadoCot | ''
}

export type FiltrosEspecificos =
    | FiltrosOrganizacion
    | FiltrosContacto
    | FiltrosLead
    | FiltrosCotizacion

export interface FiltrosExportacion {
    entidad: EntidadExportable
    busqueda: string
    filtros: FiltrosEspecificos
}

export interface ExportarResult {
    data: RegistroPreview[]
    columnas: string[]
    filename: string
    total: number
}

export interface ConteoExportacion {
    total: number
    label: string
}
