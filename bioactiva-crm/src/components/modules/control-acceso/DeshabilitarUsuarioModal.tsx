'use client'

import { X, Loader2, AlertTriangle } from 'lucide-react'
import { EstadoUsuario } from '@/types/enums'
import { UsuarioListItem } from '@/types/usuario.types'

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${esActivo ? 'bg-red-50' : 'bg-green-50'}`}>
                            <AlertTriangle size={18} className={esActivo ? 'text-red-500' : 'text-green-600'} />
                        </div>
                        <h2 className="text-base font-bold text-gray-900">
                            {esActivo ? 'Deshabilitar usuario' : 'Habilitar usuario'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                    <p className="text-sm text-gray-600">
                        {esActivo
                            ? <>¿Estás seguro de que deseas deshabilitar a <span className="font-semibold text-gray-900">{nombreCompleto}</span>? El usuario no podrá iniciar sesión.</>
                            : <>¿Deseas habilitar nuevamente a <span className="font-semibold text-gray-900">{nombreCompleto}</span>? El usuario podrá volver a iniciar sesión.</>
                        }
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
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors disabled:cursor-not-allowed
                                ${esActivo
                                    ? 'bg-red-500 hover:bg-red-600 disabled:bg-red-200'
                                    : 'bg-[#1C7E3C] hover:bg-[#16642f] disabled:bg-[#BCF7B3]'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                esActivo ? 'Sí, deshabilitar' : 'Sí, habilitar'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
