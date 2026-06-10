'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { acceptInvitacionSchema, AcceptInvitacionFormValues } from '@/lib/validators/invitacion.schema'
import { useAcceptInvitacion } from '@/hooks/usuarios/useAcceptInvitacion'
import { InvitacionInfo } from '@/types/usuario.types'
import { AuthLayout } from './AuthLayout'
import { AuthAlertBanner } from './AuthAlertBanner'
import { AuthTextField } from './AuthTextField'
import { PasswordField } from './PasswordField'
import { PasswordRequirements } from './PasswordRequirements'

export function AcceptInvitationForm() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token') ?? ''
    const { getInfo, accept, isLoading, error, success } = useAcceptInvitacion()

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm]   = useState(false)
    const [cargandoInfo, setCargandoInfo] = useState(true)
    const [info, setInfo]                 = useState<InvitacionInfo | null>(null)
    const [infoError, setInfoError]       = useState('')

    const { register, handleSubmit, control, formState: { errors } } = useForm<AcceptInvitacionFormValues>({
        resolver: zodResolver(acceptInvitacionSchema),
    })

    const passwordValue = useWatch({ control, name: 'password' }) ?? ''

    useEffect(() => {
        const cargar = async () => {
            if (!token) {
                setInfoError('El enlace de invitación no es válido.')
                setCargandoInfo(false)
                return
            }
            const resultado = await getInfo(token)
            if (resultado) setInfo(resultado)
            setCargandoInfo(false)
        }
        cargar()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token])

    const onSubmit = async (data: AcceptInvitacionFormValues) => {
        await accept(token, data)
    }

    const tokenInvalido = !cargandoInfo && (!info || info.expired || info.accepted || !!error)

    const mensajeInvalido = infoError
        || error
        || (info?.expired ? 'El enlace de invitación ha expirado. Contacta al administrador para recibir una nueva invitación.' : '')
        || (info?.accepted ? 'Esta invitación ya fue utilizada. Si crees que es un error, contacta al administrador.' : '')

    return (
        <AuthLayout
            title="Activar cuenta"
            subtitle="Completa tu información para activar tu acceso al CRM"
        >
            {cargandoInfo && (
                <div className="flex items-center justify-center gap-2 py-6 text-gray-500 text-sm">
                    <Loader2 size={16} className="animate-spin" />
                    Validando enlace de invitación...
                </div>
            )}

            {tokenInvalido && (
                <AuthAlertBanner variant="error" message={mensajeInvalido} withIcon />
            )}

            {!cargandoInfo && info && !info.expired && !info.accepted && (
                <>
                    <div className="bg-[#F1FFEC] border border-[#BCF7B3] rounded-xl px-4 py-3">
                        <p className="text-xs text-[#1C7E3C] font-semibold uppercase tracking-wide">
                            Cuenta a activar
                        </p>
                        <p className="text-sm text-[#1C7E3C] font-bold mt-0.5">{info.correo}</p>
                    </div>

                    {error && <AuthAlertBanner variant="error" message={error} />}

                    {success ? (
                        <div className="space-y-3">
                            <AuthAlertBanner variant="success" message={success} withIcon />
                            <p className="text-sm text-gray-500 text-center">Redirigiendo al dashboard...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <AuthTextField
                                label="Nombres"
                                placeholder="Ingresa tus nombres"
                                {...register('nombres')}
                                error={errors.nombres?.message}
                            />

                            <AuthTextField
                                label="Apellidos"
                                placeholder="Ingresa tus apellidos"
                                {...register('apellidos')}
                                error={errors.apellidos?.message}
                            />

                            <PasswordField
                                label="Contraseña"
                                show={showPassword}
                                onToggle={() => setShowPassword(!showPassword)}
                                {...register('password')}
                                error={errors.password?.message}
                            />

                            <PasswordRequirements password={passwordValue} mode="full" />

                            <PasswordField
                                label="Confirmar contraseña"
                                show={showConfirm}
                                onToggle={() => setShowConfirm(!showConfirm)}
                                {...register('confirmPassword')}
                                error={errors.confirmPassword?.message}
                            />

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 bg-[#1C7E3C] hover:bg-[#16642f] disabled:bg-[#BCF7B3] disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl text-sm transition-colors shadow-md shadow-[#BCF7B3]"
                            >
                                {isLoading ? (
                                    <><Loader2 size={16} className="animate-spin" />Activando cuenta...</>
                                ) : (
                                    'Activar cuenta'
                                )}
                            </button>
                        </form>
                    )}
                </>
            )}

        </AuthLayout>
    )
}
