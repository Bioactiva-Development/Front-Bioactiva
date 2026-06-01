'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { usePipeline } from '@/hooks/pipeline/useLeads'
import { KanbanBoard } from '@/components/modules/pipeline/KanbanBoard'
import { LeadFiltros } from '@/components/modules/pipeline/LeadFiltros'
import { LeadDrawer } from '@/components/modules/pipeline/LeadDrawer'
import { LeadFiltros as FiltrosType, Lead } from '@/types/lead.types'
import { LeadState } from '@/types/enums'

const FILTROS_INICIALES: FiltrosType = {}

export default function PipelinePage() {
  const router                          = useRouter()
  const [filtros, setFiltros]           = useState<FiltrosType>(FILTROS_INICIALES)
  const [leadSeleccionado, setLeadSeleccionado] = useState<Lead | null>(null)

  const { data: pipeline, isLoading, isError } = usePipeline(filtros)

  const handleLimpiarFiltros = () => setFiltros(FILTROS_INICIALES)

  const handleAddLead = (estado: LeadState = LeadState.Prospecto) => {
    router.push(`/pipeline/nuevo?estado=${encodeURIComponent(estado)}`)
  }

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

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-emerald-600
            border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-red-500">
            Error al cargar el pipeline. Intente nuevamente.
          </p>
        </div>
      )}

      {/* Kanban */}
      {!isLoading && !isError && pipeline && (
        <KanbanBoard
          pipeline={pipeline}
          onAddLead={handleAddLead}
          onClickLead={setLeadSeleccionado}
          onQuickAction={handleQuickAction}
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
