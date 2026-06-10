'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail } from 'lucide-react'
import { RolUsuario } from '@/types/enums'
import { invitarUsuarioSchema, InvitarUsuarioFormValues } from '@/lib/validators/usuario.schema'
import { ModalShell, ModalHeader, ModalFormField, modalInputCn } from '@/components/ui'

interface Props {
    isLoading: boolean
    error: string | null
    onClose: () => void
    onSubmit: (data: InvitarUsuarioFormValues) => Promise<boolean>
}

export function InvitarUsuarioModal({ isLoading, error, onClose, onSubmit }: Readonly<Props>) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<InvitarUsuarioFormValues>({
        resolver: zodResolver(invitarUsuarioSchema),
        defaultValues: { correo: '', rol: RolUsuario.Trabajador },
    })

    const handleFormSubmit = async (data: InvitarUsuarioFormValues) => {
        const ok = await onSubmit(data)
        if (ok) onClose()
    }

    return (
        <ModalShell onClose={onClose}>
            <ModalHeader
                icon={<Mail size={18} className="text-[#1C7E3C]" />}
                iconBg="bg-[#1C7E3C]/10"
                title="Invitar usuario"
                subtitle="Se enviará un correo de activación"
                onClose={onClose}
            />

            <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 py-5 space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                        {error}
                    </div>
                )}

                <ModalFormField label="Correo institucional" error={errors.correo?.message}>
                    <input
                        type="text"
                        placeholder="usuario@bioactiva.pe"
                        autoComplete="off"
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
                            <><Loader2 size={14} className="animate-spin" />Enviando...</>
                        ) : (
                            'Enviar invitación'
                        )}
                    </button>
                </div>
            </form>
        </ModalShell>
    )
}
