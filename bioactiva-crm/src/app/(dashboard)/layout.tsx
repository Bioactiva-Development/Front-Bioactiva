'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { useAuthStore, useUIStore } from '@/store'
import { authService } from '@/services/modules/auth.service'
import { USE_MOCK } from '@/lib/constants/config'
import { ROUTES } from '@/lib/constants/routes'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const { isAuthenticated, usuario, accessToken, setSession, clearSession } = useAuthStore()
    const { sidebarCollapsed, sidebarOpen } = useUIStore()

    useEffect(() => {
        if (!isAuthenticated || !accessToken) {
            router.replace(ROUTES.auth.login)
            return
        }

        // Rehidratar usuario: si hay token pero no usuario (ej. recarga de página),
        // intentar obtener el usuario via GET /auth/me
        if (accessToken && !usuario && !USE_MOCK) {
            authService.getMe()
                .then((u) => setSession(accessToken, u))
                .catch(() => {
                    clearSession()
                    router.replace(ROUTES.auth.login)
                })
        }
    }, [isAuthenticated, accessToken, usuario, router, setSession, clearSession])

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
