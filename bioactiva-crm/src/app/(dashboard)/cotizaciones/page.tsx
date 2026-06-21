'use client'

import { useState } from 'react'
import { useCotizaciones } from '@/hooks/cotizaciones/useCotizaciones'
import { CotizacionFiltros } from '@/components/modules/cotizaciones/CotizacionFiltros'
import { CotizacionCard } from '@/components/modules/cotizaciones/CotizacionCard'
import { CotizacionFiltros as FiltrosType } from '@/types/cotizacion.types'

const FILTROS_INICIALES: FiltrosType = {
  page:  1,
  limit: 10,
}

export default function CotizacionesPage() {
  const [filtros, setFiltros] = useState<FiltrosType>(FILTROS_INICIALES)

  const { data, isLoading, isError }  = useCotizaciones(filtros)

  const cotizaciones = data?.data  ?? []
  const total        = data?.total ?? 0
  const paginaActual = data?.page  ?? 1
  const limit        = data?.limit ?? 10
  const totalPaginas = Math.ceil(total / limit)

  const handlePagina = (pagina: number) => {
    setFiltros((prev) => ({ ...prev, page: pagina }))
  }

  return (
    <div className="space-y-3">

      <div>
        <h1 className="text-xl font-bold text-gray-900">Cotizaciones</h1>
        <p className="text-sm text-gray-400 mt-0.5">Gestión de propuestas comerciales</p>
      </div>

      <CotizacionFiltros
        filtros={filtros}
        onChange={setFiltros}
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
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-emerald-700 text-white">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  # Cotización
                </th>
                <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  Período
                </th>
                <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  Contacto
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  Nombre del servicio
                </th>
                <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  Monto
                </th>
                <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
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
          </div>
        )}

        {!isLoading && total > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
            <p className="text-sm text-gray-500">
              Mostrando {((paginaActual - 1) * limit) + 1}–{Math.min(paginaActual * limit, total)} de {total}
            </p>
            {totalPaginas > 1 && (
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
            )}
          </div>
        )}
      </div>
    </div>
  )
}
