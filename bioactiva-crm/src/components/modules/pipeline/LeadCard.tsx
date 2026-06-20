'use client'

import { useEffect, useRef, useState } from 'react'
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { Calendar, Clock, ExternalLink, User } from 'lucide-react'
import { Lead } from '@/types/lead.types'
import { EstadoCot, TipoMoneda } from '@/types/enums'
import { Cotizacion } from '@/types/cotizacion.types'
import { useCotizacionesPorLead } from '@/hooks/cotizaciones/useCotizaciones'
import { SEMAFORO_UI } from '@/lib/utils/semaforo.utils'
import { formatLeadDateOnly } from '@/lib/utils/lead-date.utils'

const AVATAR_COLORS = [
  'bg-emerald-500', 'bg-blue-500',  'bg-violet-500',
  'bg-amber-500',   'bg-rose-500',  'bg-cyan-500',
  'bg-indigo-500',  'bg-teal-500',  'bg-orange-500',
]

function avatarColor(name: string): string {
  let h = 0
  for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
}

function cotizacionActiva(cots: Cotizacion[]): Cotizacion | null {
  return cots.find((c) => c.estado !== EstadoCot.Rechazada) ?? null
}

function formatMonto(monto: number, tipo: TipoMoneda): string {
  const simbolo = tipo === TipoMoneda.Soles ? 'S/' : 'US$'
  return `${simbolo} ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
}

interface LeadCardProps {
  lead: Lead
  onClick: (lead: Lead) => void
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
  const cardRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const { data: cotizaciones = [] } = useCotizacionesPorLead(lead.id)
  const cot = cotizacionActiva(cotizaciones)

  useEffect(() => {
    const el = cardRef.current
    if (!el || isOverlay) return
    return draggable({
      element: el,
      getInitialData: () => ({ lead }),
      onDragStart: () => setIsDragging(true),
      onDrop:      () => setIsDragging(false),
    })
  }, [lead, isOverlay])

  if (isDragging) {
    return (
      <div className="h-40 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/30" />
    )
  }

  // Semáforo de actividades (backend: activityAlert). Siempre visible cuando el
  // lead lo trae, con color por severidad: verde → amarillo → naranja → rojo.
  const sem = lead.activity_alert ? SEMAFORO_UI[lead.activity_alert] : null

  const semBadge = sem && (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
      text-[11px] font-bold uppercase tracking-wide shrink-0 ${sem.pill}`}>
      <span className={`w-2 h-2 rounded-full ${sem.dot} ${sem.pulse ? 'animate-pulse' : ''}`} />
      {sem.label}
    </span>
  )

  // Badge secundario: lead estancado (+30 días sin avance), concepto aparte del semáforo.
  const staleBadge = lead.tiene_alerta && (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5
      bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide shrink-0">
      <Clock size={10} className="shrink-0" />
      {lead.alerta_motivo ?? '+30 días'}
    </span>
  )

  const alertBadge = sem || lead.tiene_alerta ? (
    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
      {semBadge}
      {staleBadge}
    </div>
  ) : null

  const externalLinkBtn = (
    <button
      type="button"
      title="Ver detalle completo"
      onClick={(e) => { e.stopPropagation(); onQuickAction?.(lead, 'detalle') }}
      className="text-gray-300 hover:text-emerald-600 transition-colors
        p-0.5 rounded cursor-pointer shrink-0"
    >
      <ExternalLink size={13} />
    </button>
  )

  const encargado = lead.encargado_nombre

  return (
    <div
      ref={cardRef}
      data-lead-id={lead.id}
      aria-label={`Lead - ${lead.organizacion_nombre}`}
      onClick={() => onClick(lead)}
      className={`
        bg-white rounded-xl border border-gray-200 shadow p-4
        flex flex-col gap-3 cursor-pointer select-none transition duration-150
        hover:border-emerald-200 hover:shadow-md hover:-translate-y-0.5
        ${sem ? `border-l-4 ${sem.accent}` : ''}
        ${isOverlay
          ? 'shadow-2xl ring-2 ring-emerald-300 ring-offset-2 rotate-1 scale-[1.02]'
          : ''}
      `}
    >
      {/* Fila alerta — solo cuando hay badge; lleva el link a su derecha */}
      {alertBadge && (
        <div className="flex items-center justify-between gap-2">
          {alertBadge}
          {externalLinkBtn}
        </div>
      )}

      {/* Nombre org + servicio; link a la derecha cuando no hay fila de alerta */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-snug">
            {lead.organizacion_nombre}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
            {lead.servicio_interes}
          </p>
        </div>
        {!alertBadge && externalLinkBtn}
      </div>

      {/* Monto de la cotización (si existe) */}
      {cot && (
        <span className="text-sm font-bold text-emerald-600 tabular-nums">
          {formatMonto(cot.monto, cot.tipo)}
        </span>
      )}

      {/* Contacto — encima del separador */}
      {lead.contacto_nombre && (
        <div className="flex items-center gap-1.5">
          <User size={12} className="text-gray-300 shrink-0" />
          <span className="text-xs text-gray-600 truncate flex-1 min-w-0">
            {lead.contacto_nombre}
          </span>
          <span className="text-xs text-gray-400 shrink-0">· Contacto</span>
        </div>
      )}

      {/* Separador a sangría completa */}
      <div className="-mx-4 border-t border-gray-100" />

      {/* Encargado — debajo del separador */}
      {encargado && (
        <div className="flex items-center gap-2">
          <div
            title={encargado}
            className={`w-7 h-7 rounded-full flex items-center justify-center
              text-white text-[10px] font-bold shrink-0 ${avatarColor(encargado)}`}
          >
            {initials(encargado)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-800 truncate">{encargado}</p>
            <p className="text-[10px] text-gray-400">Encargado</p>
          </div>
        </div>
      )}

      {/* Fecha de creación del lead */}
      <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
        <Calendar size={11} className="shrink-0" />
        Creado el {formatLeadDateOnly(lead.created_at)}
      </div>
    </div>
  )
}
