'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { TOKEN_KEY, COOKIE_TOKEN, COOKIE_ROL } from '@/lib/constants/config'
import { usuariosService } from '@/services/modules/usuarios.service'
import { authService } from '@/services/modules/auth.service'
import { AcceptInvitacionFormValues } from '@/lib/validators/invitacion.schema'
import { InvitacionInfo } from '@/types/usuario.types'
import { useAuthStore } from '@/store/auth.store'
import { usuarioFromAccessToken } from '@/lib/utils/auth.mappers'

const MAX_AGE = 8 * 60 * 60

function setCookie(name: string, value: string): void {
    document.cookie = `${name}=${value}; path=/; max-age=${MAX_AGE}; SameSite=Strict`
}

export function useAcceptInvitacion() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const resetMessages = () => {
        setError(null)
        setSuccess(null)
    }

    const getInfo = async (token: string): Promise<InvitacionInfo | null> => {
        try {
            resetMessages()
            setIsLoading(true)
            return await usuariosService.getInvitacionInfo(token)
        } catch (err: unknown) {
            const e = err as { message?: string }
            setError(e?.message ?? 'No se pudo validar el enlace de invitación.')
            return null
        } finally {
            setIsLoading(false)
        }
    }

    const accept = async (token: string, data: AcceptInvitacionFormValues) => {
        try {
            resetMessages()
            setIsLoading(true)

            const { accessToken } = await usuariosService.acceptInvitacion({ token, ...data })

            if (typeof window !== 'undefined') {
                localStorage.setItem(TOKEN_KEY, accessToken)
            }

            let usuarioData
            try {
                usuarioData = await authService.getMe()
            } catch {
                usuarioData = usuarioFromAccessToken(accessToken, '')
            }

            if (typeof window !== 'undefined') {
                setCookie(COOKIE_TOKEN, accessToken)
                setCookie(COOKIE_ROL, usuarioData.rol)
            }

            useAuthStore.getState().setSession(accessToken, usuarioData)

            setSuccess('Cuenta activada correctamente. Redirigiendo al sistema...')
            setTimeout(() => router.push(ROUTES.dashboard), 1500)
        } catch (err: unknown) {
            const e = err as { message?: string }
            setError(e?.message ?? 'Error al activar la cuenta. Intente nuevamente.')
        } finally {
            setIsLoading(false)
        }
    }

    return { isLoading, error, success, resetMessages, getInfo, accept }
}
