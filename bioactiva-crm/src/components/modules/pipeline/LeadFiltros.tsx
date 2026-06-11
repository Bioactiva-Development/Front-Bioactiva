'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Filter, Search, X } from 'lucide-react'
import { LeadFiltros as FiltrosType } from '@/types/lead.types'
import { EstadoUsuario, LeadState } from '@/types/enums'
import { usuariosService } from '@/services/modules/usuarios.service'
import { UsuarioListItem } from '@/types/usuario.types'
import { useOrganizaciones } from '@/hooks/organizaciones/useOrganizaciones'

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

const toResponsableOption = (usuario: UsuarioListItem): ResponsableOption => ({
  id: usuario.id,
  nombre: `${usuario.nombres} ${usuario.apellidos}`.trim() || usuario.correo,
})

// Filtros server-side soportados por GET /leads (sin canal/solo_alerta, que eran
// client-side). estado, encargado, organización, búsqueda, rango de fechas y el
// toggle de "por vencer/vencidas" se mandan al backend.
const sanitizeFiltros = (filtros: FiltrosType): FiltrosType => ({
  search: filtros.search,
  estado: filtros.estado,
  id_encargado: filtros.id_encargado,
  id_org: filtros.id_org,
  con_actividades_por_vencer: filtros.con_actividades_por_vencer,
  fecha_desde: filtros.fecha_desde,
  fecha_hasta: filtros.fecha_hasta,
})

export function LeadFiltros({
  filtros,
  onChange,
  onLimpiar,
  total,
}: LeadFiltrosProps) {
  const [abierto, setAbierto] = useState(true)
  const [responsables, setResponsables] = useState<ResponsableOption[]>([])

  const { data: orgsData } = useOrganizaciones({ limit: 100 })
  const organizaciones = orgsData?.data ?? []

  const filtrosBasicos = useMemo(() => sanitizeFiltros(filtros), [filtros])

  // Las fechas se controlan localmente para validar (hasta >= desde) antes de
  // aplicar el filtro y evitar el 400 del backend.
  const [fechaDesde, setFechaDesde] = useState(filtros.fecha_desde ?? '')
  const [fechaHasta, setFechaHasta] = useState(filtros.fecha_hasta ?? '')

  // Sincroniza el estado local cuando el padre cambia las fechas (p. ej. al
  // limpiar filtros), ajustando estado en render en vez de en un efecto.
  const [fechasPrevias, setFechasPrevias] = useState({
    desde: filtros.fecha_desde,
    hasta: filtros.fecha_hasta,
  })
  if (
    fechasPrevias.desde !== filtros.fecha_desde ||
    fechasPrevias.hasta !== filtros.fecha_hasta
  ) {
    setFechasPrevias({ desde: filtros.fecha_desde, hasta: filtros.fecha_hasta })
    setFechaDesde(filtros.fecha_desde ?? '')
    setFechaHasta(filtros.fecha_hasta ?? '')
  }

  const rangoInvalido = !!fechaDesde && !!fechaHasta && fechaHasta < fechaDesde

  const hayFiltrosActivos =
    filtrosBasicos.search ||
    filtrosBasicos.estado ||
    filtrosBasicos.id_encargado ||
    filtrosBasicos.id_org ||
    filtrosBasicos.con_actividades_por_vencer ||
    filtrosBasicos.fecha_desde ||
    filtrosBasicos.fecha_hasta

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

  // Solo aplica el rango cuando es válido (hasta >= desde). Si está incompleto
  // o vacío, aplica lo que haya; si es inválido, no propaga (se muestra el error).
  const aplicarFechas = (desde: string, hasta: string) => {
    if (desde && hasta && hasta < desde) return
    updateFiltros({
      ...filtrosBasicos,
      fecha_desde: desde || undefined,
      fecha_hasta: hasta || undefined,
    })
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
              <label htmlFor="lflt-org" className="text-xs text-gray-400 font-medium">Organización</label>
              <select
                id="lflt-org"
                value={filtrosBasicos.id_org ?? ''}
                onChange={(e) => updateFiltros({
                  ...filtrosBasicos,
                  id_org: e.target.value || undefined,
                })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200
                  bg-white text-sm text-gray-700 outline-none focus:border-emerald-400
                  cursor-pointer"
              >
                <option value="">Todas las organizaciones</option>
                {organizaciones.map((org) => (
                  <option key={org.id} value={org.id}>{org.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="lflt-desde" className="text-xs text-gray-400 font-medium">
                Creados desde
              </label>
              <input
                id="lflt-desde"
                type="date"
                value={fechaDesde}
                max={fechaHasta || undefined}
                onChange={(e) => {
                  const v = e.target.value
                  setFechaDesde(v)
                  aplicarFechas(v, fechaHasta)
                }}
                className="w-full px-3 py-2 rounded-xl border border-gray-200
                  bg-white text-sm text-gray-700 outline-none focus:border-emerald-400
                  cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="lflt-hasta" className="text-xs text-gray-400 font-medium">
                Creados hasta
              </label>
              <input
                id="lflt-hasta"
                type="date"
                value={fechaHasta}
                min={fechaDesde || undefined}
                onChange={(e) => {
                  const v = e.target.value
                  setFechaHasta(v)
                  aplicarFechas(fechaDesde, v)
                }}
                className={`w-full px-3 py-2 rounded-xl border bg-white text-sm
                  text-gray-700 outline-none cursor-pointer
                  ${rangoInvalido ? 'border-red-400' : 'border-gray-200 focus:border-emerald-400'}`}
              />
            </div>
          </div>

          {rangoInvalido && (
            <p className="text-xs text-red-500">
              La fecha &quot;hasta&quot; debe ser igual o posterior a la fecha &quot;desde&quot;.
            </p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtrosBasicos.con_actividades_por_vencer ?? false}
                onChange={(e) => updateFiltros({
                  ...filtrosBasicos,
                  con_actividades_por_vencer: e.target.checked || undefined,
                })}
                className="w-4 h-4 rounded border-gray-300 text-emerald-600
                  focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-600">Solo por vencer</span>
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
