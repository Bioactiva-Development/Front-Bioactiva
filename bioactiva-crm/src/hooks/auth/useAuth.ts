import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/modules/auth.service'
import { ROUTES } from '@/lib/constants/routes'
import { RolUsuario, EstadoUsuario } from '@/types/enums'
import {
    LoginFormValues,
    ForgotPasswordFormValues,
    ResetPasswordFormValues,
    ActivateAccountFormValues,
} from '@/lib/validators/auth.schema'

const MAX_AGE = 8 * 60 * 60 // 8 horas en segundos

function setCookie(name: string, value: string): void {
    document.cookie = `${name}=${value}; path=/; max-age=${MAX_AGE}; SameSite=Strict`
}

function clearCookie(name: string): void {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Strict`
}

function extractMessage(err: unknown, fallback: string): string {
    if (err instanceof Error) return err.message
    if (typeof err === 'object' && err !== null && 'message' in err) {
        return String((err as { message: unknown }).message)
    }
    return fallback
}

export function useAuth() {
    const router = useRouter()
    const {
        setSession,
        clearSession,
        isAuthenticated,
        usuario,
        isAdministrador
    } = useAuthStore()

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const resetMessages = useCallback(() => {
        setError(null)
        setSuccess(null)
    }, [])

    const login = async (data: LoginFormValues) => {
        try {
            resetMessages()
            setIsLoading(true)

            const { accessToken } = await authService.login(data)

            let usuarioData

            try {
                usuarioData = await authService.getMe()
            } catch {
                // El mock de login ya guardó el usuario correcto en el store; preferirlo
                usuarioData = useAuthStore.getState().usuario ?? {
                    id: 0,
                    nombres: 'Usuario',
                    apellidos: '',
                    correo: data.correo,
                    rol: RolUsuario.Trabajador,
                    estado: EstadoUsuario.Activo,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }
            }

            if (typeof window !== 'undefined') {
                localStorage.setItem('bioactiva_token', accessToken)
                setCookie('bioactiva_token', accessToken)
                setCookie('bioactiva_rol', usuarioData.rol)
            }

            setSession(accessToken, usuarioData)
            router.push(ROUTES.dashboard)
        } catch (err: unknown) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('bioactiva_token')
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
                clearCookie('bioactiva_token')
                clearCookie('bioactiva_rol')
            }
            clearSession()
            router.push(ROUTES.auth.login)
        }
    }

    const forgotPassword = async (data: ForgotPasswordFormValues) => {
        try {
            resetMessages()
            setIsLoading(true)
            await authService.forgotPassword(data.correo)
            setSuccess('Correo de recuperación enviado correctamente.')
        } catch (err: unknown) {
            setError(extractMessage(err, 'Error al enviar el correo. Intente nuevamente.'))
        } finally {
            setIsLoading(false)
        }
    }

    const validateToken = useCallback(async (token: string) => {
        try {
            resetMessages()
            setIsLoading(true)
            const response = await authService.validateToken(token)
            return response
        } catch (err: unknown) {
            setError(extractMessage(err, 'Error al validar el token. Intente nuevamente.'))
            return { valid: false }
        } finally {
            setIsLoading(false)
        }
    }, [resetMessages])

    const resetPassword = async (token: string, data: ResetPasswordFormValues) => {
        try {
            resetMessages()
            setIsLoading(true)
            await authService.resetPassword(token, data.password)
            setSuccess('Contraseña restablecida correctamente. Ya puede iniciar sesión.')
            setTimeout(() => router.push(ROUTES.auth.login), 2000)
        } catch (err: unknown) {
            setError(extractMessage(err, 'Error al restablecer la contraseña. Intente nuevamente.'))
        } finally {
            setIsLoading(false)
        }
    }

    const activateAccount = async (token: string, data: ActivateAccountFormValues) => {
        try {
            resetMessages()
            setIsLoading(true)
            await authService.activateAccount({ token, ...data })
            setSuccess('Cuenta activada correctamente. Redirigiendo...')
            setTimeout(() => router.push(ROUTES.auth.login), 2000)
        } catch (err: unknown) {
            setError(extractMessage(err, 'Error al activar la cuenta. Intente nuevamente.'))
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
        activateAccount,
        resetMessages,
    }
}
