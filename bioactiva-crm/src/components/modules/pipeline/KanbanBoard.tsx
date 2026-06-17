'use client'

import { useEffect, useRef } from 'react'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { KanbanColumn } from '@/components/modules/pipeline/KanbanColumn'
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

const COLUMNAS = [
  {
    key:         'prospecto'      as const,
    titulo:      'En prospecto',
    estado:      LeadState.Prospecto,
    color:       'bg-gray-400',
    overClasses: 'bg-gray-50 border-gray-300 ring-gray-200',
    sideBorder:  'border-l-gray-300 border-r-gray-300',
  },
  {
    key:         'ofertado'       as const,
    titulo:      'Ofertado',
    estado:      LeadState.Ofertado,
    color:       'bg-amber-400',
    overClasses: 'bg-amber-50 border-amber-200 ring-amber-200',
    sideBorder:  'border-l-amber-200 border-r-amber-200',
  },
  {
    key:         'cierreVenta'    as const,
    titulo:      'Cierre con venta',
    estado:      LeadState.CierreVenta,
    color:       'bg-emerald-500',
    overClasses: 'bg-emerald-50 border-emerald-200 ring-emerald-200',
    sideBorder:  'border-l-emerald-200 border-r-emerald-200',
  },
  {
    key:         'cierreSinVenta' as const,
    titulo:      'Cierre sin venta',
    estado:      LeadState.CierreSinVenta,
    color:       'bg-red-400',
    overClasses: 'bg-red-50 border-red-200 ring-red-200',
    sideBorder:  'border-l-red-200 border-r-red-200',
  },
]

export function KanbanBoard({
  columnas,
  onClickLead,
  onQuickAction,
  onMoveLead,
}: KanbanBoardProps) {
  // Ref para no re-registrar el monitor cuando cambia el callback
  const onMoveLeadRef = useRef(onMoveLead)
  useEffect(() => { onMoveLeadRef.current = onMoveLead }, [onMoveLead])

  useEffect(() => {
    return monitorForElements({
      onDrop: ({ source, location }) => {
        const lead      = source.data.lead as Lead | undefined
        const dropTarget = location.current.dropTargets[0]
        if (!lead || !dropTarget) return
        const estado = dropTarget.data.estado as LeadState | undefined
        if (!estado || lead.estado === estado) return
        onMoveLeadRef.current(lead, estado)
      },
    })
  }, [])

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNAS.map((col) => {
        const columna = columnas[col.key]
        return (
          <KanbanColumn
            key={col.key}
            titulo={col.titulo}
            estado={col.estado}
            color={col.color}
            overClasses={col.overClasses}
            sideBorder={col.sideBorder}
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
  )
}
