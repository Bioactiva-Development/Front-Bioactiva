'use client'

import { useState } from 'react'
import {
  Mail, Phone, Users, HelpCircle,
  CheckCircle2, Clock, Trash2,
  ChevronDown, ChevronUp, Send,
  AlertTriangle,
} from 'lucide-react'
import { Actividad } from '@/types/actividad.types'
import { TipoActividad, EstadoActividad } from '@/types/enums'
import {
  useCompletarActividad,
  useEliminarActividad,
  useComentarios,
  useCrearComentario,
} from '@/hooks/pipeline/useActividades'

interface ActividadHistorialProps {
  leadId:      number
  actividades: Actividad[]
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

function ActividadItem({
  actividad,
  leadId,
}: {
  actividad: Actividad
  leadId:    number
}) {
  const [expandido,   setExpandido]   = useState(false)
  const [nuevoComment, setNuevoComment] = useState('')

  const { mutateAsync: completar, isPending: completando } =
    useCompletarActividad(leadId)
  const { mutateAsync: eliminar, isPending: eliminando } =
    useEliminarActividad(leadId)
  const { data: comentarios = [] } = useComentarios(
    expandido ? actividad.id : 0
  )
  const { mutateAsync: crearComentario, isPending: enviando } =
    useCrearComentario(actividad.id)

  const esPendiente  = actividad.estado === EstadoActividad.Pendiente
  const esCompletada = actividad.estado === EstadoActividad.Completada

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-PE', {
      day:    '2-digit',
      month:  'short',
      year:   'numeric',
      hour:   '2-digit',
      minute: '2-digit',
    })

  const handleEnviarComentario = async () => {
    if (!nuevoComment.trim()) return
    await crearComentario(nuevoComment.trim())
    setNuevoComment('')
  }

  return (
    <div className={`border rounded-xl overflow-hidden transition-colors
      ${esPendiente ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100 bg-white'}`}>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1
              rounded-lg text-xs font-semibold ${TIPO_COLORS[actividad.tipo]}`}>
              {TIPO_ICONOS[actividad.tipo]}
              {actividad.tipo}
            </span>

            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1
              rounded-lg text-xs font-semibold
              ${esCompletada
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
              }`}>
              {esCompletada
                ? <CheckCircle2 size={12} />
                : <Clock size={12} />
              }
              {actividad.estado}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {esPendiente && (
              <button
                onClick={() => completar(actividad.id)}
                disabled={completando}
                title="Marcar como completada"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  text-xs font-semibold text-emerald-600 hover:bg-emerald-50
                  border border-emerald-200 transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle2 size={13} />
                Completar
              </button>
            )}
            <button
              onClick={() => eliminar(actividad.id)}
              disabled={eliminando}
              title="Eliminar actividad"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500
                hover:bg-red-50 transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={() => setExpandido(!expandido)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600
                hover:bg-gray-50 transition-colors"
            >
              {expandido
                ? <ChevronUp size={14} />
                : <ChevronDown size={14} />
              }
            </button>
          </div>
        </div>

        <p className="text-sm font-semibold text-gray-800">
          {actividad.nombre_actividad}
        </p>

        <div className="flex items-center gap-4 flex-wrap text-xs text-gray-400">
          <span>
            Inicio: {formatFecha(actividad.fecha_inicio)}
          </span>
          <span>
            Fin: {formatFecha(actividad.fecha_fin)}
          </span>
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
      </div>

      {expandido && (
        <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50/50">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            Comentarios
          </p>

          {comentarios.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Sin comentarios aún.</p>
          ) : (
            <div className="space-y-2">
              {comentarios.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-lg border border-gray-100 px-3 py-2"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-emerald-600">
                      {c.autor}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(c.created_at).toLocaleDateString('es-PE')}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700">{c.texto}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={nuevoComment}
              onChange={(e) => setNuevoComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEnviarComentario()}
              placeholder="Agregar comentario..."
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200
                bg-white text-sm text-gray-900 outline-none
                focus:border-emerald-400 placeholder:text-gray-400"
            />
            <button
              onClick={handleEnviarComentario}
              disabled={!nuevoComment.trim() || enviando}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700
                disabled:bg-emerald-300 disabled:cursor-not-allowed
                text-white transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function ActividadHistorial({
  leadId,
  actividades,
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
            <ActividadItem key={a.id} actividad={a} leadId={leadId} />
          ))}
        </div>
      )}

      {completadas.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
            Completadas ({completadas.length})
          </p>
          {completadas.map((a) => (
            <ActividadItem key={a.id} actividad={a} leadId={leadId} />
          ))}
        </div>
      )}
    </div>
  )
}