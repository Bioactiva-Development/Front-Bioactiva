'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'

// Icono SVG de Microsoft
function MicrosoftIcon() {
    return (
        <svg width="32" height="32" viewBox="0 0 21 21" fill="none">
            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
            <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
        </svg>
    )
}

function AjustesContent() {
    const router       = useRouter()
    const searchParams = useSearchParams()
    const microsoft    = searchParams.get('microsoft') // 'connected' | 'error' | null

    // Redirigir automáticamente al perfil después de 3 segundos
    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace(ROUTES.perfil)
        }, 3000)
        return () => clearTimeout(timer)
    }, [router])

    const esConectado = microsoft === 'connected'
    const esError     = microsoft === 'error'

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
                p-10 max-w-sm w-full text-center space-y-5">

                <div className="flex justify-center">
                    <MicrosoftIcon />
                </div>

                {esConectado && (
                    <>
                        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center
                            justify-center mx-auto">
                            <CheckCircle2 size={28} className="text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                ¡Cuenta conectada!
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Tu cuenta de Microsoft se ha vinculado correctamente.
                                Las actividades de tipo Reunión podrán sincronizarse
                                con Outlook Calendar y Teams.
                            </p>
                        </div>
                    </>
                )}

                {esError && (
                    <>
                        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center
                            justify-center mx-auto">
                            <AlertCircle size={28} className="text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                Error al conectar
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                No se pudo vincular tu cuenta de Microsoft.
                                Puedes intentarlo nuevamente desde tu perfil.
                            </p>
                        </div>
                    </>
                )}

                {!esConectado && !esError && (
                    <>
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center
                            justify-center mx-auto">
                            <Loader2 size={28} className="text-gray-400 animate-spin" />
                        </div>
                        <p className="text-sm text-gray-500">Procesando...</p>
                    </>
                )}

                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Loader2 size={12} className="animate-spin" />
                    Redirigiendo a tu perfil...
                </div>

                <button
                    onClick={() => router.replace(ROUTES.perfil)}
                    className="text-sm text-emerald-600 hover:underline font-medium"
                >
                    Ir al perfil ahora
                </button>
            </div>
        </div>
    )
}

export default function AjustesPage() {
    return (
        <Suspense>
            <AjustesContent />
        </Suspense>
    )
}
