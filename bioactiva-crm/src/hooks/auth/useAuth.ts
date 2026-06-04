'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/modules/auth.service'
import { ROUTES } from '@/lib/constants/routes'
import { TOKEN_KEY, COOKIE_TOKEN, COOKIE_ROL } from '@/lib/constants/config'
import { usuarioFromAccessToken } from '@/lib/utils/auth.mappers'
import {
    LoginFormValues,
    ForgotPasswordFormValues,
    ResetPasswordFormValues,
} from '@/lib/validators/auth.schema'
import { ValidateTokenResult } from '@/types/auth.types'

function extractMessage(err: unknown, fallback: string): string {
    if (err instanceof Error) return err.message
    if (typeof err === 'object' && err !== null && 'message' in err) {
        return String((err as { message: unknown }).message)
    }
    return fallback
}

const MAX_AGE = 8 * 60 * 60

function setCookie(name: string, value: string): void {
    document.cookie = `${name}=${value}; path=/; max-age=${MAX_AGE}; SameSite=Strict`
}

function clearCookie(name: string): void {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Strict`
}

export function useAuth() {
    const router = useRouter()
    const {
        setSession,
        clearSession,
        isAuthenticated,
        usuario,
        isAdministrador,
    } = useAuthStore()

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const resetMessages = useCallback(() => {
        setError(null)
        setSuccess(null)
    }, [])

    const login = async (data: LoginFormValues, captchaToken?: string | null) => {
        try {
            resetMessages()
            setIsLoading(true)

            const { accessToken, accessTokenExpiresIn } = await authService.login(data, captchaToken)

            if (typeof window !== 'undefined') {
                localStorage.setItem(TOKEN_KEY, accessToken)
            }

            let usuarioData
            try {
                usuarioData = await authService.getMe()
            } catch {
                usuarioData =
                    useAuthStore.getState().usuario ??
                    usuarioFromAccessToken(accessToken, data.correo)
            }

            if (typeof window !== 'undefined') {
                setCookie(COOKIE_TOKEN, accessToken)
                setCookie(COOKIE_ROL, usuarioData.rol)
            }

            setSession(accessToken, usuarioData, accessTokenExpiresIn)
            router.push(ROUTES.dashboard)
        } catch (err: unknown) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem(TOKEN_KEY)
            }
            setError(extractMessage(err, 'Error al iniciar sesión. Intente nuevamente.'))
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        try {
            await authService.logout()
        } catch {
        } finally {
            if (typeof window !== 'undefined') {
                clearCookie(COOKIE_TOKEN)
                clearCookie(COOKIE_ROL)
            }
            clearSession()
            router.push(ROUTES.auth.login)
        }
    }

    const forgotPassword = async (data: ForgotPasswordFormValues, captchaToken?: string | null) => {
        try {
            resetMessages()
            setIsLoading(true)
            await authService.forgotPassword(data.correo, captchaToken)
            // Mensaje neutral por diseño: el backend responde `{ ok: true }`
            // aunque el correo no exista (anti-enumeración de usuarios).
            // Revelar "enviado correctamente" delataría qué correos existen.
            setSuccess(
                'Si el correo está registrado en el sistema, recibirás un enlace de recuperación en los próximos minutos.',
            )
        } catch (err: unknown) {
            // El backend retorna errores diferenciados (400 dominio no permitido,
            // 404 correo no registrado o inactivo, 409 solicitud activa en <5 min).
            // extractMessage pasa el mensaje del servidor directamente al formulario.
            setError(extractMessage(err, 'Error al enviar el correo. Intente nuevamente.'))
        } finally {
            setIsLoading(false)
        }
    }

    const validateToken = useCallback(async (token: string): Promise<ValidateTokenResult> => {
        try {
            resetMessages()
            setIsLoading(true)
            const response = await authService.validateToken(token)
            return { valid: true, correo: response.correo }
        } catch (err: unknown) {
            return { valid: false, message: extractMessage(err, 'El enlace no es válido o ha expirado.') }
        } finally {
            setIsLoading(false)
        }
    }, [resetMessages])

    const resetPassword = async (token: string, data: ResetPasswordFormValues) => {
        try {
            resetMessages()
            setIsLoading(true)
            await authService.resetPassword(token, data.password, data.confirmPassword)
            setSuccess('Contraseña restablecida correctamente. Ya puede iniciar sesión.')
            setTimeout(() => router.push(ROUTES.auth.login), 2000)
        } catch (err: unknown) {
            setError(extractMessage(err, 'Error al restablecer la contraseña. Intente nuevamente.'))
        } finally {
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        error,
        success,
        isAuthenticated,
        usuario,
        isAdministrador,
        login,
        logout,
        forgotPassword,
        validateToken,
        resetPassword,
        resetMessages,
    }
}
