'use client'

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { KanbanColumn } from '@/components/modules/pipeline/KanbanColumn'
import { PipelineData, Lead } from '@/types/lead.types'
import { LeadState } from '@/types/enums'

interface KanbanBoardProps {
  pipeline:    PipelineData
  onClickLead: (lead: Lead) => void
  onQuickAction?: (
    lead: Lead,
    action: 'detalle' | 'editar' | 'actividad' | 'cotizacion' | 'seguimiento'
  ) => void
  onMoveLead: (lead: Lead, estado: LeadState) => void
}

const COLUMNAS = [
  {
    key: 'prospecto' as keyof PipelineData,
    titulo: 'En prospecto',
    estado: LeadState.Prospecto,
    color: 'bg-gray-400',
  },
  {
    key: 'ofertado' as keyof PipelineData,
    titulo: 'Ofertado',
    estado: LeadState.Ofertado,
    color: 'bg-amber-400',
  },
  {
    key: 'cierreVenta' as keyof PipelineData,
    titulo: 'Cierre con venta',
    estado: LeadState.CierreVenta,
    color: 'bg-emerald-500',
  },
  {
    key: 'cierreSinVenta' as keyof PipelineData,
    titulo: 'Cierre sin venta',
    estado: LeadState.CierreSinVenta,
    color: 'bg-red-400',
  },
]

export function KanbanBoard({
  pipeline,
  onClickLead,
  onQuickAction,
  onMoveLead,
}: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const lead = event.active.data.current?.lead as Lead | undefined
    const estado = event.over?.data.current?.estado as LeadState | undefined

    if (!lead || !estado || lead.estado === estado) return
    onMoveLead(lead, estado)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNAS.map((col) => {
          const leads = pipeline[col.key]
          if (!Array.isArray(leads)) return null

          return (
            <KanbanColumn
              key={col.key}
              titulo={col.titulo}
              estado={col.estado}
              leads={leads}
              color={col.color}
              onClickLead={onClickLead}
              onQuickAction={onQuickAction}
            />
          )
        })}
      </div>
    </DndContext>
  )
}
