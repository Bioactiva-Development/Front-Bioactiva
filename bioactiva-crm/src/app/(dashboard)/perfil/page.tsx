'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    User, Lock, Eye, EyeOff, Loader2, Save,
    Plug, ExternalLink, CheckCircle2, AlertCircle,
} from 'lucide-react'

import { usePerfil } from '@/hooks/perfil/usePerfil'
import { RolUsuario, EstadoUsuario } from '@/types/enums'
const cambiarPasswordSchema = z.object({
    newPassword: z
        .string()
        .min(8, 'Mínimo 8 caracteres')
        .max(72, 'Máximo 72 caracteres'),
    confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
})
type CambiarPasswordValues = z.infer<typeof cambiarPasswordSchema>

// PATCH /profile (Mantis #333): nombres/apellidos 1–90 chars, al menos uno.
const editarPerfilSchema = z.object({
    nombres: z
        .string()
        .min(1, 'El nombre es obligatorio')
        .max(90, 'Máximo 90 caracteres'),
    apellidos: z
        .string()
        .max(90, 'Máximo 90 caracteres')
        .optional()
        .or(z.literal('')),
})
type EditarPerfilFormValues = z.infer<typeof editarPerfilSchema>

function RolBadge({ rol }: Readonly<{ rol: RolUsuario }>) {
    if (rol === RolUsuario.Administrador) {
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 uppercase tracking-wide">
                Administrador
            </span>
        )
    }
    return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 uppercase tracking-wide">
            Trabajador
        </span>
    )
}

