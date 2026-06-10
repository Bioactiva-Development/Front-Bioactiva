'use client'

import { useState } from 'react'
import { Loader2, UserCog } from 'lucide-react'
import { RolUsuario } from '@/types/enums'
import { EditarUsuarioRequest, UsuarioListItem } from '@/types/usuario.types'
import { ModalShell, ModalHeader, ModalFormField, modalInputCn } from '@/components/ui'

interface Props {
    usuario:   UsuarioListItem
    isLoading: boolean
    error:     string | null
    onClose:   () => void
    onSubmit:  (data: EditarUsuarioRequest) => Promise<boolean>
}

export function EditarUsuarioModal({ usuario, isLoading, error, onClose, onSubmit }: Readonly<Props>) {
    const [rol, setRol] = useState<RolUsuario>(usuario.rol)

    const handleFormSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const ok = await onSubmit({
            id:              usuario.id,
            rol,
            nombre_completo: [usuario.nombres, usuario.apellidos].filter(Boolean).join(' '),
            correo:          usuario.correo,
        })
        if (ok) onClose()
    }

    return (
        <ModalShell onClose={onClose}>
            <ModalHeader
                icon={<UserCog size={18} className="text-blue-600" />}
                iconBg="bg-blue-50"
                title="Editar rol"
                subtitle={[usuario.nombres, usuario.apellidos].filter(Boolean).join(' ')}
                onClose={onClose}
            />

            <form onSubmit={handleFormSubmit} className="px-6 py-5 space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                        {error}
                    </div>
                )}

                <ModalFormField label="Rol">
                    <select
                        value={rol}
                        onChange={(e) => setRol(e.target.value as RolUsuario)}
                        className={modalInputCn(false)}
                    >
                        <option value={RolUsuario.Trabajador}>Trabajador</option>
                        <option value={RolUsuario.Administrador}>Administrador</option>
                    </select>
                </ModalFormField>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1C7E3C] hover:bg-[#16642f] disabled:bg-[#BCF7B3] disabled:cursor-not-allowed rounded-xl transition-colors"
                    >
                        {isLoading ? (
                            <><Loader2 size={14} className="animate-spin" />Guardando...</>
                        ) : (
                            'Guardar cambios'
                        )}
                    </button>
                </div>
            </form>
        </ModalShell>
    )
}
