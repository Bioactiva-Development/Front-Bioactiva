'use client'

import { useState } from 'react'
import { Plus, Search as SearchIcon } from 'lucide-react'
import { useOrganizaciones } from '@/hooks/organizaciones/useOrganizaciones'
import { OrganizacionFiltros } from '@/components/modules/organizaciones/OrganizacionFiltros'
import { OrganizacionCard } from '@/components/modules/organizaciones/OrganizacionCard'
import { OrganizacionFiltros as FiltrosType } from '@/types/organizacion.types'
import { SunatBuscador } from '@/components/modules/organizaciones/SunatBuscador'
import { PageHeader } from '@/components/layout/PageHeader'
import { useRouter } from 'next/navigation'

const ITEMS_POR_PAGINA  = 10
const FILTROS_INICIALES: FiltrosType = {}

export default function OrganizacionesPage() {
  const router = useRouter()
  const [filtros, setFiltros]           = useState<FiltrosType>(FILTROS_INICIALES)
  const [pagina, setPagina]             = useState(1)
  const [sunatAbierto, setSunatAbierto] = useState(false)

  // Filtros + paginación van al hook: el servicio (mock o API) aplica todo.
  // keepPreviousData en el hook garantiza que data nunca sea undefined entre queries.
  const { data, isLoading, isError } = useOrganizaciones({
    ...filtros,
    page:  pagina,
    limit: ITEMS_POR_PAGINA,
  })

  const organizaciones = data?.data    ?? []
  const total          = data?.total   ?? 0
  const totalPaginas   = Math.ceil(total / ITEMS_POR_PAGINA)

  const handleFiltrosChange = (nuevos: FiltrosType) => {
    setFiltros(nuevos)
    setPagina(1)
  }

  const handleLimpiarFiltros = () => {
    setFiltros(FILTROS_INICIALES)
    setPagina(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Gestión de Organizaciones"
        acciones={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSunatAbierto(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border-2
                border-emerald-600 text-emerald-600 hover:bg-emerald-50
                text-sm font-semibold transition-colors"
            >
              <SearchIcon size={16} />
              Validador SUNAT
            </button>

            <button
              onClick={() => router.push('/organizaciones/nueva')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl
                bg-emerald-600 hover:bg-emerald-700 text-white
                text-sm font-semibold transition-colors"
            >
              <Plus size={16} />
              Nueva Organización
            </button>
          </div>
        }
      />

      <OrganizacionFiltros
        filtros={filtros}
        onChange={handleFiltrosChange}
        onLimpiar={handleLimpiarFiltros}
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent
              rounded-full animate-spin" />
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-red-500">
              Error al cargar organizaciones. Intente nuevamente.
            </p>
          </div>
        )}

        {!isLoading && !isError && organizaciones.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
              <SearchIcon size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500">
              No se encontraron organizaciones
            </p>
            <p className="text-xs text-gray-400">
              Intenta con otros filtros o registra una nueva organización
            </p>
          </div>
        )}

        {!isLoading && !isError && organizaciones.length > 0 && (
          <table className="w-full">
            <thead>
              <tr className="bg-emerald-700 text-white">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  Organización
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  RUC
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  Sector
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  Tamaño
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {organizaciones.map((org) => (
                <OrganizacionCard key={org.id} organizacion={org} />
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && total > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
            <p className="text-sm text-gray-500">
              Mostrando {((pagina - 1) * ITEMS_POR_PAGINA) + 1}–{Math.min(pagina * ITEMS_POR_PAGINA, total)} de {total}
            </p>
            {totalPaginas > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagina((p) => p - 1)}
                  disabled={pagina === 1}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600
                    hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ‹
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPagina(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors
                      ${p === pagina
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPagina((p) => p + 1)}
                  disabled={pagina === totalPaginas}
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

      {sunatAbierto && (
        <SunatBuscador
          modoConsulta={true}
          onSeleccionar={() => setSunatAbierto(false)}
          onCerrar={() => setSunatAbierto(false)}
        />
      )}
    </div>
  )
}
