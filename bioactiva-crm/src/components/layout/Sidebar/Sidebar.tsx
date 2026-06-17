'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Users,
  Kanban,
  FileText,
  Bell,
  Mail,
  ArrowLeftRight,
  ShieldCheck,
  LogOut,
  ChevronLeft,
} from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import { useAuthStore, useUIStore } from '@/store'
import { useAuth } from '@/hooks/auth/useAuth'
import { RolUsuario } from '@/types/enums'

interface NavItem {
  label:      string
  href:       string
  icon:       React.ReactNode
  soloAdmin?: boolean
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href:  ROUTES.dashboard,
    icon:  <LayoutDashboard size={20} />,
  },
  {
    label: 'Organizaciones',
    href:  ROUTES.organizaciones,
    icon:  <Building2 size={20} />,
  },
  {
    label: 'Contactos',
    href:  ROUTES.contactos,
    icon:  <Users size={20} />,
  },
  {
    label: 'Pipeline',
    href:  ROUTES.pipeline,
    icon:  <Kanban size={20} />,
  },
  {
    label: 'Cotizaciones',
    href:  ROUTES.cotizaciones,
    icon:  <FileText size={20} />,
  },
  {
    label: 'Importar / Exportar',
    href:  ROUTES.datos,
    icon:  <ArrowLeftRight size={20} />,
  },
  {
    label: 'Notificaciones',
    href:  ROUTES.notificaciones,
    icon:  <Bell size={20} />,
  },
  {
    label: 'Plantillas',
    href:  ROUTES.plantillas,
    icon:  <Mail size={20} />,
  },
  {
    label:     'Gestión de Usuarios',
    href:      ROUTES.controlAcceso,
    icon:      <ShieldCheck size={20} />,
    soloAdmin: true,
  },
]

export function Sidebar() {
  const pathname                          = usePathname()
  const { usuario }                       = useAuthStore()
  const { sidebarCollapsed, toggleCollapsed, sidebarOpen } = useUIStore()
  const { logout }                        = useAuth()

  const isAdmin = usuario?.rol === RolUsuario.Administrador

  const itemsVisibles = NAV_ITEMS.filter(
    (item) => !item.soloAdmin || isAdmin
  )

  if (!sidebarOpen) return null

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full z-40 flex flex-col
        bg-white border-r border-gray-100 shadow-lg
        transition-all duration-300
        ${sidebarCollapsed ? 'w-16' : 'w-52'}
      `}
    >
      <button
        onClick={toggleCollapsed}
        className={`
          absolute -right-3 top-6 z-50
          w-6 h-6 rounded-full
          bg-white border border-gray-200 shadow-md
          flex items-center justify-center
          text-gray-400 hover:text-emerald-600
          hover:border-emerald-300 hover:shadow-emerald-100
          transition-all duration-300
          ${sidebarCollapsed ? 'rotate-180' : ''}
        `}
      >
        <ChevronLeft size={12} />
      </button>

      <div className={`
        flex items-center gap-3 px-4 py-5 border-b border-gray-100
        ${sidebarCollapsed ? 'justify-center' : ''}
      `}>
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
            <path d="M17 8C8 10 5.9 16.17 3.82 19.54a1 1 0 001.66 1.06C7 18.8 9.62 17 12 17c4 0 5-2 5-2s-1 2-1 6h2c0-4 1.5-6 3-6s2 1 2 3h2c0-3-1.5-5-3-5s-3 1.3-3 2c0 0 1-4-2-7z"/>
          </svg>
        </div>
        {!sidebarCollapsed && (
          <div>
            <p className="text-sm font-bold text-gray-900">BioActiva</p>
            <p className="text-xs text-gray-400">CRM</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-0.5">
        {itemsVisibles.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== ROUTES.dashboard && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                transition-colors group relative
                ${sidebarCollapsed ? 'justify-center' : ''}
                ${isActive
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-600 rounded-r-full" />
              )}

              <span className={isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}>
                {item.icon}
              </span>

              {!sidebarCollapsed && (
                <span className="truncate">{item.label}</span>
              )}

              {sidebarCollapsed && (
                <div className="
                  absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs
                  rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100
                  pointer-events-none transition-opacity z-50 shadow-lg
                ">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-100 p-3">
        <button
          onClick={logout}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
            text-gray-400 hover:text-red-600 hover:bg-red-50
            transition-colors group relative
            ${sidebarCollapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut size={20} className="shrink-0" />

          {!sidebarCollapsed && (
            <span>Cerrar sesión</span>
          )}

          {sidebarCollapsed && (
            <div className="
              absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs
              rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100
              pointer-events-none transition-opacity z-50 shadow-lg
            ">
              Cerrar sesión
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}
