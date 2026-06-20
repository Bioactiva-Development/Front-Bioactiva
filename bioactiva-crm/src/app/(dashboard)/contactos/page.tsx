'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useContactos } from '@/hooks/contactos/useContactos'
import { ContactoFiltros } from '@/components/modules/contactos/ContactoFiltros'
import { ContactoCard } from '@/components/modules/contactos/ContactoCard'
import { ContactoFiltros as FiltrosType } from '@/types/contacto.types'
import { PageHeader } from '@/components/layout/PageHeader'
import { useDebounce } from '@/hooks/shared/useDebounce'

const ITEMS_POR_PAGINA = 10

export default function ContactosPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [filtros, setFiltros] = useState<FiltrosType>({})
  const [pagina, setPagina]   = useState(1)

  const searchDebounced = useDebounce(filtros.search ?? '', 400)

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setPagina(1)
  }, [searchDebounced])

  const { data, isLoading, isError } = useContactos({
    search:         searchDebounced || undefined,
    page:           pagina,
    limit:          ITEMS_POR_PAGINA,
  })

  const contactos    = data?.data       ?? []
  const total        = data?.total      ?? 0
  const totalPaginas = data?.totalPages ?? Math.ceil(total / ITEMS_POR_PAGINA)

  const handleLimpiarFiltros = () => {
    setFiltros({})
    setPagina(1)
  }

  return (
    <div className="space-y-3">
      <PageHeader
        titulo="Directorio de Contactos"
        acciones={
          <button
            onClick={() => router.push('/contactos/nueva')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
              bg-emerald-600 hover:bg-emerald-700 text-white
              text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            Nuevo Contacto
          </button>
        }
      />

      <ContactoFiltros
        filtros={filtros}
        onChange={(f) => setFiltros(f)}
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
              Error al cargar contactos. Intente nuevamente.
            </p>
          </div>
        )}

        {!isLoading && !isError && contactos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
              <Plus size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500">
              No se encontraron contactos
            </p>
            <p className="text-xs text-gray-400">
              Intenta con otros filtros o registra un nuevo contacto
            </p>
          </div>
        )}

        {!isLoading && !isError && contactos.length > 0 && (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-emerald-700 text-white">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  Contacto
                </th>
                <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  Organización
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  Comunicación
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {contactos.map((contacto) => (
                <ContactoCard key={contacto.id} contacto={contacto} />
              ))}
            </tbody>
          </table>
          </div>
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
    </div>
  )
}
