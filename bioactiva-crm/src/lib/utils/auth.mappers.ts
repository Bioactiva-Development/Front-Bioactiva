import { RolUsuario, EstadoUsuario } from '@/types/enums'
import { UsuarioRaw, Usuario } from '@/types/auth.types'

export const mapRole = (role: number): RolUsuario => {
    return role == 1 ? RolUsuario.Administrador : RolUsuario.Trabajador
}

export const mapEstado = (estado: number): EstadoUsuario => {
    switch (estado) {
        case 1: return EstadoUsuario.Activo
        case 2: return EstadoUsuario.Inactivo
        default: return EstadoUsuario.Pendiente
    }
}

export const mapUsuarioRaw = (raw: UsuarioRaw): Usuario => ({
    id: raw.id,
    nombres: raw.nombres,
    apellidos: raw.apellidos,
    correo: raw.correo,
    rol: mapRole(raw.role),
    estado: mapEstado(raw.estado),
    created_at: raw.created_at,
    updated_at: raw.updated_at,

})