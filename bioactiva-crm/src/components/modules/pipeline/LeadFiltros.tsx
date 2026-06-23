'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react'
import { LeadFiltros as FiltrosType, ActivityAlertFilter } from '@/types/lead.types'
import { EstadoUsuario, LeadState, Sector, TipoEmpresa } from '@/types/enums'
import { usuariosService } from '@/services/modules/usuarios.service'
import { UsuarioListItem } from '@/types/usuario.types'
import { OrgBuscador } from '@/components/ui/OrgBuscador/OrgBuscador'
import { formatSector, formatTipo } from '@/lib/utils/organizacion.utils'

// Estilo del buscador de organización acorde al panel de filtros del pipeline.
const ORG_INPUT_CLASS = `w-full pl-8 pr-8 py-1.5 rounded-lg border border-gray-100
  bg-white text-sm text-gray-700 outline-none focus:border-emerald-300
  placeholder:text-gray-300`

interface LeadFiltrosProps {
  filtros:   FiltrosType
  onChange:  (filtros: FiltrosType) => void
  onLimpiar: () => void
}

interface ResponsableOption {
  id: number
  nombre: string
}

const toResponsableOption = (usuario: UsuarioListItem): ResponsableOption => ({
  id: usuario.id,
  nombre: `${usuario.nombres} ${usuario.apellidos}`.trim() || usuario.correo,
})

// Semáforo de actividades (backend: alertaActividad). Mismos valores que el
// campo activityAlert del lead. "Todas" = sin filtro. Severidad de menor a mayor:
// SIN_ACTIVIDADES < PENDIENTE < EN_RIESGO < POR_VENCER.
const SEMAFORO_OPCIONES: {
  value: ActivityAlertFilter | undefined
  label: string
  dots: string[]
}[] = [
  { value: undefined,         label: 'Todas',           dots: [] },
  { value: 'SIN_ACTIVIDADES', label: 'Sin actividades', dots: ['bg-emerald-500'] },
  { value: 'PENDIENTE',       label: 'Pendiente',       dots: ['bg-yellow-400'] },
  { value: 'EN_RIESGO',       label: 'En riesgo',       dots: ['bg-orange-500'] },
  { value: 'POR_VENCER',      label: 'Por vencer',      dots: ['bg-red-500'] },
]

// Filtros server-side soportados por GET /leads (sin canal/solo_alerta, que eran
// client-side). estado, encargado, organización (idOrg), sector, rango de fechas
// y el semáforo (alertaActividad) se mandan al backend.
const sanitizeFiltros = (filtros: FiltrosType): FiltrosType => ({
  search: filtros.search,
  estado: filtros.estado,
  id_encargado: filtros.id_encargado,
  id_org: filtros.id_org,
  sector: filtros.sector,
  tipo_org: filtros.tipo_org,
  alerta_actividad: filtros.alerta_actividad,
  fecha_desde: filtros.fecha_desde,
  fecha_hasta: filtros.fecha_hasta,
})

