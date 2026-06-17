'use client'

import { useEffect, useRef, useState } from 'react'
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { Loader2 } from 'lucide-react'
import { Lead } from '@/types/lead.types'
import { LeadState } from '@/types/enums'
import { LeadCard } from '@/components/modules/pipeline/LeadCard'

interface KanbanColumnProps {
  titulo:       string
  estado:       LeadState
  leads:        Lead[]
  color:        string
  /** Clases Tailwind aplicadas al contenedor cuando hay un lead encima */
  overClasses:  string
  /** Color sutil para los bordes laterales (left/right) */
  sideBorder?:  string
  total:        number
  isLoading?:   boolean
  hasMore?:     boolean
  loadingMore?: boolean
  onClickLead:  (lead: Lead) => void
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
  overClasses,
  sideBorder  = '',
  total,
  isLoading   = false,
  hasMore     = false,
  loadingMore = false,
  onClickLead,
  onQuickAction,
  onCargarMas,
}: KanbanColumnProps) {
  const columnRef         = useRef<HTMLDivElement>(null)
  const [isOver, setIsOver] = useState(false)

  useEffect(() => {
    const el = columnRef.current
    if (!el) return
    return dropTargetForElements({
      element: el,
      getData:     () => ({ estado }),
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop:      () => setIsOver(false),
    })
  }, [estado])

  return (
    <div
      ref={columnRef}
      data-column-state={estado}
      className={`
        flex flex-col min-w-72 flex-1 rounded-2xl border shadow-sm overflow-hidden
        transition-all duration-150
        ${isOver
          ? `${overClasses} ring-2`
          : `bg-white border-gray-100 ${sideBorder}`
        }
      `}
    >
      {/* Franja de color según estado — más gruesa cuando hay lead encima */}
      <div className={`shrink-0 ${color} transition-all duration-150 ${isOver ? 'h-2' : 'h-1.5'}`} />

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
