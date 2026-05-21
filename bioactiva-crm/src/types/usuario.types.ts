import { RolUsuario, EstadoUsuario } from '@/types/enums'

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

export type EstadoInvitacion = 'Enviada' | 'Pendiente' | 'Expirada'

export interface Invitacion {
    id: number
    correo: string
    rol: RolUsuario
    estado: EstadoInvitacion
    fecha_envio: string
    fecha_vencimiento: string
}

export interface UsuariosResponse {
    usuarios: UsuarioListItem[]
    total: number
    activos: number
}

export interface InvitarUsuarioRequest {
    correo: string
    rol: RolUsuario
}

export interface InvitarUsuarioResponse {
    message: string
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
