'use client'

import { useState } from 'react'
import {
  Mail, Phone, Users, HelpCircle,
  CheckCircle2, Clock, XCircle,
  ChevronDown, ChevronUp,
  AlertTriangle,
  Save, Loader2, CalendarPlus, ExternalLink, Trash2,
} from 'lucide-react'
import { ModalShell, ModalHeader } from '@/components/ui'
import { Actividad } from '@/types/actividad.types'
import { TipoActividad, EstadoActividad } from '@/types/enums'
import {
  useCompletarActividad,
  useEditarNotasActividad,
  useEliminarActividad,
} from '@/hooks/pipeline/useActividades'
import { getErrorMessage } from '@/lib/utils/error.utils'

interface ActividadHistorialProps {
  leadId:      number
  actividades: Actividad[]
  onProgramarRecordatorio?: (actividad: Actividad) => void
  onProgramarSeguimiento?: (actividad: Actividad) => void
}

const TIPO_ICONOS: Record<TipoActividad, React.ReactNode> = {
  [TipoActividad.Email]:   <Mail size={14} />,
  [TipoActividad.Llamada]: <Phone size={14} />,
  [TipoActividad.Reunion]: <Users size={14} />,
  [TipoActividad.Otro]:    <HelpCircle size={14} />,
}

const TIPO_COLORS: Record<TipoActividad, string> = {
  [TipoActividad.Email]:   'bg-blue-50 text-blue-600',
  [TipoActividad.Llamada]: 'bg-emerald-50 text-emerald-600',
  [TipoActividad.Reunion]: 'bg-purple-50 text-purple-600',
  [TipoActividad.Otro]:    'bg-gray-100 text-gray-600',
}

function estadoBadge(estado: EstadoActividad) {
  switch (estado) {
    case EstadoActividad.Completada:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
          text-xs font-semibold bg-emerald-50 text-emerald-700">
          <CheckCircle2 size={12} />
          Completada
        </span>
      )
    case EstadoActividad.Cancelada:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
          text-xs font-semibold bg-red-50 text-red-600">
          <XCircle size={12} />
          Cancelada
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
          text-xs font-semibold bg-amber-50 text-amber-700">
          <Clock size={12} />
          Pendiente
        </span>
      )
  }
}

