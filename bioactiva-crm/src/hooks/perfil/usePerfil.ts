'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { integracionesService } from '@/services/modules/integraciones.service'
import { IntegracionesResponse } from '@/types/integracion.types'

function extractMessage(err: unknown, fallback: string): string {
    if (err instanceof Error) return err.message
    if (typeof err === 'object' && err !== null && 'message' in err) {
        return String((err as { message: unknown }).message)
    }
    return fallback
}

export function usePerfil() {
    const { usuario, setSession, accessToken } = useAuthStore()

    const [isLoadingPerfil, setIsLoadingPerfil] = useState(false)
    const [isLoadingPassword, setIsLoadingPassword] = useState(false)
    const [isLoadingIntegracion, setIsLoadingIntegracion] = useState(false)

    const [integraciones, setIntegraciones] = useState<IntegracionesResponse | null>(null)
    const [integracionInfo, setIntegracionInfo] = useState<string | null>(null)

    const [successPerfil, setSuccessPerfil] = useState<string | null>(null)
    const [successPassword, setSuccessPassword] = useState<string | null>(null)
    const [errorPerfil, setErrorPerfil] = useState<string | null>(null)
    const [errorPassword, setErrorPassword] = useState<string | null>(null)

    useEffect(() => {
        integracionesService.getEstado()
            .then(setIntegraciones)
            .catch(() => setIntegraciones({
                teams: { tipo: 'microsoft_teams', conectado: false },
                outlook: { tipo: 'microsoft_outlook', conectado: false },
            }))
    }, [])

    const actualizarNombre = useCallback(async (nombre_completo: string) => {
        if (!usuario || !accessToken) return false
        try {
            setIsLoadingPerfil(true)
            setErrorPerfil(null)

            const partes = nombre_completo.trim().split(' ')
            const nombres = partes[0] ?? ''
            const apellidos = partes.slice(1).join(' ')

            // En modo real: llamar al backend PATCH /api/perfil
            // En mock: actualizar directamente el store
            setSession(accessToken, { ...usuario, nombres, apellidos })
            setSuccessPerfil('Perfil actualizado correctamente.')
            setTimeout(() => setSuccessPerfil(null), 3000)
            return true
        } catch (err: unknown) {
            setErrorPerfil(extractMessage(err, 'Error al actualizar el perfil.'))
            return false
        } finally {
            setIsLoadingPerfil(false)
        }
    }, [usuario, accessToken, setSession])

    const cambiarPassword = useCallback(async (_password: string) => {
        try {
            setIsLoadingPassword(true)
            setErrorPassword(null)
            // En modo real: llamar al backend PATCH /api/perfil/password
            await new Promise((r) => setTimeout(r, 600))
            setSuccessPassword('Contraseña actualizada correctamente.')
            setTimeout(() => setSuccessPassword(null), 3000)
            return true
        } catch (err: unknown) {
            setErrorPassword(extractMessage(err, 'Error al cambiar la contraseña.'))
            return false
        } finally {
            setIsLoadingPassword(false)
        }
    }, [])

    const conectarMicrosoft = useCallback(async () => {
        try {
            setIsLoadingIntegracion(true)
            setIntegracionInfo(null)
            const { url } = await integracionesService.getMicrosoftAuthUrl()
            window.location.href = url
        } catch (err: unknown) {
            setIntegracionInfo(extractMessage(err, 'Error al obtener la URL de autorización.'))
            setTimeout(() => setIntegracionInfo(null), 5000)
        } finally {
            setIsLoadingIntegracion(false)
        }
    }, [])

    const desconectarMicrosoft = useCallback(async () => {
        try {
            setIsLoadingIntegracion(true)
            await integracionesService.disconnectMicrosoft()
            setIntegraciones(prev => prev ? {
                ...prev,
                teams: { ...prev.teams, conectado: false, cuenta: undefined },
                outlook: { ...prev.outlook, conectado: false, cuenta: undefined },
            } : prev)
        } catch (err: unknown) {
            setIntegracionInfo(extractMessage(err, 'Error al desconectar.'))
            setTimeout(() => setIntegracionInfo(null), 5000)
        } finally {
            setIsLoadingIntegracion(false)
        }
    }, [])

    return {
        usuario,
        integraciones,
        integracionInfo,
        isLoadingPerfil,
        isLoadingPassword,
        isLoadingIntegracion,
        successPerfil,
        successPassword,
        errorPerfil,
        errorPassword,
        actualizarNombre,
        cambiarPassword,
        conectarMicrosoft,
        desconectarMicrosoft,
    }
}
