'use client'

import { useState, useCallback, useRef } from 'react'
import { usuariosService } from '@/services/modules/usuarios.service'
import {
    UsuarioListItem,
    EditarUsuarioRequest,
    CambiarPasswordRequest,
    UsuarioFilters,
} from '@/types/usuario.types'
import { RolUsuario } from '@/types/enums'

interface UsuariosState {
    usuarios: UsuarioListItem[]
    total: number
    activos: number
    isLoading: boolean
    error: string | null
    successMessage: string | null
}

function extractMessage(err: unknown, fallback: string): string {
    if (err instanceof Error) return err.message
    if (typeof err === 'object' && err !== null && 'message' in err) {
        return String((err as { message: unknown }).message)
    }
    return fallback
}

export function useUsuarios() {
    const [state, setState] = useState<UsuariosState>({
        usuarios: [],
        total: 0,
        activos: 0,
        isLoading: false,
        error: null,
        successMessage: null,
    })

    // Recuerda los últimos filtros/página para que las recargas tras una mutación
    // (editar, habilitar, etc.) mantengan la página y filtros actuales.
    const filtrosRef = useRef<UsuarioFilters>({ page: 1, limit: 10 })

    const clearMessages = useCallback(() => {
        setState(prev => ({ ...prev, error: null, successMessage: null }))
    }, [])

    const cargar = useCallback(async (filtros?: UsuarioFilters) => {
        if (filtros) filtrosRef.current = filtros
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }))
            const res = await usuariosService.getUsuarios(filtrosRef.current)
            setState(prev => ({
                ...prev,
                usuarios: res.usuarios,
                total: res.total,
                activos: res.activos,
                isLoading: false,
            }))
        } catch (err: unknown) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: extractMessage(err, 'Error al cargar usuarios.'),
            }))
        }
    }, [])

    const editar = useCallback(async (data: EditarUsuarioRequest): Promise<boolean> => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }))
            await usuariosService.editar(data)
            await cargar()
            setState(prev => ({ ...prev, isLoading: false, successMessage: 'Usuario actualizado correctamente.' }))
            return true
        } catch (err: unknown) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: extractMessage(err, 'Error al editar usuario.'),
            }))
            return false
        }
    }, [cargar])

    const cambiarRol = useCallback(async (id: number, rol: RolUsuario): Promise<boolean> => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }))
            await usuariosService.cambiarRol(id, rol)
            await cargar()
            setState(prev => ({ ...prev, isLoading: false, successMessage: 'Rol actualizado correctamente.' }))
            return true
        } catch (err: unknown) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: extractMessage(err, 'Error al cambiar el rol del usuario.'),
            }))
            return false
        }
    }, [cargar])

    const cambiarPassword = useCallback(async (data: CambiarPasswordRequest): Promise<boolean> => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }))
            const res = await usuariosService.cambiarPassword(data)
            setState(prev => ({ ...prev, isLoading: false, successMessage: res.message }))
            return true
        } catch (err: unknown) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: extractMessage(err, 'Error al cambiar contraseña.'),
            }))
            return false
        }
    }, [])

    const deshabilitar = useCallback(async (id: number): Promise<boolean> => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }))
            await usuariosService.deshabilitar(id)
            await cargar()
            setState(prev => ({ ...prev, isLoading: false, successMessage: 'Usuario deshabilitado.' }))
            return true
        } catch (err: unknown) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: extractMessage(err, 'Error al deshabilitar usuario.'),
            }))
            return false
        }
    }, [cargar])

    const habilitar = useCallback(async (id: number): Promise<boolean> => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }))
            await usuariosService.habilitar(id)
            await cargar()
            setState(prev => ({ ...prev, isLoading: false, successMessage: 'Usuario habilitado.' }))
            return true
        } catch (err: unknown) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: extractMessage(err, 'Error al habilitar usuario.'),
            }))
            return false
        }
    }, [cargar])

    return {
        ...state,
        cargar,
        editar,
        cambiarRol,
        cambiarPassword,
        deshabilitar,
        habilitar,
        clearMessages,
    }
}
