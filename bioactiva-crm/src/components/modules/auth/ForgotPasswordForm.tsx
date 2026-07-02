'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import ReCAPTCHA from 'react-google-recaptcha'
import { forgotPasswordSchema, ForgotPasswordFormValues } from '@/lib/validators/auth.schema'
import { useAuth } from '@/hooks/auth/useAuth'
import { ROUTES } from '@/lib/constants/routes'

// El backend responde 200 { ok: true } siempre (anti-enumeración) y dentro de
// los 5 minutos posteriores a una solicitud no envía otro correo, sin señalarlo.
// Este cooldown local evita reintentos en vano durante esa ventana.
const COOLDOWN_MS = 5 * 60 * 1000

interface Cooldown {
    correo: string
    until: number
}

function crearCooldown(correo: string): Cooldown {
    return {
        correo: correo.trim().toLowerCase(),
        until: Date.now() + COOLDOWN_MS,
    }
}

function ahoraMs(): number {
    return Date.now()
}

function formatearRestante(ms: number): string {
    const total = Math.max(0, Math.ceil(ms / 1000))
    const min = Math.floor(total / 60)
    const seg = total % 60
    return `${min}:${String(seg).padStart(2, '0')}`
}

export function ForgotPasswordForm() {
    const { forgotPassword, isLoading, error, success, resetMessages } = useAuth()
    const [captchaToken, setCaptchaToken] = useState<string | null>(null)
    const recaptchaRef                    = useRef<ReCAPTCHA>(null)

    const [cooldown, setCooldown] = useState<Cooldown | null>(null)
    const [ahora, setAhora]       = useState(() => Date.now())

    const cooldownRestante = cooldown ? cooldown.until - ahora : 0
    const cooldownActivo   = cooldownRestante > 0

    useEffect(() => {
        if (!cooldownActivo) return
        const id = setInterval(() => setAhora(Date.now()), 1000)
        return () => clearInterval(id)
    }, [cooldownActivo])

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    // El cooldown es por correo: escribir otro correo permite enviar de inmediato.
    const correoActual    = (useWatch({ control, name: 'correo' }) ?? '').trim().toLowerCase()
    const correoBloqueado = cooldownActivo && cooldown?.correo === correoActual

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        const enviado = await forgotPassword(data, captchaToken)
        if (enviado) {
            setCooldown(crearCooldown(data.correo))
            setAhora(ahoraMs())
        } else {
            recaptchaRef.current?.reset()
            setCaptchaToken(null)
        }
    }

    const reintentar = () => {
        recaptchaRef.current?.reset()
        setCaptchaToken(null)
        resetMessages()
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
                            {cooldownActivo ? (
                                <p className="text-sm text-gray-500 text-center">
                                    ¿No recibiste el correo? Podrás solicitar otro enlace en{' '}
                                    <span className="font-semibold text-gray-700 tabular-nums">
                                        {formatearRestante(cooldownRestante)}
                                    </span>
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={reintentar}
                                    className="w-full text-sm text-[#1C7E3C] font-semibold hover:underline"
                                >
                                    Volver a enviar el enlace
                                </button>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-5">
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
                                {/* v2 checkbox, mismo widget que login. Si más adelante se activa
                                    modo score/Enterprise, el token debe generarse con
                                    grecaptcha.enterprise.execute(siteKey, { action: 'password_reset' })
                                    — la action debe coincidir exactamente con la que valide el backend. */}
                                <ReCAPTCHA
                                    ref={recaptchaRef}
                                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                                    onChange={(token) => setCaptchaToken(token)}
                                    onExpired={() => setCaptchaToken(null)}
                                />
                            </div>

                            {correoBloqueado && (
                                <p className="text-xs text-gray-500 text-center">
                                    Ya se envió un enlace a este correo. Podrás solicitar otro en{' '}
                                    <span className="font-semibold text-gray-700 tabular-nums">
                                        {formatearRestante(cooldownRestante)}
                                    </span>
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || !captchaToken || correoBloqueado}
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