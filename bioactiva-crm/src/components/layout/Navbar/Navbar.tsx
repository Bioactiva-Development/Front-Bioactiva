'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, ChevronDown, LogOut, User, Menu } from 'lucide-react'
import { useAuthStore, useUIStore } from '@/store'
import { useAuth } from '@/hooks/auth/useAuth'
import { useCentroNotificaciones } from '@/hooks/notificaciones/useNotificaciones'
import { RolUsuario } from '@/types/enums'

export function Navbar() {
    const { usuario } = useAuthStore()
    const { toggleSidebar, notificacionesPendientes } = useUIStore()
    const { logout } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const { data: centroNotificaciones } = useCentroNotificaciones()
    const { setNotificacionesPendientes } = useUIStore()

    useEffect(() => {
        if (centroNotificaciones?.sinLeer !== undefined) {
            setNotificacionesPendientes(centroNotificaciones.sinLeer)
        }
    }, [centroNotificaciones?.sinLeer, setNotificacionesPendientes])

    const iniciales = usuario
        ? `${usuario.nombres.charAt(0)}${usuario.apellidos.charAt(0)}`.toUpperCase()
        : 'U'

    const rolLabel =
        usuario?.rol === RolUsuario.Administrador ? 'Administrador' : 'Trabajador'

    return (
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">

            <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors lg:hidden"
            >
                <Menu size={20} />
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-2">

                <button className="relative p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                    <Bell size={20} />
                    {notificacionesPendientes > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                </button>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                    >

                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{iniciales}</span>
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-semibold text-gray-900 leading-tight">
                                {usuario?.nombres} {usuario?.apellidos}
                            </p>
                            <p className="text-xs text-gray-400 leading-tight">{rolLabel}</p>
                        </div>

                        <ChevronDown
                            size={14}
                            className={`text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">

                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {usuario?.nombres} {usuario?.apellidos}
                                </p>
                                <p className="text-xs text-gray-400 truncate">{usuario?.correo}</p>
                            </div>

                            <div className="py-1">
                                <button
                                    onClick={() => setMenuOpen(false)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600
                    hover:bg-gray-50 transition-colors"
                                >
                                    <User size={16} className="text-gray-400" />
                                    Mi perfil
                                </button>

                                <button
                                    onClick={() => {
                                        setMenuOpen(false)
                                        logout()
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600
                    hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={16} />
                                    Cerrar sesión
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}