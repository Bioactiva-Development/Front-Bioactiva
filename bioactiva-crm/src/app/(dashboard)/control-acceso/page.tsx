'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Search, ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { InvitarUsuarioForm } from '@/components/modules/control-acceso/InvitarUsuarioForm'
import { UsuarioItem } from '@/components/modules/control-acceso/UsuarioItem'
import { useInvitaciones } from '@/hooks/usuarios/useInvitaciones'
import { useAuthStore } from '@/store/auth.store'
import { useDebounce } from '@/hooks/shared/useDebounce'
import { ListInvitacionesParams } from '@/types/usuario.types'
import { ROUTES } from '@/lib/constants/routes'

const LIMIT = 10

const ESTADO_OPTIONS = [
    { value: '', label: 'Todos los estados' },
    { value: '0', label: 'Pendiente' },
    { value: '1', label: 'Aceptada' },
    { value: '2', label: 'Expirada' },
]

export default function ControlAccesoPage() {
    const router = useRouter()
    const { isAdministrador } = useAuthStore()

    const [modalAbierto, setModalAbierto] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    const [term, setTerm] = useState('')
    const [estadoFiltro, setEstadoFiltro] = useState('')
    const [page, setPage] = useState(1)

    const termDebounced = useDebounce(term, 400)

    const params: ListInvitacionesParams = {
        page,
        limit: LIMIT,
        ...(termDebounced ? { term: termDebounced } : {}),
        ...(estadoFiltro !== '' ? { estado: Number(estadoFiltro) } : {}),
    }

    const {
        invitaciones,
        total,
        isLoading,
        createInvitacion,
        isCreating,
        createError,
        revokeInvitacion,
        isRevoking,
        revokingId,
    } = useInvitaciones(params)

    if (!isAdministrador()) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <ShieldAlert size={48} className="text-gray-300" />
                <div className="text-center">
                    <p className="text-gray-600 font-medium">Acceso restringido</p>
                    <p className="text-gray-400 text-sm mt-1">Solo los administradores pueden acceder a esta sección.</p>
                </div>
                <button
                    onClick={() => router.push(ROUTES.dashboard)}
                    className="text-sm text-emerald-600 hover:underline"
                >
                    Volver al dashboard
                </button>
            </div>
        )
    }

    const totalPages = Math.ceil(total / LIMIT)

    const handleInvitar = async (correo: string, rol: number) => {
        try {
            setFormError(null)
            await createInvitacion({ correo, rol })
            setModalAbierto(false)
            setSuccessMsg(`Invitación enviada a ${correo}`)
            setTimeout(() => setSuccessMsg(null), 4000)
        } catch (err: unknown) {
            const e = err as { message?: string }
            setFormError(e?.message ?? 'Error al enviar la invitación.')
        }
    }

    const handleRevocar = async (id: number) => {
        try {
            await revokeInvitacion(id)
        } catch {
            // error silenciado — la UI no cambia si falla
        }
    }

    const handleAbrirModal = () => {
        setFormError(null)
        setModalAbierto(true)
    }

    return (
        <>
            <PageHeader
                titulo="Control de Acceso"
                descripcion="Gestiona las invitaciones para acceder al CRM"
                acciones={
                    <button
                        onClick={handleAbrirModal}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                    >
                        <UserPlus size={16} />
                        Invitar usuario
                    </button>
                }
            />

            {successMsg && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
                    {successMsg}
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por correo..."
                        value={term}
                        onChange={(e) => { setTerm(e.target.value); setPage(1) }}
                        className="w-full pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white border border-gray-200 rounded-xl outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>

                <select
                    value={estadoFiltro}
                    onChange={(e) => { setEstadoFiltro(e.target.value); setPage(1) }}
                    className="px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer min-w-40"
                >
                    {ESTADO_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {isLoading && (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-17 bg-white rounded-xl border border-gray-100 animate-pulse" />
                    ))}
                </div>
            )}

            {!isLoading && invitaciones.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <UserPlus size={40} className="text-gray-200" />
                    <p className="text-gray-400 text-sm">
                        {term || estadoFiltro ? 'No se encontraron invitaciones con esos filtros.' : 'No hay invitaciones registradas.'}
                    </p>
                </div>
            )}

            {!isLoading && invitaciones.length > 0 && (
                <div className="space-y-2.5">
                    {invitaciones.map((inv) => (
                        <UsuarioItem
                            key={inv.id}
                            invitacion={inv}
                            onRevoke={handleRevocar}
                            isRevoking={isRevoking && revokingId === inv.id}
                        />
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-400">
                        {total} invitación{total !== 1 ? 'es' : ''} · Página {page} de {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {modalAbierto && (
                <InvitarUsuarioForm
                    onSubmit={handleInvitar}
                    isLoading={isCreating}
                    error={formError ?? (createError?.message ?? null)}
                    onClose={() => { setModalAbierto(false); setFormError(null) }}
                />
            )}
        </>
    )
}
