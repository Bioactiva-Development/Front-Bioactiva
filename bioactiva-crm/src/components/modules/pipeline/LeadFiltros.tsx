'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Filter, Search, X } from 'lucide-react'
import { LeadFiltros as FiltrosType } from '@/types/lead.types'
import { EstadoUsuario, LeadState } from '@/types/enums'
import { usuariosService } from '@/services/modules/usuarios.service'
import { UsuarioListItem } from '@/types/usuario.types'

interface LeadFiltrosProps {
  filtros:   FiltrosType
  onChange:  (filtros: FiltrosType) => void
  onLimpiar: () => void
  total?:    number
}

interface ResponsableOption {
  id: number
  nombre: string
}

const CANALES = [
  'Web / Redes sociales',
  'Referido',
  'Prospección directa',
]

const toResponsableOption = (usuario: UsuarioListItem): ResponsableOption => ({
  id: usuario.id,
  nombre: `${usuario.nombres} ${usuario.apellidos}`.trim() || usuario.correo,
})

const sanitizeFiltros = (filtros: FiltrosType): FiltrosType => ({
  search: filtros.search,
  estado: filtros.estado,
  id_encargado: filtros.id_encargado,
  canal_captacion: filtros.canal_captacion,
  solo_alerta: filtros.solo_alerta,
})

export function LeadFiltros({
  filtros,
  onChange,
  onLimpiar,
  total,
}: LeadFiltrosProps) {
  const [abierto, setAbierto] = useState(true)
  const [responsables, setResponsables] = useState<ResponsableOption[]>([])

  const filtrosBasicos = useMemo(() => sanitizeFiltros(filtros), [filtros])

  const hayFiltrosActivos =
    filtrosBasicos.search ||
    filtrosBasicos.estado ||
    filtrosBasicos.id_encargado ||
    filtrosBasicos.canal_captacion ||
    filtrosBasicos.solo_alerta

  useEffect(() => {
    let isMounted = true

    async function cargarResponsables() {
      try {
        const response = await usuariosService.getUsuarios({
          estado: EstadoUsuario.Activo,
          limit: 100,
        })

        if (!isMounted) return
        setResponsables(response.usuarios.map(toResponsableOption))
      } catch {
        if (!isMounted) return
        setResponsables([])
      }
    }

    cargarResponsables()

    return () => {
      isMounted = false
    }
  }, [])

  const updateFiltros = (next: FiltrosType) => {
    onChange(sanitizeFiltros(next))
  }

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
                value={filtrosBasicos.search ?? ''}
                onChange={(e) => updateFiltros({
                  ...filtrosBasicos,
                  search: e.target.value || undefined,
                })}
                placeholder="Buscar por código, organización, contacto, servicio o responsable"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200
                  bg-white text-sm text-gray-700 outline-none focus:border-emerald-400
                  placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="space-y-1">
              <label htmlFor="lflt-estado" className="text-xs text-gray-400 font-medium">Estado</label>
              <select
                value={filtrosBasicos.estado ?? ''}
                onChange={(e) => updateFiltros({
                  ...filtrosBasicos,
                  estado: e.target.value ? e.target.value as LeadState : undefined,
                })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200
                  bg-white text-sm text-gray-700 outline-none focus:border-emerald-400
                  cursor-pointer"
              >
                <option value="">Todos los estados</option>
                {Object.values(LeadState).map((estado) => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="lflt-encargado" className="text-xs text-gray-400 font-medium">Encargado</label>
              <select
                value={filtrosBasicos.id_encargado ?? ''}
                onChange={(e) => updateFiltros({
                  ...filtrosBasicos,
                  id_encargado: e.target.value ? Number(e.target.value) : undefined,
                })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200
                  bg-white text-sm text-gray-700 outline-none focus:border-emerald-400
                  cursor-pointer"
              >
                <option value="">Todos los encargados</option>
                {responsables.map((responsable) => (
                  <option key={responsable.id} value={responsable.id}>
                    {responsable.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="lflt-canal" className="text-xs text-gray-400 font-medium">Canal</label>
              <select
                value={filtrosBasicos.canal_captacion ?? ''}
                onChange={(e) => updateFiltros({
                  ...filtrosBasicos,
                  canal_captacion: e.target.value || undefined,
                })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200
                  bg-white text-sm text-gray-700 outline-none focus:border-emerald-400
                  cursor-pointer"
              >
                <option value="">Todos los canales</option>
                {CANALES.map((canal) => (
                  <option key={canal} value={canal}>{canal}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtrosBasicos.solo_alerta ?? false}
                onChange={(e) => updateFiltros({
                  ...filtrosBasicos,
                  solo_alerta: e.target.checked || undefined,
                })}
                className="w-4 h-4 rounded border-gray-300 text-emerald-600
                  focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-600">Solo con alerta activa</span>
            </label>

            {hayFiltrosActivos && (
              <button
                onClick={onLimpiar}
                className="ml-auto flex items-center gap-1.5 px-3 py-2
                  rounded-xl text-sm text-red-500 hover:bg-red-50
                  border border-red-200 transition-colors"
              >
                <X size={14} />
                Limpiar
              </button>
            )}
          </div>

          {total !== undefined && (
            <p className="text-sm text-gray-500">
              Mostrando <span className="font-semibold text-emerald-600">{total}</span>{' '}
              leads
            </p>
          )}
        </div>
      )}
    </div>
  )
}
