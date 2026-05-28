'use client'

import { AlertTriangle, Building2, User, Briefcase } from 'lucide-react'
import { Lead } from '@/types/lead.types'

interface LeadCardProps {
  lead:     Lead
  onClick:  (lead: Lead) => void
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  return (
    <div
      onClick={() => onClick(lead)}
      className={`
        bg-white rounded-xl border shadow-sm p-4 cursor-pointer
        hover:shadow-md transition-all space-y-3
        ${lead.tiene_alerta
          ? 'border-l-4 border-l-red-400 border-t-gray-100 border-r-gray-100 border-b-gray-100'
          : 'border-gray-100 hover:border-emerald-200'
        }
      `}
    >
      {lead.tiene_alerta && (
        <div className="flex items-center gap-1.5 text-red-500">
          <AlertTriangle size={13} />
          <span className="text-xs font-bold uppercase tracking-wide">
            Actividad vencida
          </span>
        </div>
      )}

      <p className="text-xs text-gray-400 font-mono">{lead.codigo}</p>

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
  )
}