import { RolUsuario, EstadoToken, EstadoUsuario } from '@/types/enums'

export interface UsuarioListItem {
    id: number
    nombres: string
    apellidos: string
    correo: string
    rol: RolUsuario
    estado: EstadoUsuario
    ultimo_acceso?: string
    created_at: string
    updated_at: string
}

export interface UsuariosResponse {
    usuarios: UsuarioListItem[]
    total: number
    activos: number
}

export interface EditarUsuarioRequest {
    id: number
    nombre_completo: string
    correo: string
    rol: RolUsuario
}

export interface CambiarPasswordRequest {
    id: number
    password: string
}

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
