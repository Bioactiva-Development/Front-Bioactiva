'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { perfilService } from '@/services/modules/perfil.service'
import { integracionesService } from '@/services/modules/integraciones.service'
import { IntegracionesResponse } from '@/types/integracion.types'
import { UpdateProfileRequest } from '@/types/auth.types'

function extractMessage(err: unknown, fallback: string): string {
    if (err instanceof Error) return err.message
    if (typeof err === 'object' && err !== null && 'message' in err) {
        return String((err as { message: unknown }).message)
    }
    return fallback
}

export function usePerfil() {
    const { usuario, setUsuario } = useAuthStore()

    const [isLoadingPerfil, setIsLoadingPerfil] = useState(false)
    const [isLoadingPassword, setIsLoadingPassword] = useState(false)
    const [isLoadingIntegracion, setIsLoadingIntegracion] = useState(false)

    const [integraciones, setIntegraciones] = useState<IntegracionesResponse | null>(null)
    const [integracionInfo, setIntegracionInfo] = useState<string | null>(null)

    const [successPerfil, setSuccessPerfil] = useState<string | null>(null)
    const [successPassword, setSuccessPassword] = useState<string | null>(null)
    const [errorPerfil, setErrorPerfil] = useState<string | null>(null)
    const [errorPassword, setErrorPassword] = useState<string | null>(null)

    // Precarga "Mi perfil" desde GET /profile (Mantis #333). Si falla, se mantienen
    // los datos del store cargados al iniciar sesión.
    useEffect(() => {
        perfilService.getProfile()
            .then(setUsuario)
            .catch(() => { /* best effort: se conserva el usuario del store */ })
    }, [setUsuario])

    useEffect(() => {
        integracionesService.getEstado()
            .then(setIntegraciones)
            .catch(() => setIntegraciones({
                teams: { tipo: 'microsoft_teams', conectado: false },
                outlook: { tipo: 'microsoft_outlook', conectado: false },
            }))
    }, [])

    // PATCH /profile — nombres/apellidos por separado; el correo no es editable.
    // Solo se envían los campos no vacíos (backend exige 1–90 chars y al menos uno).
    const actualizarPerfil = useCallback(async (nombres: string, apellidos: string) => {
        try {
            setIsLoadingPerfil(true)
            setErrorPerfil(null)

            const payload: UpdateProfileRequest = {}
            if (nombres.trim()) payload.nombres = nombres.trim()
            if (apellidos.trim()) payload.apellidos = apellidos.trim()

            const actualizado = await perfilService.updateProfile(payload)
            setUsuario(actualizado)
            setSuccessPerfil('Perfil actualizado correctamente.')
            setTimeout(() => setSuccessPerfil(null), 3000)
            return true
        } catch (err: unknown) {
            setErrorPerfil(extractMessage(err, 'Error al actualizar el perfil.'))
            return false
        } finally {
            setIsLoadingPerfil(false)
        }
    }, [setUsuario])

    // PATCH /profile/password — requiere la contraseña actual y la nueva (8–72).
    const cambiarPassword = useCallback(async (currentPassword: string, newPassword: string) => {
        try {
            setIsLoadingPassword(true)
            setErrorPassword(null)
            await perfilService.changePassword({ currentPassword, newPassword })
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
        actualizarPerfil,
        cambiarPassword,
        conectarMicrosoft,
        desconectarMicrosoft,
    }
}
