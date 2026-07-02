'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    UserX, UserCheck, UserPlus,
    Search, ShieldAlert, X,
} from 'lucide-react'
import { PaginacionSlidingWindow } from '@/components/ui/PaginacionSlidingWindow'
import { PageHeader } from '@/components/layout/PageHeader'
import { InvitarUsuarioModal } from '@/components/modules/control-acceso/InvitarUsuarioModal'
import { CambiarPasswordModal } from '@/components/modules/control-acceso/CambiarPasswordModal'
import { DeshabilitarUsuarioModal } from '@/components/modules/control-acceso/DeshabilitarUsuarioModal'
import { useUsuarios } from '@/hooks/usuarios/useUsuarios'
import { useInvitaciones } from '@/hooks/usuarios/useInvitaciones'
import { useAuthStore } from '@/store/auth.store'
import { useDebounce } from '@/hooks/shared/useDebounce'
import { UsuarioListItem, CambiarPasswordRequest, ListInvitacionesParams, Invitacion } from '@/types/usuario.types'
import { RolUsuario, EstadoUsuario, EstadoToken } from '@/types/enums'
import { InvitarUsuarioFormValues } from '@/lib/validators/usuario.schema'
import { ROUTES } from '@/lib/constants/routes'

type ModalType = 'invitar' | 'password' | 'estado' | null

const LIMIT = 10

const ESTADO_OPTIONS = [
    { value: '', label: 'Todos los estados' },
    { value: '0', label: 'Pendiente' },
    { value: '1', label: 'Aceptada' },
    { value: '2', label: 'Expirada' },
]

function getInitials(nombres: string, apellidos: string) {
    const n = nombres.trim()[0] ?? ''
    const a = apellidos.trim()[0] ?? ''
    return (n + a).toUpperCase() || '?'
}

function RolBadge({ rol }: Readonly<{ rol: RolUsuario }>) {
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

// Mantis #474 — el backend devuelve estado crudo ACTIVO | SUSPENDIDO | PENDIENTE
// (mapeado a EstadoUsuario). El mapeo a etiqueta es SOLO para mostrar; los
// filtros/peticiones siguen enviando el valor crudo del enum.
function EstadoBadge({ estado }: Readonly<{ estado: EstadoUsuario }>) {
    if (estado === EstadoUsuario.Activo) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />{' '}
                Habilitado
            </span>
        )
    }
    if (estado === EstadoUsuario.Inactivo) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />{' '}
                Deshabilitado
            </span>
        )
    }
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />{' '}
            Pendiente
        </span>
    )
}

