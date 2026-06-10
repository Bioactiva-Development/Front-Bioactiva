import { RolUsuario, EstadoUsuario } from '@/types/enums'
import { UsuarioRaw, Usuario } from '@/types/auth.types'
import { decodeJwt, subToNumber } from './jwt.utils'

/**
 * Enum `UserRole` del backend (confirmado con el JWT de `admin@example.com`,
 * que viene como `role: 0`):
 *   0 → Administrador
 *   1 → Trabajador
 *
 */
export const mapRole = (role: number): RolUsuario => {
    return role === 0 ? RolUsuario.Administrador : RolUsuario.Trabajador
}

/**
 * Enum `UserStatus` del backend:
 *   1 → Activo
 *   2 → Inactivo
 *   otros → Pendiente
 */
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

/**
 * Construye un `Usuario` a partir del payload del JWT del access token.
 * Útil como fallback cuando `GET /auth/me` falla pero el login fue exitoso
 * (el JWT trae nombres, apellidos, correo, role y estado).
 */
export const usuarioFromAccessToken = (
    accessToken: string,
    fallbackCorreo: string
): Usuario => {
    const payload = decodeJwt(accessToken)
    const now = new Date().toISOString()
    const id = subToNumber(payload?.sub)
    return {
        id: Number.isFinite(id) ? id : 0,
        nombres: payload?.nombres ?? 'Usuario',
        apellidos: payload?.apellidos ?? '',
        correo: payload?.correo ?? fallbackCorreo,
        rol: typeof payload?.role === 'number' ? mapRole(payload.role) : RolUsuario.Trabajador,
        estado: typeof payload?.estado === 'number' ? mapEstado(payload.estado) : EstadoUsuario.Activo,
        created_at: now,
        updated_at: now,
    }
}
