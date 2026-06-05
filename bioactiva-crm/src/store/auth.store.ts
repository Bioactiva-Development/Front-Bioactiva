import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TOKEN_KEY, USER_KEY } from '@/lib/constants/config'
import { Usuario, AuthState } from '@/types/auth.types'
import { RolUsuario } from '@/types/enums'

interface AuthStore extends AuthState {
    _hasHydrated: boolean
    _setHasHydrated: (value: boolean) => void

    setSession: (accessToken: string, usuario: Usuario, expiresIn?: number) => void
    updateToken: (accessToken: string, expiresIn?: number) => void
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
            tokenExpiresAt: null,
            isAuthenticated: false,
            isLoading: false,
            _hasHydrated: false,

            _setHasHydrated: (value) => set({ _hasHydrated: value }),

            setSession: (accessToken, usuario, expiresIn) => {
                if (typeof globalThis.window !== 'undefined') {
                    localStorage.setItem(TOKEN_KEY, accessToken)
                    localStorage.setItem(USER_KEY, JSON.stringify(usuario))
                }
                set({
                    accessToken,
                    usuario,
                    tokenExpiresAt: expiresIn ? Date.now() + expiresIn * 1000 : null,
                    isAuthenticated: true,
                    isLoading: false,
                })
            },

            updateToken: (accessToken, expiresIn) => {
                if (typeof globalThis.window !== 'undefined') {
                    localStorage.setItem(TOKEN_KEY, accessToken)
                }
                set({
                    accessToken,
                    tokenExpiresAt: expiresIn ? Date.now() + expiresIn * 1000 : null,
                })
            },

            clearSession: () => {
                if (typeof globalThis.window !== 'undefined') {
                    localStorage.removeItem(TOKEN_KEY)
                    localStorage.removeItem(USER_KEY)
                }
                set({
                    accessToken: null,
                    tokenExpiresAt: null,
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
                tokenExpiresAt: state.tokenExpiresAt,
                usuario: state.usuario,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                state?._setHasHydrated(true)
            },
        }
    )
)
