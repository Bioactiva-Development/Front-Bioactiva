'use client'

import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { ContactoFiltros as FiltrosType } from '@/types/contacto.types'
import { useDebounce } from '@/hooks/shared/useDebounce'
import { useOrganizaciones } from '@/hooks/organizaciones/useOrganizaciones'

interface ContactoFiltrosProps {
  filtros:   FiltrosType
  onChange:  (filtros: FiltrosType) => void
  onLimpiar: () => void
}

export function ContactoFiltros({
  filtros,
  onChange,
  onLimpiar,
}: ContactoFiltrosProps) {
  const [searchLocal, setSearchLocal] = useState(filtros.search ?? '')
  const debouncedSearch               = useDebounce(searchLocal, 400)
  const filtrosRef = useRef(filtros)
  useLayoutEffect(() => { filtrosRef.current = filtros })

  const { data: orgsData } = useOrganizaciones({ limit: 100 })
  const organizaciones     = orgsData?.data ?? []

  useEffect(() => {
    const newSearch = debouncedSearch || undefined
    if (newSearch !== filtrosRef.current.search) {
      onChange({ ...filtrosRef.current, search: newSearch, page: 1 })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const handleOrganizacion = (value: string) => {
    onChange({
      ...filtros,
      idOrganizacion: value || undefined,
      page: 1,
    })
  }

  const handleLimpiar = () => {
    setSearchLocal('')
    onLimpiar()
  }

  const hayFiltrosActivos = filtros.search || filtros.idOrganizacion

  return (
    <div className="space-y-3">
      {/* Buscador */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={searchLocal}
          onChange={(e) => setSearchLocal(e.target.value)}
          placeholder="Buscar por nombre, email, cargo, organización..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200
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
          value={filtros.idOrganizacion ?? ''}
          onChange={(e) => handleOrganizacion(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white
            text-sm outline-none focus:border-emerald-400 text-gray-600
            transition-colors cursor-pointer"
        >
          <option value="">Todas las organizaciones</option>
          {organizaciones.map((org) => (
            <option key={org.id} value={org.id}>
              {org.nombre}
            </option>
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