import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
    mockListInvitaciones,
    mockCreateInvitacion,
    mockRevokeInvitacion,
    mockGetInvitacionInfo,
    mockAcceptInvitacion,
} from '@/services/mock/usuarios.mock'
import { mapRole } from '@/lib/utils/auth.mappers'
import {
    ListInvitacionesParams,
    ListInvitacionesResponse,
    Invitacion,
    InvitacionRaw,
    InvitacionInfo,
    AcceptInvitacionRequest,
    AcceptInvitacionResponse,
} from '@/types/usuario.types'
import { EstadoToken } from '@/types/enums'

const ESTADO_TOKEN_MAP: Record<number, EstadoToken> = {
    0: EstadoToken.Pendiente,
    1: EstadoToken.Consumido,
    2: EstadoToken.Expirado,
}

function mapInvitacionRaw(raw: InvitacionRaw): Invitacion {
    return {
        id: raw.id,
        correo: raw.correo,
        rol: typeof raw.rol === 'number' ? mapRole(raw.rol) : (raw.rol as never),
        estado:
            typeof raw.estado === 'number'
                ? (ESTADO_TOKEN_MAP[raw.estado] ?? EstadoToken.Pendiente)
                : (raw.estado as EstadoToken),
        expires_at: raw.expires_at,
        consumed_at: raw.consumed_at,
        created_at: raw.created_at,
    }
}

export const usuariosService = {
    listInvitaciones: async (params?: ListInvitacionesParams): Promise<ListInvitacionesResponse> => {
        if (USE_MOCK) return mockListInvitaciones(params)
        const response = await apiClient.get<Omit<ListInvitacionesResponse, 'data'> & { data: InvitacionRaw[] }>(
            ENDPOINTS.invitaciones.list,
            { params },
        )
        return {
            ...response.data,
            data: response.data.data.map(mapInvitacionRaw),
        }
    },

    createInvitacion: async (correo: string, rol: number): Promise<Invitacion> => {
        if (USE_MOCK) return mockCreateInvitacion(correo, rol)
        const response = await apiClient.post<InvitacionRaw>(
            ENDPOINTS.invitaciones.create,
            { correo, rol },
        )
        return mapInvitacionRaw(response.data)
    },

    revokeInvitacion: async (id: number): Promise<Invitacion> => {
        if (USE_MOCK) return mockRevokeInvitacion(id)
        const response = await apiClient.delete<InvitacionRaw>(
            ENDPOINTS.invitaciones.revoke(id),
        )
        return mapInvitacionRaw(response.data)
    },

    getInvitacionInfo: async (token: string): Promise<InvitacionInfo> => {
        if (USE_MOCK) return mockGetInvitacionInfo(token)
        const response = await apiClient.get<InvitacionInfo>(
            ENDPOINTS.invitaciones.info(token),
        )
        return response.data
    },

    acceptInvitacion: async (data: AcceptInvitacionRequest): Promise<AcceptInvitacionResponse> => {
        if (USE_MOCK) return mockAcceptInvitacion()
        const response = await apiClient.post<AcceptInvitacionResponse>(
            ENDPOINTS.invitaciones.accept,
            data,
        )
        return response.data
    },
}
