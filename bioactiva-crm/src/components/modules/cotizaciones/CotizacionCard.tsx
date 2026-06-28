'use client'

import { ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Cotizacion } from '@/types/cotizacion.types'
import { EstadoCot, TipoMoneda } from '@/types/enums'
import { ROUTES } from '@/lib/constants/routes'

interface CotizacionCardProps {
  cotizacion: Cotizacion
}

const ESTADO_COLORS: Record<EstadoCot, string> = {
  [EstadoCot.Pendiente]:  'bg-gray-100 text-gray-600',
  [EstadoCot.Enviada]:    'bg-blue-100 text-blue-700',
  [EstadoCot.Aceptada]:   'bg-emerald-100 text-emerald-700',
  [EstadoCot.Rechazada]:  'bg-red-100 text-red-700',
}

const ESTADO_HOVER_COLORS: Record<EstadoCot, string> = {
  [EstadoCot.Pendiente]:  'hover:bg-gray-50',
  [EstadoCot.Enviada]:    'hover:bg-blue-50/40',
  [EstadoCot.Aceptada]:   'hover:bg-emerald-50/30',
  [EstadoCot.Rechazada]:  'hover:bg-red-50/40',
}

const ESTADO_CODE_COLORS: Record<EstadoCot, string> = {
  [EstadoCot.Pendiente]:  'text-gray-600',
  [EstadoCot.Enviada]:    'text-blue-600',
  [EstadoCot.Aceptada]:   'text-emerald-600',
  [EstadoCot.Rechazada]:  'text-red-600',
}

export function CotizacionCard({ cotizacion }: Readonly<CotizacionCardProps>) {
  const router = useRouter()

  const formatMonto = (monto: number, tipo: TipoMoneda) => {
    const simbolo = tipo === TipoMoneda.Soles ? 'S/' : '$'
    return `${simbolo} ${monto.toLocaleString('es-PE', {
      minimumFractionDigits: 2,
    })}`
  }

  const handleVerDetalle = () => {
    router.push(ROUTES.cotizacion(cotizacion.id))
  }

  return (
    <tr
      className={`border-b border-gray-50 transition-colors cursor-pointer
        ${ESTADO_HOVER_COLORS[cotizacion.estado]}`}
      onClick={handleVerDetalle}
    >
      {/* Código — siempre visible; muestra datos clave debajo en móvil */}
      <td className="px-4 py-3">
        <p className={`text-sm font-semibold ${ESTADO_CODE_COLORS[cotizacion.estado]}`}>
          {cotizacion.codigo}
        </p>
        <div className="sm:hidden mt-1 space-y-0.5">
          {cotizacion.periodo && (
            <p className="text-xs text-gray-500">{cotizacion.periodo}</p>
          )}
          <p className="text-xs font-semibold text-gray-700">
            {formatMonto(cotizacion.monto, cotizacion.tipo)}
          </p>
          {cotizacion.contacto_nombre && (
            <p className="text-xs text-gray-400 truncate">{cotizacion.contacto_nombre}</p>
          )}
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
            ${ESTADO_COLORS[cotizacion.estado]}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
            {cotizacion.estado}
          </span>
        </div>
      </td>

      {/* Período — oculto en móvil, visible en sm+ */}
      <td className="hidden sm:table-cell px-4 py-3">
        <p className="text-sm text-gray-600">
          {cotizacion.periodo ?? '—'}
        </p>
      </td>

      {/* Contacto — oculto en móvil, visible en sm+ */}
      <td className="hidden sm:table-cell px-4 py-3">
        <p className="text-sm font-semibold text-gray-800">
          {cotizacion.contacto_nombre ?? '—'}
        </p>
        {cotizacion.organizacion_nombre && (
          <p className="text-xs text-gray-400 mt-0.5">
            {cotizacion.organizacion_nombre}
          </p>
        )}
      </td>

      {/* Nombre del servicio — oculto en móvil y tablet, visible en md+ */}
      <td className="hidden md:table-cell px-4 py-3 max-w-xs">
        <p className="text-sm text-gray-700 truncate">
          {cotizacion.nombre_servicio}
        </p>
      </td>

      {/* Monto — oculto en móvil, visible en sm+ */}
      <td className="hidden sm:table-cell px-4 py-3">
        <p className="text-sm font-bold text-gray-900">
          {formatMonto(cotizacion.monto, cotizacion.tipo)}
        </p>
      </td>

      {/* Estado — oculto en móvil, visible en sm+ */}
      <td className="hidden sm:table-cell px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
          ${ESTADO_COLORS[cotizacion.estado]}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
          {cotizacion.estado}
        </span>
      </td>

      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          <button
            aria-label={`Ver detalle de cotización ${cotizacion.codigo}`}
            onClick={handleVerDetalle}
            className="p-2 rounded-lg text-gray-400 hover:text-emerald-600
              hover:bg-emerald-50 transition-colors"
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </td>
    </tr>
  )
}
