'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { usePipeline, useActualizarEstadoLead } from '@/hooks/pipeline/useLeads'
import { KanbanBoard } from '@/components/modules/pipeline/KanbanBoard'
import { LeadFiltros } from '@/components/modules/pipeline/LeadFiltros'
import { LeadDrawer } from '@/components/modules/pipeline/LeadDrawer'
import { LeadFiltros as FiltrosType, Lead, PipelineData } from '@/types/lead.types'
import { LeadState } from '@/types/enums'

const FILTROS_INICIALES: FiltrosType = {}

function aplicarFiltros(pipeline: PipelineData, filtros: FiltrosType): PipelineData {
  const cols: Array<keyof Omit<PipelineData, 'total'>> = [
    'prospecto', 'ofertado', 'cierreVenta', 'cierreSinVenta',
  ]

  const search = filtros.search?.trim().toLowerCase()

  const filtrar = (leads: Lead[]): Lead[] => {
    let r = leads

    if (search) {
      r = r.filter(
        (l) =>
          l.organizacion_nombre?.toLowerCase().includes(search) ||
          l.servicio_interes.toLowerCase().includes(search) ||
          l.encargado_nombre?.toLowerCase().includes(search) ||
          l.codigo.toLowerCase().includes(search)
      )
    }

    if (filtros.id_encargado) {
      r = r.filter((l) => l.id_encargado === filtros.id_encargado)
    }

    if (filtros.canal_captacion) {
      r = r.filter((l) => l.canal_captacion === filtros.canal_captacion)
    }

    if (filtros.solo_alerta) {
      r = r.filter((l) => l.tiene_alerta)
    }

    if (filtros.fecha_desde) {
      r = r.filter(
        (l) => new Date(l.created_at) >= new Date(filtros.fecha_desde!)
      )
    }

    if (filtros.fecha_hasta) {
      r = r.filter(
        (l) => new Date(l.created_at) <= new Date(filtros.fecha_hasta!)
      )
    }

    return r
  }

  // Si hay filtro de estado, sólo mostrar esa columna con leads
  if (filtros.estado) {
    const result: PipelineData = {
      prospecto: [], ofertado: [], cierreVenta: [], cierreSinVenta: [], total: 0,
    }
    const colPorEstado: Record<LeadState, keyof Omit<PipelineData, 'total'>> = {
      [LeadState.Prospecto]:      'prospecto',
      [LeadState.Ofertado]:       'ofertado',
      [LeadState.CierreVenta]:    'cierreVenta',
      [LeadState.CierreSinVenta]: 'cierreSinVenta',
    }
    const col = colPorEstado[filtros.estado]
    result[col] = filtrar(pipeline[col])
    result.total = result[col].length
    return result
  }

  const filtered: Partial<PipelineData> = {}
  let total = 0
  for (const col of cols) {
    filtered[col] = filtrar(pipeline[col])
    total += filtered[col]!.length
  }

  return { ...(filtered as Omit<PipelineData, 'total'>), total }
}

export default function PipelinePage() {
  const router  = useRouter()
  const [filtros, setFiltros]                   = useState<FiltrosType>(FILTROS_INICIALES)
  const [leadSeleccionado, setLeadSeleccionado] = useState<Lead | null>(null)

  const { data: pipelineRaw, isLoading, isError } = usePipeline()
  const { mutate: actualizarEstado }              = useActualizarEstadoLead()

  // Filtrado instantáneo en cliente — sin llamadas adicionales a la API/mock
  const pipeline = useMemo(
    () => (pipelineRaw ? aplicarFiltros(pipelineRaw, filtros) : null),
    [pipelineRaw, filtros]
  )

  const handleLimpiarFiltros = () => setFiltros(FILTROS_INICIALES)

  const handleEstadoChange = (leadId: number, estado: LeadState) => {
    actualizarEstado({ id: leadId, estado })
  }

  const total = pipeline
    ? pipeline.prospecto.length +
      pipeline.ofertado.length +
      pipeline.cierreVenta.length +
      pipeline.cierreSinVenta.length
    : 0

  return (
    <div className="space-y-6">

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
        onChange={setFiltros}
        onLimpiar={handleLimpiarFiltros}
        total={total}
      />

      {/* Loading (solo en la carga inicial) */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-emerald-600
            border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-red-500">
            Error al cargar el pipeline. Intente nuevamente.
          </p>
        </div>
      )}

      {/* Kanban — se muestra incluso si hay filtros activos sin resultados */}
      {!isLoading && !isError && pipeline && (
        <KanbanBoard
          pipeline={pipeline}
          onAddLead={() => router.push('/pipeline/nuevo')}
          onClickLead={setLeadSeleccionado}
          onEstadoChange={handleEstadoChange}
        />
      )}

      {/* Drawer */}
      {leadSeleccionado && (
        <LeadDrawer
          lead={leadSeleccionado}
          onCerrar={() => setLeadSeleccionado(null)}
        />
      )}
    </div>
  )
}
