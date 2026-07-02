import { Usuario, UpdateProfileRequest, ChangePasswordRequest } from '@/types/auth.types'
import { useAuthStore } from '@/store/auth.store'

const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockGetProfile = async (): Promise<Usuario> => {
    await delay()
    const usuario = useAuthStore.getState().usuario
    if (!usuario) {
        throw Object.assign(new Error('No hay sesión activa.'), { status: 401 })
    }
    return usuario
}

export const mockUpdateProfile = async (data: UpdateProfileRequest): Promise<Usuario> => {
    await delay()
    const usuario = useAuthStore.getState().usuario
    if (!usuario) {
        throw Object.assign(new Error('No hay sesión activa.'), { status: 401 })
    }

    const actualizado: Usuario = {
        ...usuario,
        ...(data.nombres?.trim() ? { nombres: data.nombres.trim() } : {}),
        ...(data.apellidos?.trim() ? { apellidos: data.apellidos.trim() } : {}),
        updated_at: new Date().toISOString(),
    }

    useAuthStore.getState().setUsuario(actualizado)
    return actualizado
}

export const mockChangePassword = async (_data: ChangePasswordRequest): Promise<void> => {
    await delay()
}
