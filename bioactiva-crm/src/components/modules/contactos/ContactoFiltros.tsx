'use client'

import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { ContactoFiltros as FiltrosType } from '@/types/contacto.types'
import { useDebounce } from '@/hooks/shared/useDebounce'

interface ContactoFiltrosProps {
  filtros:   FiltrosType
  onChange:  (filtros: FiltrosType) => void
  onLimpiar: () => void
}

export function ContactoFiltros({
  filtros,
  onChange,
  onLimpiar,
}: Readonly<ContactoFiltrosProps>) {
  const [searchLocal, setSearchLocal] = useState(filtros.search ?? '')
  const debouncedSearch               = useDebounce(searchLocal, 400)
  const filtrosRef = useRef(filtros)
  useLayoutEffect(() => { filtrosRef.current = filtros })



  useEffect(() => {
    const newSearch = debouncedSearch || undefined
    if (newSearch !== filtrosRef.current.search) {
      onChange({ ...filtrosRef.current, search: newSearch, page: 1 })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])



  const handleLimpiar = () => {
    setSearchLocal('')
    onLimpiar()
  }

  const hayFiltrosActivos = filtros.search

  return (
    <div className="space-y-2">
      {/* Buscador */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={searchLocal}
          onChange={(e) => setSearchLocal(e.target.value)}
          placeholder="Buscar por nombre de contacto..."
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