'use client'

import { useState, useCallback, useRef } from 'react'
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

function extractStatus(err: unknown): number | undefined {
    if (typeof err === 'object' && err !== null && 'status' in err) {
        return (err as { status?: number }).status
    }
    return undefined
}

const MAX_AGE = 8 * 60 * 60
const SECURE = process.env.NODE_ENV === 'production' ? '; Secure' : ''

function setCookie(name: string, value: string): void {
    document.cookie = `${name}=${value}; path=/; max-age=${MAX_AGE}; SameSite=Lax${SECURE}`
}

function clearCookie(name: string): void {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${SECURE}`
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

            if (globalThis.window !== undefined) {
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

            if (globalThis.window !== undefined) {
                setCookie(COOKIE_TOKEN, accessToken)
                setCookie(COOKIE_ROL, usuarioData.rol)
            }

            setSession(accessToken, usuarioData, accessTokenExpiresIn)
            router.push(ROUTES.dashboard)
        } catch (err: unknown) {
            if (globalThis.window !== undefined) {
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
            if (globalThis.window !== undefined) {
                clearCookie(COOKIE_TOKEN)
                clearCookie(COOKIE_ROL)
            }
            clearSession()
            router.push(ROUTES.auth.login)
        }
    }

    /**
     * Solicita el correo de recuperación. Devuelve `true` si la solicitud se
     * envió (el formulario usa ese valor para iniciar el cooldown local).
     *
     * El backend responde siempre `200 { ok: true }` exista o no la cuenta y
     * haya o no rate limit (anti-enumeración de usuarios), así que el mensaje
     * de éxito es genérico por diseño. Un `401` indica que la verificación del
     * captcha falló (token vencido, reusado o de score bajo si más adelante se
     * activa v3/Enterprise); cualquier otro error es de red o inesperado.
     */
    const forgotPassword = async (
        data: ForgotPasswordFormValues,
        captchaToken?: string | null,
    ): Promise<boolean> => {
        try {
            resetMessages()
            setIsLoading(true)
            await authService.forgotPassword(data.correo, captchaToken)
            setSuccess(
                'Si el correo está registrado, te enviamos un enlace de recuperación. Revisa tu bandeja y spam.',
            )
            return true
        } catch (err: unknown) {
            const message = extractStatus(err) === 401
                ? 'Verificación fallida, reintenta el captcha.'
                : extractMessage(err, 'No se pudo enviar la solicitud. Intente nuevamente.')
            setError(message)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const validateToken = useCallback(async (token: string): Promise<ValidateTokenResult> => {
        try {
            resetMessages()
            setIsLoading(true)
            const response = await authService.validateToken(token)
            return { valid: response.valid, correo: response.correo, message: response.message }
        } catch (err: unknown) {
            return { valid: false, message: extractMessage(err, 'El enlace no es válido o ha expirado.') }
        } finally {
            setIsLoading(false)
        }
    }, [resetMessages])

    // Guardas contra doble submit (doble click / doble pestaña): el token es de
    // un solo uso y el segundo request recibiría 400 "inválido o ya utilizado".
    const resetEnVueloRef = useRef(false)
    const resetExitosoRef = useRef(false)

    const resetPassword = async (token: string, data: ResetPasswordFormValues) => {
        if (resetEnVueloRef.current || resetExitosoRef.current) return
        resetEnVueloRef.current = true
        try {
            resetMessages()
            setIsLoading(true)
            await authService.resetPassword(token, data.password, data.confirmPassword)
            resetExitosoRef.current = true
            setSuccess('Contraseña restablecida correctamente. Ya puede iniciar sesión.')
            setTimeout(() => router.push(ROUTES.auth.login), 2000)
        } catch (err: unknown) {
            if (resetExitosoRef.current) {
                // Un 400 "token ya utilizado" que llega después de un 200 propio
                // (requests concurrentes) se trata como éxito, no como error.
                return
            }
            setError(extractMessage(err, 'Error al restablecer la contraseña. Intente nuevamente.'))
        } finally {
            resetEnVueloRef.current = false
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
