'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Pencil, Lock, UserX, UserCheck, UserPlus, Users,
    Mail, Search, ChevronLeft, ChevronRight, ShieldAlert,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { InvitarUsuarioModal } from '@/components/modules/control-acceso/InvitarUsuarioModal'
import { EditarUsuarioModal } from '@/components/modules/control-acceso/EditarUsuarioModal'
import { CambiarPasswordModal } from '@/components/modules/control-acceso/CambiarPasswordModal'
import { DeshabilitarUsuarioModal } from '@/components/modules/control-acceso/DeshabilitarUsuarioModal'
import { useUsuarios } from '@/hooks/usuarios/useUsuarios'
import { useInvitaciones } from '@/hooks/usuarios/useInvitaciones'
import { useAuthStore } from '@/store/auth.store'
import { useDebounce } from '@/hooks/shared/useDebounce'
import { UsuarioListItem, EditarUsuarioRequest, CambiarPasswordRequest, ListInvitacionesParams } from '@/types/usuario.types'
import { RolUsuario, EstadoUsuario, EstadoToken } from '@/types/enums'
import { InvitarUsuarioFormValues } from '@/lib/validators/usuario.schema'
import { ROUTES } from '@/lib/constants/routes'

type ModalType = 'invitar' | 'editar' | 'password' | 'estado' | null

const LIMIT = 10

const ESTADO_OPTIONS = [
    { value: '', label: 'Todos los estados' },
    { value: '0', label: 'Pendiente' },
    { value: '1', label: 'Aceptada' },
    { value: '2', label: 'Expirada' },
    { value: '3', label: 'Revocada' },
]

function getInitials(nombres: string, apellidos: string) {
    const n = nombres.trim()[0] ?? ''
    const a = apellidos.trim()[0] ?? ''
    return (n + a).toUpperCase() || '?'
}

function RolBadge({ rol }: { rol: RolUsuario }) {
    if (rol === RolUsuario.Administrador) {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                Administrador
            </span>
        )
    }
    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            Trabajador
        </span>
    )
}

function EstadoBadge({ estado }: { estado: EstadoUsuario }) {
    if (estado === EstadoUsuario.Activo) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Activo
            </span>
        )
    }
    if (estado === EstadoUsuario.Inactivo) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Inactivo
            </span>
        )
    }
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            Pendiente
        </span>
    )
}

function EstadoInvitacionBadge({ estado }: { estado: EstadoToken }) {
    const map: Record<EstadoToken, { label: string; className: string }> = {
        [EstadoToken.Pendiente]: { label: 'Pendiente', className: 'bg-amber-100 text-amber-700' },
        [EstadoToken.Consumido]: { label: 'Aceptada', className: 'bg-green-100 text-green-700' },
        [EstadoToken.Expirado]:  { label: 'Expirada', className: 'bg-gray-100 text-gray-500' },
        [EstadoToken.Revocado]:  { label: 'Revocada', className: 'bg-red-100 text-red-500' },
    }
    const { label, className } = map[estado] ?? { label: estado, className: 'bg-gray-100 text-gray-500' }
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
            {label}
        </span>
    )
}

