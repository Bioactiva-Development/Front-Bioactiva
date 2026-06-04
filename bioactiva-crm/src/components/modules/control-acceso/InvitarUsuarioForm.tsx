'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Loader2, Send } from 'lucide-react'
import { createInvitacionSchema, CreateInvitacionFormValues } from '@/lib/validators/invitacion.schema'

interface InvitarUsuarioFormProps {
    onSubmit: (correo: string, rol: number) => Promise<void>
    isLoading: boolean
    error: string | null
    onClose: () => void
}

export function InvitarUsuarioForm({ onSubmit, isLoading, error, onClose }: Readonly<InvitarUsuarioFormProps>) {
    const { register, handleSubmit, formState: { errors } } = useForm<CreateInvitacionFormValues>({
        resolver: zodResolver(createInvitacionSchema),
        defaultValues: { rol: 1 },
    })

    const submit = async (data: CreateInvitacionFormValues) => {
        await onSubmit(data.correo, data.rol)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">Invitar usuario</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Se enviará un correo con el enlace de activación</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(submit)} className="px-6 py-5 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Correo electrónico <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            placeholder="usuario@bioactiva.pe"
                            {...register('correo')}
                            className={`w-full px-4 py-2.5 text-gray-900 placeholder:text-gray-400 rounded-xl border text-sm outline-none transition-colors
                                ${errors.correo ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-emerald-500 focus:bg-white'}`}
                        />
                        {errors.correo && <p className="text-red-500 text-xs">{errors.correo.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Rol <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register('rol', { valueAsNumber: true })}
                            className={`w-full px-4 py-2.5 text-gray-900 rounded-xl border text-sm outline-none transition-colors appearance-none cursor-pointer
                                ${errors.rol ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-emerald-500 focus:bg-white'}`}
                        >
                            <option value={1}>Trabajador</option>
                            <option value={0}>Administrador</option>
                        </select>
                        {errors.rol && <p className="text-red-500 text-xs">{errors.rol.message}</p>}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700
                                disabled:bg-emerald-200 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            {isLoading ? (
                                <><Loader2 size={15} className="animate-spin" />Enviando...</>
                            ) : (
                                <><Send size={15} />Enviar invitación</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
