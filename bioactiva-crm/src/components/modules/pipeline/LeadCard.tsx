'use client'

import type React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  AlertTriangle,
  Building2,
  User,
  Briefcase,
  ExternalLink,
  Pencil,
  MessageSquarePlus,
  FileText,
  Send,
} from 'lucide-react'
import { Lead } from '@/types/lead.types'

interface LeadCardProps {
  lead:     Lead
  onClick:  (lead: Lead) => void
  isOverlay?: boolean
  onQuickAction?: (
    lead: Lead,
    action: 'detalle' | 'editar' | 'actividad' | 'cotizacion' | 'seguimiento'
  ) => void
}

export function LeadCard({
  lead,
  onClick,
  isOverlay = false,
  onQuickAction,
}: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `lead-${lead.id}`,
    data: { lead },
  })

  const handleAction = (
    event: React.MouseEvent<HTMLButtonElement>,
    action: 'detalle' | 'editar' | 'actividad' | 'cotizacion' | 'seguimiento'
  ) => {
    event.stopPropagation()
    onQuickAction?.(lead, action)
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      data-lead-id={lead.id}
      aria-label={`Lead - ${lead.organizacion_nombre}`}
      style={{
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 20 : undefined,
        touchAction: 'none',
      }}
      onClick={() => onClick(lead)}
      className={`
        bg-white rounded-xl border shadow-sm p-4 cursor-pointer
        hover:shadow-md transition-all space-y-3
        ${isDragging ? 'opacity-60 ring-2 ring-emerald-300' : ''}
        ${lead.tiene_alerta
          ? 'border-l-4 border-l-red-400 border-t-gray-100 border-r-gray-100 border-b-gray-100'
          : 'border-gray-100 hover:border-emerald-200'
        }
        ${isDragging ? 'opacity-40' : ''}
        ${isOverlay ? 'shadow-xl rotate-2 cursor-grabbing' : 'cursor-pointer hover:shadow-md transition-all'}
      `}
    >
      {lead.tiene_alerta && (
        <div className="flex items-center gap-1.5 text-red-500">
          <AlertTriangle size={13} />
          <span className="text-xs font-bold uppercase tracking-wide">
            {lead.alerta_motivo ?? 'Alerta activa'}
          </span>
        </div>
      )}

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

      <div className="flex items-center justify-between gap-1 pt-2 border-t border-gray-50">
        <button
          type="button"
          title="Ver detalle"
          onClick={(event) => handleAction(event, 'detalle')}
          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600
            hover:bg-emerald-50 transition-colors"
        >
          <ExternalLink size={14} />
        </button>
        <button
          type="button"
          title="Editar lead"
          onClick={(event) => handleAction(event, 'editar')}
          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600
            hover:bg-emerald-50 transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          title="Registrar actividad"
          onClick={(event) => handleAction(event, 'actividad')}
          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600
            hover:bg-emerald-50 transition-colors"
        >
          <MessageSquarePlus size={14} />
        </button>
        <button
          type="button"
          title="Crear cotización"
          onClick={(event) => handleAction(event, 'cotizacion')}
          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600
            hover:bg-emerald-50 transition-colors"
        >
          <FileText size={14} />
        </button>
        <button
          type="button"
          title="Programar seguimiento"
          onClick={(event) => handleAction(event, 'seguimiento')}
          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600
            hover:bg-emerald-50 transition-colors"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}
