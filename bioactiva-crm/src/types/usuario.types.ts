import { RolUsuario, EstadoToken, EstadoUsuario } from '@/types/enums'

export interface UsuarioListItem {
    id: number
    nombres: string
    apellidos: string
    correo: string
    rol: RolUsuario
    estado: EstadoUsuario
    created_at: string
    updated_at: string
}

export interface UsuariosResponse {
    usuarios: UsuarioListItem[]
    total: number
    activos: number
}

// Mantis #434 — GET /users/assignable. Usuario habilitado asignable como
// encargado de un lead, sin restriccion por rol.
export interface AssignableUsuario {
    id: number
    nombres: string
    apellidos: string
    correo: string
    rol: RolUsuario
}

// Filtros aceptados por GET /users (doc-endpoint.md, módulo `users`).
export interface UsuarioFilters {
    search?: string
    rol?: RolUsuario
    estado?: EstadoUsuario
    page?: number
    limit?: number
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

// Forma cruda tal como la entrega el backend (GET /invitations).
// El backend usa `expired_at` (no `expires_at`) e incluye `token` e `invitador_id`.
export interface InvitacionRaw {
    id: number
    correo: string
    token?: string
    rol: number
    invitador_id?: number
    estado: number | string
    expired_at?: string
    expires_at?: string
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

export interface CambiarRolRequest {
    id: number
    rol: string
}

export interface AcceptInvitacionResponse {
    accessToken: string
    accessTokenExpiresIn: number
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
