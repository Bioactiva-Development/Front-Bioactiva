'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { useAuthStore, useUIStore } from '@/store'
import { authService } from '@/services/modules/auth.service'
import { USE_MOCK, COOKIE_TOKEN, COOKIE_ROL } from '@/lib/constants/config'
import { ROUTES } from '@/lib/constants/routes'
import { useProactiveRefresh } from '@/hooks/auth/useProactiveRefresh'

const MAX_AGE = 8 * 60 * 60
const SECURE = process.env.NODE_ENV === 'production' ? '; Secure' : ''

function setCookie(name: string, value: string): void {
    document.cookie = `${name}=${value}; path=/; max-age=${MAX_AGE}; SameSite=Lax${SECURE}`
}

function clearCookie(name: string): void {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${SECURE}`
}

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const router = useRouter()
    const { isAuthenticated, usuario, accessToken, setSession, clearSession, _hasHydrated } = useAuthStore()
    const { sidebarCollapsed } = useUIStore()

    useProactiveRefresh()

    useEffect(() => {
        if (!_hasHydrated) return

        if (!isAuthenticated || !accessToken) {
            clearCookie(COOKIE_TOKEN)
            clearCookie(COOKIE_ROL)
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
                    clearCookie(COOKIE_TOKEN)
                    clearCookie(COOKIE_ROL)
                    clearSession()
                    router.replace(ROUTES.auth.login)
                })
        }
    }, [_hasHydrated, isAuthenticated, accessToken, usuario, router, setSession, clearSession])

    if (!_hasHydrated) return null
    if (!isAuthenticated || !accessToken) return null

    const sidebarMargin = sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-52'

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="print:hidden">
                <Sidebar />
            </div>

            <div
                className={`transition-all duration-300 flex flex-col min-h-screen ${sidebarMargin} print:ml-0`}
            >
                <div className="print:hidden">
                    <Navbar />
                </div>

                <main className="flex-1 p-4 sm:p-6 print:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
