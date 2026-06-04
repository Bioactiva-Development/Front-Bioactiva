'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { KanbanColumn } from '@/components/modules/pipeline/KanbanColumn'
import { LeadCard } from '@/components/modules/pipeline/LeadCard'
import { PipelineData, Lead } from '@/types/lead.types'
import { LeadState } from '@/types/enums'

type ColumnKey = Exclude<keyof PipelineData, 'total'>

const COLUMNAS: {
  key:    ColumnKey
  titulo: string
  color:  string
  estado: LeadState
}[] = [
  { key: 'prospecto',      titulo: 'En prospecto',    color: 'bg-gray-400',    estado: LeadState.Prospecto      },
  { key: 'ofertado',       titulo: 'Ofertado',        color: 'bg-amber-400',   estado: LeadState.Ofertado       },
  { key: 'cierreVenta',    titulo: 'Cierre con venta', color: 'bg-emerald-500', estado: LeadState.CierreVenta    },
  { key: 'cierreSinVenta', titulo: 'Cierre sin venta', color: 'bg-red-400',     estado: LeadState.CierreSinVenta },
]

interface KanbanBoardProps {
  pipeline:        PipelineData
  onAddLead:       () => void
  onClickLead:     (lead: Lead) => void
  onEstadoChange:  (leadId: number, estado: LeadState) => void
}

export function KanbanBoard({
  pipeline,
  onAddLead,
  onClickLead,
  onEstadoChange,
}: KanbanBoardProps) {
  const [activeLead, setActiveLead] = useState<Lead | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function findLead(id: number): Lead | null {
    for (const col of COLUMNAS) {
      const found = pipeline[col.key].find((l) => l.id === id)
      if (found) return found
    }
    return null
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveLead(findLead(event.active.id as number))
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveLead(null)
    const { active, over } = event
    if (!over) return

    const leadId    = active.id as number
    const targetKey = over.id as ColumnKey
    const col       = COLUMNAS.find((c) => c.key === targetKey)
    if (!col) return

    const current = findLead(leadId)
    if (!current || current.estado === col.estado) return

    onEstadoChange(leadId, col.estado)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNAS.map((col) => {
          const leads = pipeline[col.key]
          if (!Array.isArray(leads)) return null

          return (
            <KanbanColumn
              key={col.key}
              id={col.key}
              titulo={col.titulo}
              leads={leads}
              color={col.color}
              onAddLead={onAddLead}
              onClickLead={onClickLead}
            />
          )
        })}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeLead ? (
          <LeadCard lead={activeLead} onClick={() => {}} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
