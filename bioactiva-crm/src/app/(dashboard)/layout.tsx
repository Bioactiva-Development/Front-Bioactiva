'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { useAuthStore, useUIStore } from '@/store'
import { authService } from '@/services/modules/auth.service'
import { USE_MOCK } from '@/lib/constants/config'
import { ROUTES } from '@/lib/constants/routes'
import { useProactiveRefresh } from '@/hooks/auth/useProactiveRefresh'

const MAX_AGE = 8 * 60 * 60

function setCookie(name: string, value: string): void {
    document.cookie = `${name}=${value}; path=/; max-age=${MAX_AGE}; SameSite=Strict`
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const { isAuthenticated, usuario, accessToken, setSession, clearSession, _hasHydrated } = useAuthStore()
    const { sidebarCollapsed, sidebarOpen } = useUIStore()

    useProactiveRefresh()

    useEffect(() => {
        if (!_hasHydrated) return

        if (!isAuthenticated || !accessToken) {
            router.replace(ROUTES.auth.login)
            return
        }
        if (accessToken) {
            setCookie('bioactiva_token', accessToken)
        }
        if (usuario?.rol) {
            setCookie('bioactiva_rol', usuario.rol)
        }

        if (accessToken && !usuario && !USE_MOCK) {
            authService.getMe()
                .then((u) => {
                    setSession(accessToken, u)
                    setCookie('bioactiva_rol', u.rol)
                })
                .catch(() => {
                    clearSession()
                    router.replace(ROUTES.auth.login)
                })
        }
    }, [_hasHydrated, isAuthenticated, accessToken, usuario, router, setSession, clearSession])

    if (!_hasHydrated) return null
    if (!isAuthenticated || !accessToken) return null

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />

            <div
                className={`
          transition-all duration-300 flex flex-col min-h-screen
          ${sidebarOpen
                        ? sidebarCollapsed
                            ? 'lg:ml-16'
                            : 'lg:ml-60'
                        : 'ml-0'
                    }
        `}
            >
                <Navbar />

                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
