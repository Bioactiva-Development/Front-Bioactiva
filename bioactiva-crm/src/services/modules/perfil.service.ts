import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
    Usuario,
    UserResponseDto,
    UpdateProfileRequest,
    ChangePasswordRequest,
} from '@/types/auth.types'
import { mapPerfilUsuario } from '@/lib/utils/auth.mappers'
import {
    mockGetProfile,
    mockUpdateProfile,
    mockChangePassword,
} from '@/services/mock/perfil.mock'

/**
 * Cliente del módulo "Mi perfil" (Mantis #333).
 *  - GET   /profile           → datos del usuario autenticado.
 *  - PATCH /profile           → editar nombres/apellidos (correo NO editable).
 *  - PATCH /profile/password  → cambiar contraseña (204 sin body).
 */
export const perfilService = {
    getProfile: async (): Promise<Usuario> => {
        if (USE_MOCK) return mockGetProfile()
        const response = await apiClient.get<UserResponseDto>(ENDPOINTS.perfil.get)
        return mapPerfilUsuario(response.data)
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<Usuario> => {
        if (USE_MOCK) return mockUpdateProfile(data)
        const response = await apiClient.patch<UserResponseDto>(ENDPOINTS.perfil.update, data)
        return mapPerfilUsuario(response.data)
    },

    changePassword: async (data: ChangePasswordRequest): Promise<void> => {
        if (USE_MOCK) return mockChangePassword(data)
        await apiClient.patch(ENDPOINTS.perfil.password, data)
    },
}