function EstadoInvitacionBadge({ estado }: Readonly<{ estado: EstadoToken }>) {
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
    const { isAdministrador, usuario: currentUser } = useAuthStore()

    const {
        usuarios, total: totalUsuarios,
        isLoading: isLoadingUsuarios, error: errorUsuarios, successMessage,
        cargar, cambiarRol, cambiarPassword, deshabilitar, habilitar, clearMessages,
    } = useUsuarios()

    const [modalAbierto, setModalAbierto] = useState<ModalType>(null)
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioListItem | null>(null)
    const [inviteError, setInviteError] = useState<string | null>(null)
    const [cambiandoRolId, setCambiandoRolId] = useState<number | null>(null)
    const [tabMovil, setTabMovil] = useState<'usuarios' | 'invitaciones'>('usuarios')
    const [detalleMobil, setDetalleMobil] = useState<UsuarioListItem | null>(null)
    const [detalleInvitacionMovil, setDetalleInvitacionMovil] = useState<Invitacion | null>(null)

    const [term, setTerm] = useState('')
    const [estadoFiltro, setEstadoFiltro] = useState('')
    const [page, setPage] = useState(1)
    const [usuariosPage, setUsuariosPage] = useState(1)
    const termDebounced = useDebounce(term, 400)

    const params: ListInvitacionesParams = {
        page,
        limit: LIMIT,
        ...(termDebounced ? { term: termDebounced } : {}),
        ...(estadoFiltro === '' ? {} : { estado: Number(estadoFiltro) }),
    }

    const {
        invitaciones, total: totalInvitaciones,
        isLoading: isLoadingInvitaciones,
        createInvitacion, isCreating,
        revokeInvitacion, isRevoking, revokingId,
    } = useInvitaciones(params)

    useEffect(() => {
        cargar({ page: usuariosPage, limit: LIMIT })
    }, [cargar, usuariosPage])

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
            let msg = (err as { message?: string })?.message ?? 'Error al enviar la invitación. Intente nuevamente.'
            if (/prisma|unique constraint|constraint failed|invocation/i.test(msg)) {
                msg = 'Ya existe un usuario registrado con ese correo. Si el acceso fue revocado, puedes reactivarlo desde la lista de usuarios.'
            }
            setInviteError(msg)
            return false
        }
    }

    // Mantis #333 — selector de rol por fila vía PATCH /users/:id/role.
    // El propio admin no puede cambiar su rol (la fila propia muestra un badge).
    const handleCambiarRol = async (u: UsuarioListItem, nuevoRol: RolUsuario) => {
        if (nuevoRol === u.rol) return
        clearMessages()
        setCambiandoRolId(u.id)
        await cambiarRol(u.id, nuevoRol)
        setCambiandoRolId(null)
    }

    const handleCambiarPassword = async (id: number, password: string): Promise<boolean> => {
        return cambiarPassword({ id, password } as CambiarPasswordRequest)
    }

    const handleEstado = async (): Promise<boolean> => {
        if (usuarioSeleccionado) {
            if (usuarioSeleccionado.estado === EstadoUsuario.Activo) {
                return deshabilitar(usuarioSeleccionado.id)
            }
            return habilitar(usuarioSeleccionado.id)
        }
        return false
    }

    const handleRevocar = async (id: number) => {
        try {
            await revokeInvitacion(id)
        } catch {
            // error silenciado — la UI no cambia si falla
        }
    }

    const totalPages = Math.ceil(totalInvitaciones / LIMIT)
    const totalPagesUsuarios = Math.ceil(totalUsuarios / LIMIT)

    return (
        <div>
            <PageHeader
                titulo="Control de Acceso"
                descripcion="Gestión de usuarios y permisos del sistema"
                acciones={
                    <button
                        onClick={() => abrirModal('invitar')}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-sm"
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

            {/* Tabs móvil — solo visible en pantallas pequeñas */}
            <div className="sm:hidden flex gap-1 p-1 bg-gray-100 rounded-xl mb-4">
                <button
                    onClick={() => setTabMovil('usuarios')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors
                        ${tabMovil === 'usuarios'
                            ? 'bg-white text-emerald-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Usuarios
                </button>
                <button
                    onClick={() => setTabMovil('invitaciones')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors
                        ${tabMovil === 'invitaciones'
                            ? 'bg-white text-emerald-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Invitaciones
                </button>
            </div>

            {/* Tabla de usuarios */}
            <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 ${tabMovil === 'invitaciones' ? 'hidden sm:block' : ''}`}>
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-900">Usuarios registrados</h2>
                </div>

                {isLoadingUsuarios && usuarios.length === 0 && (
                    <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                        Cargando usuarios...
                    </div>
                )}
                {!isLoadingUsuarios && usuarios.length === 0 && (
                    <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                        No hay usuarios registrados
                    </div>
                )}
                {usuarios.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuario</th>
                                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</th>
                                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                                    <th className="hidden sm:table-cell px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {usuarios.map((u) => (
                                    <tr
                                        key={u.id}
                                        className="hover:bg-gray-50/50 transition-colors sm:cursor-default cursor-pointer"
                                        onClick={() => {
                                            if (typeof window !== 'undefined' && window.innerWidth < 640) {
                                                setDetalleMobil(u)
                                            }
                                        }}
                                    >
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
                                                    {/* Rol + estado: solo visibles en móvil */}
                                                    <div className="sm:hidden flex items-center gap-2 mt-1.5 flex-wrap">
                                                        <RolBadge rol={u.rol} />
                                                        <EstadoBadge estado={u.estado} />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell px-6 py-4">
                                            {u.id === currentUser?.id ? (
                                                // Mantis #333 — un admin no puede cambiar su propio rol.
                                                <div className="flex items-center gap-2">
                                                    <RolBadge rol={u.rol} />
                                                    <span className="text-xs text-gray-400">(tú)</span>
                                                </div>
                                            ) : (
                                                <select
                                                    value={u.rol}
                                                    disabled={cambiandoRolId === u.id}
                                                    onChange={(e) => handleCambiarRol(u, e.target.value as RolUsuario)}
                                                    title="Cambiar rol"
                                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg outline-none focus:border-emerald-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                                                >
                                                    <option value={RolUsuario.Trabajador}>Trabajador</option>
                                                    <option value={RolUsuario.Administrador}>Administrador</option>
                                                </select>
                                            )}
                                        </td>
                                        <td className="hidden sm:table-cell px-6 py-4">
                                            <EstadoBadge estado={u.estado} />
                                        </td>
                                        <td className="hidden sm:table-cell px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                {u.estado !== EstadoUsuario.Pendiente && u.id !== currentUser?.id && (
                                                    <button
                                                        onClick={() => abrirModal('estado', u)}
                                                        aria-label={u.estado === EstadoUsuario.Activo ? `Deshabilitar a ${u.nombres} ${u.apellidos}` : `Habilitar a ${u.nombres} ${u.apellidos}`}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                                            ${u.estado === EstadoUsuario.Activo
                                                                ? 'text-gray-400 hover:bg-red-50 hover:text-red-500'
                                                                : 'text-gray-400 hover:bg-green-50 hover:text-green-600'
                                                            }`}
                                                    >
                                                        {u.estado === EstadoUsuario.Activo ? <UserX size={16} /> : <UserCheck size={16} />}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalUsuarios > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p className="text-sm text-gray-400">
                            Mostrando {((usuariosPage - 1) * LIMIT) + 1}–{Math.min(usuariosPage * LIMIT, totalUsuarios)} de {totalUsuarios} usuario{totalUsuarios === 1 ? '' : 's'}
                        </p>
                        <PaginacionSlidingWindow
                            paginaActual={usuariosPage}
                            totalPaginas={totalPagesUsuarios}
                            onChange={setUsuariosPage}
                        />
                    </div>
                )}
            </div>

            {/* Tabla de invitaciones */}
            <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${tabMovil === 'usuarios' ? 'hidden sm:block' : ''}`}>
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-900">Invitaciones enviadas</h2>
                </div>
                <div className="px-6 py-4">
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
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
                                        <th className="hidden sm:table-cell py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</th>
                                        <th className="py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                                        <th className="hidden md:table-cell py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Enviada</th>
                                        <th className="hidden md:table-cell py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vence</th>
                                        <th className="py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {invitaciones.map((inv) => (
                                        <tr
                                            key={inv.id}
                                            className="hover:bg-gray-50/50 transition-colors sm:cursor-default cursor-pointer"
                                            onClick={() => {
                                                if (typeof window !== 'undefined' && window.innerWidth < 640) {
                                                    setDetalleInvitacionMovil(inv)
                                                }
                                            }}
                                        >
                                            <td className="py-4 text-sm text-gray-900">{inv.correo}</td>
                                            <td className="hidden sm:table-cell py-4"><RolBadge rol={inv.rol} /></td>
                                            <td className="py-4"><EstadoInvitacionBadge estado={inv.estado} /></td>
                                            <td className="hidden md:table-cell py-4 text-sm text-gray-500">{new Date(inv.created_at).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                            <td className="hidden md:table-cell py-4 text-sm text-gray-500">{new Date(inv.expires_at).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
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

                    {totalInvitaciones > 0 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-400">
                                Mostrando {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, totalInvitaciones)} de {totalInvitaciones} invitación{totalInvitaciones === 1 ? '' : 'es'}
                            </p>
                            <PaginacionSlidingWindow
                                paginaActual={page}
                                totalPaginas={totalPages}
                                onChange={setPage}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ── DETALLE DE INVITACIÓN — bottom sheet solo en móvil ── */}
            {detalleInvitacionMovil && (
                <div className="sm:hidden fixed inset-0 z-50 flex items-end">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setDetalleInvitacionMovil(null)}
                    />
                    <div className="relative w-full bg-white rounded-t-2xl px-5 pt-5 pb-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-semibold text-gray-900">Detalle de invitación</h3>
                            <button
                                onClick={() => setDetalleInvitacionMovil(null)}
                                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <p className="text-sm font-semibold text-gray-900 mb-4 truncate">
                            {detalleInvitacionMovil.correo}
                        </p>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Rol</span>
                                <RolBadge rol={detalleInvitacionMovil.rol} />
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado</span>
                                <EstadoInvitacionBadge estado={detalleInvitacionMovil.estado} />
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Enviada</span>
                                <span className="text-sm text-gray-600">
                                    {new Date(detalleInvitacionMovil.created_at).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Vence</span>
                                <span className="text-sm text-gray-600">
                                    {new Date(detalleInvitacionMovil.expires_at).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>

                        {detalleInvitacionMovil.estado === EstadoToken.Pendiente && (
                            <button
                                onClick={() => {
                                    handleRevocar(detalleInvitacionMovil.id)
                                    setDetalleInvitacionMovil(null)
                                }}
                                disabled={isRevoking && revokingId === detalleInvitacionMovil.id}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Revocar invitación
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ── DETALLE DE USUARIO — bottom sheet solo en móvil ── */}
            {detalleMobil && (
                <div className="sm:hidden fixed inset-0 z-50 flex items-end">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setDetalleMobil(null)}
                    />
                    <div className="relative w-full bg-white rounded-t-2xl px-5 pt-5 pb-8 shadow-2xl">
                        {/* Cabecera */}
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-semibold text-gray-900">Detalle de usuario</h3>
                            <button
                                onClick={() => setDetalleMobil(null)}
                                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Avatar + info */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-[#1C7E3C]/10 flex items-center justify-center shrink-0">
                                <span className="text-sm font-bold text-[#1C7E3C]">
                                    {getInitials(detalleMobil.nombres, detalleMobil.apellidos)}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    {[detalleMobil.nombres, detalleMobil.apellidos].filter(Boolean).join(' ')}
                                </p>
                                <p className="text-xs text-gray-500">{detalleMobil.correo}</p>
                            </div>
                        </div>

                        {/* Atributos */}
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Rol</span>
                                {detalleMobil.id === currentUser?.id ? (
                                    <div className="flex items-center gap-2">
                                        <RolBadge rol={detalleMobil.rol} />
                                        <span className="text-xs text-gray-400">(tú)</span>
                                    </div>
                                ) : (
                                    <select
                                        value={detalleMobil.rol}
                                        disabled={cambiandoRolId === detalleMobil.id}
                                        onChange={(e) => handleCambiarRol(detalleMobil, e.target.value as RolUsuario)}
                                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg outline-none focus:border-emerald-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        <option value={RolUsuario.Trabajador}>Trabajador</option>
                                        <option value={RolUsuario.Administrador}>Administrador</option>
                                    </select>
                                )}
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado</span>
                                <EstadoBadge estado={detalleMobil.estado} />
                            </div>
                        </div>

                        {/* Acciones */}
                        {detalleMobil.estado !== EstadoUsuario.Pendiente && detalleMobil.id !== currentUser?.id && (
                            <button
                                onClick={() => {
                                    abrirModal('estado', detalleMobil)
                                    setDetalleMobil(null)
                                }}
                                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors
                                    ${detalleMobil.estado === EstadoUsuario.Activo
                                        ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                        : 'text-green-600 bg-green-50 hover:bg-green-100'
                                    }`}
                            >
                                {detalleMobil.estado === EstadoUsuario.Activo
                                    ? <><UserX size={16} /><span>Deshabilitar usuario</span></>
                                    : <><UserCheck size={16} /><span>Habilitar usuario</span></>
                                }
                            </button>
                        )}
                    </div>
                </div>
            )}

            {modalAbierto === 'invitar' && (
                <InvitarUsuarioModal
                    isLoading={isCreating}
                    error={inviteError}
                    onClose={cerrarModal}
                    onSubmit={handleInvitar}
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
                    error={errorUsuarios}
                    onClose={cerrarModal}
                    onConfirm={handleEstado}
                />
            )}
        </div>
    )
}
