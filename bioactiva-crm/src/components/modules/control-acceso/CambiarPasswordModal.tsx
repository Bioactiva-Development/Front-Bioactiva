'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react'
import { cambiarPasswordSchema, CambiarPasswordFormValues } from '@/lib/validators/usuario.schema'
import { UsuarioListItem } from '@/types/usuario.types'
import { ModalShell, ModalHeader, ModalFormField, modalInputCn } from '@/components/ui'

interface Props {
    usuario: UsuarioListItem
    isLoading: boolean
    error: string | null
    onClose: () => void
    onSubmit: (id: number, password: string) => Promise<boolean>
}

export function CambiarPasswordModal({ usuario, isLoading, error, onClose, onSubmit }: Readonly<Props>) {
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
        <ModalShell onClose={onClose}>
            <ModalHeader
                icon={<Lock size={18} className="text-amber-600" />}
                iconBg="bg-amber-50"
                title="Cambiar contraseña"
                subtitle={nombreCompleto}
                onClose={onClose}
            />

            <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 py-5 space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                        {error}
                    </div>
                )}

                <ModalFormField label="Nueva contraseña" error={errors.password?.message}>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mínimo 6 caracteres"
                            {...register('password')}
                            className={`${modalInputCn(!!errors.password)} pr-11`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </ModalFormField>

                <ModalFormField label="Confirmar contraseña" error={errors.confirmPassword?.message}>
                    <div className="relative">
                        <input
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="Repita la contraseña"
                            {...register('confirmPassword')}
                            className={`${modalInputCn(!!errors.confirmPassword)} pr-11`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
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
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 disabled:cursor-not-allowed rounded-xl transition-colors"
                    >
                        {isLoading ? (
                            <><Loader2 size={14} className="animate-spin" />Guardando...</>
                        ) : (
                            'Cambiar contraseña'
                        )}
                    </button>
                </div>
            </form>
        </ModalShell>
    )
}
