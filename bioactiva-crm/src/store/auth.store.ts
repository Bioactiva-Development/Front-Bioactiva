import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TOKEN_KEY, USER_KEY } from '@/lib/constants/config'
import { Usuario, AuthState } from '@/types/auth.types'
import { RolUsuario } from '@/types/enums'

interface AuthStore extends AuthState {
    setSession: (accessToken: string, usuario: Usuario) => void
    updateToken: (accessToken: string) => void
    clearSession: () => void
    setLoading: (isLoading: boolean) => void

    isAdministrador: () => boolean
    isWorker: () => boolean
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            usuario: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,

            setSession: (accessToken, usuario) => {
                if (typeof window !== 'undefined') {
                    localStorage.setItem(TOKEN_KEY, accessToken)
                    localStorage.setItem(USER_KEY, JSON.stringify(usuario))
                }
                set({
                    accessToken,
                    usuario,
                    isAuthenticated: true,
                    isLoading: false,
                })
            },

            updateToken: (accessToken) => {
                if (typeof window !== 'undefined') {
                    localStorage.setItem(TOKEN_KEY, accessToken)
                }
                set({ accessToken })
            },

            clearSession: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem(TOKEN_KEY)
                    localStorage.removeItem(USER_KEY)
                }
                set({
                    accessToken: null,
                    usuario: null,
                    isAuthenticated: false,
                    isLoading: false,
                })
            },
            setLoading: (isLoading) => set({ isLoading }),
            isAdministrador: () => get().usuario?.rol === RolUsuario.Administrador,
            isWorker: () => get().usuario?.rol === RolUsuario.Trabajador,
        }),
        {
            name: 'bioactiva-auth',
            partialize: (state) => ({
                accessToken: state.accessToken,
                usuario: state.usuario,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)
