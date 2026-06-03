import { RolUsuario, EstadoToken, EstadoUsuario } from '@/types/enums'
import {
    UsuarioListItem,
    UsuariosResponse,
    UsuarioFilters,
    EditarUsuarioRequest,
    CambiarPasswordRequest,
    Invitacion,
    InvitacionInfo,
    ListInvitacionesParams,
    ListInvitacionesResponse,
    AcceptInvitacionResponse,
} from '@/types/usuario.types'

// ── Usuario mocks ──────────────────────────────────────────────────────────────

let mockUsuarios: UsuarioListItem[] = [
    { id: 1, nombres: 'Administración', apellidos: '', correo: 'admin@bioactiva.pe', rol: RolUsuario.Administrador, estado: EstadoUsuario.Activo, ultimo_acceso: 'Hace 11 min', created_at: '2024-01-01T08:00:00Z', updated_at: '2024-01-01T08:00:00Z' },
    { id: 2, nombres: 'Karien', apellidos: 'Diaz', correo: 'karien@bioactiva.pe', rol: RolUsuario.Trabajador, estado: EstadoUsuario.Activo, ultimo_acceso: 'Hace 11 min', created_at: '2024-01-02T08:00:00Z', updated_at: '2024-01-02T08:00:00Z' },
    { id: 3, nombres: 'Luis', apellidos: 'Torres', correo: 'ltorres@bioactiva.pe', rol: RolUsuario.Trabajador, estado: EstadoUsuario.Activo, ultimo_acceso: 'Hace 11 min', created_at: '2024-01-03T08:00:00Z', updated_at: '2024-01-03T08:00:00Z' },
    { id: 4, nombres: 'Ana', apellidos: 'Rojas', correo: 'arojas@bioactiva.pe', rol: RolUsuario.Trabajador, estado: EstadoUsuario.Activo, ultimo_acceso: 'Hace 11 min', created_at: '2024-01-04T08:00:00Z', updated_at: '2024-01-04T08:00:00Z' },
    { id: 5, nombres: 'María', apellidos: 'Quispe', correo: 'mquispe@bioactiva.pe', rol: RolUsuario.Trabajador, estado: EstadoUsuario.Activo, ultimo_acceso: 'Hace 11 min', created_at: '2024-01-05T08:00:00Z', updated_at: '2024-01-05T08:00:00Z' },
    { id: 6, nombres: 'Carlos', apellidos: 'Mamani', correo: 'cmamani@bioactiva.pe', rol: RolUsuario.Trabajador, estado: EstadoUsuario.Activo, ultimo_acceso: 'Hace 11 min', created_at: '2024-01-06T08:00:00Z', updated_at: '2024-01-06T08:00:00Z' },
]

export function mockGetUsuarios(filters?: UsuarioFilters): UsuariosResponse {
    let result = [...mockUsuarios]

    if (filters?.search) {
        const s = filters.search.toLowerCase()
        result = result.filter(
            u =>
                u.nombres.toLowerCase().includes(s) ||
                u.apellidos.toLowerCase().includes(s) ||
                u.correo.toLowerCase().includes(s),
        )
    }
    if (filters?.rol) result = result.filter(u => u.rol === filters.rol)
    if (filters?.estado) result = result.filter(u => u.estado === filters.estado)

    // `activos` refleja el total de cuentas activas, no solo las filtradas.
    const activos = mockUsuarios.filter(u => u.estado === EstadoUsuario.Activo).length
    return { usuarios: result, total: result.length, activos }
}

export function mockEditarUsuario(data: EditarUsuarioRequest): UsuarioListItem {
    const idx = mockUsuarios.findIndex(u => u.id === data.id)
    if (idx === -1) throw new Error('Usuario no encontrado.')

    const partes = data.nombre_completo.trim().split(' ')
    const nombres = partes[0] ?? ''
    const apellidos = partes.slice(1).join(' ')

    mockUsuarios[idx] = {
        ...mockUsuarios[idx],
        nombres,
        apellidos,
        correo: data.correo,
        rol: data.rol,
        updated_at: new Date().toISOString(),
    }
    return mockUsuarios[idx]
}

export function mockCambiarPassword(_data: CambiarPasswordRequest): { message: string } {
    return { message: 'Contraseña actualizada correctamente.' }
}

export function mockDeshabilitarUsuario(id: number): UsuarioListItem {
    const idx = mockUsuarios.findIndex(u => u.id === id)
    if (idx === -1) throw new Error('Usuario no encontrado.')
    mockUsuarios[idx] = { ...mockUsuarios[idx], estado: EstadoUsuario.Inactivo, updated_at: new Date().toISOString() }
    return mockUsuarios[idx]
}

