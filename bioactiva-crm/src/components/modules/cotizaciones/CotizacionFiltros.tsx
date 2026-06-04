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
  { label: 'Enviada',   value: EstadoCot.Enviada },
  { label: 'Aceptada',  value: EstadoCot.Aceptada },
  { label: 'Rechazada', value: EstadoCot.Rechazada },
  { label: 'Pendiente', value: EstadoCot.Pendiente },
]

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
    <div className="space-y-4">
      <div className="flex items-center gap-1 bg-white border border-gray-100
        rounded-xl px-2 py-2 shadow-sm w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => handleTab(tab.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors
              ${filtros.estado === tab.value
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative">
        {isLoading && searchLocal ? (
          <Loader2
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2
              text-emerald-500 animate-spin"
          />
        ) : (
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
        )}
        <input
          type="text"
          value={searchLocal}
          onChange={(e) => setSearchLocal(e.target.value)}
          placeholder="Buscar..."
          className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200
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