'use client'

import { useState } from 'react'
import { AlertTriangle, Clock, Mail, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import {
  NotificacionInApp,
  NotificacionProgramada,
} from '@/types/notificacion.types'
import {
  useCancelarProgramada,
  useMarcarLeida,
} from '@/hooks/notificaciones/useNotificaciones'

const formatFecha = (fecha: string) =>
  new Date(fecha).toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const formatTiempo = (fecha: string, ahora: number) => {
  const horas = Math.floor((ahora - new Date(fecha).getTime()) / 3_600_000)
  const dias = Math.floor(horas / 24)
  if (dias > 0) return `Hace ${dias} día${dias > 1 ? 's' : ''}`
  if (horas > 0) return `Hace ${horas} h`
  return 'Hace un momento'
}

export function NotificacionAlerta({
  notificacion,
}: Readonly<{ notificacion: NotificacionInApp }>) {
  const router = useRouter()
  const { mutateAsync: marcarLeida } = useMarcarLeida()
  const esNoLeida = notificacion.estado === 'NO_LEIDA'
  const esLeadSinMovimiento =
    notificacion.idLead !== null &&
    notificacion.idActividad === null &&
    /lead sin movimiento/i.test(notificacion.titulo)
  const [tiempo] = useState(() => formatTiempo(notificacion.createdAt, Date.now()))

  const handleClick = async () => {
    if (esNoLeida) await marcarLeida(notificacion.id)
    if (notificacion.idLead) router.push(ROUTES.lead(notificacion.idLead))
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
        esNoLeida
          ? 'border-red-100 bg-red-50 hover:bg-red-100'
          : 'border-gray-100 bg-white hover:bg-gray-50'
      }`}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
        esNoLeida ? 'bg-red-100' : 'bg-gray-100'
      }`}>
        <AlertTriangle size={15} className={esNoLeida ? 'text-red-500' : 'text-gray-400'} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-sm font-semibold ${
          esNoLeida ? 'text-red-700' : 'text-gray-700'
        }`}>
          {notificacion.titulo}
        </span>
        {esLeadSinMovimiento && (
          <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
            Alerta automatica 30+ dias
          </span>
        )}
        <span className="mt-1 block text-xs text-gray-500">{notificacion.mensaje}</span>
        <span className="mt-1 block text-xs text-gray-400">{tiempo}</span>
      </span>
      {esNoLeida && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />}
    </button>
  )
}

interface ProgramadaItemProps {
  notificacion: NotificacionProgramada
  leadLabel?: string
  responsableActual?: string
}

export function NotificacionProgramadaItem({
  notificacion,
  leadLabel,
  responsableActual,
}: Readonly<ProgramadaItemProps>) {
  const { mutateAsync: cancelar, isPending } = useCancelarProgramada()
  const esProgramada = notificacion.estado === 'PROGRAMADA'

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
          {notificacion.tipo === 'RECORDATORIO'
            ? <Clock size={15} className="text-blue-600" />
            : <Mail size={15} className="text-blue-600" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">
              {notificacion.tipo === 'RECORDATORIO'
                ? notificacion.asuntoInterno
                : `Seguimiento de ${notificacion.instancias?.length ?? 0} instancia(s)`}
            </p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              esProgramada
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            }`}>
              {notificacion.estado}
            </span>
          </div>
          {leadLabel && <p className="mt-1 text-xs text-gray-500">{leadLabel}</p>}
          <p className="mt-1 text-xs text-gray-500">
            Encargado actual: {responsableActual ?? `Usuario ${notificacion.idResponsable}`}
          </p>

          {notificacion.tipo === 'RECORDATORIO' && notificacion.fechaEnvioInterno && (
            <p className="mt-2 text-xs text-gray-400">
              Envío interno: {formatFecha(notificacion.fechaEnvioInterno)}
            </p>
          )}

          {notificacion.instancias?.map((instancia) => (
            <div key={instancia.id} className="mt-3 rounded-xl bg-gray-50 p-3 text-xs">
              <p className="font-semibold text-gray-700">Instancia {instancia.orden}</p>
              <p className="mt-1 text-gray-500">
                Interno: {formatFecha(instancia.fechaEnvioInterno)}
                {instancia.enviadoInterno ? ' · enviado' : ' · pendiente'}
              </p>
              <p className="mt-1 text-gray-500">
                Cliente: {formatFecha(instancia.fechaEnvioExterno)}
                {instancia.enviadoExterno ? ' · enviado' : ' · pendiente'}
              </p>
            </div>
          ))}

          {notificacion.correoCliente && (
            <p className="mt-2 text-xs text-gray-400">
              Destinatario externo: {notificacion.correoCliente}
            </p>
          )}
        </div>

        {esProgramada && (
          <button
            type="button"
            onClick={() => cancelar(notificacion.id)}
            disabled={isPending}
            title="Cancelar notificación"
            className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </article>
  )
}