export function mockHabilitarUsuario(id: number): UsuarioListItem {
    const idx = mockUsuarios.findIndex(u => u.id === id)
    if (idx === -1) throw new Error('Usuario no encontrado.')
    mockUsuarios[idx] = { ...mockUsuarios[idx], estado: EstadoUsuario.Activo, updated_at: new Date().toISOString() }
    return mockUsuarios[idx]
}

// ── Invitación mocks ───────────────────────────────────────────────────────────

let MOCK_INVITACIONES: Invitacion[] = [
    {
        id: 1,
        correo: 'nuevo1@bioactiva.pe',
        rol: RolUsuario.Trabajador,
        estado: EstadoToken.Pendiente,
        expires_at: new Date(Date.now() + 86400000 * 3).toISOString(),
        consumed_at: null,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
        id: 2,
        correo: 'gerente@bioactiva.pe',
        rol: RolUsuario.Administrador,
        estado: EstadoToken.Consumido,
        expires_at: new Date(Date.now() - 86400000).toISOString(),
        consumed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
        id: 3,
        correo: 'analista@bioactiva.pe',
        rol: RolUsuario.Trabajador,
        estado: EstadoToken.Expirado,
        expires_at: new Date(Date.now() - 3600000).toISOString(),
        consumed_at: null,
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
]

const MOCK_TOKENS: Record<string, InvitacionInfo> = {
    'mock-invitation-token-valido': {
        correo: 'n****1@bioactiva.pe',
        expired: false,
        accepted: false,
    },
    'mock-invitation-token-expirado': {
        correo: 'a*****@bioactiva.pe',
        expired: true,
        accepted: false,
    },
    'mock-invitation-token-consumido': {
        correo: 'g*****@bioactiva.pe',
        expired: false,
        accepted: true,
    },
}

const delay = (ms = 600) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export const mockListInvitaciones = async (
    params?: ListInvitacionesParams,
): Promise<ListInvitacionesResponse> => {
    await delay()

    let filtered = [...MOCK_INVITACIONES]

    if (params?.term) {
        const term = params.term.toLowerCase()
        filtered = filtered.filter((i) => i.correo.toLowerCase().includes(term))
    }

    if (params?.estado !== undefined) {
        const estadoMap: Record<number, EstadoToken> = {
            0: EstadoToken.Pendiente,
            1: EstadoToken.Consumido,
            2: EstadoToken.Expirado,
        }
        const estadoFiltro = estadoMap[params.estado]
        if (estadoFiltro) {
            filtered = filtered.filter((i) => i.estado === estadoFiltro)
        }
    }

    const page = params?.page ?? 1
    const limit = params?.limit ?? 10
    const start = (page - 1) * limit
    const data = filtered.slice(start, start + limit)

    return { data, total: filtered.length, page, limit }
}

export const mockCreateInvitacion = async (correo: string, rol: number): Promise<Invitacion> => {
    await delay()

    const rolMap: Record<number, RolUsuario> = {
        1: RolUsuario.Administrador,
        2: RolUsuario.Trabajador,
    }

    const existing = MOCK_INVITACIONES.find(
        (i) => i.correo === correo && i.estado === EstadoToken.Pendiente,
    )
    if (existing) {
        throw { status: 400, message: 'Ya existe una invitación pendiente para este correo.' }
    }

    const nueva: Invitacion = {
        id: Date.now(),
        correo,
        rol: rolMap[rol] ?? RolUsuario.Trabajador,
        estado: EstadoToken.Pendiente,
        expires_at: new Date(Date.now() + 86400000 * 3).toISOString(),
        consumed_at: null,
        created_at: new Date().toISOString(),
    }

    MOCK_INVITACIONES.push(nueva)
    return nueva
}

export const mockRevokeInvitacion = async (id: number): Promise<Invitacion> => {
    await delay()

    const invitacion = MOCK_INVITACIONES.find((i) => i.id === id)
    if (!invitacion) {
        throw { status: 400, message: 'La invitación no existe.' }
    }

    invitacion.estado = EstadoToken.Expirado
    return { ...invitacion }
}

export const mockGetInvitacionInfo = async (token: string): Promise<InvitacionInfo> => {
    await delay(400)

    const info = MOCK_TOKENS[token]
    if (!info) {
        throw { status: 400, message: 'El token de invitación no es válido.' }
    }

    return info
}

export const mockAcceptInvitacion = async (): Promise<AcceptInvitacionResponse> => {
    await delay()
    return { accessToken: 'mock-token-activacion', accessTokenExpiresIn: 900 }
}
