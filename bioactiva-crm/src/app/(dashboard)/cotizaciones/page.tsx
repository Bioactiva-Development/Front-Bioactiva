'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react'
import { useCotizaciones, useCotizacionKpis } from '@/hooks/cotizaciones/useCotizaciones'
import { CotizacionFiltros } from '@/components/modules/cotizaciones/CotizacionFiltros'
import { CotizacionCard } from '@/components/modules/cotizaciones/CotizacionCard'
import { CotizacionFiltros as FiltrosType } from '@/types/cotizacion.types'

const FILTROS_INICIALES: FiltrosType = {
  page:  1,
  limit: 10,
}

export default function CotizacionesPage() {
  const router                = useRouter()
  const [filtros, setFiltros] = useState<FiltrosType>(FILTROS_INICIALES)

  const { data, isLoading, isError }  = useCotizaciones(filtros)
  const { data: kpis }                = useCotizacionKpis()

  const cotizaciones = data?.data  ?? []
  const total        = data?.total ?? 0
  const paginaActual = data?.page  ?? 1
  const limit        = data?.limit ?? 10
  const totalPaginas = Math.ceil(total / limit)

  const handleLimpiarFiltros = () => setFiltros(FILTROS_INICIALES)

  const handlePagina = (pagina: number) => {
    setFiltros((prev) => ({ ...prev, page: pagina }))
  }

  const formatMonto = (monto: number) =>
    `S/ ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-100
          rounded-xl px-1 py-1 shadow-sm">
          <button className="px-4 py-2 rounded-lg text-sm font-semibold
            bg-emerald-50 text-emerald-700">
            Cotizaciones
          </button>
        </div>
        <button
          onClick={() => router.push('/cotizaciones/nueva')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl
            bg-emerald-600 hover:bg-emerald-700 text-white
            text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          Nueva Cotización
        </button>
      </div>

      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Total activo
              </p>
              <TrendingUp size={18} className="text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {formatMonto(kpis.totalActivo)}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Aceptadas
              </p>
              <CheckCircle size={18} className="text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpis.aceptadas}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Enviadas
              </p>
              <Clock size={18} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{kpis.enviadas}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Rechazadas
              </p>
              <XCircle size={18} className="text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600">
              {kpis.rechazadas}
            </p>
          </div>
        </div>
      )}

      <CotizacionFiltros
        filtros={filtros}
        onChange={setFiltros}
        onLimpiar={handleLimpiarFiltros}
        isLoading={isLoading}
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-emerald-600
              border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-red-500">
              Error al cargar cotizaciones. Intente nuevamente.
            </p>
          </div>
        )}

        {!isLoading && !isError && cotizaciones.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <p className="text-sm font-semibold text-gray-500">
              No se encontraron cotizaciones
            </p>
          </div>
        )}

        {!isLoading && !isError && cotizaciones.length > 0 && (
          <table className="w-full">
            <thead>
              <tr className="bg-emerald-700 text-white">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  # Cotización
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  ID Lead
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  Período
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  Contacto
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  Nombre del servicio
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  Monto
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {cotizaciones.map((cot) => (
                <CotizacionCard
                  key={cot.id}
                  cotizacion={cot}
                />
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && totalPaginas > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
            <p className="text-sm text-gray-500">
              Mostrando {((paginaActual - 1) * limit) + 1} – {Math.min(paginaActual * limit, total)} de {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600
                  hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ‹
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePagina(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors
                    ${p === paginaActual
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => handlePagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600
                  hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ›
              </button>
            </div>
          </div>
        )}

        {!isLoading && totalPaginas <= 1 && cotizaciones.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-50">
            <p className="text-sm text-gray-500">
              Mostrando 1 – {cotizaciones.length} de {total}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
