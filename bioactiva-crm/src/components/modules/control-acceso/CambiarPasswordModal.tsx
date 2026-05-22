'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Loader2, Lock, Eye, EyeOff } from 'lucide-react'
import { cambiarPasswordSchema, CambiarPasswordFormValues } from '@/lib/validators/usuario.schema'
import { UsuarioListItem } from '@/types/usuario.types'

interface Props {
    usuario: UsuarioListItem
    isLoading: boolean
    error: string | null
    onClose: () => void
    onSubmit: (id: number, password: string) => Promise<boolean>
}

export function CambiarPasswordModal({ usuario, isLoading, error, onClose, onSubmit }: Props) {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CambiarPasswordFormValues>({
        resolver: zodResolver(cambiarPasswordSchema),
    })

    const handleFormSubmit = async (data: CambiarPasswordFormValues) => {
        const ok = await onSubmit(usuario.id, data.password)
        if (ok) onClose()
    }

    const nombreCompleto = [usuario.nombres, usuario.apellidos].filter(Boolean).join(' ')

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                            <Lock size={18} className="text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Cambiar contraseña</h2>
                            <p className="text-xs text-gray-500">{nombreCompleto}</p>
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
                            Nueva contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Mínimo 6 caracteres"
                                {...register('password')}
                                className={`w-full px-4 py-2.5 pr-11 text-sm text-gray-900 placeholder:text-gray-400 rounded-xl border-2 outline-none transition-colors bg-gray-50
                                    ${errors.password ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#1C7E3C]'}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-xs">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Confirmar contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                placeholder="Repita la contraseña"
                                {...register('confirmPassword')}
                                className={`w-full px-4 py-2.5 pr-11 text-sm text-gray-900 placeholder:text-gray-400 rounded-xl border-2 outline-none transition-colors bg-gray-50
                                    ${errors.confirmPassword ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#1C7E3C]'}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>
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
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 disabled:cursor-not-allowed rounded-xl transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                'Cambiar contraseña'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
