'use client'

import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Pencil, ExternalLink,
  Send, CheckCircle2, XCircle, Loader2,
  DollarSign, Building2,
} from 'lucide-react'
import { Cotizacion } from '@/types/cotizacion.types'
import { EstadoCot, TipoMoneda } from '@/types/enums'
import { ROUTES } from '@/lib/constants/routes'
import {
  useEnviarCotizacion,
  useAceptarCotizacion,
  useRechazarCotizacion,
} from '@/hooks/cotizaciones/useCotizaciones'
import { getErrorMessage } from '@/lib/utils/error.utils'
import { useState } from 'react'

interface CotizacionDetalleProps {
  cotizacion: Cotizacion
  onEditar:   () => void
}

const ESTADO_COLORS: Record<EstadoCot, string> = {
  [EstadoCot.Pendiente]: 'bg-gray-100 text-gray-600',
  [EstadoCot.Enviada]:   'bg-blue-50 text-blue-700',
  [EstadoCot.Aceptada]:  'bg-emerald-50 text-emerald-700',
  [EstadoCot.Rechazada]: 'bg-red-50 text-red-600',
}

function InfoItem({ label, valor }: Readonly<{ label: string; valor?: string | null }>) {
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

export function CotizacionDetalle({ cotizacion, onEditar }: Readonly<CotizacionDetalleProps>) {
  const router  = useRouter()
  const [accionError, setAccionError] = useState<string | null>(null)

  const { mutateAsync: enviar,   isPending: enviando }   = useEnviarCotizacion()
  const { mutateAsync: aceptar,  isPending: aceptando }  = useAceptarCotizacion()
  const { mutateAsync: rechazar, isPending: rechazando } = useRechazarCotizacion()

  const anyPending   = enviando || aceptando || rechazando
  const esTerminal   = cotizacion.estado === EstadoCot.Aceptada ||
                       cotizacion.estado === EstadoCot.Rechazada
  const esPendiente  = cotizacion.estado === EstadoCot.Pendiente
  const esEnviada    = cotizacion.estado === EstadoCot.Enviada

  const handleAccion = async (fn: () => Promise<unknown>) => {
    try {
      setAccionError(null)
      await fn()
    } catch (err) {
      setAccionError(getErrorMessage(err))
    }
  }

  const formatMonto = (monto: number, tipo: TipoMoneda) => {
    const simbolo = tipo === TipoMoneda.Soles ? 'S/' : '$'
    return `${simbolo} ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
  }

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'long', year: 'numeric',
    })

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(ROUTES.cotizaciones)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                  text-gray-500 hover:text-gray-700 hover:bg-gray-50
                  border border-gray-200 transition-colors shrink-0"
              >
                <ArrowLeft size={14} />
                Volver
              </button>
              <button
                onClick={() => router.push(ROUTES.lead(cotizacion.id_lead))}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                  text-gray-500 hover:text-gray-700 hover:bg-gray-50
                  border border-gray-200 transition-colors shrink-0"
              >
                <Building2 size={14} />
                Ver lead
              </button>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center
              justify-center shrink-0">
              <DollarSign size={22} className="text-emerald-600" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-emerald-600">
                  {cotizacion.codigo ?? `COT-${cotizacion.id}`}
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

          <div className="flex items-center gap-2 flex-wrap">
            {!esTerminal && (
              <button
                onClick={onEditar}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                  font-semibold border border-emerald-600 text-emerald-600
                  hover:bg-emerald-50 transition-colors"
              >
                <Pencil size={14} />
                Editar
              </button>
            )}
          </div>
        </div>

        {/* Acciones de ciclo de vida */}
        {!esTerminal && (
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-3">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
              Avanzar estado
            </p>

            {accionError && (
              <div className="bg-red-50 border border-red-200 text-red-700
                text-xs rounded-xl px-3 py-2">
                {accionError}
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {esPendiente && (
                <button
                  onClick={() => handleAccion(() => enviar(cotizacion.id))}
                  disabled={anyPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                    font-semibold text-blue-600 border border-blue-200
                    hover:bg-blue-50 transition-colors
                    disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {enviando
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Send size={14} />
                  }
                  Marcar como enviada
                </button>
              )}

              {esEnviada && (
                <>
                  <button
                    onClick={() => handleAccion(() => aceptar(cotizacion.id))}
                    disabled={anyPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                      font-semibold text-emerald-700 border border-emerald-300
                      hover:bg-emerald-50 transition-colors
                      disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {aceptando
                      ? <Loader2 size={14} className="animate-spin" />
                      : <CheckCircle2 size={14} />
                    }
                    Aceptar
                  </button>

                  <button
                    onClick={() => handleAccion(() => rechazar(cotizacion.id))}
                    disabled={anyPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                      font-semibold text-red-600 border border-red-200
                      hover:bg-red-50 transition-colors
                      disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {rechazando
                      ? <Loader2 size={14} className="animate-spin" />
                      : <XCircle size={14} />
                    }
                    Rechazar
                  </button>
                </>
              )}
            </div>

            {(cotizacion.estado === EstadoCot.Aceptada ||
              cotizacion.estado === EstadoCot.Rechazada) && (
              <p className="text-xs text-gray-400 italic">
                Esta cotización está en estado terminal y no puede modificarse.
              </p>
            )}
          </div>
        )}

        {esTerminal && (
          <div className="mt-4 pt-4 border-t border-gray-50">
            <p className="text-xs text-gray-400 italic">
              Esta cotización está en estado terminal y no puede modificarse.
            </p>
          </div>
        )}
      </div>

      {/* Detalle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            Datos de la cotización
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Fecha"     valor={formatFecha(cotizacion.fecha_cot)} />
            <InfoItem label="Cliente"   valor={cotizacion.cliente ?? undefined} />
            <InfoItem label="Producto"  valor={cotizacion.producto ?? undefined} />
            <InfoItem label="Remitente" valor={cotizacion.nombre_remitente} />
            {cotizacion.contacto_nombre && (
              <InfoItem label="Contacto" valor={cotizacion.contacto_nombre} />
            )}
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
                className="flex items-center gap-2 text-sm text-emerald-600 hover:underline"
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

