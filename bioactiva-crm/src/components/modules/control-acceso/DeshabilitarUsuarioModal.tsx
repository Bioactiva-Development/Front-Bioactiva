'use client'

import { Loader2, AlertTriangle } from 'lucide-react'
import { EstadoUsuario } from '@/types/enums'
import { UsuarioListItem } from '@/types/usuario.types'
import { ModalShell, ModalHeader } from '@/components/ui'

interface Props {
    usuario: UsuarioListItem
    isLoading: boolean
    onClose: () => void
    onConfirm: () => Promise<boolean>
}

export function DeshabilitarUsuarioModal({ usuario, isLoading, onClose, onConfirm }: Props) {
    const nombreCompleto = [usuario.nombres, usuario.apellidos].filter(Boolean).join(' ')
    const esActivo = usuario.estado === EstadoUsuario.Activo

    const handleConfirm = async () => {
        const ok = await onConfirm()
        if (ok) onClose()
    }

    return (
        <ModalShell onClose={onClose} maxWidth="sm">
            <ModalHeader
                icon={<AlertTriangle size={18} className={esActivo ? 'text-red-500' : 'text-green-600'} />}
                iconBg={esActivo ? 'bg-red-50' : 'bg-green-50'}
                title={esActivo ? 'Deshabilitar usuario' : 'Habilitar usuario'}
                onClose={onClose}
            />

            <div className="px-6 py-5 space-y-4">
                <p className="text-sm text-gray-600">
                    {esActivo ? (
                        <>¿Estás seguro de que deseas deshabilitar a <span className="font-semibold text-gray-900">{nombreCompleto}</span>? El usuario no podrá iniciar sesión.</>
                    ) : (
                        <>¿Deseas habilitar nuevamente a <span className="font-semibold text-gray-900">{nombreCompleto}</span>? El usuario podrá volver a iniciar sesión.</>
                    )}
                </p>

                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors disabled:cursor-not-allowed ${
                            esActivo
                                ? 'bg-red-500 hover:bg-red-600 disabled:bg-red-200'
                                : 'bg-[#1C7E3C] hover:bg-[#16642f] disabled:bg-[#BCF7B3]'
                        }`}
                    >
                        {isLoading ? (
                            <><Loader2 size={14} className="animate-spin" />Procesando...</>
                        ) : (
                            esActivo ? 'Sí, deshabilitar' : 'Sí, habilitar'
                        )}
                    </button>
                </div>
            </div>
        </ModalShell>
    )
}