export default function ControlAccesoPage() {
    const router = useRouter()
    const { isAdministrador } = useAuthStore()

    const {
        usuarios, total: totalUsuarios, activos,
        isLoading: isLoadingUsuarios, error: errorUsuarios, successMessage,
        cargar, editar, cambiarPassword, deshabilitar, habilitar, clearMessages,
    } = useUsuarios()

    const [modalAbierto, setModalAbierto] = useState<ModalType>(null)
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioListItem | null>(null)
    const [inviteError, setInviteError] = useState<string | null>(null)

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
        invitaciones, total: totalInvitaciones,
        isLoading: isLoadingInvitaciones,
        createInvitacion, isCreating, createError,
        revokeInvitacion, isRevoking, revokingId,
    } = useInvitaciones(params)

    useEffect(() => {
        cargar()
    }, [cargar])

    useEffect(() => {
        if (successMessage) {
            const t = setTimeout(clearMessages, 3000)
            return () => clearTimeout(t)
        }
    }, [successMessage, clearMessages])

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

    const abrirModal = (tipo: ModalType, usuario?: UsuarioListItem) => {
        clearMessages()
        setInviteError(null)
        setUsuarioSeleccionado(usuario ?? null)
        setModalAbierto(tipo)
    }

    const cerrarModal = () => {
        setModalAbierto(null)
        setUsuarioSeleccionado(null)
        setInviteError(null)
    }

    const handleInvitar = async (data: InvitarUsuarioFormValues): Promise<boolean> => {
        try {
            setInviteError(null)
            const rolNumerico = data.rol === RolUsuario.Administrador ? 0 : 1
            await createInvitacion({ correo: data.correo, rol: rolNumerico })
            return true
        } catch (err: unknown) {
            const raw = (err as { message?: string })?.message ?? ''
            const msg = /unique constraint|already exists|correo/i.test(raw)
                ? 'Ya existe una invitación o cuenta registrada con ese correo. No es posible enviar una nueva invitación.'
                : 'Error al enviar la invitación. Intente nuevamente.'
            setInviteError(msg)
            return false
        }
    }

    const handleEditar = async (data: EditarUsuarioRequest): Promise<boolean> => {
        return editar(data)
    }

    const handleCambiarPassword = async (id: number, password: string): Promise<boolean> => {
        return cambiarPassword({ id, password } as CambiarPasswordRequest)
    }

    const handleEstado = async (): Promise<boolean> => {
        if (!usuarioSeleccionado) return false
        if (usuarioSeleccionado.estado === EstadoUsuario.Activo) {
            return deshabilitar(usuarioSeleccionado.id)
        }
        return habilitar(usuarioSeleccionado.id)
    }

    const handleRevocar = async (id: number) => {
        try {
            await revokeInvitacion(id)
        } catch {
            // error silenciado — la UI no cambia si falla
        }
    }

    const totalPages = Math.ceil(totalInvitaciones / LIMIT)

    return (
        <div>
            <PageHeader
                titulo="Control de acceso"
                descripcion="Gestión de usuarios y permisos del sistema"
                acciones={
                    <button
                        onClick={() => abrirModal('invitar')}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1C7E3C] hover:bg-[#16642f] rounded-xl transition-colors shadow-sm"
                    >
                        <UserPlus size={16} />
                        Invitar usuario
                    </button>
                }
            />

            {successMessage && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
                    {successMessage}
                </div>
            )}

            {errorUsuarios && !modalAbierto && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    {errorUsuarios}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1C7E3C]/10 flex items-center justify-center shrink-0">
                        <Users size={20} className="text-[#1C7E3C]" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Total usuarios</p>
                        <p className="text-2xl font-bold text-gray-900">{totalUsuarios}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                        <UserCheck size={20} className="text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Activos</p>
                        <p className="text-2xl font-bold text-gray-900">{activos}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                        <Mail size={20} className="text-amber-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Invitaciones</p>
                        <p className="text-2xl font-bold text-gray-900">{totalInvitaciones}</p>
                    </div>
                </div>
            </div>

            {/* Tabla de usuarios */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-900">Usuarios registrados</h2>
                </div>

                {isLoadingUsuarios && usuarios.length === 0 ? (
                    <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                        Cargando usuarios...
                    </div>
                ) : usuarios.length === 0 ? (
                    <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                        No hay usuarios registrados
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuario</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {usuarios.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-[#1C7E3C]/10 flex items-center justify-center shrink-0">
                                                    <span className="text-xs font-bold text-[#1C7E3C]">
                                                        {getInitials(u.nombres, u.apellidos)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {[u.nombres, u.apellidos].filter(Boolean).join(' ')}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{u.correo}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <RolBadge rol={u.rol} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <EstadoBadge estado={u.estado} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => abrirModal('editar', u)}
                                                    title="Editar usuario"
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => abrirModal('password', u)}
                                                    title="Cambiar contraseña"
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                                                >
                                                    <Lock size={15} />
                                                </button>
                                                <button
                                                    onClick={() => abrirModal('estado', u)}
                                                    title={u.estado === EstadoUsuario.Activo ? 'Deshabilitar' : 'Habilitar'}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                                        ${u.estado === EstadoUsuario.Activo
                                                            ? 'text-gray-400 hover:bg-red-50 hover:text-red-500'
                                                            : 'text-gray-400 hover:bg-green-50 hover:text-green-600'
                                                        }`}
                                                >
                                                    {u.estado === EstadoUsuario.Activo ? <UserX size={15} /> : <UserCheck size={15} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Tabla de invitaciones */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-900">Invitaciones enviadas</h2>
                </div>
                <div className="px-6 py-4">
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por correo..."
                                value={term}
                                onChange={(e) => { setTerm(e.target.value); setPage(1) }}
                                className="w-full pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>
                        <select
                            value={estadoFiltro}
                            onChange={(e) => { setEstadoFiltro(e.target.value); setPage(1) }}
                            className="px-4 py-2.5 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer min-w-40"
                        >
                            {ESTADO_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {isLoadingInvitaciones && (
                        <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
                            Cargando invitaciones...
                        </div>
                    )}

                    {!isLoadingInvitaciones && invitaciones.length === 0 && (
                        <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
                            {term || estadoFiltro
                                ? 'No se encontraron invitaciones con esos filtros.'
                                : 'No hay invitaciones registradas.'}
                        </div>
                    )}

                    {!isLoadingInvitaciones && invitaciones.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Correo</th>
                                        <th className="py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</th>
                                        <th className="py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                                        <th className="py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Enviada</th>
                                        <th className="py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vence</th>
                                        <th className="py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {invitaciones.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 text-sm text-gray-900">{inv.correo}</td>
                                            <td className="py-4"><RolBadge rol={inv.rol} /></td>
                                            <td className="py-4"><EstadoInvitacionBadge estado={inv.estado} /></td>
                                            <td className="py-4 text-sm text-gray-500">{new Date(inv.created_at).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                            <td className="py-4 text-sm text-gray-500">{new Date(inv.expires_at).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                            <td className="py-4 text-right">
                                                {inv.estado === EstadoToken.Pendiente && (
                                                    <button
                                                        onClick={() => handleRevocar(inv.id)}
                                                        disabled={isRevoking && revokingId === inv.id}
                                                        className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        Revocar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-gray-400">
                                {totalInvitaciones} invitación{totalInvitaciones !== 1 ? 'es' : ''} · Página {page} de {totalPages}
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
                </div>
            </div>

            {modalAbierto === 'invitar' && (
                <InvitarUsuarioModal
                    isLoading={isCreating}
                    error={inviteError ?? (createError?.message ?? null)}
                    onClose={cerrarModal}
                    onSubmit={handleInvitar}
                />
            )}

            {modalAbierto === 'editar' && usuarioSeleccionado && (
                <EditarUsuarioModal
                    usuario={usuarioSeleccionado}
                    isLoading={isLoadingUsuarios}
                    error={errorUsuarios}
                    onClose={cerrarModal}
                    onSubmit={handleEditar}
                />
            )}

            {modalAbierto === 'password' && usuarioSeleccionado && (
                <CambiarPasswordModal
                    usuario={usuarioSeleccionado}
                    isLoading={isLoadingUsuarios}
                    error={errorUsuarios}
                    onClose={cerrarModal}
                    onSubmit={handleCambiarPassword}
                />
            )}

            {modalAbierto === 'estado' && usuarioSeleccionado && (
                <DeshabilitarUsuarioModal
                    usuario={usuarioSeleccionado}
                    isLoading={isLoadingUsuarios}
                    onClose={cerrarModal}
                    onConfirm={handleEstado}
                />
            )}
        </div>
    )
}
