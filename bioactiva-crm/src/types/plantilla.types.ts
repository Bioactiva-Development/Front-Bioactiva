export interface Plantilla {
    id:        number
    nombre:    string
    asunto:    string
    cuerpo:    string
    activo:    boolean
    createdAt: string
    updatedAt: string
}

export interface PlantillaFormData {
    nombre: string
    asunto: string
    cuerpo: string
    activo?: boolean
}

export interface PlantillaFiltros {
    search?:         string
    soloActivas?:    boolean
    includeInactive?: boolean
}

export const VARIABLES_PLANTILLA = [
    { key: '{{nombre_contacto}}',     descripcion: 'Nombre del contacto del lead' },
    { key: '{{nombre_organizacion}}', descripcion: 'Nombre de la organización' },
    { key: '{{servicio_interes}}',    descripcion: 'Servicio de interés del lead' },
    { key: '{{nombre_encargado}}',    descripcion: 'Nombre del encargado del lead' },
    { key: '{{fecha_actividad}}',     descripcion: 'Fecha de la actividad programada' },
    { key: '{{estado_lead}}',         descripcion: 'Estado actual del lead' },
]
