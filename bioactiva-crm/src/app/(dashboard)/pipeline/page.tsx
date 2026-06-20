'use client'

import { Suspense, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, Clock, Loader2, Plus, User } from 'lucide-react'
import { SEMAFORO_UI } from '@/lib/utils/semaforo.utils'
import { useMoverLeadPipeline, usePipelineColumns } from '@/hooks/pipeline/useLeads'
import { useCotizacionesPorLead } from '@/hooks/cotizaciones/useCotizaciones'
import { KanbanBoard } from '@/components/modules/pipeline/KanbanBoard'
import { LeadFiltros } from '@/components/modules/pipeline/LeadFiltros'
import { LeadDrawer } from '@/components/modules/pipeline/LeadDrawer'
import { LeadFiltros as FiltrosType, Lead } from '@/types/lead.types'
import { EstadoCot, LeadState, Sector, TipoMoneda } from '@/types/enums'
import { ActivityAlertFilter } from '@/types/lead.types'
import { getErrorMessage } from '@/lib/utils/error.utils'

const COLUMNAS_MOVIL = [
  { key: 'prospecto'      as const, label: 'Prospecto', activeClass: 'bg-gray-700 text-white' },
  { key: 'ofertado'       as const, label: 'Ofertado',  activeClass: 'bg-amber-500 text-white' },
  { key: 'cierreVenta'    as const, label: 'C. Venta',  activeClass: 'bg-emerald-600 text-white' },
  { key: 'cierreSinVenta' as const, label: 'Sin Venta', activeClass: 'bg-red-500 text-white' },
]

function formatMonto(monto: number, tipo: TipoMoneda): string {
  return `${tipo === TipoMoneda.Soles ? 'S/' : 'US$'} ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
}

function LeadListItem({ lead, onClick }: { lead: Lead; onClick: (lead: Lead) => void }) {
  const { data: cotizaciones = [] } = useCotizacionesPorLead(lead.id)
  const cot = cotizaciones.find((c) => c.estado !== EstadoCot.Rechazada) ?? null

  // Semáforo de actividades (backend: activityAlert): verde → amarillo → naranja → rojo.
  const sem = lead.activity_alert ? SEMAFORO_UI[lead.activity_alert] : null

  return (
    <button
      type="button"
      onClick={() => onClick(lead)}
      className={`w-full bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left
        hover:border-emerald-200 hover:shadow-md transition-all active:scale-[0.99]
        ${sem ? `border-l-4 ${sem.accent}` : ''}`}
    >
      {(sem || lead.tiene_alerta) && (
        <div className="mb-2 flex items-center gap-1.5 flex-wrap">
          {sem && (
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase
              px-2.5 py-1 rounded-full ${sem.pill}`}>
              <span className={`w-2 h-2 rounded-full ${sem.dot} ${sem.pulse ? 'animate-pulse' : ''}`} />
              {sem.label}
            </span>
          )}
          {lead.tiene_alerta && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase
              px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              <Clock size={9} /> {lead.alerta_motivo ?? '+30 días sin avance'}
            </span>
          )}
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900 truncate">{lead.organizacion_nombre}</p>
          {lead.servicio_interes && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{lead.servicio_interes}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          {cot
            ? <p className="text-sm font-bold text-emerald-600">{formatMonto(cot.monto, cot.tipo)}</p>
            : <p className="text-xs text-gray-300">Sin cotización</p>
          }
        </div>
      </div>

      {lead.encargado_nombre && (
        <div className="mt-2 flex items-center gap-1.5">
          <User size={11} className="text-gray-300 shrink-0" />
          <p className="text-xs text-gray-500 truncate">{lead.encargado_nombre}</p>
        </div>
      )}
    </button>
  )
}

