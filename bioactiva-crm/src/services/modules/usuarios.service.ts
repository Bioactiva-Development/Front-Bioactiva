import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
    mockGetUsuarios,
    mockGetInvitaciones,
    mockInvitarUsuario,
    mockEditarUsuario,
    mockCambiarPassword,
    mockDeshabilitarUsuario,
    mockHabilitarUsuario,
} from '@/services/mock/usuarios.mock'
import {
    UsuariosResponse,
    Invitacion,
    InvitarUsuarioRequest,
    InvitarUsuarioResponse,
    EditarUsuarioRequest,
    CambiarPasswordRequest,
    UsuarioListItem,
} from '@/types/usuario.types'

export const usuariosService = {
    getUsuarios: async (): Promise<UsuariosResponse> => {
        if (USE_MOCK) return mockGetUsuarios()
        const response = await apiClient.get<UsuariosResponse>(ENDPOINTS.usuarios.list)
        return response.data
    },

    getInvitaciones: async (): Promise<Invitacion[]> => {
        if (USE_MOCK) return mockGetInvitaciones()
        const response = await apiClient.get<Invitacion[]>(ENDPOINTS.usuarios.invitaciones)
        return response.data
    },

    invitar: async (data: InvitarUsuarioRequest): Promise<InvitarUsuarioResponse> => {
        if (USE_MOCK) return mockInvitarUsuario(data)
        const response = await apiClient.post<InvitarUsuarioResponse>(ENDPOINTS.usuarios.invite, data)
        return response.data
    },

    editar: async (data: EditarUsuarioRequest): Promise<UsuarioListItem> => {
        if (USE_MOCK) return mockEditarUsuario(data)
        const response = await apiClient.put<UsuarioListItem>(ENDPOINTS.usuarios.detail(data.id), data)
        return response.data
    },

    cambiarPassword: async (data: CambiarPasswordRequest): Promise<{ message: string }> => {
        if (USE_MOCK) return mockCambiarPassword(data)
        const response = await apiClient.patch<{ message: string }>(
            ENDPOINTS.usuarios.cambiarPassword(data.id),
            { password: data.password },
        )
        return response.data
    },

    deshabilitar: async (id: number): Promise<UsuarioListItem> => {
        if (USE_MOCK) return mockDeshabilitarUsuario(id)
        const response = await apiClient.patch<UsuarioListItem>(ENDPOINTS.usuarios.disable(id))
        return response.data
    },

    habilitar: async (id: number): Promise<UsuarioListItem> => {
        if (USE_MOCK) return mockHabilitarUsuario(id)
        const response = await apiClient.patch<UsuarioListItem>(ENDPOINTS.usuarios.enable(id))
        return response.data
    },
}
