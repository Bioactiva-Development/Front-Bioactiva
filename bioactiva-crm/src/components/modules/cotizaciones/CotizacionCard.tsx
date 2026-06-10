'use client'

import { ExternalLink, Printer, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Cotizacion } from '@/types/cotizacion.types'
import { EstadoCot, TipoMoneda } from '@/types/enums'
import { ROUTES } from '@/lib/constants/routes'
import { useEnviarCotizacion } from '@/hooks/cotizaciones/useCotizaciones'

interface CotizacionCardProps {
  cotizacion: Cotizacion
}

const ESTADO_COLORS: Record<EstadoCot, string> = {
  [EstadoCot.Pendiente]:  'bg-gray-100 text-gray-600',
  [EstadoCot.Enviada]:    'bg-blue-50 text-blue-700',
  [EstadoCot.Aceptada]:   'bg-emerald-50 text-emerald-700',
  [EstadoCot.Rechazada]:  'bg-red-50 text-red-600',
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
  const { mutateAsync: enviar, isPending: enviando } = useEnviarCotizacion()

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
      <td className="px-4 py-4">
        <p className={`text-sm font-bold ${ESTADO_CODE_COLORS[cotizacion.estado]}`}>
          {cotizacion.codigo}
        </p>
      </td>

      <td className="px-4 py-4">
        <p className="text-sm text-gray-500 font-mono">
          {cotizacion.lead_codigo ?? `#${cotizacion.id_lead}`}
        </p>
      </td>

      <td className="px-4 py-4">
        <p className="text-sm text-gray-600">
          {cotizacion.periodo ?? '—'}
        </p>
      </td>

      <td className="px-4 py-4">
        <p className="text-sm font-semibold text-gray-800">
          {cotizacion.dirigido}
        </p>
        {cotizacion.organizacion_nombre && (
          <p className="text-xs text-gray-400 mt-0.5">
            {cotizacion.organizacion_nombre}
          </p>
        )}
      </td>

      <td className="px-4 py-4 max-w-xs">
        <p className="text-sm text-gray-700 truncate">
          {cotizacion.nombre_servicio}
        </p>
      </td>

      <td className="px-4 py-4">
        <p className="text-sm font-bold text-gray-900">
          {formatMonto(cotizacion.monto, cotizacion.tipo)}
        </p>
      </td>

      <td className="px-4 py-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg
          text-xs font-bold uppercase tracking-wide
          ${ESTADO_COLORS[cotizacion.estado]}`}>
          {cotizacion.estado}
        </span>
      </td>

      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          <button
            title="Imprimir"
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600
              hover:bg-gray-50 transition-colors"
            onClick={() => window.print()}
          >
            <Printer size={15} />
          </button>
          {cotizacion.estado === EstadoCot.Pendiente && (
            <button
              title="Marcar como enviada"
              disabled={enviando}
              onClick={() => enviar(cotizacion.id)}
              className="p-2 rounded-lg text-gray-400 hover:text-emerald-600
                hover:bg-emerald-50 transition-colors disabled:opacity-40
                disabled:cursor-not-allowed"
            >
              <Mail size={15} />
            </button>
          )}
          <button
            title="Ver detalle"
            onClick={handleVerDetalle}
            className="p-2 rounded-lg text-gray-400 hover:text-emerald-600
              hover:bg-emerald-50 transition-colors"
          >
            <ExternalLink size={15} />
          </button>
        </div>
      </td>
    </tr>
  )
}
