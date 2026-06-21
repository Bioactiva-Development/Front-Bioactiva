'use client'

import { useRouter } from 'next/navigation'
import {
  X, ExternalLink, User, AlertTriangle,
  CalendarClock, FileText, DollarSign,
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
import { getAllowedLeadTransitions } from '@/lib/utils/lead-flow.utils'

interface LeadDrawerProps {
  lead:         Lead
  onCerrar:     () => void
  onMoverLead?: (lead: Lead, estado: LeadState) => void
}

const ETAPAS_PIPELINE = [
  {
    estado:      LeadState.Prospecto,
    label:       'En prospecto',
    buttonClass: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  },
  {
    estado:      LeadState.Ofertado,
    label:       'Ofertado',
    buttonClass: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
  },
  {
    estado:      LeadState.CierreVenta,
    label:       'Cierre con venta',
    buttonClass: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  },
  {
    estado:      LeadState.CierreSinVenta,
    label:       'Cierre sin venta',
    buttonClass: 'bg-red-50 text-red-600 hover:bg-red-100',
  },
]

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

function EmptySeccion({
  icono,
  mensaje,
}: {
  icono:   React.ReactNode
  mensaje: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl
      border border-dashed border-gray-200 bg-gray-50/60 py-6 text-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-full
        bg-white text-gray-300 shadow-sm">
        {icono}
      </div>
      <p className="text-xs text-gray-400">{mensaje}</p>
    </div>
  )
}

export function LeadDrawer({ lead, onCerrar, onMoverLead }: LeadDrawerProps) {
  const router = useRouter()
  const { data: actividades = [] }  = useActividades(lead.id)
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

          {actividades.length === 0 && cotizaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3
              rounded-2xl border border-dashed border-gray-200 bg-gray-50/60
              px-6 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center
                rounded-full bg-white text-gray-300 shadow-sm">
                <FileText size={22} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-600">
                  Aún no hay movimientos
                </p>
                <p className="text-xs text-gray-400">
                  Este lead todavía no tiene actividades ni cotización
                  registrada.
                </p>
              </div>
              <button
                onClick={() => {
                  onCerrar()
                  router.push(ROUTES.lead(lead.id))
                }}
                className="inline-flex items-center gap-1.5 rounded-lg
                  px-3 py-1.5 text-xs font-semibold text-emerald-600
                  hover:bg-emerald-50 transition-colors"
              >
                <ExternalLink size={13} />
                Gestionar lead
              </button>
            </div>
          ) : (
          <>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">
              Actividades ({actividades.length})
            </p>

            {actividades.length === 0 ? (
              <EmptySeccion
                icono={<CalendarClock size={16} />}
                mensaje="Sin actividades registradas."
              />
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
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">
              Cotización
            </p>

            {cotizaciones.length === 0 ? (
              <EmptySeccion
                icono={<FileText size={16} />}
                mensaje="Sin cotización generada."
              />
            ) : (
              <div className="space-y-2">
                {cotizaciones.map((cot) => (
                  <button
                    key={cot.id}
                    type="button"
                    onClick={() => {
                      onCerrar()
                      router.push(ROUTES.cotizacion(cot.id))
                    }}
                    className="w-full flex items-start justify-between gap-2
                      p-3 rounded-xl border border-gray-100 bg-white text-left
                      hover:border-emerald-200 hover:shadow-sm transition-all"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-600">
                          {cot.codigo ?? `#${cot.id}`}
                        </span>
                        <span className={`text-xs font-bold px-1.5 py-0.5
                          rounded-md uppercase tracking-wide
                          ${COTIZACION_COLORS[cot.estado]}`}>
                          {cot.estado}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {cot.nombre_servicio}
                      </p>
                      <p className="text-xs font-bold text-gray-900 mt-1
                        flex items-center gap-1">
                        <DollarSign size={11} className="text-gray-400" />
                        {formatMonto(cot.monto, cot.tipo)}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">
                      {formatFecha(cot.fecha_cot)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          </>
          )}
        </div>

        {/* Cambiar etapa — solo en móvil, solo a estados destino permitidos */}
        {onMoverLead && getAllowedLeadTransitions(lead.estado).length > 0 && (
          <div className="lg:hidden px-6 py-4 border-t border-gray-100 space-y-3">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
              Cambiar etapa
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ETAPAS_PIPELINE
                .filter((etapa) => getAllowedLeadTransitions(lead.estado).includes(etapa.estado))
                .map((etapa) => (
                  <button
                    key={etapa.estado}
                    type="button"
                    onClick={() => {
                      onCerrar()
                      onMoverLead(lead, etapa.estado)
                    }}
                    className={`py-2.5 rounded-xl text-xs font-semibold transition-colors ${etapa.buttonClass}`}
                  >
                    {etapa.label}
                  </button>
                ))}
            </div>
          </div>
        )}

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
