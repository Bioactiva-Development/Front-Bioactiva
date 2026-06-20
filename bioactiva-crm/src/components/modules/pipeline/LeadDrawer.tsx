'use client'

import { useRouter } from 'next/navigation'
import {
  X, ExternalLink, User, AlertTriangle,
} from 'lucide-react'
import { Lead } from '@/types/lead.types'
import {
  LeadState,
  TipoActividad,
  EstadoActividad,
} from '@/types/enums'
import { useActividades } from '@/hooks/pipeline/useActividades'
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

export function LeadDrawer({ lead, onCerrar, onMoverLead }: LeadDrawerProps) {
  const router = useRouter()
  const { data: actividades = [] } = useActividades(lead.id)

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
