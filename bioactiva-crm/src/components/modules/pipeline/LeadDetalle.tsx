'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Pencil, Building2, User,
  Briefcase, Calendar, Mail, Phone,
  Plus, MessageSquare, FileText, History,
  ExternalLink, AlertCircle, DollarSign, Bell,
} from 'lucide-react'
import { Lead } from '@/types/lead.types'
import { EstadoCot, LeadState, TipoMoneda } from '@/types/enums'
import { ROUTES } from '@/lib/constants/routes'
import { ActividadHistorial } from './ActividadHistorial'
import { ActividadForm } from './ActividadForm'
import { useActividades, useCrearActividad } from '@/hooks/pipeline/useActividades'
import { useActualizarEstadoLead } from '@/hooks/pipeline/useLeads'
import { useCotizacionesPorLead } from '@/hooks/cotizaciones/useCotizaciones'
import {
  useCentroNotificaciones,
  useCrearRecordatorio,
  useCrearSeguimiento,
  useNotificacionesPorLead,
} from '@/hooks/notificaciones/useNotificaciones'
import { RecordatorioForm } from '@/components/modules/notificaciones/RecordatorioForm'
import { SeguimientoForm } from '@/components/modules/notificaciones/SeguimientoForm'
import { ActividadFormValues } from '@/lib/validators/actividad.schema'
import {
  RecordatorioFormValues,
  SeguimientoFormValues,
} from '@/lib/validators/notificacion.schema'
import { getErrorMessage } from '@/lib/utils/error.utils'
import { validateLeadStateTransition } from '@/lib/utils/lead-flow.utils'
import {
  formatLeadDateOnly,
  getLeadCloseDateStatus,
} from '@/lib/utils/lead-date.utils'
import {
  getBlockingPendingActivity,
  isLeadStaleWithoutProgress,
} from '@/lib/utils/activity-flow.utils'
import { Actividad } from '@/types/actividad.types'
import { NotificacionProgramada } from '@/types/notificacion.types'

interface LeadDetalleProps {
  lead:     Lead
  onEditar: () => void
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

const ESTADOS_PIPELINE = [
  LeadState.Prospecto,
  LeadState.Ofertado,
  LeadState.CierreVenta,
  LeadState.CierreSinVenta,
]

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
    'info' | 'actividades' | 'cotizaciones' | 'historial'
  >(initialAction ? 'actividades' : 'info')
  const [mostrarForm, setMostrarForm]   = useState(initialAction === 'actividad')
  const [errorActividad, setErrorActividad] = useState<string | null>(null)
  const [estadoError, setEstadoError]   = useState<string | null>(null)
  const [borradorCotId, setBorradorCotId] = useState<number | null>(null)
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
  const { data: notificaciones = [] } = useNotificacionesPorLead(lead.id)
  const { data: centroNotificaciones } = useCentroNotificaciones()

  const { mutateAsync: crearActividad, isPending: creando } =
    useCrearActividad()

  const { mutateAsync: actualizarEstado, isPending: actualizandoEstado } =
    useActualizarEstadoLead()
  const { mutateAsync: crearRecordatorio, isPending: creandoRecordatorio } =
    useCrearRecordatorio()
  const { mutateAsync: crearSeguimiento, isPending: creandoSeguimiento } =
    useCrearSeguimiento()
  const closeDateStatus = getLeadCloseDateStatus(lead.fecha_cierre)

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

