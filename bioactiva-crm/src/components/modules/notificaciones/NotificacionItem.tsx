'use client'

import { useState } from 'react'
import { AlertTriangle, Clock, Bell, X } from 'lucide-react'
import { Notificacion, NotificacionProgramada } from '@/types/notificacion.types'
import { EstadoNotif } from '@/types/enums'
import { useMarcarLeida, useCancelarProgramada } from '@/hooks/notificaciones/useNotificaciones'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

interface NotificacionAlertaProps {
  notificacion: Notificacion
}

const formatTiempo = (fecha: string, ahora: number) => {
  const diff = ahora - new Date(fecha).getTime()
  const horas = Math.floor(diff / (1000 * 60 * 60))
  const dias = Math.floor(horas / 24)

  if (dias > 0) return `Hace ${dias} día${dias > 1 ? 's' : ''}`
  if (horas > 0) return `Hace ${horas} h`
  return 'Hace un momento'
}

export function NotificacionAlerta({ notificacion }: Readonly<NotificacionAlertaProps>) {
  const router = useRouter()
  const { mutateAsync: marcarLeida } = useMarcarLeida()

  const esNoLeida = notificacion.estado === EstadoNotif.NoLeida
  const [tiempo] = useState(() => formatTiempo(notificacion.created_at, Date.now()))

  const handleClick = async () => {
    if (esNoLeida) await marcarLeida(notificacion.id)
    if (notificacion.id_lead) {
      router.push(ROUTES.lead(notificacion.id_lead))
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick() }}
      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer
        transition-colors
        ${esNoLeida
          ? 'bg-red-50 border-red-100 hover:bg-red-100'
          : 'bg-white border-gray-100 hover:bg-gray-50'
        }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
        ${esNoLeida ? 'bg-red-100' : 'bg-gray-100'}`}>
        <AlertTriangle
          size={15}
          className={esNoLeida ? 'text-red-500' : 'text-gray-400'}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate
          ${esNoLeida ? 'text-red-700' : 'text-gray-600'}`}>
          {notificacion.titulo}
        </p>
        {notificacion.lead_org && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {notificacion.lead_org}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {tiempo}
        </p>
      </div>
      {esNoLeida && (
        <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />
      )}
    </div>
  )
}

interface NotificacionProgramadaItemProps {
  notificacion: NotificacionProgramada
}

export function NotificacionProgramadaItem({
  notificacion,
}: Readonly<NotificacionProgramadaItemProps>) {
  const { mutateAsync: cancelar, isPending } = useCancelarProgramada()

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-PE', {
      day:    '2-digit',
      month:  'short',
      year:   'numeric',
      hour:   '2-digit',
      minute: '2-digit',
    })

  const esProgramada = notificacion.estado === 'PROGRAMADA'
  const destinatario = notificacion.destinatario ?? notificacion.correo_cliente

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-100
      bg-white">
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center
        justify-center shrink-0">
        <Clock size={15} className="text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">
          {notificacion.asunto_interno}
        </p>
        {notificacion.lead_org && (
          <p className="text-xs text-gray-500 mt-0.5">
            {notificacion.lead_codigo} · {notificacion.lead_org}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Programada: {formatFecha(notificacion.fecha_envio_interno)}
        </p>
        {destinatario && (
          <p className="text-xs text-gray-400">
            Para: {destinatario}
          </p>
        )}
      </div>

      {esProgramada && (
        <button
          onClick={() => cancelar(notificacion.id)}
          disabled={isPending}
          title="Cancelar notificación"
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500
            hover:bg-red-50 transition-colors shrink-0
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

interface NotificacionDropdownProps {
  onVerTodas:    () => void
  onVerPipeline: () => void
}

export function NotificacionDropdown({
  onVerTodas,
  onVerPipeline,
}: Readonly<NotificacionDropdownProps>) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl
      shadow-2xl border border-gray-100 z-50 overflow-hidden">

      <div className="flex items-center justify-between px-4 py-3
        border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-emerald-600" />
          <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Notificaciones
          </span>
        </div>
        <span className="text-xs text-emerald-600 font-semibold">
          2 por leer
        </span>
      </div>

      {/* Contenido */}
      <div className="max-h-80 overflow-y-auto p-3 space-y-1">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide px-1 mb-2">
          Sin leer
        </p>
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg
          hover:bg-gray-50 cursor-pointer">
          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
            <AlertTriangle size={13} className="text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">
              Actividad vencida en LEAD-2025-003 (...
            </p>
            <p className="text-xs text-gray-400">Hace 3 h</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
        </div>
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg
          hover:bg-gray-50 cursor-pointer">
          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
            <AlertTriangle size={13} className="text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">
              Actividad vencida en LEAD-2025-008 (...
            </p>
            <p className="text-xs text-gray-400">Hace 1 h</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
        </div>

        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide px-1 mt-3 mb-2">
          Leídas
        </p>
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg
          hover:bg-gray-50 cursor-pointer opacity-60">
          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
            <Clock size={13} className="text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">
              Actividad vencida en LEAD-2025-005 (L...
            </p>
            <p className="text-xs text-gray-400">Hace 8 días</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3
        border-t border-gray-100">
        <button
          onClick={onVerTodas}
          className="text-xs text-gray-500 hover:text-emerald-600
            font-semibold transition-colors"
        >
          Ver todas
        </button>
        <button
          onClick={onVerPipeline}
          className="text-xs text-emerald-600 hover:text-emerald-700
            font-semibold transition-colors flex items-center gap-1"
        >
          Ver pipeline →
        </button>
      </div>
    </div>
  )
}