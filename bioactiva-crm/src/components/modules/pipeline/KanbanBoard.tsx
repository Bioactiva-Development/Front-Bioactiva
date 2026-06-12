'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { KanbanColumn } from '@/components/modules/pipeline/KanbanColumn'
import { LeadCard } from '@/components/modules/pipeline/LeadCard'
import { Lead } from '@/types/lead.types'
import { LeadState } from '@/types/enums'
import { PipelineColumn } from '@/hooks/pipeline/useLeads'

export interface PipelineColumns {
  prospecto:      PipelineColumn
  ofertado:       PipelineColumn
  cierreVenta:    PipelineColumn
  cierreSinVenta: PipelineColumn
}

interface KanbanBoardProps {
  columnas:    PipelineColumns
  onClickLead: (lead: Lead) => void
  onQuickAction?: (
    lead: Lead,
    action: 'detalle' | 'editar' | 'actividad' | 'cotizacion' | 'seguimiento'
  ) => void
  onMoveLead: (lead: Lead, estado: LeadState) => void
}

// Orden EN_PROSPECTO → OFERTADO → CIERRE_CON_VENTA → CIERRE_SIN_VENTA.
const COLUMNAS = [
  { key: 'prospecto'      as const, titulo: 'En prospecto',     estado: LeadState.Prospecto,      color: 'bg-gray-400' },
  { key: 'ofertado'       as const, titulo: 'Ofertado',         estado: LeadState.Ofertado,       color: 'bg-amber-400' },
  { key: 'cierreVenta'    as const, titulo: 'Cierre con venta', estado: LeadState.CierreVenta,    color: 'bg-emerald-500' },
  { key: 'cierreSinVenta' as const, titulo: 'Cierre sin venta', estado: LeadState.CierreSinVenta, color: 'bg-red-400' },
]

export function KanbanBoard({
  columnas,
  onClickLead,
  onQuickAction,
  onMoveLead,
}: KanbanBoardProps) {
  const [activeLead, setActiveLead] = useState<Lead | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const lead = event.active.data.current?.lead as Lead | undefined
    if (lead) setActiveLead(lead)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveLead(null)
    const lead = event.active.data.current?.lead as Lead | undefined
    const estado = event.over?.data.current?.estado as LeadState | undefined
    if (!lead || !estado || lead.estado === estado) return
    onMoveLead(lead, estado)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNAS.map((col) => {
          const columna = columnas[col.key]

          return (
            <KanbanColumn
              key={col.key}
              titulo={col.titulo}
              estado={col.estado}
              color={col.color}
              leads={columna.leads}
              total={columna.total}
              isLoading={columna.isLoading}
              hasMore={columna.hasMore}
              loadingMore={columna.loadingMore}
              onClickLead={onClickLead}
              onQuickAction={onQuickAction}
              onCargarMas={columna.cargarMas}
            />
          )
        })}
      </div>

      {/* Renderiza el card en el body — siempre por encima de todo */}
      <DragOverlay dropAnimation={null}>
        {activeLead ? (
          <LeadCard
            lead={activeLead}
            onClick={() => {}}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
