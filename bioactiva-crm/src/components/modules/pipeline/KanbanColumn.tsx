'use client'

import { useDroppable } from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import { Lead } from '@/types/lead.types'
import { LeadState } from '@/types/enums'
import { LeadCard } from '@/components/modules/pipeline/LeadCard'

interface KanbanColumnProps {
  titulo:    string
  estado:    LeadState
  leads:     Lead[]
  color:     string
  onAddLead: (estado: LeadState) => void
  onClickLead: (lead: Lead) => void
  onQuickAction?: (
    lead: Lead,
    action: 'detalle' | 'editar' | 'actividad' | 'cotizacion' | 'seguimiento'
  ) => void
}

export function KanbanColumn({
  id,
  titulo,
  estado,
  leads,
  color,
  onAddLead,
  onClickLead,
  onQuickAction,
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `column-${estado}`,
    data: { estado },
  })

  return (
    <div
      ref={setNodeRef}
      data-column-state={estado}
      className={`flex flex-col min-w-70 flex-1 rounded-xl transition-colors
        ${isOver ? 'bg-emerald-50/60 ring-2 ring-emerald-100' : ''}`}
    >

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
          <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            {titulo}
          </span>
          <span className="text-xs font-bold text-gray-400 bg-gray-100
            px-2 py-0.5 rounded-full">
            {leads.length}
          </span>
        </div>
        <button
          onClick={() => onAddLead(estado)}
          title={`Nuevo lead en ${titulo}`}
          className="p-1 rounded-lg text-gray-400 hover:text-emerald-600
            hover:bg-emerald-50 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-3 flex-1 min-h-40">
        {leads.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-gray-300 italic">Sin leads</p>
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={onClickLead}
              onQuickAction={onQuickAction}
            />
          ))
        )}
      </div>
    </div>
  )
}
