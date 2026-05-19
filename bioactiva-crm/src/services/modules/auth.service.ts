import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
    mockLogin,
    mockForgotPassword,
    mockValidateToken,
    mockResetPassword,
    mockActivateAccount,
} from '@/services/mock/auth.mock'
import {
    LoginRequest,
    LoginResponse,
    RefreshResponse,
    ForgotPasswordResponse,
    ResetPasswordResponse,
    ActivateAccountRequest,
    ActivateAccountResponse,
    ValidateTokenResponse,
    UsuarioRaw,
} from '@/types/auth.types'

import { mapUsuarioRaw } from '@/lib/utils/auth.mappers'

export const authService = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        if (USE_MOCK) return mockLogin(data)
        const response = await apiClient.post<LoginResponse>(
            ENDPOINTS.auth.login,
            data,
        )
        return response.data
    },

    refresh: async (): Promise<RefreshResponse> => {
        if (USE_MOCK) throw { status: 501, message: 'No implementado en mock' }
        const response = await apiClient.post<RefreshResponse>(
            ENDPOINTS.auth.refresh,
        )
        return response.data
    },

    getMe: async () => {
        if (USE_MOCK) throw { status: 501, message: 'No implementado en mock' }
        const response = await apiClient.get<UsuarioRaw>(ENDPOINTS.auth.me)
        return mapUsuarioRaw(response.data)
    },

    forgotPassword: async (correo: string): Promise<ForgotPasswordResponse> => {
        if (USE_MOCK) return mockForgotPassword(correo)
        const response = await apiClient.post<ForgotPasswordResponse>(
            ENDPOINTS.auth.forgotPassword,
            { correo },
        )
        return response.data
    },

    validateToken: async (token: string): Promise<ValidateTokenResponse> => {
        if (USE_MOCK) return mockValidateToken(token)
        const response = await apiClient.get<ValidateTokenResponse>(
            ENDPOINTS.auth.validateToken(token),
        )
        return response.data
    },

    resetPassword: async (token: string, password: string): Promise<ResetPasswordResponse> => {
        if (USE_MOCK) return mockResetPassword(token, password)
        const response = await apiClient.post<ResetPasswordResponse>(
            ENDPOINTS.auth.resetPassword,
            { token, password }
        )
        return response.data
    },

    activateAccount: async (data: ActivateAccountRequest): Promise<ActivateAccountResponse> => {
        if (USE_MOCK) return mockActivateAccount(data)
        const response = await apiClient.post<ActivateAccountResponse>(
            ENDPOINTS.auth.activate,
            data,
        )
        return response.data
    },

    logout: async (): Promise<void> => {
        return
    },
}
