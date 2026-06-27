'use client'

import { useRef, useState } from 'react'
import { Building2, X } from 'lucide-react'
import { useOrganizaciones, useOrganizacion } from '@/hooks/organizaciones/useOrganizaciones'
import { useDebounce } from '@/hooks/shared/useDebounce'

interface OrgBuscadorProps {
  value?: string
  onSelect: (idOrg: string | undefined) => void
  placeholder?: string
  inputClassName?: string
}

const DEFAULT_INPUT_CLASS = `w-full pl-8 pr-10 py-2 rounded-xl border border-gray-200
  bg-white text-sm text-gray-700 outline-none focus:border-emerald-400
  placeholder:text-gray-400`

// Buscador-selector de organización: el usuario escribe, elige una organización y
// se mapea su id al filtro correspondiente (GET /leads?idOrg=, GET /quotations?idOrg=).
export function OrgBuscador({
  value,
  onSelect,
  placeholder = 'Buscar y seleccionar organización...',
  inputClassName = DEFAULT_INPUT_CLASS,
}: Readonly<OrgBuscadorProps>) {
  const [query, setQuery] = useState('')
  const [abierto, setAbierto] = useState(false)
  const debounced = useDebounce(query.trim(), 300)
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: resultados } = useOrganizaciones({
    search: debounced || undefined,
    limit: 20,
  })
  // Resuelve el nombre de la organización ya seleccionada (p. ej. al cargar la
  // página desde una URL/estado con idOrg) para mostrarlo en el input.
  const { data: seleccionada } = useOrganizacion(value ?? '')

  const opciones = resultados?.data ?? []
  const nombreSeleccionado = seleccionada?.nombre ?? ''

  const elegir = (id: string) => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current)
    onSelect(id)
    setQuery('')
    setAbierto(false)
  }

  const limpiar = () => {
    onSelect(undefined)
    setQuery('')
    setAbierto(false)
  }

  return (
    <div className="relative">
      <Building2
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        value={abierto ? query : nombreSeleccionado}
        onFocus={() => { setAbierto(true); setQuery('') }}
        onBlur={() => {
          blurTimeout.current = setTimeout(() => setAbierto(false), 150)
        }}
        onChange={(e) => { setQuery(e.target.value); setAbierto(true) }}
        placeholder={placeholder}
        className={inputClassName}
      />
      {value && (
        <button
          type="button"
          onClick={limpiar}
          aria-label="Quitar organización"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1
            bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600
            focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-500
            transition-colors cursor-pointer"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      )}

      {abierto && opciones.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-lg
          border border-gray-100 bg-white shadow-lg py-1">
          {opciones.map((org) => (
            <li key={org.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => elegir(org.id)}
                className={`w-full text-left px-3 py-1.5 text-sm cursor-pointer
                  hover:bg-emerald-50
                  ${org.id === value ? 'text-emerald-700 font-medium' : 'text-gray-700'}`}
              >
                {org.nombre}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
