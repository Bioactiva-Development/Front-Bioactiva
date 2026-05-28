'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { resetPasswordSchema, ResetPasswordFormValues } from '@/lib/validators/auth.schema'
import { useAuth } from '@/hooks/auth/useAuth'
import { ROUTES } from '@/lib/constants/routes'

export function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token') ?? ''
    const { validateToken, resetPassword, isLoading, error, success } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [tokenValido, setTokenValido] = useState<boolean | null>(null)
    const [tokenMensaje, setTokenMensaje] = useState('')
    const [validandoToken, setValidandoToken] = useState(true)

    const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
    })

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
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-linear-to-br from-[#1C7E3C] via-[#1C7E3C]/90 to-[#BCF7B3]">

            <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-sm" />
            <div className="absolute -bottom-15 -right-15 w-64 h-64 rounded-full bg-white/10 blur-sm" />
            <div className="absolute top-1/2 -left-30 w-80 h-80 rounded-full bg-white/5" />

            <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl overflow-hidden shadow-2xl">

                <div className="bg-[#1C7E3C] px-8 py-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                            <path d="M17 8C8 10 5.9 16.17 3.82 19.54a1 1 0 001.66 1.06C7 18.8 9.62 17 12 17c4 0 5-2 5-2s-1 2-1 6h2c0-4 1.5-6 3-6s2 1 2 3h2c0-3-1.5-5-3-5s-3 1.3-3 2c0 0 1-4-2-7z" />
                        </svg>
                    </div>
                    <h1 className="text-white text-xl font-bold">Bioactiva CRM</h1>
                </div>

                <div className="bg-white px-8 py-8 space-y-5">
                    <div>
                        <h2 className="text-gray-900 text-xl font-bold">Nueva contraseña</h2>
                        <p className="text-gray-500 text-sm mt-1">Define tu nueva contraseña de acceso</p>
                    </div>

                    {validandoToken && (
                        <div className="flex items-center justify-center gap-2 py-6 text-gray-500 text-sm">
                            <Loader2 size={16} className="animate-spin" />
                            Validando enlace...
                        </div>
                    )}

                    {!validandoToken && !tokenValido && (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                                <XCircle size={18} className="mt-0.5 shrink-0" />
                                <p>{tokenMensaje || 'El enlace no es válido o ha expirado.'}</p>
                            </div>
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
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                                    {error}
                                </div>
                            )}

                            {success ? (
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 bg-[#F1FFEC] border border-[#BCF7B3] text-[#1C7E3C] text-sm rounded-lg px-4 py-3">
                                        <CheckCircle size={18} className="mt-0.5 shrink-0" />
                                        <p>{success}</p>
                                    </div>
                                    <p className="text-sm text-gray-500 text-center">Redirigiendo al login...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Nueva contraseña
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                {...register('password')}
                                                className={`w-full px-4 py-3 pr-11 text-gray-900 placeholder:text-gray-400 rounded-xl border-2 text-sm outline-none transition-colors bg-[#F1FFEC]
                          ${errors.password ? 'border-red-400' : 'border-[#BCF7B3] focus:border-[#1C7E3C]'}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1C7E3C]"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Confirmar contraseña
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirm ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                {...register('confirmPassword')}
                                                className={`w-full px-4 py-3 pr-11 text-gray-900 placeholder:text-gray-400 rounded-xl border-2 text-sm outline-none transition-colors bg-[#F1FFEC]
                          ${errors.confirmPassword ? 'border-red-400' : 'border-[#BCF7B3] focus:border-[#1C7E3C]'}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm(!showConfirm)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1C7E3C]"
                                            >
                                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
                                    </div>

                                    <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                                        <li>Mínimo 8 caracteres</li>
                                        <li>Al menos una letra mayúscula</li>
                                        <li>Al menos un número</li>
                                        <li>Al menos un carácter especial (!@#$...)</li>
                                    </ul>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-center gap-2 bg-[#1C7E3C] hover:bg-[#16642f]
                      disabled:bg-[#BCF7B3] disabled:cursor-not-allowed text-white font-semibold
                      py-3 px-4 rounded-xl text-sm transition-colors shadow-md shadow-[#BCF7B3]"
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
                </div>
            </div>
        </div>
    )
}