  const handleCambiarEstado = async (estado: LeadState) => {
    const guard = validateLeadStateTransition(lead.estado, estado, cotizaciones)
    if (!guard.allowed) {
      setEstadoError(guard.reason ?? 'No se puede realizar el cambio de estado.')
      return
    }

    try {
      setEstadoError(null)
      setBorradorCotId(null)
      const { borrador } = await actualizarEstado({ id: lead.id, estado })
      // OFERTADO: el backend generó la cotización borrador automáticamente.
      if (borrador) setBorradorCotId(borrador.id)
    } catch (err: unknown) {
      // 409: el lead tiene una actividad pendiente que debe resolverse antes.
      const status = (err as { status?: number })?.status
      setEstadoError(
        status === 409
          ? 'El lead tiene una actividad pendiente. Complétala o cancélala (en la pestaña Actividades) antes de cambiar el estado.'
          : getErrorMessage(err, 'No se pudo cambiar el estado del lead.')
      )
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

  const handleCrearRecordatorio = async (
    data: RecordatorioFormValues & Partial<NotificacionProgramada>
  ) => {
    try {
      setErrorNotificacion(null)
      await crearRecordatorio(data)
      cerrarProgramacion()
    } catch (err: unknown) {
      setErrorNotificacion(getErrorMessage(err, 'No se pudo programar el recordatorio.'))
    }
  }

  const handleCrearSeguimiento = async (
    data: SeguimientoFormValues & Partial<NotificacionProgramada>
  ) => {
    try {
      setErrorNotificacion(null)
      await crearSeguimiento(data)
      cerrarProgramacion()
    } catch (err: unknown) {
      setErrorNotificacion(getErrorMessage(err, 'No se pudo programar el seguimiento.'))
    }
  }

  const historial = useMemo(() => {
    const eventos = [
      {
        id: `lead-${lead.id}-created`,
        fecha: lead.created_at,
        tipo: 'Lead creado',
        titulo: lead.organizacion_nombre ?? 'Lead creado',
        detalle: `${lead.organizacion_nombre ?? 'Organización'} - ${lead.servicio_interes}`,
      },
      ...actividades.map((actividad) => ({
        id: `actividad-${actividad.id}`,
        fecha: actividad.updated_at ?? actividad.created_at,
        tipo: `Actividad ${actividad.estado}`,
        titulo: actividad.nombre_actividad,
        detalle: `${actividad.tipo}${actividad.responsable_nombre ? ` - ${actividad.responsable_nombre}` : ''}`,
      })),
      ...cotizaciones.map((cotizacion) => ({
        id: `cotizacion-${cotizacion.id}`,
        fecha: cotizacion.updated_at ?? cotizacion.created_at,
        tipo: `Cotización ${cotizacion.estado}`,
        titulo: cotizacion.codigo,
        detalle: `${cotizacion.nombre_servicio} - ${formatMonto(cotizacion.monto, cotizacion.tipo)}`,
      })),
      ...notificaciones.map((notificacion) => ({
        id: `notificacion-${notificacion.id}`,
        fecha: notificacion.created_at,
        tipo: `${notificacion.tipo}`,
        titulo: notificacion.titulo,
        detalle: notificacion.mensaje,
      })),
      ...(centroNotificaciones?.programadas ?? [])
        .filter((notificacion) => notificacion.id_lead === lead.id)
        .map((notificacion) => ({
          id: `notificacion-programada-${notificacion.id}`,
          fecha: notificacion.created_at,
          tipo: `${notificacion.tipo} programado`,
          titulo: notificacion.asunto,
          detalle: `${notificacion.actividad_nombre ?? 'Actividad'} - envío ${formatFecha(notificacion.fecha_envio)}`,
        })),
      {
        id: `lead-${lead.id}-state`,
        fecha: lead.updated_at,
        tipo: 'Estado actual',
        titulo: lead.estado,
        detalle: 'Última actualización registrada en el pipeline.',
      },
    ]

    return eventos.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    )
  }, [actividades, centroNotificaciones?.programadas, cotizaciones, lead, notificaciones])

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
              <h1 className="text-xl font-bold text-gray-900 mt-1">
                {lead.organizacion_nombre}
              </h1>
              {lead.servicio_interes && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {lead.servicio_interes}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onEditar}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                font-semibold border border-emerald-600 text-emerald-600
                hover:bg-emerald-50 transition-colors"
            >
              <Pencil size={14} />
              Editar lead
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-50">
          {isLeadStaleWithoutProgress(lead) && (
            <div className="mb-4 flex items-start gap-2 rounded-xl
              border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>
                Este lead supera 30 días sin cambio de estado. Registra una
                actividad o actualiza el avance comercial para resolver la alerta.
              </p>
            </div>
          )}

          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
            Mover a estado
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {ESTADOS_PIPELINE.map((estado) => (
              <button
                key={estado}
                onClick={() => handleCambiarEstado(estado)}
                disabled={lead.estado === estado || actualizandoEstado}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold
                  transition-colors disabled:cursor-not-allowed
                  ${lead.estado === estado
                    ? `${ESTADO_COLORS[estado]} opacity-100 cursor-default`
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
              >
                {estado}
              </button>
            ))}
          </div>
          {estadoError && (
            <div className="mt-3 flex items-start gap-2 rounded-xl
              border border-amber-200 bg-amber-50 px-3 py-2 text-sm
              text-amber-800">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div>
                <p>{estadoError}</p>
                <button
                  type="button"
                  onClick={() => router.push(`/cotizaciones/nueva?lead=${lead.id}`)}
                  className="mt-1 text-xs font-bold text-amber-900 underline
                    underline-offset-2"
                >
                  Crear cotización para este lead
                </button>
              </div>
            </div>
          )}
          {borradorCotId && (
            <div className="mt-3 flex items-start gap-2 rounded-xl
              border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm
              text-emerald-800">
              <FileText size={16} className="mt-0.5 shrink-0" />
              <div>
                <p>Se generó una cotización borrador. Complétala.</p>
                <button
                  type="button"
                  onClick={() => router.push(ROUTES.cotizacion(borradorCotId))}
                  className="mt-1 text-xs font-bold text-emerald-700 underline
                    underline-offset-2"
                >
                  Completar cotización
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { key: 'info',        label: 'Información',  icono: <Briefcase size={14} /> },
          { key: 'actividades', label: 'Actividades',  icono: <MessageSquare size={14} /> },
          { key: 'cotizaciones', label: 'Cotizaciones', icono: <FileText size={14} /> },
          { key: 'historial',   label: 'Historial',    icono: <History size={14} /> },
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
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Datos del lead
            </h3>
            <div className="space-y-4">
              <InfoItem
                icono={<Building2 size={14} />}
                label="Organización"
                valor={lead.organizacion_nombre}
              />
              <InfoItem
                icono={<User size={14} />}
                label="Contacto"
                valor={lead.contacto_nombre}
              />
              <InfoItem
                icono={<Briefcase size={14} />}
                label="Servicio de interés"
                valor={lead.servicio_interes}
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
                label="Fecha de cierre estimada"
                valor={lead.fecha_cierre && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{formatLeadDateOnly(lead.fecha_cierre)}</span>
                    {closeDateStatus && (
                      <span className={`rounded-full border px-2 py-0.5 text-xs
                        font-semibold ${closeDateStatus.className}`}>
                        {closeDateStatus.label}
                      </span>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Contexto comercial
            </h3>
            <div className="space-y-4">
              {lead.comentarios && (
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                    Comentarios
                  </p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">
                    {lead.comentarios}
                  </p>
                </div>
              )}
              {lead.desafio_oportunidad && (
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                    Desafío u oportunidad
                  </p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">
                    {lead.desafio_oportunidad}
                  </p>
                </div>
              )}
              {!lead.comentarios && !lead.desafio_oportunidad && (
                <p className="text-sm text-gray-400 italic">Sin notas registradas.</p>
              )}
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
                  actividadIdInicial={actividadNotificacion.id}
                  onSubmit={handleCrearRecordatorio}
                  onCancel={cerrarProgramacion}
                  isLoading={creandoRecordatorio}
                  error={errorNotificacion}
                />
              ) : (
                <SeguimientoForm
                  leadIdInicial={lead.id}
                  actividadIdInicial={actividadNotificacion.id}
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
            <button
              onClick={() => router.push(`/cotizaciones/nueva?lead=${lead.id}`)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                font-semibold bg-emerald-600 hover:bg-emerald-700
                text-white transition-colors shrink-0"
            >
              <Plus size={14} />
              Nueva cotización
            </button>
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

      {tab === 'historial' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">
            Historial comercial
          </h3>
          {historial.length === 0 ? (
            <EmptyPanel message="Sin eventos comerciales registrados." />
          ) : (
            <div className="space-y-3">
              {historial.map((evento) => (
                <div key={evento.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="w-7 h-7 rounded-full bg-emerald-50
                      text-emerald-600 mt-1 flex items-center justify-center">
                      {evento.id.startsWith('notificacion')
                        ? <Bell size={13} />
                        : evento.id.startsWith('cotizacion')
                          ? <FileText size={13} />
                          : evento.id.startsWith('actividad')
                            ? <MessageSquare size={13} />
                            : <History size={13} />
                      }
                    </span>
                    <span className="w-px flex-1 bg-gray-100 mt-1" />
                  </div>
                  <div className="flex-1 rounded-xl border border-gray-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-emerald-600
                          uppercase tracking-wide">
                          {evento.tipo}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {evento.titulo}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">
                        {formatFecha(evento.fecha)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {evento.detalle}
                    </p>
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
