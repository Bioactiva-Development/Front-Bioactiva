import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
    mockLogin,
    mockForgotPassword,
    mockValidateToken,
    mockResetPassword,
} from '@/services/mock/auth.mock'
import {
    LoginRequest,
    LoginResponse,
    RefreshResponse,
    ForgotPasswordResponse,
    ResetPasswordResponse,
    ValidateTokenResponse,
    UsuarioRaw,
} from '@/types/auth.types'

import { mapUsuarioRaw } from '@/lib/utils/auth.mappers'

/**
 * Cliente del módulo de autenticación + restablecimiento de contraseña.
 *
 * Rutas del backend NestJS (doc HackMD):
 *  - POST /auth/login
 *  - POST /auth/refresh                     (cookie)
 *  - GET  /auth/me                          (Bearer)
 *  - POST /reset-password/request           ← antes mal mapeado a /auth/forgot-password
 *  - POST /reset-password/validate          ← antes era GET /auth/validate-token/:t
 *  - POST /reset-password/reset             ← antes mal mapeado a /auth/reset-password
 */

interface AppError {
    status?: number
    message?: string
}

const isAppError = (e: unknown): e is AppError =>
    typeof e === 'object' && e !== null

export const authService = {
    login: async (data: LoginRequest, captchaToken?: string | null): Promise<LoginResponse> => {
        if (USE_MOCK) return mockLogin(data)
        const response = await apiClient.post<LoginResponse>(
            ENDPOINTS.auth.login,
            data,
            captchaToken ? { headers: { 'x-recaptcha-token': captchaToken } } : undefined,
        )
        return response.data
    },

    refresh: async (): Promise<RefreshResponse> => {
        if (USE_MOCK) throw Object.assign(new Error('No implementado en mock'), { status: 501 })
        const response = await apiClient.post<RefreshResponse>(
            ENDPOINTS.auth.refresh,
        )
        return response.data
    },

    getMe: async () => {
        if (USE_MOCK) throw Object.assign(new Error('No implementado en mock'), { status: 501 })
        const response = await apiClient.get<UsuarioRaw>(ENDPOINTS.auth.me)
        return mapUsuarioRaw(response.data)
    },

    /**
     * Solicita el envío de un correo de recuperación.
     *
     * El backend siempre responde `{ ok: true }` aunque el correo no exista
     * (anti-enumeración de usuarios). El frontend debe mostrar siempre un
     * mensaje neutral del tipo "Si el correo está registrado, recibirás...".
     */
    forgotPassword: async (correo: string, _captchaToken?: string | null): Promise<ForgotPasswordResponse> => {
        if (USE_MOCK) return mockForgotPassword(correo)
        const response = await apiClient.post<{ ok: boolean }>(
            ENDPOINTS.resetPassword.request,
            { correo },
        )
        return { ok: response.data?.ok ?? true }
    },

    /**
     * Valida un token de recuperación.
     *
     * Backend: `POST /reset-password/validate` con `{ token }`.
     *   - 200 → `{ correo: "u***o@dominio.com" }` (correo ofuscado)
     *   - 400 → `{ message: "Token inválido o ya utilizado" | "...ha expirado" }`
     *
     * Adaptamos al contrato que espera el formulario:
     *   `{ valid, correo?, message? }`.
     */
    validateToken: async (token: string): Promise<ValidateTokenResponse> => {
        if (USE_MOCK) return mockValidateToken(token)
        try {
            const response = await apiClient.post<{ correo: string }>(
                ENDPOINTS.resetPassword.validate,
                { token },
            )
            return { valid: true, correo: response.data.correo }
        } catch (err) {
            const raw = isAppError(err) ? (err.message ?? '') : ''
            const isTechnical = !raw || /cannot read|undefined|null|prisma|invocation|property of/i.test(raw)
            return {
                valid: false,
                message: isTechnical
                    ? 'El enlace de recuperación no es válido o ha expirado.'
                    : raw,
            }
        }
    },

    resetPassword: async (
        token: string,
        password: string,
        confirmPassword: string,
    ): Promise<ResetPasswordResponse> => {
        if (USE_MOCK) return mockResetPassword(token, password)
        const response = await apiClient.post<{ ok: boolean }>(
            ENDPOINTS.resetPassword.reset,
            { token, password, confirmPassword },
        )
        return { ok: response.data?.ok ?? true }
    },

    logout: async (): Promise<void> => {
        // El backend no expone /auth/logout aún. El logout real ocurre en el
        // cliente (clearSession + redirect). Este método queda como hook para
        // cuando se implemente revoke server-side.
        return
    },
}
