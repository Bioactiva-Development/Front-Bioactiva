'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    User, Lock, Eye, EyeOff, Loader2, Save,
    Plug, ExternalLink, CheckCircle2, AlertCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { usePerfil } from '@/hooks/perfil/usePerfil'
import { RolUsuario, EstadoUsuario } from '@/types/enums'
import { cambiarPasswordSchema, CambiarPasswordFormValues } from '@/lib/validators/usuario.schema'

const editarPerfilSchema = z.object({
    nombre_completo: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre es demasiado largo'),
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
        actualizarNombre,
        cambiarPassword,
        conectarMicrosoft,
        desconectarMicrosoft,
    } = usePerfil()

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const perfilForm = useForm<EditarPerfilFormValues>({
        resolver: zodResolver(editarPerfilSchema),
    })

    const passwordForm = useForm<CambiarPasswordFormValues>({
        resolver: zodResolver(cambiarPasswordSchema),
    })

    useEffect(() => {
        if (usuario) {
            perfilForm.reset({
                nombre_completo: [usuario.nombres, usuario.apellidos].filter(Boolean).join(' '),
            })
        }
    }, [usuario, perfilForm])

    const onGuardarPerfil = async (data: EditarPerfilFormValues) => {
        await actualizarNombre(data.nombre_completo)
    }

    const onCambiarPassword = async (data: CambiarPasswordFormValues) => {
        const ok = await cambiarPassword(data.password)
        if (ok) passwordForm.reset()
    }

    const iniciales = usuario
        ? `${usuario.nombres.trim()[0] ?? ''}${usuario.apellidos.trim()[0] ?? ''}`.toUpperCase() || '?'
        : '?'

    const microsoftConectado = integraciones?.teams.conectado || integraciones?.outlook.conectado

    return (
        <div className="max-w-2xl">
            <PageHeader
                titulo="Mi perfil"
                descripcion="Información personal, seguridad e integraciones"
            />

            {/* Información personal */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-5">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-xl bg-[#1C7E3C]/10 flex items-center justify-center">
                        <User size={16} className="text-[#1C7E3C]" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-900">Información personal</h2>
                </div>

                <div className="px-6 py-5">
                    <div className="flex items-center gap-5 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-[#1C7E3C]/10 flex items-center justify-center shrink-0">
                            <span className="text-xl font-bold text-[#1C7E3C]">{iniciales}</span>
                        </div>
                        <div>
                            <p className="text-base font-bold text-gray-900">
                                {[usuario?.nombres, usuario?.apellidos].filter(Boolean).join(' ') || '—'}
                            </p>
                            <p className="text-sm text-gray-500 mb-2">{usuario?.correo}</p>
                            <div className="flex items-center gap-2">
                                {usuario?.rol && <RolBadge rol={usuario.rol} />}
                                {usuario?.estado && <EstadoBadge estado={usuario.estado} />}
                            </div>
                        </div>
                    </div>

                    {successPerfil && (
                        <div className="flex items-center gap-2 mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
                            <CheckCircle2 size={16} />
                            {successPerfil}
                        </div>
                    )}
                    {errorPerfil && (
                        <div className="flex items-center gap-2 mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                            <AlertCircle size={16} />
                            {errorPerfil}
                        </div>
                    )}

                    <form onSubmit={perfilForm.handleSubmit(onGuardarPerfil)} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Nombre completo
                            </label>
                            <input
                                type="text"
                                {...perfilForm.register('nombre_completo')}
                                className={`w-full px-4 py-2.5 text-sm text-gray-900 rounded-xl border-2 outline-none transition-colors bg-gray-50
                                    ${perfilForm.formState.errors.nombre_completo
                                        ? 'border-red-400 focus:border-red-500'
                                        : 'border-gray-200 focus:border-[#1C7E3C]'}`}
                            />
                            {perfilForm.formState.errors.nombre_completo && (
                                <p className="text-red-500 text-xs">{perfilForm.formState.errors.nombre_completo.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Correo institucional
                            </label>
                            <input
                                type="email"
                                value={usuario?.correo ?? ''}
                                readOnly
                                className="w-full px-4 py-2.5 text-sm text-gray-500 rounded-xl border-2 border-gray-100 bg-gray-50 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400">El correo institucional no se puede modificar.</p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isLoadingPerfil}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1C7E3C] hover:bg-[#16642f] disabled:bg-[#BCF7B3] disabled:cursor-not-allowed rounded-xl transition-colors"
                            >
                                {isLoadingPerfil ? (
                                    <><Loader2 size={14} className="animate-spin" />Guardando...</>
                                ) : (
                                    <><Save size={14} />Guardar cambios</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Seguridad */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-5">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Lock size={16} className="text-amber-600" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-900">Seguridad</h2>
                </div>

                <div className="px-6 py-5">
                    {successPassword && (
                        <div className="flex items-center gap-2 mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
                            <CheckCircle2 size={16} />
                            {successPassword}
                        </div>
                    )}
                    {errorPassword && (
                        <div className="flex items-center gap-2 mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                            <AlertCircle size={16} />
                            {errorPassword}
                        </div>
                    )}

                    <form onSubmit={passwordForm.handleSubmit(onCambiarPassword)} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Nueva contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Mínimo 6 caracteres"
                                    {...passwordForm.register('password')}
                                    className={`w-full px-4 py-2.5 pr-11 text-sm text-gray-900 placeholder:text-gray-400 rounded-xl border-2 outline-none transition-colors bg-gray-50
                                        ${passwordForm.formState.errors.password ? 'border-red-400' : 'border-gray-200 focus:border-[#1C7E3C]'}`}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {passwordForm.formState.errors.password && (
                                <p className="text-red-500 text-xs">{passwordForm.formState.errors.password.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Confirmar contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="Repita la contraseña"
                                    {...passwordForm.register('confirmPassword')}
                                    className={`w-full px-4 py-2.5 pr-11 text-sm text-gray-900 placeholder:text-gray-400 rounded-xl border-2 outline-none transition-colors bg-gray-50
                                        ${passwordForm.formState.errors.confirmPassword ? 'border-red-400' : 'border-gray-200 focus:border-[#1C7E3C]'}`}
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {passwordForm.formState.errors.confirmPassword && (
                                <p className="text-red-500 text-xs">{passwordForm.formState.errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isLoadingPassword}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 disabled:cursor-not-allowed rounded-xl transition-colors"
                            >
                                {isLoadingPassword ? (
                                    <><Loader2 size={14} className="animate-spin" />Guardando...</>
                                ) : (
                                    <><Lock size={14} />Cambiar contraseña</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Integraciones */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <Plug size={16} className="text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-gray-900">Integraciones</h2>
                        <p className="text-xs text-gray-500">Conecta herramientas externas para expandir las capacidades del CRM.</p>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-4">
                    {integracionInfo && (
                        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            {integracionInfo}
                        </div>
                    )}

                    {/* Microsoft Teams */}
                    <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#4B53BC]/10 flex items-center justify-center shrink-0">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                    <path d="M14.5 9.5C14.5 10.88 13.38 12 12 12C10.62 12 9.5 10.88 9.5 9.5C9.5 8.12 10.62 7 12 7C13.38 7 14.5 8.12 14.5 9.5Z" fill="#4B53BC" />
                                    <path d="M19.5 8.5C19.5 9.6 18.6 10.5 17.5 10.5C16.4 10.5 15.5 9.6 15.5 8.5C15.5 7.4 16.4 6.5 17.5 6.5C18.6 6.5 19.5 7.4 19.5 8.5Z" fill="#7B83EB" />
                                    <path d="M17.5 11.5H14.97C15.3 12.06 15.5 12.76 15.5 13.5V17H20V14C20 12.62 18.88 11.5 17.5 11.5Z" fill="#7B83EB" />
                                    <path d="M9.03 11.5H6.5C5.12 11.5 4 12.62 4 14V17H8.5V13.5C8.5 12.76 8.7 12.06 9.03 11.5Z" fill="#4B53BC" />
                                    <path d="M15.5 13.5C15.5 12.12 14.38 11 13 11H11C9.62 11 8.5 12.12 8.5 13.5V18H15.5V13.5Z" fill="#4B53BC" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Microsoft Teams</p>
                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                    Crea reuniones de Teams automáticamente desde las actividades del CRM y genera enlaces en tiempo real.
                                </p>
                                <div className="mt-2">
                                    {integraciones?.teams.conectado ? (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            Conectado{integraciones.teams.cuenta ? ` · ${integraciones.teams.cuenta}` : ''}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                            No conectado
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Microsoft Outlook */}
                    <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#0078D4]/10 flex items-center justify-center shrink-0">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="#0078D4" strokeWidth="1.5" fill="none" />
                                    <path d="M2 8L12 13L22 8" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Microsoft Outlook</p>
                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                    Sincroniza el calendario y eventos de Outlook con las actividades del CRM vía Microsoft Graph.
                                </p>
                                <div className="mt-2">
                                    {integraciones?.outlook.conectado ? (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            Conectado{integraciones.outlook.cuenta ? ` · ${integraciones.outlook.cuenta}` : ''}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                            No conectado
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botón único de conexión Microsoft (mismo OAuth para ambos) */}
                    <div className="pt-2">
                        {microsoftConectado ? (
                            <button
                                onClick={desconectarMicrosoft}
                                disabled={isLoadingIntegracion}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-xl transition-colors"
                            >
                                {isLoadingIntegracion ? <Loader2 size={14} className="animate-spin" /> : null}
                                Desconectar cuenta de Microsoft
                            </button>
                        ) : (
                            <button
                                onClick={conectarMicrosoft}
                                disabled={isLoadingIntegracion}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0078D4] hover:bg-[#106EBE] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm"
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
                        <p className="text-xs text-gray-400 mt-2">
                            Un solo inicio de sesión de Microsoft concede acceso a Teams y Outlook.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
