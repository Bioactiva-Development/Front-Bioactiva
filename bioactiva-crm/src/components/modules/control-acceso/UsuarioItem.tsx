'use client'

import { Loader2, Trash2 } from 'lucide-react'
import { Invitacion } from '@/types/usuario.types'
import { EstadoToken, RolUsuario } from '@/types/enums'

interface UsuarioItemProps {
    invitacion: Invitacion
    onRevoke: (id: number) => void
    isRevoking: boolean
}

const ESTADO_BADGE: Record<EstadoToken, { label: string; className: string }> = {
    [EstadoToken.Pendiente]: {
        label: 'Pendiente',
        className: 'bg-amber-50 text-amber-700 border border-amber-200',
    },
    [EstadoToken.Consumido]: {
        label: 'Aceptada',
        className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    [EstadoToken.Expirado]: {
        label: 'Expirada',
        className: 'bg-gray-100 text-gray-500 border border-gray-200',
    },
    [EstadoToken.Revocado]: {
        label: 'Revocada',
        className: 'bg-red-50 text-red-600 border border-red-200',
    },
}

const ROL_BADGE: Record<RolUsuario, { label: string; className: string }> = {
    [RolUsuario.Administrador]: {
        label: 'Administrador',
        className: 'bg-violet-50 text-violet-700 border border-violet-200',
    },
    [RolUsuario.Trabajador]: {
        label: 'Trabajador',
        className: 'bg-blue-50 text-blue-700 border border-blue-200',
    },
}

function formatFecha(iso: string) {
    return new Date(iso).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

export function UsuarioItem({ invitacion, onRevoke, isRevoking }: Readonly<UsuarioItemProps>) {
    const estadoBadge = ESTADO_BADGE[invitacion.estado]
    const rolBadge = ROL_BADGE[invitacion.rol]
    const puedeRevocar = invitacion.estado === EstadoToken.Pendiente

    return (
        <div className="flex items-center gap-4 px-5 py-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <span className="text-emerald-700 text-sm font-bold">
                    {invitacion.correo.charAt(0).toUpperCase()}
                </span>
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{invitacion.correo}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                    Enviada el {formatFecha(invitacion.created_at)}
                    {invitacion.estado === EstadoToken.Pendiente && (
                        <> · Expira el {formatFecha(invitacion.expires_at)}</>
                    )}
                    {invitacion.consumed_at && (
                        <> · Aceptada el {formatFecha(invitacion.consumed_at)}</>
                    )}
                </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${rolBadge.className}`}>
                    {rolBadge.label}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${estadoBadge.className}`}>
                    {estadoBadge.label}
                </span>

                {puedeRevocar && (
                    <button
                        onClick={() => onRevoke(invitacion.id)}
                        disabled={isRevoking}
                        title="Revocar invitación"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isRevoking ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Trash2 size={16} />
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}
