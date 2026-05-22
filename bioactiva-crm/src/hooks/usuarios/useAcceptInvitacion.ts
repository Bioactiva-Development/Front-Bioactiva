'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { usuariosService } from '@/services/modules/usuarios.service'
import { AcceptInvitacionFormValues } from '@/lib/validators/invitacion.schema'
import { InvitacionInfo } from '@/types/usuario.types'

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
            await usuariosService.acceptInvitacion({ token, ...data })
            setSuccess('Cuenta activada correctamente. Redirigiendo...')
            setTimeout(() => router.push(ROUTES.auth.login), 2000)
        } catch (err: unknown) {
            const e = err as { message?: string }
            setError(e?.message ?? 'Error al activar la cuenta. Intente nuevamente.')
        } finally {
            setIsLoading(false)
        }
    }

    return { isLoading, error, success, resetMessages, getInfo, accept }
}
