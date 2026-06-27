'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  FileX,
  Mail,
  Pencil,
  Trash2,
} from 'lucide-react'
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
import { APP_TIME_ZONE } from '@/lib/utils/timezone.utils'

const formatFecha = (fecha: string) =>
  new Date(fecha).toLocaleString('es-PE', {
    timeZone: APP_TIME_ZONE,
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
  const esImportError = notificacion.titulo === 'Error de importación'
  const esLeadSinMovimiento =
    !esImportError &&
    notificacion.idLead !== null &&
    notificacion.idActividad === null &&
    /lead sin movimiento/i.test(notificacion.titulo)
  const [tiempo] = useState(() => formatTiempo(notificacion.createdAt, Date.now()))

  const handleClick = async () => {
    if (esNoLeida) await marcarLeida(notificacion.id)
    if (notificacion.idLead) router.push(ROUTES.lead(notificacion.idLead))
  }

  const containerClass = esNoLeida
    ? esImportError
      ? 'border-orange-200 bg-orange-50 hover:bg-orange-100'
      : 'border-red-100 bg-red-50 hover:bg-red-100'
    : 'border-gray-100 bg-white hover:bg-gray-50'

  const iconBgClass = esNoLeida
    ? esImportError ? 'bg-orange-100' : 'bg-red-100'
    : 'bg-gray-100'

  const titleClass = esNoLeida
    ? esImportError ? 'text-orange-700' : 'text-red-700'
    : 'text-gray-700'

  const dotClass = esImportError ? 'bg-orange-500' : 'bg-red-500'

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${containerClass}`}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBgClass}`}>
        {esImportError
          ? <FileX size={16} className={esNoLeida ? 'text-orange-500' : 'text-gray-400'} />
          : <AlertTriangle size={16} className={esNoLeida ? 'text-red-500' : 'text-gray-400'} />
        }
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-sm font-semibold ${titleClass}`}>
          {notificacion.titulo}
        </span>
        {esImportError && esNoLeida && (
          <span className="mt-1 inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-700">
            Ningún dato fue importado
          </span>
        )}
        {esLeadSinMovimiento && (
          <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
            Alerta automatica 30+ dias
          </span>
        )}
        <span className="mt-1 block text-xs text-gray-500 whitespace-pre-wrap">{notificacion.mensaje}</span>
        <span className="mt-1 block text-xs text-gray-400">{tiempo}</span>
      </span>
      {esNoLeida && <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotClass}`} />}
    </button>
  )
}

interface ProgramadaItemProps {
  notificacion: NotificacionProgramada
  leadLabel?: string
  responsableActual?: string
  onEdit?: (notificacion: NotificacionProgramada) => void
}

export function NotificacionProgramadaItem({
  notificacion,
  leadLabel,
  responsableActual,
  onEdit,
}: Readonly<ProgramadaItemProps>) {
  const { mutateAsync: cancelar, isPending } = useCancelarProgramada()
  const esProgramada = notificacion.estado === 'PROGRAMADA'
  const [confirmandoCancelacion, setConfirmandoCancelacion] = useState(false)
  const [mostrandoDetalle, setMostrandoDetalle] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const esSeguimiento = notificacion.tipo === 'SEGUIMIENTO'
  const titulo = esSeguimiento
    ? notificacion.instancias?.[0]?.asuntoInterno ?? 'Seguimiento comercial'
    : notificacion.asuntoInterno ?? 'Recordatorio de actividad'
  const fechaPrincipal = esSeguimiento
    ? notificacion.instancias?.[0]?.fechaEnvioInterno
    : notificacion.fechaEnvioInterno
  const instancia = notificacion.instancias?.[0]
  const puedeEditar = Boolean(
    esProgramada &&
    esSeguimiento &&
    instancia &&
    !instancia.enviadoInterno &&
    !instancia.enviadoExterno
  )

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
    <article className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
          {esSeguimiento ? <Mail size={12} /> : <Clock size={12} />}
          {esSeguimiento ? 'Seguimiento' : 'Recordatorio'}
        </span>
        {fechaPrincipal && (
          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
            esProgramada
              ? 'border-gray-200 bg-white text-gray-600'
              : 'border-red-200 bg-red-50 text-red-600'
          }`}>
            {formatFecha(fechaPrincipal)}
          </span>
        )}
      </div>

      <h3 className="mt-3 text-sm font-bold text-gray-950">{titulo}</h3>
      {leadLabel && <p className="mt-1 text-xs font-medium text-gray-500">{leadLabel}</p>}
      <p className="mt-2 text-xs text-gray-500">
        Encargado: {responsableActual ?? `Usuario ${notificacion.idResponsable}`}
      </p>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {puedeEditar && onEdit && (
          <button
            type="button"
            onClick={() => onEdit(notificacion)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
          >
            <Pencil size={14} /> Editar
          </button>
        )}
        <button
          type="button"
          onClick={() => setMostrandoDetalle((visible) => !visible)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:border-gray-300"
        >
          {esSeguimiento ? 'Ver correos' : 'Ver detalle'}
          {mostrandoDetalle ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {esProgramada && (
          <button
            type="button"
            onClick={() => {
              setCancelError(null)
              setConfirmandoCancelacion(true)
            }}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-40"
          >
            <Trash2 size={14} /> Eliminar
          </button>
        )}
      </div>

      {mostrandoDetalle && (
        <div className="mt-4 space-y-3 border-t border-gray-200 pt-4 text-xs text-gray-500">
          {!esSeguimiento && notificacion.fechaEnvioInterno && (
            <div className="flex flex-wrap items-center gap-2">
              <span>Envío interno: {formatFecha(notificacion.fechaEnvioInterno)}</span>
              <EstadoEnvioBadge enviado={notificacion.enviadoInterno} />
            </div>
          )}

          {notificacion.instancias?.map((instancia) => (
            <div key={instancia.id} className="rounded-xl border border-gray-100 bg-white p-3">
              <p className="font-bold text-gray-700">Instancia {instancia.orden}</p>
              <p className="mt-2 font-semibold text-gray-700">{instancia.asuntoInterno}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span>Interno: {formatFecha(instancia.fechaEnvioInterno)}</span>
                <EstadoEnvioBadge enviado={instancia.enviadoInterno} />
              </div>
              <p className="mt-2 font-semibold text-gray-700">{instancia.asuntoExterno}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span>Cliente: {formatFecha(instancia.fechaEnvioExterno)}</span>
                <EstadoEnvioBadge enviado={instancia.enviadoExterno} />
              </div>
              {!instancia.enviadoExterno && (
                <p className="mt-2 text-gray-400">
                  Se enviará solo si la actividad sigue pendiente en esa fecha.
                </p>
              )}
            </div>
          ))}

          {notificacion.correoCliente && (
            <p>Destinatario externo: {notificacion.correoCliente}</p>
          )}
          {esProgramada && (
            <p className="text-gray-400">
              Al completar la actividad, el backend cancela los pasos pendientes.
            </p>
          )}
        </div>
      )}

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
