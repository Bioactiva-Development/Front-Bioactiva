'use client'

import type React from 'react'
import { useDraggable } from '@dnd-kit/core'
import {
  AlertTriangle,
  Building2,
  User,
  Briefcase,
  ExternalLink,
  Pencil,
  MessageSquarePlus,
  FileText,
} from 'lucide-react'
import { ActivityAlert, Lead } from '@/types/lead.types'

// Semáforo de actividades (backend: activityAlert). El color/label se pinta tal
// cual llega del backend; el front NO recalcula el nivel.
const SEMAFORO: Record<ActivityAlert, {
  dot: string
  pill: string
  label: string
  descripcion: string
}> = {
  VERDE: {
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-50 text-emerald-700',
    label: 'Al día',
    descripcion: 'Sin actividades pendientes por vencer ni vencidas',
  },
  AMARILLO: {
    dot: 'bg-amber-500',
    pill: 'bg-amber-50 text-amber-700',
    label: 'Por vencer',
    descripcion: 'Actividad pendiente próxima a vencer (≤ 3 días)',
  },
  ROJO: {
    dot: 'bg-red-500',
    pill: 'bg-red-50 text-red-700',
    label: 'Vencida',
    descripcion: 'Actividad pendiente vencida',
  },
}

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

  // Mientras se arrastra: muestra placeholder fantasma; el visual real lo lleva DragOverlay
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={{ touchAction: 'none' }}
        className="h-56 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/30"
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      data-lead-id={lead.id}
      aria-label={`Lead - ${lead.organizacion_nombre}`}
      style={{ touchAction: 'none' }}
      onClick={() => onClick(lead)}
      className={`
        h-56 overflow-hidden bg-white rounded-xl border shadow-sm p-4
        flex flex-col gap-2 group
        transition duration-150
        ${lead.tiene_alerta
          ? 'border-l-4 border-l-red-400 border-t-gray-100 border-r-gray-100 border-b-gray-100'
          : 'border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:-translate-y-0.5'
        }
        ${isOverlay
          ? 'shadow-2xl ring-2 ring-emerald-400 ring-offset-2 rotate-1 cursor-grabbing scale-[1.02]'
          : 'cursor-pointer'
        }
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
        {lead.activity_alert && (
          <span
            title={SEMAFORO[lead.activity_alert].descripcion}
            aria-label={`Semáforo de actividades: ${SEMAFORO[lead.activity_alert].descripcion}`}
            className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5
              text-[10px] font-bold uppercase tracking-wide shrink-0
              ${SEMAFORO[lead.activity_alert].pill}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${SEMAFORO[lead.activity_alert].dot}`} />
            {SEMAFORO[lead.activity_alert].label}
          </span>
        )}
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
          <p className="text-sm text-gray-600 truncate">
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

      <div className="mt-auto flex items-center justify-between gap-1 pt-2 border-t border-gray-100
        opacity-60 group-hover:opacity-100 transition-opacity duration-200">
        <button
          type="button"
          title="Ver detalle"
          onClick={(event) => handleAction(event, 'detalle')}
          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600
            hover:bg-emerald-50 transition-colors cursor-pointer"
        >
          <ExternalLink size={14} />
        </button>
        <button
          type="button"
          title="Editar lead"
          onClick={(event) => handleAction(event, 'editar')}
          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600
            hover:bg-emerald-50 transition-colors cursor-pointer"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          title="Registrar actividad"
          onClick={(event) => handleAction(event, 'actividad')}
          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600
            hover:bg-emerald-50 transition-colors cursor-pointer"
        >
          <MessageSquarePlus size={14} />
        </button>
        <button
          type="button"
          title="Crear cotización"
          onClick={(event) => handleAction(event, 'cotizacion')}
          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600
            hover:bg-emerald-50 transition-colors cursor-pointer"
        >
          <FileText size={14} />
        </button>
      </div>
    </div>
  )
}
