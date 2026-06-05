'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { AlertTriangle, Building2, User, Briefcase, GripVertical } from 'lucide-react'
import { Lead } from '@/types/lead.types'

interface LeadCardProps {
  lead:        Lead
  onClick:     (lead: Lead) => void
  isOverlay?:  boolean
}

export function LeadCard({ lead, onClick, isOverlay = false }: Readonly<LeadCardProps>) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white rounded-xl border shadow-sm p-4 space-y-3
        ${lead.tiene_alerta
          ? 'border-l-4 border-l-red-400 border-t-gray-100 border-r-gray-100 border-b-gray-100'
          : 'border-gray-100 hover:border-emerald-200'
        }
        ${isDragging ? 'opacity-40' : ''}
        ${isOverlay ? 'shadow-xl rotate-2 cursor-grabbing' : 'cursor-pointer hover:shadow-md transition-all'}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {lead.tiene_alerta && (
            <div className="flex items-center gap-1.5 text-red-500 mb-1">
              <AlertTriangle size={13} />
              <span className="text-xs font-bold uppercase tracking-wide">
                Actividad vencida
              </span>
            </div>
          )}
          <p className="text-xs text-gray-400 font-mono">{lead.codigo}</p>
        </div>

        <button
          {...listeners}
          {...attributes}
          onClick={(e) => e.stopPropagation()}
          className="p-1 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100
            transition-colors cursor-grab active:cursor-grabbing shrink-0"
          aria-label="Arrastrar lead"
        >
          <GripVertical size={14} />
        </button>
      </div>

      <div
        role="button"
        tabIndex={0}
        className="space-y-2"
        onClick={() => !isDragging && onClick(lead)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') !isDragging && onClick(lead) }}
      >
        <div className="flex items-center gap-2">
          <Building2 size={14} className="text-emerald-600 shrink-0" />
          <p className="text-sm font-bold text-gray-900 truncate">
            {lead.organizacion_nombre}
          </p>
        </div>

        {lead.contacto_nombre && (
          <div className="flex items-center gap-2">
            <User size={13} className="text-gray-400 shrink-0" />
            <p className="text-sm text-gray-600 truncate">
              {lead.contacto_nombre}
            </p>
          </div>
        )}

        <div className="flex items-start gap-2">
          <Briefcase size={13} className="text-gray-400 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 line-clamp-2">
            {lead.servicio_interes}
          </p>
        </div>

        {lead.encargado_nombre && (
          <div className="pt-2 border-t border-gray-50">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg
              bg-gray-100 text-xs text-gray-600 font-medium">
              {lead.encargado_nombre}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