// Los filtros viven en la URL (camelCase del contrato) para que sean compartibles.
function filtrosFromParams(sp: URLSearchParams): FiltrosType {
  const filtros: FiltrosType = {}

  const estado = sp.get('estado')
  if (estado && (Object.values(LeadState) as string[]).includes(estado)) {
    filtros.estado = estado as LeadState
  }

  const idEncargado = sp.get('idEncargado')
  if (idEncargado) filtros.id_encargado = Number(idEncargado)

  const idOrg = sp.get('idOrg')
  if (idOrg) filtros.id_org = idOrg

  const sector = sp.get('sector')
  if (sector && (Object.values(Sector) as string[]).includes(sector)) {
    filtros.sector = sector as Sector
  }

  const search = sp.get('search')
  if (search) filtros.search = search

  const fechaDesde = sp.get('fechaDesde')
  if (fechaDesde) filtros.fecha_desde = fechaDesde

  const fechaHasta = sp.get('fechaHasta')
  if (fechaHasta) filtros.fecha_hasta = fechaHasta

  const ALERTAS: ActivityAlertFilter[] = [
    'SIN_ACTIVIDADES', 'PENDIENTE', 'EN_RIESGO', 'POR_VENCER',
  ]
  const alerta = sp.get('alertaActividad')
  if (alerta && (ALERTAS as string[]).includes(alerta)) {
    filtros.alerta_actividad = alerta as ActivityAlertFilter
  }

  return filtros
}

function paramsFromFiltros(filtros: FiltrosType): string {
  const sp = new URLSearchParams()
  if (filtros.estado) sp.set('estado', filtros.estado)
  if (filtros.id_encargado) sp.set('idEncargado', String(filtros.id_encargado))
  if (filtros.id_org) sp.set('idOrg', filtros.id_org)
  if (filtros.sector) sp.set('sector', filtros.sector)
  if (filtros.search) sp.set('search', filtros.search)
  if (filtros.fecha_desde) sp.set('fechaDesde', filtros.fecha_desde)
  if (filtros.fecha_hasta) sp.set('fechaHasta', filtros.fecha_hasta)
  if (filtros.alerta_actividad) sp.set('alertaActividad', filtros.alerta_actividad)
  return sp.toString()
}

function PipelineContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const spString     = searchParams.toString()
  const filtros      = useMemo(() => filtrosFromParams(new URLSearchParams(spString)), [spString])

  const [leadSeleccionado, setLeadSeleccionado] = useState<Lead | null>(null)
  const [dragError, setDragError] = useState<string | null>(null)
  const [tabMovil, setTabMovil] = useState<'prospecto' | 'ofertado' | 'cierreVenta' | 'cierreSinVenta'>('prospecto')

  const columnas = usePipelineColumns(filtros)
  const { mutateAsync: moverLead, isPending: actualizandoEstado } =
    useMoverLeadPipeline()

  const total =
    columnas.prospecto.total +
    columnas.ofertado.total +
    columnas.cierreVenta.total +
    columnas.cierreSinVenta.total

  const isLoading =
    columnas.prospecto.isLoading ||
    columnas.ofertado.isLoading ||
    columnas.cierreVenta.isLoading ||
    columnas.cierreSinVenta.isLoading

  const isError =
    columnas.prospecto.isError &&
    columnas.ofertado.isError &&
    columnas.cierreVenta.isError &&
    columnas.cierreSinVenta.isError

  const handleFiltrosChange = (next: FiltrosType) => {
    const query = paramsFromFiltros(next)
    router.replace(query ? `/pipeline?${query}` : '/pipeline', { scroll: false })
  }

  const handleLimpiarFiltros = () => router.replace('/pipeline', { scroll: false })

  const handleQuickAction = (
    lead: Lead,
    action: 'detalle' | 'editar' | 'actividad' | 'cotizacion' | 'seguimiento'
  ) => {
    if (action === 'cotizacion') {
      router.push(`/cotizaciones/nueva?lead=${lead.id}`)
      return
    }

    const accionMap = {
      detalle: '',
      editar: '?accion=editar',
      actividad: '?accion=actividad',
      seguimiento: '?accion=seguimiento',
    } as const

    router.push(`/pipeline/${lead.id}${accionMap[action]}`)
  }

  const handleMoveLead = async (lead: Lead, estado: LeadState) => {
    try {
      setDragError(null)
      await moverLead({ lead, estado })
    } catch (err: unknown) {
      // 409: el lead tiene una actividad pendiente y debe resolverse antes.
      const status = (err as { status?: number })?.status
      setDragError(
        status === 409
          ? 'El lead tiene una actividad pendiente. Complétala o cancélala antes de cambiar el estado.'
          : getErrorMessage(err, 'No se pudo actualizar el estado del lead.')
      )
    }
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-100
          rounded-xl px-1 py-1 shadow-sm">
          <button className="px-4 py-2 rounded-lg text-sm font-semibold
            bg-emerald-50 text-emerald-700">
            Pipeline
          </button>
        </div>
        <button
          onClick={() => router.push('/pipeline/nuevo')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl
            bg-emerald-600 hover:bg-emerald-700 text-white
            text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          Nuevo Lead
        </button>
      </div>

      {/* Filtros */}
      <LeadFiltros
        filtros={filtros}
        onChange={handleFiltrosChange}
        onLimpiar={handleLimpiarFiltros}
        total={total}
      />

      {dragError && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200
          bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <p>{dragError}</p>
        </div>
      )}

      {/* Error global (las 4 columnas fallaron) */}
      {isError && (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-red-500">
            Error al cargar el pipeline. Intente nuevamente.
          </p>
        </div>
      )}

      {/* ── MÓVIL: tabs + lista ── */}
      {!isError && (
        <div className="lg:hidden space-y-3">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
            {COLUMNAS_MOVIL.map((col) => {
              const isActive = tabMovil === col.key
              const count = columnas[col.key].total
              return (
                <button
                  key={col.key}
                  onClick={() => setTabMovil(col.key)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors
                    ${isActive ? col.activeClass : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {col.label}
                  {count > 0 && (
                    <span className={`ml-1 ${isActive ? 'opacity-75' : 'text-gray-400'}`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="space-y-2">
            {columnas[tabMovil].isLoading && columnas[tabMovil].leads.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="animate-spin text-gray-300" />
              </div>
            ) : columnas[tabMovil].leads.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400 italic">Sin leads en esta etapa</p>
              </div>
            ) : (
              columnas[tabMovil].leads.map((lead) => (
                <LeadListItem key={lead.id} lead={lead} onClick={setLeadSeleccionado} />
              ))
            )}
          </div>

          {columnas[tabMovil].hasMore && (
            <button
              type="button"
              onClick={columnas[tabMovil].cargarMas}
              disabled={columnas[tabMovil].loadingMore}
              className="w-full py-3 text-sm font-semibold text-emerald-600
                bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors disabled:opacity-60"
            >
              {columnas[tabMovil].loadingMore
                ? 'Cargando...'
                : `Ver más (${columnas[tabMovil].leads.length} de ${columnas[tabMovil].total})`}
            </button>
          )}
        </div>
      )}

      {/* ── DESKTOP: kanban con drag & drop ── */}
      {!isError && (
        <div className="hidden lg:block">
          <KanbanBoard
            columnas={columnas}
            onClickLead={setLeadSeleccionado}
            onQuickAction={handleQuickAction}
            onMoveLead={handleMoveLead}
          />
        </div>
      )}

      {(actualizandoEstado || isLoading) && (
        <div className="fixed bottom-4 right-4 rounded-xl bg-emerald-700
          px-4 py-3 text-sm font-semibold text-white shadow-lg">
          {actualizandoEstado ? 'Actualizando estado...' : 'Cargando pipeline...'}
        </div>
      )}

      {/* Drawer */}
      {leadSeleccionado && (
        <LeadDrawer
          lead={leadSeleccionado}
          onCerrar={() => setLeadSeleccionado(null)}
          onMoverLead={handleMoveLead}
        />
      )}
    </div>
  )
}

export default function PipelinePage() {
  return (
    <Suspense fallback={null}>
      <PipelineContent />
    </Suspense>
  )
}