function ActividadItem({
  actividad,
  leadId,
  onProgramarRecordatorio,
  onProgramarSeguimiento,
}: {
  actividad: Actividad
  leadId:    number
  onProgramarRecordatorio?: (actividad: Actividad) => void
  onProgramarSeguimiento?: (actividad: Actividad) => void
}) {
  const [expandido,       setExpandido]       = useState(false)
  const [confirmarEliminar, setConfirmarEliminar] = useState(false)
  const [notasEdit,       setNotasEdit]       = useState(actividad.notas ?? '')
  const [notasError,      setNotasError]      = useState<string | null>(null)

  const { mutateAsync: completar, isPending: completando } =
    useCompletarActividad(leadId)
  const { mutateAsync: guardarNotas, isPending: guardandoNotas } =
    useEditarNotasActividad(leadId)
  const { mutateAsync: eliminar, isPending: eliminando } =
    useEliminarActividad(leadId)

  const esPendiente = actividad.estado === EstadoActividad.Pendiente
  const esTerminal  = actividad.estado === EstadoActividad.Completada ||
                      actividad.estado === EstadoActividad.Cancelada

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-PE', {
      day:    '2-digit',
      month:  'short',
      year:   'numeric',
      hour:   '2-digit',
      minute: '2-digit',
    })

  const notasGuardadas = (actividad.notas ?? '').trim()
  const notasActual = notasEdit.trim()
  const notasSinCambios = notasActual === notasGuardadas
  const notasInvalida = notasActual.length < 1 || notasActual.length > 1000

  const handleGuardarNotas = async () => {
    const texto = notasEdit.trim()
    if (texto.length < 1) {
      setNotasError('El comentario es obligatorio (1 a 1000 caracteres).')
      return
    }
    if (texto.length > 1000) {
      setNotasError('El comentario no puede superar los 1000 caracteres.')
      return
    }

    setNotasError(null)
    try {
      await guardarNotas({ id: actividad.id, notas: texto })
    } catch (err) {
      setNotasError(getErrorMessage(err, 'No se pudo guardar el comentario.'))
    }
  }

  const handleCompletar = async () => {
    await completar({ id: actividad.id })
  }

  return (
    <div className={`border rounded-xl overflow-hidden transition-colors
      ${esPendiente
        ? 'border-amber-200 bg-amber-50/30'
        : esTerminal
          ? 'border-gray-100 bg-white opacity-80'
          : 'border-gray-100 bg-white'
      }`}>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1
              rounded-lg text-xs font-semibold ${TIPO_COLORS[actividad.tipo]}`}>
              {TIPO_ICONOS[actividad.tipo]}
              {actividad.tipo}
            </span>
            {estadoBadge(actividad.estado)}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {esPendiente && (
              <>
                <button
                  onClick={handleCompletar}
                  disabled={completando || eliminando}
                  title="Marcar como completada"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                    text-xs font-semibold text-emerald-600 hover:bg-emerald-50
                    border border-emerald-200 transition-colors
                    disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 size={13} />
                  Completar
                </button>
                <button
                  onClick={() => setConfirmarEliminar(true)}
                  disabled={eliminando || completando}
                  title="Eliminar actividad"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500
                    hover:bg-red-50 transition-colors
                    disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
            <button
              onClick={() => setExpandido(!expandido)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600
                hover:bg-gray-50 transition-colors"
            >
              {expandido ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        <p className="text-sm font-semibold text-gray-800">
          {actividad.nombre_actividad}
        </p>

        <div className="flex items-center gap-4 flex-wrap text-xs text-gray-400">
          <span>Inicio: {formatFecha(actividad.fecha_inicio)}</span>
          <span>Fin: {formatFecha(actividad.fecha_fin)}</span>
          {actividad.responsable_nombre && (
            <span className="text-emerald-600 font-medium">
              {actividad.responsable_nombre}
            </span>
          )}
        </div>

        {actividad.notas && (
          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
            {actividad.notas}
          </p>
        )}

        {actividad.outlook_event_id && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border
            border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
            <CalendarPlus size={13} />
            <span className="font-semibold">Evento Outlook creado</span>
            {actividad.teamsMeetingUrl && (
              <a
                href={actividad.teamsMeetingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold underline underline-offset-2"
              >
                Abrir Teams <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}
      </div>

      {expandido && (
        <div className="border-t border-gray-100 p-4 space-y-2 bg-gray-50/50">
          <label
            htmlFor={`act-notas-${actividad.id}`}
            className="block text-xs font-bold text-gray-500 uppercase tracking-wide"
          >
            Comentarios
          </label>

          <textarea
            id={`act-notas-${actividad.id}`}
            rows={3}
            maxLength={1000}
            value={notasEdit}
            onChange={(event) => {
              setNotasEdit(event.target.value)
              if (notasError) setNotasError(null)
            }}
            placeholder="Escribe el comentario de la actividad..."
            className="w-full px-3 py-2 rounded-xl border border-gray-200
              bg-white text-sm text-gray-900 outline-none
              focus:border-emerald-400 placeholder:text-gray-400 resize-none"
          />

          {notasError && (
            <p className="text-red-500 text-xs">{notasError}</p>
          )}

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-400">{notasActual.length}/1000</span>
            <button
              type="button"
              onClick={handleGuardarNotas}
              disabled={guardandoNotas || notasInvalida || notasSinCambios}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                text-xs font-semibold bg-emerald-600 hover:bg-emerald-700
                disabled:bg-emerald-300 disabled:cursor-not-allowed text-white
                transition-colors"
            >
              {guardandoNotas
                ? <Loader2 size={13} className="animate-spin" />
                : <Save size={13} />}
              Guardar comentario
            </button>
          </div>
        </div>
      )}
      {confirmarEliminar && (
        <ModalShell onClose={() => setConfirmarEliminar(false)} maxWidth="sm">
          <ModalHeader
            icon={<AlertTriangle size={18} className="text-red-500" />}
            iconBg="bg-red-50"
            title="Eliminar actividad"
            onClose={() => setConfirmarEliminar(false)}
          />
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-gray-600">
              ¿Estás seguro de que deseas eliminar{' '}
              <span className="font-semibold text-gray-900">
                {actividad.nombre_actividad}
              </span>
              ? Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmarEliminar(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  await eliminar(actividad.id)
                  setConfirmarEliminar(false)
                }}
                disabled={eliminando}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:bg-red-200 disabled:cursor-not-allowed rounded-xl transition-colors"
              >
                {eliminando
                  ? <><Loader2 size={14} className="animate-spin" />Eliminando...</>
                  : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  )
}

export function ActividadHistorial({
  leadId,
  actividades,
  onProgramarRecordatorio,
  onProgramarSeguimiento,
}: ActividadHistorialProps) {
  const pendientes  = actividades.filter(
    (a) => a.estado === EstadoActividad.Pendiente
  )
  const completadas = actividades.filter(
    (a) => a.estado === EstadoActividad.Completada
  )

  if (actividades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-2">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
          <AlertTriangle size={18} className="text-gray-300" />
        </div>
        <p className="text-sm text-gray-400">Sin actividades registradas</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {pendientes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">
            Pendientes ({pendientes.length})
          </p>
          {pendientes.map((a) => (
            <ActividadItem
              key={a.id}
              actividad={a}
              leadId={leadId}
              onProgramarRecordatorio={onProgramarRecordatorio}
              onProgramarSeguimiento={onProgramarSeguimiento}
            />
          ))}
        </div>
      )}

      {completadas.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
            Completadas ({completadas.length})
          </p>
          {completadas.map((a) => (
            <ActividadItem
              key={a.id}
              actividad={a}
              leadId={leadId}
              onProgramarRecordatorio={onProgramarRecordatorio}
              onProgramarSeguimiento={onProgramarSeguimiento}
            />
          ))}
        </div>
      )}
    </div>
  )
}
