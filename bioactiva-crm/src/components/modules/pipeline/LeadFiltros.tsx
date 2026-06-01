'use client'

import { useState } from 'react'
import { Filter, ChevronUp, ChevronDown, X, Search } from 'lucide-react'
import { LeadFiltros as FiltrosType } from '@/types/lead.types'
import { LeadState, Sector, TipoEmpresa, TamanoEmpresa } from '@/types/enums'

interface LeadFiltrosProps {
  filtros:   FiltrosType
  onChange:  (filtros: FiltrosType) => void
  onLimpiar: () => void
  total?:    number
}

const ENCARGADOS = [
  { id: 1, nombre: 'Karien Diaz' },
  { id: 2, nombre: 'Luis Torres' },
  { id: 3, nombre: 'Administración' },
  { id: 4, nombre: 'Carlos Mamani' },
]

const CANALES = [
  'Web / Redes sociales',
  'Referido',
  'Prospección directa',
]

export function LeadFiltros({
  filtros,
  onChange,
  onLimpiar,
  total,
}: LeadFiltrosProps) {
  const [abierto, setAbierto] = useState(true)

  const hayFiltrosActivos =
    filtros.search ||
    filtros.estado ||
    filtros.id_encargado ||
    filtros.canal_captacion ||
    filtros.sector ||
    filtros.tipo_org ||
    filtros.tamano ||
    filtros.fecha_desde ||
    filtros.fecha_hasta ||
    filtros.solo_alerta

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">

      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between px-6 py-4"
      >
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-emerald-600" />
          <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Filtros
          </span>
          {hayFiltrosActivos && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </div>
        {abierto
          ? <ChevronUp size={16} className="text-gray-400" />
          : <ChevronDown size={16} className="text-gray-400" />
        }
      </button>

      {abierto && (
        <div className="px-6 pb-5 space-y-4 border-t border-gray-50">

          <div className="pt-4">
            <label className="block text-xs text-gray-400 font-medium mb-1">
              Búsqueda comercial
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={filtros.search ?? ''}
                onChange={(e) => onChange({
                  ...filtros,
                  search: e.target.value || undefined,
                })}
                placeholder="Buscar por código, organización, contacto, servicio o responsable"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200
                  bg-white text-sm text-gray-700 outline-none focus:border-emerald-400
                  placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Estado</label>
              <select
                value={filtros.estado ?? ''}
                onChange={(e) => onChange({
                  ...filtros,
                  estado: e.target.value ? e.target.value as LeadState : undefined
                })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200
                  bg-white text-sm text-gray-700 outline-none focus:border-emerald-400
                  cursor-pointer"
              >
                <option value="">Estado</option>
                {Object.values(LeadState).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Encargado</label>
              <select
                value={filtros.id_encargado ?? ''}
                onChange={(e) => onChange({
                  ...filtros,
                  id_encargado: e.target.value ? Number(e.target.value) : undefined
                })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200
                  bg-white text-sm text-gray-700 outline-none focus:border-emerald-400
                  cursor-pointer"
              >
                <option value="">Encargado</option>
                {ENCARGADOS.map((e) => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Canal</label>
              <select
                value={filtros.canal_captacion ?? ''}
                onChange={(e) => onChange({
                  ...filtros,
                  canal_captacion: e.target.value || undefined
                })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200
                  bg-white text-sm text-gray-700 outline-none focus:border-emerald-400
                  cursor-pointer"
              >
                <option value="">Canal</option>
                {CANALES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Sector</label>
              <select
                value={filtros.sector ?? ''}
                onChange={(e) => onChange({
                  ...filtros,
                  sector: e.target.value || undefined
                })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200
                  bg-white text-sm text-gray-700 outline-none focus:border-emerald-400
                  cursor-pointer"
              >
                <option value="">Sector</option>
                {Object.values(Sector).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Tipo org.</label>
              <select
                value={filtros.tipo_org ?? ''}
                onChange={(e) => onChange({
                  ...filtros,
                  tipo_org: e.target.value || undefined
                })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200
                  bg-white text-sm text-gray-700 outline-none focus:border-emerald-400
                  cursor-pointer"
              >
                <option value="">Tipo org.</option>
                {Object.values(TipoEmpresa).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Tamaño</label>
              <select
                value={filtros.tamano ?? ''}
                onChange={(e) => onChange({
                  ...filtros,
                  tamano: e.target.value || undefined
                })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200
                  bg-white text-sm text-gray-700 outline-none focus:border-emerald-400
                  cursor-pointer"
              >
                <option value="">Tamaño</option>
                {Object.values(TamanoEmpresa).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Creado desde
              </span>
              <input
                type="date"
                value={filtros.fecha_desde ?? ''}
                onChange={(e) => onChange({
                  ...filtros,
                  fecha_desde: e.target.value || undefined
                })}
                className="px-3 py-2 rounded-xl border border-gray-200 bg-white
                  text-sm text-gray-700 outline-none focus:border-emerald-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Hasta
              </span>
              <input
                type="date"
                value={filtros.fecha_hasta ?? ''}
                onChange={(e) => onChange({
                  ...filtros,
                  fecha_hasta: e.target.value || undefined
                })}
                className="px-3 py-2 rounded-xl border border-gray-200 bg-white
                  text-sm text-gray-700 outline-none focus:border-emerald-400"
              />
            </div>

            <div className="ml-auto flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filtros.solo_alerta ?? false}
                  onChange={(e) => onChange({
                    ...filtros,
                    solo_alerta: e.target.checked || undefined
                  })}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600
                    focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-600">Solo con alerta activa</span>
              </label>

              {hayFiltrosActivos && (
                <button
                  onClick={onLimpiar}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                    text-sm text-red-500 hover:bg-red-50 border border-red-200
                    transition-colors"
                >
                  <X size={14} />
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {total !== undefined && (
            <p className="text-sm text-gray-500">
              Mostrando <span className="font-semibold text-emerald-600">{total}</span> de{' '}
              <span className="font-semibold">{total}</span> leads
            </p>
          )}
        </div>
      )}
    </div>
  )
}
