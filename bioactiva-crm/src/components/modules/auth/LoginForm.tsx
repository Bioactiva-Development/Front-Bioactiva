'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import ReCAPTCHA from 'react-google-recaptcha'
import { loginSchema, LoginFormValues } from '@/lib/validators/auth.schema'
import { useAuth } from '@/hooks/auth/useAuth'
import { ROUTES } from '@/lib/constants/routes'

export function LoginForm() {
    const { login, isLoading, error } = useAuth()
    const searchParams                      = useSearchParams()
    // Mantis #271/#104: el interceptor redirige con ?expired=1 cuando la sesión
    // caducó o fue invalidada (login en otro dispositivo / cambio de rol).
    const sessionExpired                    = searchParams.get('expired') !== null
    const [showPassword, setShowPassword]   = useState(false)
    const [captchaToken, setCaptchaToken]   = useState<string | null>(null)
    const recaptchaRef                      = useRef<ReCAPTCHA>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormValues) => {
        await login(data, captchaToken)
        // Siempre reset: en éxito el redirect lo descarta; en fallo, el usuario
        // necesita resolver el captcha de nuevo antes del siguiente intento.
        recaptchaRef.current?.reset()
        setCaptchaToken(null)
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-linear-to-br from-[#1C7E3C] via-[#1C7E3C]/90 to-[#BCF7B3]">

            <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-sm" />
            <div className="absolute -bottom-15 -right-15 w-64 h-64 rounded-full bg-white/10 blur-sm" />
            <div className="absolute top-1/2 -left-30 w-80 h-80 rounded-full bg-white/5" />

            <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl overflow-hidden shadow-2xl">

                <div className="bg-[#1C7E3C] px-8 py-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0">
                        <img src="/BAlogo.svg" alt="BioActiva" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="text-white text-xl font-bold">Bioactiva CRM</h1>
                        <p className="text-[#F1FFEC] text-sm">Gestión comercial inteligente</p>
                    </div>
                </div>

                <div className="bg-white px-8 py-8 space-y-5">
                    <div>
                        <h2 className="text-gray-900 text-xl font-bold">Iniciar sesión</h2>
                        <p className="text-gray-500 text-sm mt-1">Accede a tu cuenta para continuar</p>
                    </div>

                    {sessionExpired && !error && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
                            Tu sesión expiró o se inició en otro dispositivo. Vuelve a iniciar sesión.
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} method="post" className="space-y-5">
                        <div className="space-y-1.5">
                            <label htmlFor="lf-correo" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Correo electrónico
                            </label>
                            <input
                                id="lf-correo"
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

                        <div className="space-y-1.5">
                            <label htmlFor="lf-password" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="lf-password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    {...register('password')}
                                    className={`w-full px-4 py-3 pr-11 text-gray-900 placeholder:text-gray-400 rounded-xl border-2 text-sm outline-none transition-colors bg-[#F1FFEC]
                    ${errors.password
                                            ? 'border-red-400 focus:border-red-500'
                                            : 'border-[#BCF7B3] focus:border-[#1C7E3C]'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1C7E3C] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-xs">{errors.password.message}</p>
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
                            className="w-full flex items-center justify-center gap-2 bg-[#1C7E3C] hover:bg-[#16642f] disabled:bg-[#BCF7B3] disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl text-sm transition-colors shadow-md shadow-[#BCF7B3]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Iniciando sesión...
                                </>
                            ) : (
                                'Ingresar'
                            )}
                        </button>


                        <div className="text-center">
                            <Link
                                href={ROUTES.auth.forgotPassword}
                                className="text-sm text-[#1C7E3C] hover:text-[#16642f] hover:underline"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>


                    </form>
                </div>
            </div>
        </div>
    )
}