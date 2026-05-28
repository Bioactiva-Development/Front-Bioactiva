export type TipoIntegracion = 'microsoft_teams' | 'microsoft_outlook'

export interface IntegracionEstado {
    tipo: TipoIntegracion
    conectado: boolean
    cuenta?: string
    conectadoEn?: string
}

export interface IntegracionesResponse {
    teams: IntegracionEstado
    outlook: IntegracionEstado
}

export interface IntegracionAuthUrlResponse {
    authUrl: string
}
