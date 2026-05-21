'use client'

import { useEffect, useState } from 'react'
import { Pencil, Lock, UserX, UserCheck, UserPlus, Users, Mail, Clock } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { InvitarUsuarioModal } from '@/components/modules/control-acceso/InvitarUsuarioModal'
import { EditarUsuarioModal } from '@/components/modules/control-acceso/EditarUsuarioModal'
import { CambiarPasswordModal } from '@/components/modules/control-acceso/CambiarPasswordModal'
import { DeshabilitarUsuarioModal } from '@/components/modules/control-acceso/DeshabilitarUsuarioModal'
import { useUsuarios } from '@/hooks/usuarios/useUsuarios'
import { UsuarioListItem } from '@/types/usuario.types'
import { RolUsuario, EstadoUsuario } from '@/types/enums'
import { InvitarUsuarioFormValues } from '@/lib/validators/usuario.schema'
import { EditarUsuarioRequest, CambiarPasswordRequest } from '@/types/usuario.types'

type ModalType = 'invitar' | 'editar' | 'password' | 'estado' | null

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

export default function ControlAccesoPage() {
    const {
        usuarios, invitaciones, total, activos,
        isLoading, error, successMessage,
        cargar, invitar, editar, cambiarPassword, deshabilitar, habilitar,
        clearMessages,
    } = useUsuarios()

    const [modalAbierto, setModalAbierto] = useState<ModalType>(null)
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioListItem | null>(null)

    useEffect(() => {
        cargar()
    }, [cargar])

    useEffect(() => {
        if (successMessage) {
            const t = setTimeout(clearMessages, 3000)
            return () => clearTimeout(t)
        }
    }, [successMessage, clearMessages])

    const abrirModal = (tipo: ModalType, usuario?: UsuarioListItem) => {
        clearMessages()
        setUsuarioSeleccionado(usuario ?? null)
        setModalAbierto(tipo)
    }

    const cerrarModal = () => {
        setModalAbierto(null)
        setUsuarioSeleccionado(null)
    }

    const handleInvitar = async (data: InvitarUsuarioFormValues) => {
        return invitar(data)
    }

    const handleEditar = async (data: EditarUsuarioRequest) => {
        return editar(data)
    }

    const handleCambiarPassword = async (id: number, password: string) => {
        return cambiarPassword({ id, password } as CambiarPasswordRequest)
    }

    const handleEstado = async () => {
        if (!usuarioSeleccionado) return false
        if (usuarioSeleccionado.estado === EstadoUsuario.Activo) {
            return deshabilitar(usuarioSeleccionado.id)
        }
        return habilitar(usuarioSeleccionado.id)
    }

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

            {error && !modalAbierto && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1C7E3C]/10 flex items-center justify-center shrink-0">
                        <Users size={20} className="text-[#1C7E3C]" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Total usuarios</p>
                        <p className="text-2xl font-bold text-gray-900">{total}</p>
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
                        <p className="text-xs text-gray-500">Invitaciones pendientes</p>
                        <p className="text-2xl font-bold text-gray-900">{invitaciones.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-900">Usuarios registrados</h2>
                </div>

                {isLoading && usuarios.length === 0 ? (
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
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Último acceso</th>
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
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <Clock size={12} />
                                                {u.ultimo_acceso ?? '—'}
                                            </div>
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

            {invitaciones.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-900">Invitaciones enviadas</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Correo</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha envío</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {invitaciones.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900">{inv.correo}</td>
                                        <td className="px-6 py-4">
                                            <RolBadge rol={inv.rol} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${inv.estado === 'Enviada' ? 'bg-blue-100 text-blue-700' : ''}
                                                ${inv.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' : ''}
                                                ${inv.estado === 'Expirada' ? 'bg-gray-100 text-gray-500' : ''}
                                            `}>
                                                {inv.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{inv.fecha_envio}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{inv.fecha_vencimiento}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {modalAbierto === 'invitar' && (
                <InvitarUsuarioModal
                    isLoading={isLoading}
                    error={error}
                    onClose={cerrarModal}
                    onSubmit={handleInvitar}
                />
            )}

            {modalAbierto === 'editar' && usuarioSeleccionado && (
                <EditarUsuarioModal
                    usuario={usuarioSeleccionado}
                    isLoading={isLoading}
                    error={error}
                    onClose={cerrarModal}
                    onSubmit={handleEditar}
                />
            )}

            {modalAbierto === 'password' && usuarioSeleccionado && (
                <CambiarPasswordModal
                    usuario={usuarioSeleccionado}
                    isLoading={isLoading}
                    error={error}
                    onClose={cerrarModal}
                    onSubmit={handleCambiarPassword}
                />
            )}

            {modalAbierto === 'estado' && usuarioSeleccionado && (
                <DeshabilitarUsuarioModal
                    usuario={usuarioSeleccionado}
                    isLoading={isLoading}
                    onClose={cerrarModal}
                    onConfirm={handleEstado}
                />
            )}
        </div>
    )
}
