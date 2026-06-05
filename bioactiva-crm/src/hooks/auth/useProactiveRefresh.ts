'use client'
//hola
import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/modules/auth.service'
import { TOKEN_KEY, USE_MOCK } from '@/lib/constants/config'
import { ROUTES } from '@/lib/constants/routes'

// Renovar 60 s antes de que expire para evitar 401 en requests en vuelo
const REFRESH_BUFFER_MS = 60_000

export function useProactiveRefresh() {
    const router = useRouter()
    const { accessToken, tokenExpiresAt, updateToken, clearSession } = useAuthStore()
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const doRefresh = useCallback(async () => {
        try {
            const { accessToken: newToken, accessTokenExpiresIn } = await authService.refresh()
            if (typeof globalThis.window !== 'undefined') {
                localStorage.setItem(TOKEN_KEY, newToken)
            }
            updateToken(newToken, accessTokenExpiresIn)
        } catch {
            clearSession()
            router.replace(ROUTES.auth.login)
        }
    }, [updateToken, clearSession, router])

    // Programar el refresh al cargar o cuando cambia el token
    useEffect(() => {
        if (USE_MOCK || !accessToken || !tokenExpiresAt) return

        if (timerRef.current) clearTimeout(timerRef.current)

        const delay = tokenExpiresAt - Date.now() - REFRESH_BUFFER_MS
        timerRef.current = setTimeout(doRefresh, Math.max(delay, 0))

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [accessToken, tokenExpiresAt, doRefresh])

    // Cuando la pestaña vuelve a ser visible, verificar si el token necesita
    // renovación inmediata (cubre el caso de pestañas backgrounded donde
    // setTimeout puede retrasarse)
    useEffect(() => {
        if (USE_MOCK) return

        const onVisible = () => {
            if (document.visibilityState !== 'visible') return
            if (!accessToken || !tokenExpiresAt) return
            if (tokenExpiresAt - Date.now() < REFRESH_BUFFER_MS) {
                if (timerRef.current) clearTimeout(timerRef.current)
                doRefresh()
            }
        }

        document.addEventListener('visibilitychange', onVisible)
        return () => document.removeEventListener('visibilitychange', onVisible)
    }, [accessToken, tokenExpiresAt, doRefresh])
}
