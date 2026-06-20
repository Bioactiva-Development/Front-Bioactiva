'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Pencil, Building2, User,
  Briefcase, Calendar, Mail, Phone,
  Plus, MessageSquare, FileText,
  ExternalLink, AlertCircle, DollarSign,
} from 'lucide-react'
import { Lead } from '@/types/lead.types'
import { EstadoCot, LeadState, TipoMoneda } from '@/types/enums'
import { ROUTES } from '@/lib/constants/routes'
import { ActividadHistorial } from './ActividadHistorial'
import { ActividadForm } from './ActividadForm'
import { LeadEditFocus } from './LeadForm'
import { useActividades, useCrearActividad } from '@/hooks/pipeline/useActividades'
import { useCotizacionesPorLead } from '@/hooks/cotizaciones/useCotizaciones'
import {
  useCrearRecordatorio,
  useCrearSeguimiento,
} from '@/hooks/notificaciones/useNotificaciones'
import { RecordatorioForm } from '@/components/modules/notificaciones/RecordatorioForm'
import { SeguimientoForm } from '@/components/modules/notificaciones/SeguimientoForm'
import { ActividadFormValues } from '@/lib/validators/actividad.schema'
import { getErrorMessage } from '@/lib/utils/error.utils'
import { formatLeadDateOnly } from '@/lib/utils/lead-date.utils'
import {
  getBlockingPendingActivity,
  isLeadStaleWithoutProgress,
} from '@/lib/utils/activity-flow.utils'
import { Actividad } from '@/types/actividad.types'
import {
  CrearRecordatorioRequest,
  CrearSeguimientoRequest,
} from '@/types/notificacion.types'

interface LeadDetalleProps {
  lead:     Lead
  onEditar: (focus?: LeadEditFocus) => void
  onEliminar?: () => void
  eliminando?: boolean
  initialAction?: 'actividad' | 'seguimiento'
}

const ESTADO_COLORS: Record<LeadState, string> = {
  [LeadState.Prospecto]:     'bg-gray-100 text-gray-600',
  [LeadState.Ofertado]:      'bg-amber-50 text-amber-700',
  [LeadState.CierreVenta]:   'bg-emerald-50 text-emerald-700',
  [LeadState.CierreSinVenta]: 'bg-red-50 text-red-600',
}

const COTIZACION_COLORS: Record<EstadoCot, string> = {
  [EstadoCot.Pendiente]: 'bg-gray-100 text-gray-600',
  [EstadoCot.Enviada]:   'bg-blue-50 text-blue-700',
  [EstadoCot.Aceptada]:  'bg-emerald-50 text-emerald-700',
  [EstadoCot.Rechazada]: 'bg-red-50 text-red-600',
}

function InfoItem({
  icono,
  label,
  valor,
}: {
  icono:  React.ReactNode
  label:  string
  valor?: React.ReactNode
}) {
  if (!valor) return null
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center
        justify-center shrink-0 mt-0.5">
        <span className="text-emerald-600">{icono}</span>
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
          {label}
        </p>
        <div className="text-sm text-gray-800 font-medium mt-0.5">{valor}</div>
      </div>
    </div>
  )
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center
        justify-center mb-2">
        <AlertCircle size={18} className="text-gray-300" />
      </div>
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  )
}

function formatMonto(monto: number, tipo: TipoMoneda) {
  const simbolo = tipo === TipoMoneda.Soles ? 'S/' : '$'
  return `${simbolo} ${monto.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
  })}`
}

function formatFecha(fecha?: string) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-PE', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  })
}

