'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { TipoEmpresa, TamanoEmpresa, Sector } from '@/types/enums'
import { OrganizacionFiltros as FiltrosType } from '@/types/organizacion.types'
import { useDebounce } from '@/hooks/shared/useDebounce'
import { formatSector, formatTamano, formatTipo } from '@/lib/utils/organizacion.utils'

interface OrganizacionFiltrosProps {
  filtros:   FiltrosType
  onChange:  (filtros: FiltrosType) => void
  onLimpiar: () => void
}

export function OrganizacionFiltros({
  filtros,
  onChange,
  onLimpiar,
}: Readonly<OrganizacionFiltrosProps>) {
  const [searchLocal, setSearchLocal] = useState(filtros.search ?? '')
  const debouncedSearch               = useDebounce(searchLocal, 400)

  useEffect(() => {
    const newSearch = debouncedSearch || undefined
    if (newSearch !== filtros.search) {
      onChange({ ...filtros, search: newSearch, page: 1 })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const handleSector = (value: string) => {
    onChange({ ...filtros, sector: value ? (value as Sector) : undefined, page: 1 })
  }

  const handleTamaño = (value: string) => {
    onChange({ ...filtros, tamano: value ? (value as TamanoEmpresa) : undefined, page: 1 })
  }

  const handleTipo = (value: string) => {
    onChange({ ...filtros, tipo: value ? (value as TipoEmpresa) : undefined, page: 1 })
  }

  const handleLimpiar = () => {
    setSearchLocal('')
    onLimpiar()
  }

  const hayFiltrosActivos =
    filtros.search || filtros.sector || filtros.tamano || filtros.tipo

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={searchLocal}
          onChange={(e) => setSearchLocal(e.target.value)}
          placeholder="Buscar por nombre..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200
            bg-white text-gray-900 text-sm outline-none focus:border-emerald-400
            placeholder:text-gray-400 transition-colors"
        />
        {searchLocal && (
          <button
            onClick={() => setSearchLocal('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
              hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={filtros.sector ?? ''}
          onChange={(e) => handleSector(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white
            text-sm outline-none focus:border-emerald-400 text-gray-600
            transition-colors cursor-pointer"
        >
          <option value="">Todos los sectores</option>
          {Object.values(Sector).map((s) => (
            <option key={s} value={s}>{formatSector(s)}</option>
          ))}
        </select>

        <select
          value={filtros.tamano ?? ''}
          onChange={(e) => handleTamaño(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white
            text-sm outline-none focus:border-emerald-400 text-gray-600
            transition-colors cursor-pointer"
        >
          <option value="">Todos los tamaños</option>
          {Object.values(TamanoEmpresa).map((t) => (
            <option key={t} value={t}>{formatTamano(t)}</option>
          ))}
        </select>

        <select
          value={filtros.tipo ?? ''}
          onChange={(e) => handleTipo(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white
            text-sm outline-none focus:border-emerald-400 text-gray-600
            transition-colors cursor-pointer"
        >
          <option value="">Todos los tipos</option>
          {Object.values(TipoEmpresa).map((t) => (
            <option key={t} value={t}>{formatTipo(t)}</option>
          ))}
        </select>

        {hayFiltrosActivos && (
          <button
            onClick={handleLimpiar}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl
              text-sm text-red-500 hover:bg-red-50 border border-red-200
              transition-colors"
          >
            <X size={14} />
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  )
}
