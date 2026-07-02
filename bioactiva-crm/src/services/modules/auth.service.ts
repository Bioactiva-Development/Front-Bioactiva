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
    ResetPasswordInfoResponse,
    ValidateTokenResponse,
    UsuarioRaw,
} from '@/types/auth.types'

import { mapUsuarioRaw } from '@/lib/utils/auth.mappers'

/**
 * Cliente del módulo de autenticación + restablecimiento de contraseña.
 *
 * Rutas del backend NestJS:
 *  - POST /auth/login
 *  - POST /auth/refresh                     (cookie)
 *  - GET  /auth/me                          (Bearer)
 *  - POST /reset-password/request
 *  - GET  /reset-password/info/:token       ← reemplaza a POST /reset-password/validate
 *  - POST /reset-password/reset
 */

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
     * El backend responde siempre `200 { ok: true }`, exista o no la cuenta y
     * haya o no rate limit (anti-enumeración de usuarios). Dentro de los 5
     * minutos posteriores a una solicitud no envía otro correo, pero tampoco
     * lo señala: el cooldown se maneja localmente en el cliente.
     *
     * El captcha viaja igual que en login: header `x-recaptcha-token`. Si la
     * verificación falla, el backend responde `401`.
     */
    forgotPassword: async (correo: string, captchaToken?: string | null): Promise<ForgotPasswordResponse> => {
        if (USE_MOCK) return mockForgotPassword(correo)
        const response = await apiClient.post<{ ok: boolean }>(
            ENDPOINTS.resetPassword.request,
            { correo },
            captchaToken ? { headers: { 'x-recaptcha-token': captchaToken } } : undefined,
        )
        return { ok: response.data?.ok ?? true }
    },

    /**
     * Valida un token de recuperación.
     *
     * Backend: `GET /reset-password/info/:token`.
     *   - 200 → `{ correo: "u***o@dominio.com", expired: boolean, used: boolean }`
     *     (correo ofuscado; no lanza error para tokens expirados/consumidos).
     *
     * Adaptamos al contrato que espera el formulario:
     *   `{ valid, correo?, message? }`.
     */
    validateToken: async (token: string): Promise<ValidateTokenResponse> => {
        if (USE_MOCK) return mockValidateToken(token)
        try {
            const response = await apiClient.get<ResetPasswordInfoResponse>(
                ENDPOINTS.resetPassword.info(token),
            )
            const { correo, expired, used } = response.data
            if (expired) {
                return { valid: false, message: 'El enlace de recuperación ha expirado. Solicita uno nuevo.' }
            }
            if (used) {
                return { valid: false, message: 'El enlace de recuperación ya fue utilizado. Solicita uno nuevo.' }
            }
            return { valid: true, correo }
        } catch {
            // Token desconocido o error inesperado: misma pantalla de enlace inválido.
            return { valid: false, message: 'El enlace de recuperación no es válido o ha expirado.' }
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
