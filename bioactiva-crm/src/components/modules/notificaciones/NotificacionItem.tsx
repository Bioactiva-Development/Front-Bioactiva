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

function EstadoEnvioBadge({ enviado }: Readonly<{ enviado: boolean }>) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
      enviado
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-amber-100 text-amber-700'
    }`}>
      {enviado ? 'Enviado' : 'Pendiente'}
    </span>
  )
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
  const [confirmandoCancelacion, setConfirmandoCancelacion] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  const handleCancelar = async () => {
    if (!esProgramada) {
      setCancelError(
        'La notificación ya no puede cancelarse porque está vencida o ya fue ejecutada.'
      )
      return
    }

    try {
      setCancelError(null)
      await cancelar(notificacion.id)
      setConfirmandoCancelacion(false)
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
      setCancelError(
        status === 409
          ? 'La notificación ya no puede cancelarse porque está vencida o ya fue ejecutada.'
          : 'No se pudo cancelar la notificación. Intente nuevamente.'
      )
    }
  }

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
            <div className="mt-2 space-y-1 text-xs text-gray-500">
              <p>
                Envío interno: {formatFecha(notificacion.fechaEnvioInterno)}
                {' '}
                <EstadoEnvioBadge enviado={notificacion.enviadoInterno} />
              </p>
              {!notificacion.enviadoInterno && (
                <p className="text-gray-400">
                  Si la actividad se marca como completada antes del envío, el
                  backend cancelará este recordatorio pendiente.
                </p>
              )}
              {esProgramada && (
                <p className="text-gray-400">
                  También puedes cancelarlo manualmente antes de su ejecución.
                  Al cancelarse, desaparece de esta lista y no se envía.
                </p>
              )}
            </div>
          )}

          {notificacion.tipo === 'SEGUIMIENTO' && (
            <p className="mt-2 text-xs text-gray-400">
              Si la actividad se completa antes de un paso programado, el
              backend cancelará los pasos pendientes. El correo externo se
              enviará solo si la actividad sigue pendiente en su fecha
              programada. También puedes cancelar la notificación completa antes
              de su ejecución; al cancelarse, no se envía ni queda en esta lista.
            </p>
          )}

          {notificacion.instancias?.map((instancia) => (
            <div key={instancia.id} className="mt-3 rounded-xl bg-gray-50 p-3 text-xs">
              <p className="font-semibold text-gray-700">Instancia {instancia.orden}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-gray-500">
                <span>Interno: {formatFecha(instancia.fechaEnvioInterno)}</span>
                <EstadoEnvioBadge enviado={instancia.enviadoInterno} />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-gray-500">
                <span>Cliente: {formatFecha(instancia.fechaEnvioExterno)}</span>
                <EstadoEnvioBadge enviado={instancia.enviadoExterno} />
              </div>
              {!instancia.enviadoExterno && (
                <p className="mt-1 text-gray-400">
                  Se enviará al cliente si el encargado no completa la
                  actividad antes de esta fecha.
                </p>
              )}
            </div>
          ))}

          {notificacion.correoCliente && (
            <p className="mt-2 text-xs text-gray-400">
              Destinatario externo: {notificacion.correoCliente}
            </p>
          )}
        </div>

        {esProgramada && (
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => {
                setCancelError(null)
                setConfirmandoCancelacion(true)
              }}
              disabled={isPending}
              title="Cancelar notificación"
              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {confirmandoCancelacion && (
        <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700">
          <p className="font-semibold">Cancelar notificación programada</p>
          <p className="mt-1">
            Se anularán los envíos pendientes. La notificación cancelada no se
            mostrará en programadas ni como ejecutada en el historial.
          </p>
          {cancelError && <p className="mt-2 font-semibold">{cancelError}</p>}
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setConfirmandoCancelacion(false)
                setCancelError(null)
              }}
              disabled={isPending}
              className="rounded-lg px-3 py-1.5 font-semibold text-gray-500 hover:bg-white"
            >
              Volver
            </button>
            <button
              type="button"
              onClick={handleCancelar}
              disabled={isPending || !esProgramada}
              className="rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isPending ? 'Cancelando...' : 'Confirmar cancelación'}
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
