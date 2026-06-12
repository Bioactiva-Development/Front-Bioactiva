'use client'

import { useDroppable } from '@dnd-kit/core'
import { Loader2 } from 'lucide-react'
import { Lead } from '@/types/lead.types'
import { LeadState } from '@/types/enums'
import { LeadCard } from '@/components/modules/pipeline/LeadCard'

interface KanbanColumnProps {
  titulo:      string
  estado:      LeadState
  leads:       Lead[]
  color:       string
  total:       number
  isLoading?:  boolean
  hasMore?:    boolean
  loadingMore?: boolean
  onClickLead: (lead: Lead) => void
  onQuickAction?: (
    lead: Lead,
    action: 'detalle' | 'editar' | 'actividad' | 'cotizacion' | 'seguimiento'
  ) => void
  onCargarMas?: () => void
}

export function KanbanColumn({
  titulo,
  estado,
  leads,
  color,
  total,
  isLoading = false,
  hasMore = false,
  loadingMore = false,
  onClickLead,
  onQuickAction,
  onCargarMas,
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `column-${estado}`,
    data: { estado },
  })

  return (
    <div
      ref={setNodeRef}
      data-column-state={estado}
      className={`flex flex-col min-w-72 flex-1 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden transition-all
        ${isOver ? 'ring-2 ring-emerald-200 border-emerald-100' : ''}`}
    >
      {/* Franja de color según estado */}
      <div className={`h-1.5 shrink-0 ${color}`} />

      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-bold text-gray-800 uppercase tracking-wide flex-1">
            {titulo}
          </span>
          <span className="text-xs font-bold text-gray-500 bg-gray-100
            px-2 py-0.5 rounded-full tabular-nums">
            {total}
          </span>
        </div>

        <div className="flex flex-col gap-2.5 flex-1 min-h-40">
          {isLoading && leads.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-300">
              <Loader2 size={18} className="animate-spin" />
            </div>
          ) : leads.length === 0 ? (
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

          {hasMore && (
            <button
              type="button"
              onClick={onCargarMas}
              disabled={loadingMore}
              className="mt-1 flex items-center justify-center gap-2 rounded-xl border
                border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500
                hover:text-emerald-600 hover:border-emerald-200 transition-colors
                disabled:opacity-60 cursor-pointer"
            >
              {loadingMore
                ? <Loader2 size={14} className="animate-spin" />
                : `Cargar más (${leads.length} de ${total})`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
