'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { TipoEmpresa, TamanoEmpresa, Sector } from '@/types/enums'
import { OrganizacionFiltros as FiltrosType } from '@/types/organizacion.types'
import { useDebounce } from '@/hooks/shared/useDebounce'
import { formatSector, formatTamano } from '@/lib/utils/organizacion.utils'

interface OrganizacionFiltrosProps {
  filtros:   FiltrosType
  onChange:  (filtros: FiltrosType) => void
  onLimpiar: () => void
}

// ── Búsqueda inteligente: detecta sector/tamaño/tipo escritos en el cuadro ──

const norm = (t: string) =>
  t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// label normalizado → Sector enum
const SECTOR_LABELS = new Map<string, Sector>(
  Object.values(Sector).map((s) => [norm(formatSector(s)), s])
)

const TAMANO_LABELS = new Map<string, TamanoEmpresa>([
  ['micro',   TamanoEmpresa.Micro],
  ['pequena', TamanoEmpresa.Pequena],
  ['pequeno', TamanoEmpresa.Pequena],
  ['mediana', TamanoEmpresa.Mediana],
  ['mediano', TamanoEmpresa.Mediana],
  ['grande',  TamanoEmpresa.Grande],
])

const TIPO_LABELS = new Map<string, TipoEmpresa>([
  ['privada', TipoEmpresa.Privada],
  ['publica', TipoEmpresa.Publica],
  ['ong',     TipoEmpresa.ONG],
  ['mixta',   TipoEmpresa.Mixta],
])

/** Retorna el Sector cuyo label normalizado contiene `word` como palabra completa. */
const matchSector = (word: string): Sector | undefined => {
  const re = new RegExp(`\\b${word}\\b`)
  for (const [label, s] of SECTOR_LABELS) {
    if (re.test(label)) return s
  }
  return undefined
}

interface ParsedBusqueda {
  term:    string
  sector?: Sector
  tamano?: TamanoEmpresa
  tipo?:   TipoEmpresa
}

/**
 * Divide el texto palabra por palabra. Las palabras que coincidan con un
 * sector, tamaño o tipo conocido se convierten en filtros de enum; el resto
 * se envía como término de búsqueda de nombre al backend.
 */
function parsearBusqueda(text: string): ParsedBusqueda {
  const palabras = text.trim().split(/\s+/).filter(Boolean)
  const restantes: string[] = []
  let sector: Sector | undefined
  let tamano: TamanoEmpresa | undefined
  let tipo:   TipoEmpresa   | undefined

  for (const p of palabras) {
    const n = norm(p)
    const detSector = !sector ? matchSector(n)          : undefined
    const detTamano = !tamano ? TAMANO_LABELS.get(n)    : undefined
    const detTipo   = !tipo   ? TIPO_LABELS.get(n)      : undefined

    if (detSector !== undefined)      sector = detSector
    else if (detTamano !== undefined) tamano = detTamano
    else if (detTipo   !== undefined) tipo   = detTipo
    else                              restantes.push(p)
  }

  return { term: restantes.join(' '), sector, tamano, tipo }
}

// ────────────────────────────────────────────────────────────────────────────

export function OrganizacionFiltros({
  filtros,
  onChange,
  onLimpiar,
}: Readonly<OrganizacionFiltrosProps>) {
  const [searchLocal, setSearchLocal] = useState(filtros.search ?? '')
  const debouncedSearch               = useDebounce(searchLocal, 400)

  // Valores elegidos explícitamente en los selectores (no desde el texto)
  const [explicitSector, setExplicitSector] = useState<Sector | undefined>(filtros.sector)
  const [explicitTamano, setExplicitTamano] = useState<TamanoEmpresa | undefined>(filtros.tamano)
  const [explicitTipo,   setExplicitTipo  ] = useState<TipoEmpresa   | undefined>(filtros.tipo)

  useEffect(() => {
    const { term, sector, tamano, tipo } = parsearBusqueda(debouncedSearch)
    const newSector = sector ?? explicitSector
    const newTamano = tamano ?? explicitTamano
    const newTipo   = tipo   ?? explicitTipo
    const newSearch = term   || undefined

    if (
      newSearch !== filtros.search ||
      newSector !== filtros.sector ||
      newTamano !== filtros.tamano ||
      newTipo   !== filtros.tipo
    ) {
      onChange({ ...filtros, search: newSearch, sector: newSector, tamano: newTamano, tipo: newTipo, page: 1 })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const handleSector = (value: string) => {
    const s = value ? (value as Sector) : undefined
    setExplicitSector(s)
    onChange({ ...filtros, sector: s, page: 1 })
  }

  const handleTamaño = (value: string) => {
    const t = value ? (value as TamanoEmpresa) : undefined
    setExplicitTamano(t)
    onChange({ ...filtros, tamano: t, page: 1 })
  }

  const handleTipo = (value: string) => {
    const t = value ? (value as TipoEmpresa) : undefined
    setExplicitTipo(t)
    onChange({ ...filtros, tipo: t, page: 1 })
  }

  const handleLimpiar = () => {
    setSearchLocal('')
    setExplicitSector(undefined)
    setExplicitTamano(undefined)
    setExplicitTipo(undefined)
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
          placeholder="Buscar por nombre, sector, tamaño o tipo..."
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
            <option key={t} value={t}>{t}</option>
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
