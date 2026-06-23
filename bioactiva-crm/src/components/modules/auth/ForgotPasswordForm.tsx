'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { useRef, useState } from 'react'
import Link from 'next/link'
import ReCAPTCHA from 'react-google-recaptcha'
import { forgotPasswordSchema, ForgotPasswordFormValues } from '@/lib/validators/auth.schema'
import { useAuth } from '@/hooks/auth/useAuth'
import { ROUTES } from '@/lib/constants/routes'

export function ForgotPasswordForm() {
    const { forgotPassword, isLoading, error, success } = useAuth()
    const [captchaToken, setCaptchaToken] = useState<string | null>(null)
    const recaptchaRef                    = useRef<ReCAPTCHA>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        await forgotPassword(data, captchaToken)
        if (error) {
            recaptchaRef.current?.reset()
            setCaptchaToken(null)
        }
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-linear-to-br from-[#1C7E3C] via-[#1C7E3C]/90 to-[#BCF7B3]">

            <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-sm" />
            <div className="absolute -bottom-60 -right-60 w-64 h-64 rounded-full bg-white/10 blur-sm" />
            <div className="absolute top-1/2 -left-30 w-80 h-80 rounded-full bg-white/5" />


            <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl overflow-hidden shadow-2xl">


                <div className="bg-[#1C7E3C] px-8 py-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0">
                        <img src="/BAlogo.svg" alt="BioActiva" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-white text-xl font-bold">Bioactiva CRM</h1>
                </div>

                <div className="bg-white px-8 py-8 space-y-5">
                    <div>
                        <h2 className="text-gray-900 text-xl font-bold">Recuperar contraseña</h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Ingresa tu correo y te enviaremos un enlace de recuperación.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 bg-[#F1FFEC] border border-[#BCF7B3] text-[#1C7E3C] text-sm rounded-lg px-4 py-3">
                                <CheckCircle size={18} className="mt-0.5 shrink-0" />
                                <p>{success}</p>
                            </div>
                            <p className="text-sm text-gray-500 text-center">
                                Revisa tu bandeja de entrada y sigue las instrucciones.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="space-y-1.5">
                                <label htmlFor="fp-correo" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Correo electrónico
                                </label>
                                <input
                                    id="fp-correo"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="correo@bioactiva.pe"
                                    {...register('correo')}
                                    className={`w-full px-4 py-3 text-gray-900 placeholder:text-gray-400 rounded-xl border-2 text-sm outline-none transition-colors bg-[#F1FFEC]
                    ${errors.correo
                                            ? 'border-red-400 focus:border-red-500'
                                            : 'border-[#BCF7B3] focus:border-[#1C7E3C]'
                                        }`}
                                />
                                {errors.correo && (
                                    <p className="text-red-500 text-xs">{errors.correo.message}</p>
                                )}
                            </div>

                            <div className="flex justify-center">
                                <ReCAPTCHA
                                    ref={recaptchaRef}
                                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                                    onChange={(token) => setCaptchaToken(token)}
                                    onExpired={() => setCaptchaToken(null)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !captchaToken}
                                className="w-full flex items-center justify-center gap-2 bg-[#1C7E3C] hover:bg-[#16642f]
                  disabled:bg-[#BCF7B3] disabled:cursor-not-allowed text-white font-semibold
                  py-3 px-4 rounded-xl text-sm transition-colors shadow-md shadow-[#BCF7B3]"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    'Enviar enlace'
                                )}
                            </button>
                        </form>
                    )}

                    <div className="text-center">
                        <Link
                            href={ROUTES.auth.login}
                            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1C7E3C] transition-colors"
                        >
                            <ArrowLeft size={14} />
                            Volver al inicio de sesión
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}