import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/modules/auth.service'
import { ROUTES } from '@/lib/constants/routes'
import { USE_MOCK } from '@/lib/constants/config'
import {
    LoginFormValues,
    ForgotPasswordFormValues,
    ResetPasswordFormValues,
    ActivateAccountFormValues,
} from '@/lib/validators/auth.schema'

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

    const resetMessages = () => {
        setError(null)
        setSuccess(null)
    }
    const login = async (data: LoginFormValues) => {
        try {
            resetMessages()
            setIsLoading(true)

            const { accessToken } = await authService.login(data)

            if (typeof window !== 'undefined') {
                localStorage.setItem('bioactiva_token', accessToken)
            }

            let usuario

            try {
                usuario = await authService.getMe()
            } catch {
                usuario = {
                    id: 0,
                    nombres: 'Usuario',
                    apellidos: '',
                    correo: data.correo,
                    rol: 'Trabajador' as any,
                    estado: 'Activo' as any,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }
            }


            setSession(accessToken, usuario)
            router.push(ROUTES.dashboard)
        } catch (err: any) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('bioactiva_token')
            }
            setError(err?.message as string ?? 'Error al iniciar sesión. Intente nuevamente.')
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        try {
            await authService.logout()
        } catch {
        } finally {
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
        } catch (err: any) {
            setError(err?.message ?? 'Error al enviar el correo. Intente nuevamente.')
        } finally {
            setIsLoading(false)
        }
    }

    const validateToken = async (token: string) => {
        try {
            resetMessages()
            setIsLoading(true)

            const response = await authService.validateToken(token)
            return response
        } catch (err: any) {
            setError(err?.message ?? 'Error al validar el token. Intente nuevamente.')
            return { valid: false }
        } finally {
            setIsLoading(false)
        }
    }

    const resetPassword = async (token: string, data: ResetPasswordFormValues) => {
        try {
            resetMessages()
            setIsLoading(true)

            await authService.resetPassword(token, data.password)

            setSuccess('Contraseña restablecida correctamente. Ya puede iniciar sesión.')
            setTimeout(() => router.push(ROUTES.auth.login), 2000)
        } catch (err: any) {
            setError(err?.message ?? 'Error al restablecer la contraseña. Intente nuevamente.')
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
        } catch (err: any) {
            setError(err?.message ?? 'Error al activar la cuenta. Intente nuevamente.')
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
