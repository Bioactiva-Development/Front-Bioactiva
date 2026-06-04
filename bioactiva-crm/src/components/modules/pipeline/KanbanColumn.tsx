'use client'

import { useDroppable } from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { Lead } from '@/types/lead.types'
import { LeadCard } from '@/components/modules/pipeline/LeadCard'

interface KanbanColumnProps {
  id:          string
  titulo:      string
  leads:       Lead[]
  color:       string
  onAddLead:   () => void
  onClickLead: (lead: Lead) => void
}

export function KanbanColumn({
  id,
  titulo,
  leads,
  color,
  onAddLead,
  onClickLead,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className="flex flex-col min-w-70 flex-1">

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
          onClick={onAddLead}
          className="p-1 rounded-lg text-gray-400 hover:text-emerald-600
            hover:bg-emerald-50 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`
          flex flex-col gap-3 flex-1 rounded-xl p-2 min-h-32 transition-colors
          ${isOver
            ? 'bg-emerald-50 border-2 border-dashed border-emerald-300'
            : 'border-2 border-transparent'
          }
        `}
      >
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
            />
          ))
        )}
      </div>
    </div>
  )
}