export function LeadDetalle({
  lead,
  onEditar,
  initialAction,
}: LeadDetalleProps) {
  const router                          = useRouter()
  const [tab, setTab]                   = useState<
    'info' | 'actividades' | 'cotizaciones'
  >(initialAction ? 'actividades' : 'info')
  const [mostrarForm, setMostrarForm]   = useState(initialAction === 'actividad')
  const [errorActividad, setErrorActividad] = useState<string | null>(null)
  const [actividadBloqueada, setActividadBloqueada] = useState<string | null>(null)
  const [notificacionMode, setNotificacionMode] = useState<
    'recordatorio' | 'seguimiento' | null
  >(null)
  const [actividadNotificacion, setActividadNotificacion] =
    useState<Actividad | null>(null)
  const [errorNotificacion, setErrorNotificacion] = useState<string | null>(null)

  const { data: actividades = [], isLoading: loadingActividades } =
    useActividades(lead.id)
  const { data: cotizaciones = [], isLoading: loadingCotizaciones } =
    useCotizacionesPorLead(lead.id)
  const { mutateAsync: crearActividad, isPending: creando } =
    useCrearActividad()

  const { mutateAsync: crearRecordatorio, isPending: creandoRecordatorio } =
    useCrearRecordatorio()
  const { mutateAsync: crearSeguimiento, isPending: creandoSeguimiento } =
    useCrearSeguimiento()

  const pendingActivity = useMemo(
    () => getBlockingPendingActivity(actividades),
    [actividades]
  )

  const handleCrearActividad = async (data: ActividadFormValues) => {
    if (pendingActivity) {
      setActividadBloqueada(
        `Completa primero "${pendingActivity.nombre_actividad}" antes de programar una nueva actividad.`
      )
      return
    }

    try {
      setErrorActividad(null)
      setActividadBloqueada(null)
      await crearActividad(data)
      setMostrarForm(false)
    } catch (err: unknown) {
      setErrorActividad(getErrorMessage(err, 'No se pudo registrar la actividad.'))
    }
  }

  const abrirProgramacion = (
    mode: 'recordatorio' | 'seguimiento',
    actividad: Actividad
  ) => {
    setErrorNotificacion(null)
    setNotificacionMode(mode)
    setActividadNotificacion(actividad)
  }

  const cerrarProgramacion = () => {
    setNotificacionMode(null)
    setActividadNotificacion(null)
    setErrorNotificacion(null)
  }

  const handleCrearRecordatorio = async (data: CrearRecordatorioRequest) => {
    try {
      setErrorNotificacion(null)
      await crearRecordatorio(data)
      cerrarProgramacion()
    } catch (err: unknown) {
      setErrorNotificacion(getErrorMessage(err, 'No se pudo programar el recordatorio.'))
    }
  }

  const handleCrearSeguimiento = async (data: CrearSeguimientoRequest) => {
    try {
      setErrorNotificacion(null)
      await crearSeguimiento(data)
      cerrarProgramacion()
    } catch (err: unknown) {
      setErrorNotificacion(getErrorMessage(err, 'No se pudo programar el seguimiento.'))
    }
  }

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(ROUTES.pipeline)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                text-gray-500 hover:text-gray-700 hover:bg-gray-50
                border border-gray-200 transition-colors shrink-0"
            >
              <ArrowLeft size={14} />
              Pipeline
            </button>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg
                  uppercase tracking-wide ${ESTADO_COLORS[lead.estado]}`}>
                  {lead.estado}
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mt-1 flex items-center gap-2">
                <Building2 size={18} className="text-emerald-600 shrink-0" />
                {lead.organizacion_nombre}
              </h1>
              {lead.servicio_interes && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <Briefcase size={14} className="text-gray-400 shrink-0" />
                  {lead.servicio_interes}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditar()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                font-semibold border border-emerald-600 text-emerald-600
                hover:bg-emerald-50 transition-colors"
            >
              <Pencil size={14} />
              Editar lead
            </button>
          </div>
        </div>

        {isLeadStaleWithoutProgress(lead) && (
          <div className="mt-4 pt-4 border-t border-gray-50">
            <div className="flex items-start gap-2 rounded-xl
              border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>
                Este lead supera 30 días sin cambio de estado. Registra una
                actividad o actualiza el avance comercial para resolver la alerta.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {[
          { key: 'info',        label: 'Información',  icono: <Briefcase size={14} /> },
          { key: 'actividades', label: 'Actividades',  icono: <MessageSquare size={14} /> },
          { key: 'cotizaciones', label: 'Cotizaciones', icono: <FileText size={14} /> },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm
              font-semibold transition-colors
              ${tab === t.key
                ? 'bg-emerald-700 text-white'
                : 'bg-white border border-gray-100 text-gray-500 hover:text-emerald-600'
              }`}
          >
            {t.icono}
            {t.label}
            {t.key === 'actividades' && actividades.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full
                ${tab === t.key ? 'bg-white/20' : 'bg-gray-100'}`}>
                {actividades.length}
              </span>
            )}
            {t.key === 'cotizaciones' && cotizaciones.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full
                ${tab === t.key ? 'bg-white/20' : 'bg-gray-100'}`}>
                {cotizaciones.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Datos del lead
              </h3>
              <button
                onClick={() => onEditar('datos')}
                className="inline-flex items-center gap-1 text-xs font-semibold
                  text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <Pencil size={12} />
                Editar
              </button>
            </div>
            <div className="space-y-4">
              <InfoItem
                icono={<User size={14} />}
                label="Contacto"
                valor={lead.contacto_nombre}
              />
              <InfoItem
                icono={<Mail size={14} />}
                label="Canal de captación"
                valor={lead.canal_captacion}
              />
              <InfoItem
                icono={<Phone size={14} />}
                label="Encargado"
                valor={lead.encargado_nombre}
              />
              <InfoItem
                icono={<Calendar size={14} />}
                label="Fecha de creación"
                valor={formatLeadDateOnly(lead.created_at)}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Contexto comercial
              </h3>
              <button
                onClick={() => onEditar('contexto')}
                className="inline-flex items-center gap-1 text-xs font-semibold
                  text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <Pencil size={12} />
                Editar
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                  Comentarios
                </p>
                {lead.comentarios ? (
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">
                    {lead.comentarios}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">Sin comentarios registrados.</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                  Desafío u oportunidad
                </p>
                {lead.desafio_oportunidad ? (
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">
                    {lead.desafio_oportunidad}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">Sin desafío u oportunidad registrado.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'actividades' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Actividades de seguimiento
              </h3>
              {pendingActivity && (
                <p className="text-sm text-amber-600 mt-1">
                  Hay una actividad pendiente. Complétala para habilitar la siguiente.
                </p>
              )}
            </div>
            {!mostrarForm && (
              <button
                onClick={() => {
                  if (pendingActivity) {
                    setActividadBloqueada(
                      `Completa primero "${pendingActivity.nombre_actividad}" antes de programar una nueva actividad.`
                    )
                    return
                  }
                  setActividadBloqueada(null)
                  setMostrarForm(true)
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                  font-semibold transition-colors
                  ${pendingActivity
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
              >
                <Plus size={14} />
                Nueva actividad
              </button>
            )}
          </div>

          {actividadBloqueada && (
            <div className="mb-4 flex items-start gap-2 rounded-xl
              border border-amber-200 bg-amber-50 px-3 py-2 text-sm
              text-amber-800">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{actividadBloqueada}</p>
            </div>
          )}

          {mostrarForm && !pendingActivity && (
            <div className="mb-4">
              <ActividadForm
                leadId={lead.id}
                onSubmit={handleCrearActividad}
                onCancelar={() => setMostrarForm(false)}
                isLoading={creando}
                error={errorActividad}
              />
            </div>
          )}

          {notificacionMode && actividadNotificacion && (
            <div className="mb-4">
              {notificacionMode === 'recordatorio' ? (
                <RecordatorioForm
                  leadIdInicial={lead.id}
                  onSubmit={handleCrearRecordatorio}
                  onCancel={cerrarProgramacion}
                  isLoading={creandoRecordatorio}
                  error={errorNotificacion}
                />
              ) : (
                <SeguimientoForm
                  leadIdInicial={lead.id}
                  onSubmit={handleCrearSeguimiento}
                  onCancel={cerrarProgramacion}
                  isLoading={creandoSeguimiento}
                  error={errorNotificacion}
                />
              )}
            </div>
          )}

          {loadingActividades ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-emerald-600
                border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ActividadHistorial
              leadId={lead.id}
              actividades={actividades}
              onProgramarRecordatorio={(actividad) =>
                abrirProgramacion('recordatorio', actividad)
              }
              onProgramarSeguimiento={(actividad) =>
                abrirProgramacion('seguimiento', actividad)
              }
            />
          )}
        </div>
      )}

      {tab === 'cotizaciones' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Cotizaciones asociadas
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Las cotizaciones aceptadas o rechazadas sincronizan el cierre del lead.
              </p>
            </div>
            {/* El backend permite una sola cotización por lead: el botón se oculta
                cuando ya existe una. */}
            {cotizaciones.length === 0 && (
              <button
                onClick={() => router.push(`/cotizaciones/nueva?lead=${lead.id}`)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                  font-semibold bg-emerald-600 hover:bg-emerald-700
                  text-white transition-colors shrink-0"
              >
                <Plus size={14} />
                Nueva cotización
              </button>
            )}
          </div>

          {loadingCotizaciones ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-emerald-600
                border-t-transparent rounded-full animate-spin" />
            </div>
          ) : cotizaciones.length === 0 ? (
            <EmptyPanel message="Este lead todavía no tiene cotizaciones." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {cotizaciones.map((cotizacion) => (
                <div
                  key={cotizacion.id}
                  className="rounded-xl border border-gray-100 bg-white p-4
                    hover:border-emerald-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-emerald-600">
                        {cotizacion.codigo}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatFecha(cotizacion.fecha_cot)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1
                      rounded-lg text-xs font-bold uppercase tracking-wide
                      ${COTIZACION_COLORS[cotizacion.estado]}`}>
                      {cotizacion.estado}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-gray-800 mt-3">
                    {cotizacion.nombre_servicio}
                  </p>
                  <div className="flex items-center justify-between gap-3 mt-3">
                    <span className="inline-flex items-center gap-1.5 text-sm
                      font-bold text-gray-900">
                      <DollarSign size={14} className="text-gray-400" />
                      {formatMonto(cotizacion.monto, cotizacion.tipo)}
                    </span>
                    <button
                      onClick={() => router.push(ROUTES.cotizacion(cotizacion.id))}
                      className="inline-flex items-center gap-1.5 rounded-lg
                        px-2.5 py-1.5 text-xs font-semibold text-emerald-600
                        hover:bg-emerald-50 transition-colors"
                    >
                      <ExternalLink size={13} />
                      Ver detalle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
