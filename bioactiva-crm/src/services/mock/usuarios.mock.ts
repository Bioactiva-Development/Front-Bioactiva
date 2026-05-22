import { RolUsuario, EstadoToken } from '@/types/enums'
import {
    Invitacion,
    InvitacionInfo,
    ListInvitacionesParams,
    ListInvitacionesResponse,
    AcceptInvitacionResponse,
} from '@/types/usuario.types'

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
    return { message: 'Cuenta activada correctamente.' }
}