function EstadoBadge({ estado }: Readonly<{ estado: EstadoUsuario }>) {
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
            ${estado === EstadoUsuario.Activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${estado === EstadoUsuario.Activo ? 'bg-green-500' : 'bg-red-500'}`} />
            {estado}
        </span>
    )
}

// Icono SVG de Microsoft
function MicrosoftIcon({ size = 20 }: Readonly<{ size?: number }>) {
    return (
        <svg width={size} height={size} viewBox="0 0 21 21" fill="none">
            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
            <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
        </svg>
    )
}

export default function PerfilPage() {
    const {
        usuario,
        integraciones,
        integracionInfo,
        isLoadingPerfil,
        isLoadingPassword,
        isLoadingIntegracion,
        successPerfil,
        successPassword,
        errorPerfil,
        errorPassword,
        actualizarPerfil,
        cambiarPassword,
        conectarMicrosoft,
        desconectarMicrosoft,
    } = usePerfil()

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const perfilForm = useForm<EditarPerfilFormValues>({
        resolver: zodResolver(editarPerfilSchema),
    })

    const passwordForm = useForm<CambiarPasswordValues>({
        resolver: zodResolver(cambiarPasswordSchema),
    })

    useEffect(() => {
        if (usuario) {
            perfilForm.reset({
                nombres: usuario.nombres,
                apellidos: usuario.apellidos ?? '',
            })
        }
    }, [usuario, perfilForm])

    const onGuardarPerfil = async (data: EditarPerfilFormValues) => {
        await actualizarPerfil(data.nombres, data.apellidos ?? '')
    }

    const onCambiarPassword = async (data: CambiarPasswordValues) => {
        const ok = await cambiarPassword('', data.newPassword)
        if (ok) passwordForm.reset()
    }

    const iniciales = usuario
        ? `${usuario.nombres.trim()[0] ?? ''}${usuario.apellidos.trim()[0] ?? ''}`.toUpperCase() || '?'
        : '?'

    const microsoftConectado = integraciones?.teams.conectado || integraciones?.outlook.conectado

    const inputClass = (hasError: boolean) =>
        `w-full px-4 py-2.5 text-sm text-gray-900 rounded-xl border outline-none transition-colors
        placeholder:text-gray-400
        ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-emerald-400 bg-white'}`

    return (
        <div className="max-w-xl mx-auto space-y-4">

            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-gray-900">Mi perfil</h1>
                <p className="text-sm text-gray-400 mt-0.5">Información personal, seguridad e integraciones</p>
            </div>

            <div className="space-y-4">

            {/* Información personal */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <User size={16} className="text-emerald-700" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-800">Información personal</h2>
                </div>

                <div className="px-6 py-5 space-y-5">
                    <div className="flex items-center gap-4 pb-4 border-b border-gray-50">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                            <span className="text-xl font-bold text-emerald-700">{iniciales}</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-base font-bold text-gray-900">
                                {[usuario?.nombres, usuario?.apellidos].filter(Boolean).join(' ') || '—'}
                            </p>
                            <p className="text-sm text-gray-500">{usuario?.correo}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                                {usuario?.rol && <RolBadge rol={usuario.rol} />}
                                {usuario?.estado && <EstadoBadge estado={usuario.estado} />}
                            </div>
                        </div>
                    </div>

                    {successPerfil && (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
                            <CheckCircle2 size={16} className="shrink-0" />
                            {successPerfil}
                        </div>
                    )}
                    {errorPerfil && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                            <AlertCircle size={16} className="shrink-0" />
                            {errorPerfil}
                        </div>
                    )}

                    <form onSubmit={perfilForm.handleSubmit(onGuardarPerfil)} className="space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="prf-nombres" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Nombres
                            </label>
                            <input
                                id="prf-nombres"
                                type="text"
                                placeholder="Tus nombres"
                                {...perfilForm.register('nombres')}
                                className={inputClass(!!perfilForm.formState.errors.nombres)}
                            />
                            {perfilForm.formState.errors.nombres && (
                                <p className="text-red-500 text-xs">{perfilForm.formState.errors.nombres.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="prf-apellidos" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Apellidos
                            </label>
                            <input
                                id="prf-apellidos"
                                type="text"
                                placeholder="Tus apellidos"
                                {...perfilForm.register('apellidos')}
                                className={inputClass(!!perfilForm.formState.errors.apellidos)}
                            />
                            {perfilForm.formState.errors.apellidos && (
                                <p className="text-red-500 text-xs">{perfilForm.formState.errors.apellidos.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="prf-correo" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Correo institucional
                            </label>
                            <input
                                id="prf-correo"
                                type="email"
                                value={usuario?.correo ?? ''}
                                readOnly
                                className="w-full px-4 py-2.5 text-sm text-gray-400 rounded-xl border border-gray-100 bg-gray-50 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400">El correo institucional no se puede modificar.</p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isLoadingPerfil}
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed rounded-xl transition-colors"
                            >
                                {isLoadingPerfil ? (
                                    <><Loader2 size={14} className="animate-spin" /> Guardando...</>
                                ) : (
                                    <><Save size={14} /> Guardar cambios</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Seguridad */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Lock size={16} className="text-amber-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-gray-800">Seguridad</h2>
                        <p className="text-xs text-gray-400">Actualiza tu contraseña de acceso</p>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-4">
                    {successPassword && (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
                            <CheckCircle2 size={16} className="shrink-0" />
                            {successPassword}
                        </div>
                    )}
                    {errorPassword && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                            <AlertCircle size={16} className="shrink-0" />
                            {errorPassword}
                        </div>
                    )}

                    <form onSubmit={passwordForm.handleSubmit(onCambiarPassword)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="prf-password" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Nueva contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        id="prf-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Mínimo 8 caracteres"
                                        autoComplete="new-password"
                                        {...passwordForm.register('newPassword')}
                                        className={`${inputClass(!!passwordForm.formState.errors.newPassword)} pr-11`}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {passwordForm.formState.errors.newPassword && (
                                    <p className="text-red-500 text-xs">{passwordForm.formState.errors.newPassword.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="prf-confirm" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Confirmar contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        id="prf-confirm"
                                        type={showConfirm ? 'text' : 'password'}
                                        placeholder="Repita la contraseña"
                                        {...passwordForm.register('confirmPassword')}
                                        className={`${inputClass(!!passwordForm.formState.errors.confirmPassword)} pr-11`}
                                    />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {passwordForm.formState.errors.confirmPassword && (
                                    <p className="text-red-500 text-xs">{passwordForm.formState.errors.confirmPassword.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isLoadingPassword}
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 disabled:cursor-not-allowed rounded-xl transition-colors"
                            >
                                {isLoadingPassword ? (
                                    <><Loader2 size={14} className="animate-spin" /> Guardando...</>
                                ) : (
                                    <><Lock size={14} /> Cambiar contraseña</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Integraciones */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <Plug size={16} className="text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-gray-800">Integraciones</h2>
                        <p className="text-xs text-gray-400">Conecta herramientas externas para expandir las capacidades del CRM.</p>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-3">
                    {integracionInfo && (
                        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            {integracionInfo}
                        </div>
                    )}

                    {/* Teams + Outlook en grid 2 columnas */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Microsoft Teams */}
                        <div className="flex flex-col gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50/40 hover:border-gray-200 transition-colors">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-[#4B53BC]/10 flex items-center justify-center shrink-0">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M14.5 9.5C14.5 10.88 13.38 12 12 12C10.62 12 9.5 10.88 9.5 9.5C9.5 8.12 10.62 7 12 7C13.38 7 14.5 8.12 14.5 9.5Z" fill="#4B53BC" />
                                        <path d="M19.5 8.5C19.5 9.6 18.6 10.5 17.5 10.5C16.4 10.5 15.5 9.6 15.5 8.5C15.5 7.4 16.4 6.5 17.5 6.5C18.6 6.5 19.5 7.4 19.5 8.5Z" fill="#7B83EB" />
                                        <path d="M17.5 11.5H14.97C15.3 12.06 15.5 12.76 15.5 13.5V17H20V14C20 12.62 18.88 11.5 17.5 11.5Z" fill="#7B83EB" />
                                        <path d="M9.03 11.5H6.5C5.12 11.5 4 12.62 4 14V17H8.5V13.5C8.5 12.76 8.7 12.06 9.03 11.5Z" fill="#4B53BC" />
                                        <path d="M15.5 13.5C15.5 12.12 14.38 11 13 11H11C9.62 11 8.5 12.12 8.5 13.5V18H15.5V13.5Z" fill="#4B53BC" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-gray-900">Teams</p>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Crea reuniones automáticamente desde las actividades del CRM.
                            </p>
                            {integraciones?.teams.conectado ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full w-fit">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    Conectado
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> No conectado
                                </span>
                            )}
                        </div>

                        {/* Microsoft Outlook */}
                        <div className="flex flex-col gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50/40 hover:border-gray-200 transition-colors">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-[#0078D4]/10 flex items-center justify-center shrink-0">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <rect x="2" y="5" width="20" height="14" rx="2" stroke="#0078D4" strokeWidth="1.5" fill="none" />
                                        <path d="M2 8L12 13L22 8" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-gray-900">Outlook</p>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Sincroniza el calendario y eventos con las actividades del CRM.
                            </p>
                            {integraciones?.outlook.conectado ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full w-fit">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    Conectado
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> No conectado
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="pt-1 flex items-center gap-4 flex-wrap">
                        {microsoftConectado ? (
                            <button
                                onClick={desconectarMicrosoft}
                                disabled={isLoadingIntegracion}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
                            >
                                {isLoadingIntegracion ? <Loader2 size={14} className="animate-spin" /> : null}
                                Desconectar cuenta de Microsoft
                            </button>
                        ) : (
                            <button
                                onClick={conectarMicrosoft}
                                disabled={isLoadingIntegracion}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0078D4] hover:bg-[#106EBE] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm cursor-pointer"
                            >
                                {isLoadingIntegracion ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <MicrosoftIcon size={18} />
                                )}
                                Conectar con Microsoft
                                <ExternalLink size={14} className="opacity-70" />
                            </button>
                        )}
                        <p className="text-xs text-gray-400">
                            Un solo inicio de sesión concede acceso a Teams y Outlook.
                        </p>
                    </div>
                </div>
            </div>

            </div>{/* fin space-y-4 */}
        </div>
    )
}
