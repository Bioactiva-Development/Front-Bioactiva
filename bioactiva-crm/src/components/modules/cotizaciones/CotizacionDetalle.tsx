'use client'

import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Pencil, ExternalLink,
  Printer, Mail, DollarSign,
} from 'lucide-react'
import { Cotizacion } from '@/types/cotizacion.types'
import { EstadoCot, TipoMoneda } from '@/types/enums'
import { ROUTES } from '@/lib/constants/routes'

interface CotizacionDetalleProps {
  cotizacion: Cotizacion
  onEditar:   () => void
}

const ESTADO_COLORS: Record<EstadoCot, string> = {
  [EstadoCot.Pendiente]:  'bg-gray-100 text-gray-600',
  [EstadoCot.Enviada]:    'bg-blue-50 text-blue-700',
  [EstadoCot.Aceptada]:   'bg-emerald-50 text-emerald-700',
  [EstadoCot.Rechazada]:  'bg-red-50 text-red-600',
}

function InfoItem({
  label,
  valor,
}: {
  label: string
  valor?: string
}) {
  if (!valor) return null
  return (
    <div>
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm text-gray-800 font-medium mt-0.5">{valor}</p>
    </div>
  )
}

export function CotizacionDetalle({
  cotizacion,
  onEditar,
}: CotizacionDetalleProps) {
  const router = useRouter()

  const formatMonto = (monto: number, tipo: TipoMoneda) => {
    const simbolo = tipo === TipoMoneda.Soles ? 'S/' : '$'
    return `${simbolo} ${monto.toLocaleString('es-PE', {
      minimumFractionDigits: 2,
    })}`
  }

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-PE', {
      day:   '2-digit',
      month: 'long',
      year:  'numeric',
    })

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(ROUTES.cotizaciones)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                text-gray-500 hover:text-gray-700 hover:bg-gray-50
                border border-gray-200 transition-colors shrink-0"
            >
              <ArrowLeft size={14} />
              Volver
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center
              justify-center shrink-0">
              <DollarSign size={22} className="text-emerald-600" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-emerald-600">
                  {cotizacion.codigo}
                </h1>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg
                  uppercase tracking-wide ${ESTADO_COLORS[cotizacion.estado]}`}>
                  {cotizacion.estado}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {cotizacion.nombre_servicio}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                text-gray-500 hover:text-gray-700 hover:bg-gray-50
                border border-gray-200 transition-colors"
            >
              <Printer size={14} />
              Imprimir
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                text-gray-500 hover:text-emerald-600 hover:bg-emerald-50
                border border-gray-200 transition-colors"
            >
              <Mail size={14} />
              Enviar
            </button>
            <button
              onClick={onEditar}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                font-semibold bg-emerald-600 hover:bg-emerald-700
                text-white transition-colors"
            >
              <Pencil size={14} />
              Editar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            Datos de la cotización
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <InfoItem
              label="Código"
              valor={cotizacion.codigo}
            />
            <InfoItem
              label="Lead asociado"
              valor={cotizacion.lead_codigo ?? `#${cotizacion.id_lead}`}
            />
            <InfoItem
              label="Fecha"
              valor={formatFecha(cotizacion.fecha_cot)}
            />
            <InfoItem
              label="Periodo"
              valor={cotizacion.periodo}
            />
            <InfoItem
              label="Dirigido a"
              valor={cotizacion.dirigido}
            />
            <InfoItem
              label="Cliente"
              valor={cotizacion.cliente}
            />
            <InfoItem
              label="Producto"
              valor={cotizacion.producto}
            />
            <InfoItem
              label="Remitente"
              valor={cotizacion.nombre_remitente}
            />
          </div>

          <div className="pt-2 border-t border-gray-50">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">
              Nombre del servicio
            </p>
            <p className="text-sm text-gray-800">{cotizacion.nombre_servicio}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">
              Información económica
            </h3>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-gray-900">
                {formatMonto(cotizacion.monto, cotizacion.tipo)}
              </p>
              <p className="text-sm text-gray-400 mb-1">{cotizacion.tipo}</p>
            </div>
          </div>

          {cotizacion.observacion && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Observación
              </h3>
              <p className="text-sm text-gray-700">{cotizacion.observacion}</p>
            </div>
          )}

          {cotizacion.link_propuesta && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Propuesta
              </h3>
              <a
                href={cotizacion.link_propuesta}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-emerald-600
                  hover:underline"
              >
                <ExternalLink size={14} />
                Ver propuesta
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}