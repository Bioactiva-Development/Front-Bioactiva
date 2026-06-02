'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { resetPasswordSchema, ResetPasswordFormValues } from '@/lib/validators/auth.schema'
import { useAuth } from '@/hooks/auth/useAuth'
import { ROUTES } from '@/lib/constants/routes'
import { AuthLayout } from './AuthLayout'
import { AuthAlertBanner } from './AuthAlertBanner'
import { PasswordField } from './PasswordField'
import { PasswordRequirements } from './PasswordRequirements'

export function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token') ?? ''
    const { validateToken, resetPassword, isLoading, error, success } = useAuth()

    const [showPassword, setShowPassword]   = useState(false)
    const [showConfirm, setShowConfirm]     = useState(false)
    const [tokenValido, setTokenValido]     = useState<boolean | null>(null)
    const [tokenMensaje, setTokenMensaje]   = useState('')
    const [validandoToken, setValidandoToken] = useState(true)

    const { register, handleSubmit, control, formState: { errors } } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
    })

    const passwordValue = useWatch({ control, name: 'password' }) ?? ''

    useEffect(() => {
        const verificar = async () => {
            if (!token) {
                setTokenValido(false)
                setTokenMensaje('El enlace no es válido.')
                setValidandoToken(false)
                return
            }
            const result = await validateToken(token)
            setTokenValido(result.valid)
            setTokenMensaje(result.message ?? '')
            setValidandoToken(false)
        }
        verificar()
        // `validateToken` está memoizado con useCallback en useAuth, por lo que
        // incluirlo en deps no causa re-renders innecesarios.
    }, [token, validateToken])

    const onSubmit = async (data: ResetPasswordFormValues) => {
        await resetPassword(token, data)
    }

    return (
        <AuthLayout
            title="Nueva contraseña"
            subtitle="Define tu nueva contraseña de acceso"
        >
            {validandoToken && (
                <div className="flex items-center justify-center gap-2 py-6 text-gray-500 text-sm">
                    <Loader2 size={16} className="animate-spin" />
                    Validando enlace...
                </div>
            )}

            {!validandoToken && !tokenValido && (
                <div className="space-y-4">
                    <AuthAlertBanner
                        variant="error"
                        message={tokenMensaje || 'El enlace no es válido o ha expirado.'}
                        withIcon
                    />
                    <Link
                        href={ROUTES.auth.forgotPassword}
                        className="block text-center text-sm text-[#1C7E3C] hover:underline"
                    >
                        Solicitar un nuevo enlace
                    </Link>
                </div>
            )}

            {!validandoToken && tokenValido && (
                <>
                    {error && <AuthAlertBanner variant="error" message={error} />}

                    {success ? (
                        <div className="space-y-3">
                            <AuthAlertBanner variant="success" message={success} withIcon />
                            <p className="text-sm text-gray-500 text-center">Redirigiendo al login...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <PasswordField
                                label="Nueva contraseña"
                                show={showPassword}
                                onToggle={() => setShowPassword(!showPassword)}
                                {...register('password')}
                                error={errors.password?.message}
                            />

                            <PasswordRequirements password={passwordValue} />

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
                                    <><Loader2 size={16} className="animate-spin" />Guardando...</>
                                ) : (
                                    'Guardar nueva contraseña'
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
