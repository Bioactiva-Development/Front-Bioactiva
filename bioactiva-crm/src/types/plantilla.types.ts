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