export function LeadFiltros({
  filtros,
  onChange,
  onLimpiar,
}: LeadFiltrosProps) {
  const [abierto, setAbierto] = useState(false)
  const [responsables, setResponsables] = useState<ResponsableOption[]>([])

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
    filtrosBasicos.sector ||
    filtrosBasicos.tipo_org ||
    filtrosBasicos.alerta_actividad ||
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
    <div className={`rounded-xl border transition-colors ${abierto ? 'bg-white border-gray-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>

      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between px-4 py-2.5 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Filter size={14} className={hayFiltrosActivos ? 'text-emerald-500' : 'text-gray-400'} />
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Filtros
          </span>
          {hayFiltrosActivos && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          )}
        </div>
        {abierto
          ? <ChevronUp size={14} className="text-gray-400" />
          : <ChevronDown size={14} className="text-gray-400" />
        }
      </button>

      {abierto && (
        <div className="px-4 pb-3 space-y-2.5 border-t border-gray-100">

          <div className="pt-2.5">
            <OrgBuscador
              value={filtrosBasicos.id_org}
              onSelect={(idOrg) => updateFiltros({
                ...filtrosBasicos,
                id_org: idOrg,
              })}
              inputClassName={ORG_INPUT_CLASS}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="space-y-1">
              <label htmlFor="lflt-estado" className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Estado</label>
              <select
                id="lflt-estado"
                value={filtrosBasicos.estado ?? ''}
                onChange={(e) => updateFiltros({
                  ...filtrosBasicos,
                  estado: e.target.value ? e.target.value as LeadState : undefined,
                })}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-100
                  bg-white text-sm text-gray-600 outline-none focus:border-emerald-300
                  cursor-pointer"
              >
                <option value="">Todos los estados</option>
                {Object.values(LeadState).map((estado) => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="lflt-encargado" className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Encargado</label>
              <select
                id="lflt-encargado"
                value={filtrosBasicos.id_encargado ?? ''}
                onChange={(e) => updateFiltros({
                  ...filtrosBasicos,
                  id_encargado: e.target.value ? Number(e.target.value) : undefined,
                })}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-100
                  bg-white text-sm text-gray-600 outline-none focus:border-emerald-300
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
              <label htmlFor="lflt-sector" className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Sector</label>
              <select
                id="lflt-sector"
                value={filtrosBasicos.sector ?? ''}
                onChange={(e) => updateFiltros({
                  ...filtrosBasicos,
                  sector: e.target.value ? (e.target.value as Sector) : undefined,
                })}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-100
                  bg-white text-sm text-gray-600 outline-none focus:border-emerald-300
                  cursor-pointer"
              >
                <option value="">Todos los sectores</option>
                {Object.values(Sector).map((s) => (
                  <option key={s} value={s}>{formatSector(s)}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="lflt-tipo-org" className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Tipo de org.</label>
              <select
                id="lflt-tipo-org"
                value={filtrosBasicos.tipo_org ?? ''}
                onChange={(e) => updateFiltros({
                  ...filtrosBasicos,
                  tipo_org: e.target.value ? (e.target.value as TipoEmpresa) : undefined,
                })}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-100
                  bg-white text-sm text-gray-600 outline-none focus:border-emerald-300
                  cursor-pointer"
              >
                <option value="">Todos los tipos</option>
                {Object.values(TipoEmpresa).map((t) => (
                  <option key={t} value={t}>{formatTipo(t)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-1">
              <label htmlFor="lflt-desde" className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
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
                className="w-full px-3 py-1.5 rounded-lg border border-gray-100
                  bg-white text-sm text-gray-600 outline-none focus:border-emerald-300
                  cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="lflt-hasta" className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
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
                className={`w-full px-3 py-1.5 rounded-lg border bg-white text-sm
                  text-gray-600 outline-none cursor-pointer
                  ${rangoInvalido ? 'border-red-400' : 'border-gray-100 focus:border-emerald-300'}`}
              />
            </div>
          </div>

          {rangoInvalido && (
            <p className="text-xs text-red-500">
              La fecha &quot;hasta&quot; debe ser igual o posterior a la fecha &quot;desde&quot;.
            </p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                Semáforo
              </span>
              <div className="inline-flex items-center rounded-lg border border-gray-100 bg-white p-0.5">
                {SEMAFORO_OPCIONES.map((opt) => {
                  const activo = filtrosBasicos.alerta_actividad === opt.value
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => updateFiltros({
                        ...filtrosBasicos,
                        alerta_actividad: opt.value,
                      })}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs
                        font-medium transition-colors cursor-pointer
                        ${activo
                          ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                          : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      {opt.dots.map((dot) => (
                        <span key={dot} className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      ))}
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {hayFiltrosActivos && (
              <button
                onClick={onLimpiar}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5
                  rounded-lg text-xs text-red-500 hover:bg-red-50
                  border border-red-100 transition-colors cursor-pointer"
              >
                <X size={12} />
                Limpiar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
