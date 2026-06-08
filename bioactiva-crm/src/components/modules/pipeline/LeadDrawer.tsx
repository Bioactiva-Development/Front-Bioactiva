'use client'

import { useRouter } from 'next/navigation'
import {
  X, ExternalLink, User, Plus,
  AlertTriangle, FileText, History,
} from 'lucide-react'
import { Lead } from '@/types/lead.types'
import {
  LeadState,
  TipoActividad,
  EstadoActividad,
  EstadoCot,
  TipoMoneda,
} from '@/types/enums'
import { useActividades } from '@/hooks/pipeline/useActividades'
import { useCotizacionesPorLead } from '@/hooks/cotizaciones/useCotizaciones'
import { ROUTES } from '@/lib/constants/routes'

interface LeadDrawerProps {
  lead:     Lead
  onCerrar: () => void
}

const ESTADO_COLORS: Record<LeadState, string> = {
  [LeadState.Prospecto]:      'bg-gray-700 text-white',
  [LeadState.Ofertado]:       'bg-amber-500 text-white',
  [LeadState.CierreVenta]:    'bg-emerald-600 text-white',
  [LeadState.CierreSinVenta]: 'bg-red-500 text-white',
}

const TIPO_ICONOS: Record<TipoActividad, string> = {
  [TipoActividad.Email]:   '✉',
  [TipoActividad.Llamada]: '📞',
  [TipoActividad.Reunion]: '📅',
  [TipoActividad.Otro]:    '📌',
}

const COTIZACION_COLORS: Record<EstadoCot, string> = {
  [EstadoCot.Pendiente]: 'bg-gray-100 text-gray-600',
  [EstadoCot.Enviada]:   'bg-blue-50 text-blue-700',
  [EstadoCot.Aceptada]:  'bg-emerald-50 text-emerald-700',
  [EstadoCot.Rechazada]: 'bg-red-50 text-red-600',
}

function formatMonto(monto: number, tipo: TipoMoneda) {
  const simbolo = tipo === TipoMoneda.Soles ? 'S/' : '$'
  return `${simbolo} ${monto.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
  })}`
}

export function LeadDrawer({ lead, onCerrar }: LeadDrawerProps) {
  const router = useRouter()
  const { data: actividades = [] } = useActividades(lead.id)
  const { data: cotizaciones = [] } = useCotizacionesPorLead(lead.id)

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-PE', {
      day:   '2-digit',
      month: 'short',
    })

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Cerrar panel"
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onCerrar}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCerrar() }}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white
        shadow-2xl z-50 flex flex-col overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4
          border-b border-gray-100">
          <h2 className="text-base font-bold text-emerald-700">
            Lead — {lead.organizacion_nombre}
          </h2>
          <button
            onClick={onCerrar}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600
              hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          <div className="bg-gray-50 rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                {lead.contacto_nombre && (
                  <p className="text-sm text-emerald-600 font-medium mt-0.5">
                    {lead.contacto_nombre}
                  </p>
                )}
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-lg
                uppercase tracking-wide ${ESTADO_COLORS[lead.estado]}`}>
                {lead.estado}
              </span>
            </div>
            {lead.tiene_alerta && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg
                bg-red-50 px-2.5 py-1 text-xs font-bold uppercase
                tracking-wide text-red-600">
                <AlertTriangle size={12} />
                {lead.alerta_motivo ?? 'Alerta activa'}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                Servicio de interés
              </p>
              <p className="text-sm text-gray-800 font-medium mt-1">
                {lead.servicio_interes}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                Canal
              </p>
              <p className="text-sm text-gray-800 font-medium mt-1">
                {lead.canal_captacion ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                Encargado
              </p>
              <p className="text-sm text-gray-800 font-medium mt-1">
                {lead.encargado_nombre ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                Fecha cierre estimada
              </p>
              <p className="text-sm text-gray-800 font-medium mt-1">
                {lead.fecha_cierre
                  ? formatFecha(lead.fecha_cierre)
                  : '—'
                }
              </p>
            </div>
          </div>

          {lead.desafio_oportunidad && (
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">
                Desafío u oportunidad
              </p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">
                {lead.desafio_oportunidad}
              </p>
            </div>
          )}

          {lead.notas_contacto && (
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">
                Notas de contacto
              </p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">
                {lead.notas_contacto}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">
              Actividades ({actividades.length})
            </p>

            {actividades.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Sin actividades.</p>
            ) : (
              <div className="space-y-2">
                {actividades.map((act) => {
                  const vencida = act.estado === EstadoActividad.Pendiente &&
                    new Date(act.fecha_fin) < new Date()

                  return (
                    <div
                      key={act.id}
                      className={`flex items-start justify-between p-3
                        rounded-xl border text-sm
                        ${vencida
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-100 bg-white'
                        }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-base">
                          {TIPO_ICONOS[act.tipo]}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-600 uppercase">
                              {act.tipo}
                            </span>
                            {vencida && (
                              <span className="text-xs font-bold text-red-500
                                bg-red-100 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                <AlertTriangle size={10} />
                                VENCIDA
                              </span>
                            )}
                          </div>
                          {act.notas && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {act.notas}
                            </p>
                          )}
                          {act.responsable_nombre && (
                            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                              <User size={10} />
                              {act.responsable_nombre}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0 ml-2">
                        {formatFecha(act.fecha_fin)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                Cotizaciones ({cotizaciones.length})
              </p>
              <button
                onClick={() => {
                  onCerrar()
                  router.push(`/cotizaciones/nueva?lead=${lead.id}`)
                }}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1
                  text-xs font-semibold text-emerald-600 hover:bg-emerald-50
                  transition-colors"
              >
                <Plus size={12} />
                Nueva
              </button>
            </div>

            {cotizaciones.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200
                px-4 py-5 text-center">
                <FileText size={18} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">
                  Sin cotizaciones asociadas.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {cotizaciones.map((cotizacion) => (
                  <button
                    key={cotizacion.id}
                    type="button"
                    onClick={() => {
                      onCerrar()
                      router.push(ROUTES.cotizacion(cotizacion.id))
                    }}
                    className="w-full text-left rounded-xl border border-gray-100
                      bg-white p-3 hover:border-emerald-200 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-emerald-600">
                          {cotizacion.codigo}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {cotizacion.nombre_servicio}
                        </p>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-1
                        rounded-lg uppercase tracking-wide shrink-0
                        ${COTIZACION_COLORS[cotizacion.estado]}`}>
                        {cotizacion.estado}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-900 mt-2">
                      {formatMonto(cotizacion.monto, cotizacion.tipo)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">
              Historial comercial
            </p>
            <div className="space-y-2">
              <div className="flex gap-2 text-sm">
                <History size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-700">Lead creado</p>
                  <p className="text-xs text-gray-400">
                    {formatFecha(lead.created_at)}
                  </p>
                </div>
              </div>
              {cotizaciones.slice(0, 2).map((cotizacion) => (
                <div key={`hist-cot-${cotizacion.id}`} className="flex gap-2 text-sm">
                  <FileText size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-700">
                      Cotización {cotizacion.estado}
                    </p>
                    <p className="text-xs text-gray-400">
                      {cotizacion.codigo} · {formatFecha(cotizacion.updated_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => {
              onCerrar()
              router.push(ROUTES.lead(lead.id))
            }}
            className="w-full flex items-center justify-center gap-2
              bg-emerald-700 hover:bg-emerald-800 text-white font-semibold
              py-3 rounded-xl text-sm transition-colors"
          >
            <ExternalLink size={16} />
            Gestionar lead
          </button>
        </div>
      </div>
    </>
  )
}
