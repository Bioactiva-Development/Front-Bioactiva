'use client'

import { EstadoCot } from '@/types/enums'
import { CotizacionFiltros as FiltrosType } from '@/types/cotizacion.types'
import { OrgBuscador } from '@/components/ui/OrgBuscador/OrgBuscador'

interface CotizacionFiltrosProps {
  filtros:   FiltrosType
  onChange:  (filtros: FiltrosType) => void
}

const TABS = [
  { label: 'Todas',     value: undefined },
  { label: 'Pendiente', value: EstadoCot.Pendiente },
  { label: 'Enviada',   value: EstadoCot.Enviada },
  { label: 'Aceptada',  value: EstadoCot.Aceptada },
  { label: 'Rechazada', value: EstadoCot.Rechazada },
]

const TAB_ACTIVE_COLORS: Record<string, string> = {
  todas:                         'bg-emerald-50 text-emerald-700',
  [EstadoCot.Pendiente]:         'bg-gray-100 text-gray-700',
  [EstadoCot.Enviada]:           'bg-blue-50 text-blue-700',
  [EstadoCot.Aceptada]:          'bg-emerald-50 text-emerald-700',
  [EstadoCot.Rechazada]:         'bg-red-50 text-red-700',
}

export function CotizacionFiltros({
  filtros,
  onChange,
}: Readonly<CotizacionFiltrosProps>) {
  const handleTab = (estado?: EstadoCot) => {
    onChange({ ...filtros, estado, page: 1 })
  }

  const handleOrg = (idOrg?: string) => {
    onChange({ ...filtros, id_org: idOrg, page: 1 })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-0.5 sm:gap-1 bg-white border border-gray-100
        rounded-xl px-1 sm:px-1.5 py-1 sm:py-1.5 shadow-sm w-full">
        {TABS.map((tab) => {
          const isActive = filtros.estado === tab.value
          const activeKey = tab.value ?? 'todas'

          return (
            <button
              key={tab.label}
              onClick={() => handleTab(tab.value)}
              className={`flex-1 text-center py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer
                ${isActive
                  ? TAB_ACTIVE_COLORS[activeKey]
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <OrgBuscador
        value={filtros.id_org}
        onSelect={handleOrg}
      />
    </div>
  )
}
