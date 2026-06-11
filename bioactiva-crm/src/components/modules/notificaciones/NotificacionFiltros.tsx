'use client'

import { EstadoNotif } from '@/types/enums'
import { NotificacionFiltros as FiltrosType } from '@/types/notificacion.types'

interface NotificacionFiltrosProps {
  filtros: FiltrosType
  onChange: (filtros: FiltrosType) => void
  onLimpiar: () => void
}

export function NotificacionFiltros({
  filtros,
  onChange,
  onLimpiar,
}: Readonly<NotificacionFiltrosProps>) {
  const handleTipoChange = (value: string) => {
    onChange({
      ...filtros,
      tipo: value ? (value as FiltrosType['tipo']) : undefined,
    })
  }

  const handleEstadoChange = (value: string) => {
    onChange({
      ...filtros,
      estado: value ? (value as EstadoNotif) : undefined,
    })
  }

  const hayFiltrosActivos = filtros.tipo || filtros.estado

  return (
    <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Filtros de notificaciones
          </p>
          <h2 className="text-lg font-bold text-gray-900">Refinar resultados</h2>
        </div>
        {hayFiltrosActivos && (
          <button
            type="button"
            onClick={onLimpiar}
            className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nf-tipo" className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Tipo
          </label>
          <select
            id="nf-tipo"
            value={filtros.tipo ?? ''}
            onChange={(event) => handleTipoChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 transition-colors"
          >
            <option value="">Todos los tipos</option>
            <option value="RECORDATORIO">Recordatorio</option>
            <option value="SEGUIMIENTO">Seguimiento</option>
          </select>
        </div>

        <div>
          <label htmlFor="nf-estado" className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Estado
          </label>
          <select
            id="nf-estado"
            value={filtros.estado ?? ''}
            onChange={(event) => handleEstadoChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 transition-colors"
          >
            <option value="">Todos los estados</option>
            <option value={EstadoNotif.NoLeida}>No leída</option>
            <option value={EstadoNotif.Leida}>Leída</option>
          </select>
        </div>
      </div>
    </div>
  )
}
