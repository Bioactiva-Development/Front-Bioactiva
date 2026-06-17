'use client'

import { useState, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { EstadoCot } from '@/types/enums'
import { CotizacionFiltros as FiltrosType } from '@/types/cotizacion.types'
import { useDebounce } from '@/hooks/shared/useDebounce'

interface CotizacionFiltrosProps {
  filtros:    FiltrosType
  onChange:   (filtros: FiltrosType) => void
  onLimpiar:  () => void
  isLoading?: boolean
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
  onLimpiar,
  isLoading,
}: Readonly<CotizacionFiltrosProps>) {
  const [searchLocal, setSearchLocal] = useState(filtros.search ?? '')
  const debouncedSearch               = useDebounce(searchLocal, 400)

  useEffect(() => {
    if (debouncedSearch !== filtros.search) {
      onChange({ ...filtros, search: debouncedSearch, page: 1 })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const handleTab = (estado?: EstadoCot) => {
    onChange({ ...filtros, estado, page: 1 })
  }

  const handleLimpiar = () => {
    setSearchLocal('')
    onLimpiar()
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

      <div className="relative">
        {isLoading && searchLocal ? (
          <Loader2
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2
              text-emerald-500 animate-spin"
          />
        ) : (
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
        )}
        <input
          type="text"
          value={searchLocal}
          onChange={(e) => setSearchLocal(e.target.value)}
          placeholder="Buscar por código, contacto, servicio..."
          className="w-full pl-9 pr-9 py-2 rounded-xl border border-gray-200
            bg-white text-gray-900 text-sm outline-none focus:border-emerald-400
            placeholder:text-gray-400 transition-colors"
        />
        {searchLocal && (
          <button
            onClick={handleLimpiar}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
              hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
