'use client'

import { KanbanColumn } from '@/components/modules/pipeline/KanbanColumn'
import { PipelineData, Lead } from '@/types/lead.types'

interface KanbanBoardProps {
  pipeline:    PipelineData
  onAddLead:   () => void
  onClickLead: (lead: Lead) => void
  onQuickAction?: (
    lead: Lead,
    action: 'detalle' | 'editar' | 'actividad' | 'cotizacion' | 'seguimiento'
  ) => void
}

const COLUMNAS = [
  { key: 'prospecto'     as keyof PipelineData, titulo: 'En prospecto',    color: 'bg-gray-400' },
  { key: 'ofertado'      as keyof PipelineData, titulo: 'Ofertado',        color: 'bg-amber-400' },
  { key: 'cierreVenta'   as keyof PipelineData, titulo: 'Cierre con venta', color: 'bg-emerald-500' },
  { key: 'cierreSinVenta' as keyof PipelineData, titulo: 'Cierre sin venta', color: 'bg-red-400' },
]

export function KanbanBoard({
  pipeline,
  onAddLead,
  onClickLead,
  onQuickAction,
}: KanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNAS.map((col) => {
        const leads = pipeline[col.key]
        if (!Array.isArray(leads)) return null

        return (
          <KanbanColumn
            key={col.key}
            titulo={col.titulo}
            leads={leads}
            color={col.color}
            onAddLead={onAddLead}
            onClickLead={onClickLead}
            onQuickAction={onQuickAction}
          />
        )
      })}
    </div>
  )
}
