'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Loader2, UserCog } from 'lucide-react'
import { RolUsuario } from '@/types/enums'
import { editarUsuarioSchema, EditarUsuarioFormValues } from '@/lib/validators/usuario.schema'
import { UsuarioListItem } from '@/types/usuario.types'

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                            <UserCog size={18} className="text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Editar usuario</h2>
                            <p className="text-xs text-gray-500">{usuario.correo}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 py-5 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Nombre completo
                        </label>
                        <input
                            type="text"
                            placeholder="Nombres y apellidos"
                            {...register('nombre_completo')}
                            className={`w-full px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 rounded-xl border-2 outline-none transition-colors bg-gray-50
                                ${errors.nombre_completo ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#1C7E3C]'}`}
                        />
                        {errors.nombre_completo && (
                            <p className="text-red-500 text-xs">{errors.nombre_completo.message}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Correo institucional
                        </label>
                        <input
                            type="email"
                            placeholder="usuario@bioactiva.pe"
                            {...register('correo')}
                            className={`w-full px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 rounded-xl border-2 outline-none transition-colors bg-gray-50
                                ${errors.correo ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#1C7E3C]'}`}
                        />
                        {errors.correo && (
                            <p className="text-red-500 text-xs">{errors.correo.message}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Rol
                        </label>
                        <select
                            {...register('rol')}
                            className={`w-full px-4 py-2.5 text-sm text-gray-900 rounded-xl border-2 outline-none transition-colors bg-gray-50
                                ${errors.rol ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#1C7E3C]'}`}
                        >
                            <option value={RolUsuario.Trabajador}>Trabajador</option>
                            <option value={RolUsuario.Administrador}>Administrador</option>
                        </select>
                        {errors.rol && (
                            <p className="text-red-500 text-xs">{errors.rol.message}</p>
                        )}
                    </div>

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
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                'Guardar cambios'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
