import { RolUsuario, EstadoToken } from './enums'

export interface InvitacionInfo {
    correo: string
    expired: boolean
    accepted: boolean
}

export interface InvitacionRaw {
    id: number
    correo: string
    rol: number
    estado: number | string
    expires_at: string
    consumed_at: string | null
    created_at: string
}

export interface Invitacion {
    id: number
    correo: string
    rol: RolUsuario
    estado: EstadoToken
    expires_at: string
    consumed_at: string | null
    created_at: string
}

export interface CreateInvitacionRequest {
    correo: string
    rol: number
}

export interface AcceptInvitacionRequest {
    token: string
    password: string
    confirmPassword: string
    nombres: string
    apellidos: string
}

export interface AcceptInvitacionResponse {
    message?: string
}

export interface ListInvitacionesParams {
    page?: number
    limit?: number
    term?: string
    estado?: number
}

export interface ListInvitacionesResponse {
    data: Invitacion[]
    total: number
    page: number
    limit: number
}
