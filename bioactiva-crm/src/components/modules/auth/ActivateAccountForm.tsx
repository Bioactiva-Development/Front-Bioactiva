'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { activateAccountSchema, ActivateAccountFormValues } from '@/lib/validators/auth.schema'
import { useAuth } from '@/hooks/auth/useAuth'
import { ROUTES } from '@/lib/constants/routes'
import { AuthLayout } from './AuthLayout'
import { AuthAlertBanner } from './AuthAlertBanner'
import { AuthTextField } from './AuthTextField'
import { PasswordField } from './PasswordField'

export function ActivateAccountForm() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token') ?? ''
    const { validateToken, activateAccount, isLoading, error, success } = useAuth()

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [tokenValido, setTokenValido] = useState<boolean | null>(null)
    const [tokenMensaje, setTokenMensaje] = useState('')
    const [validandoToken, setValidandoToken] = useState(true)
    const [correoInvitado, setCorreoInvitado] = useState('')

    const { register, handleSubmit, formState: { errors } } = useForm<ActivateAccountFormValues>({
        resolver: zodResolver(activateAccountSchema),
    })

    useEffect(() => {
        const verificar = async () => {
            if (!token) {
                setTokenValido(false)
                setTokenMensaje('El enlace de activación no es válido.')
                setValidandoToken(false)
                return
            }
            const result = await validateToken(token)
            setTokenValido(result.valid)
            setTokenMensaje(result.message ?? '')
            if (result.correo) setCorreoInvitado(result.correo)
            setValidandoToken(false)
        }
        verificar()
    }, [token, validateToken])

    const onSubmit = async (data: ActivateAccountFormValues) => {
        await activateAccount(token, data)
    }

    return (
        <AuthLayout
            title="Activar cuenta"
            subtitle="Completa tu información para activar tu acceso al CRM"
        >
            {validandoToken && (
                <div className="flex items-center justify-center gap-2 py-6 text-gray-500 text-sm">
                    <Loader2 size={16} className="animate-spin" />
                    Validando enlace de activación...
                </div>
            )}

            {!validandoToken && !tokenValido && (
                <div className="space-y-4">
                    <AuthAlertBanner
                        variant="error"
                        message={tokenMensaje || 'El enlace no es válido o ha expirado.'}
                        withIcon
                    />
                    <p className="text-sm text-gray-500 text-center">
                        Contacta al administrador para recibir una nueva invitación.
                    </p>
                </div>
            )}

            {!validandoToken && tokenValido && (
                <>
                    {correoInvitado && (
                        <div className="bg-[#F1FFEC] border border-[#BCF7B3] rounded-xl px-4 py-3">
                            <p className="text-xs text-[#1C7E3C] font-semibold uppercase tracking-wide">
                                Cuenta a activar
                            </p>
                            <p className="text-sm text-[#1C7E3C] font-bold mt-0.5">{correoInvitado}</p>
                        </div>
                    )}

                    {error && <AuthAlertBanner variant="error" message={error} />}

                    {success ? (
                        <div className="space-y-3">
                            <AuthAlertBanner variant="success" message={success} withIcon />
                            <p className="text-sm text-gray-500 text-center">Redirigiendo al login...</p>
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

                            <PasswordField
                                label="Confirmar contraseña"
                                show={showConfirm}
                                onToggle={() => setShowConfirm(!showConfirm)}
                                {...register('confirmPassword')}
                                error={errors.confirmPassword?.message}
                            />

                            <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                                <li>Mínimo 8 caracteres</li>
                                <li>Al menos una letra mayúscula</li>
                                <li>Al menos un número</li>
                                <li>Al menos un carácter especial (!@#$...)</li>
                            </ul>

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

            {!validandoToken && (
                <div className="text-center pt-2">
                    <Link
                        href={ROUTES.auth.login}
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1C7E3C] transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Volver al inicio de sesión
                    </Link>
                </div>
            )}
        </AuthLayout>
    )
}
