'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, UserCog } from 'lucide-react'
import { RolUsuario } from '@/types/enums'
import { editarUsuarioSchema, EditarUsuarioFormValues } from '@/lib/validators/usuario.schema'
import { UsuarioListItem } from '@/types/usuario.types'
import { ModalShell, ModalHeader, ModalFormField, modalInputCn } from '@/components/ui'

interface Props {
    usuario: UsuarioListItem
    isLoading: boolean
    error: string | null
    onClose: () => void
    onSubmit: (data: EditarUsuarioFormValues & { id: number }) => Promise<boolean>
}

export function EditarUsuarioModal({ usuario, isLoading, error, onClose, onSubmit }: Props) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<EditarUsuarioFormValues>({
        resolver: zodResolver(editarUsuarioSchema),
    })

    useEffect(() => {
        reset({
            nombre_completo: [usuario.nombres, usuario.apellidos].filter(Boolean).join(' '),
            correo: usuario.correo,
            rol: usuario.rol,
        })
    }, [usuario, reset])

    const handleFormSubmit = async (data: EditarUsuarioFormValues) => {
        const ok = await onSubmit({ ...data, id: usuario.id })
        if (ok) onClose()
    }

    return (
        <ModalShell onClose={onClose}>
            <ModalHeader
                icon={<UserCog size={18} className="text-blue-600" />}
                iconBg="bg-blue-50"
                title="Editar usuario"
                subtitle={usuario.correo}
                onClose={onClose}
            />

            <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 py-5 space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                        {error}
                    </div>
                )}

                <ModalFormField label="Nombre completo" error={errors.nombre_completo?.message}>
                    <input
                        type="text"
                        placeholder="Nombres y apellidos"
                        {...register('nombre_completo')}
                        className={modalInputCn(!!errors.nombre_completo)}
                    />
                </ModalFormField>

                <ModalFormField label="Correo institucional" error={errors.correo?.message}>
                    <input
                        type="email"
                        placeholder="usuario@bioactiva.pe"
                        {...register('correo')}
                        className={modalInputCn(!!errors.correo)}
                    />
                </ModalFormField>

                <ModalFormField label="Rol" error={errors.rol?.message}>
                    <select
                        {...register('rol')}
                        className={modalInputCn(!!errors.rol)}
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
