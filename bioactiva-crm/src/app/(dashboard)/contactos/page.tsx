'use client'

import { useState } from 'react'
import { Plus, Users, X } from 'lucide-react'
import { PaginacionSlidingWindow } from '@/components/ui/PaginacionSlidingWindow'
import { useRouter, useSearchParams } from 'next/navigation'
import { useContactos } from '@/hooks/contactos/useContactos'
import { ContactoFiltros } from '@/components/modules/contactos/ContactoFiltros'
import { ContactoCard } from '@/components/modules/contactos/ContactoCard'
import { ContactoFiltros as FiltrosType } from '@/types/contacto.types'
import { PageHeader } from '@/components/layout/PageHeader'
import { useDebounce } from '@/hooks/shared/useDebounce'
import { ROUTES } from '@/lib/constants/routes'

const ITEMS_POR_PAGINA = 10

export default function ContactosPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const orgId     = searchParams.get('organizacion') ?? undefined
  const orgNombre = searchParams.get('orgNombre')    ?? undefined

  const [filtros, setFiltros] = useState<FiltrosType>({ idOrganizacion: orgId })
  const [pagina, setPagina]   = useState(1)

  const searchDebounced = useDebounce(filtros.search ?? '', 400)

  const { data, isLoading, isError } = useContactos({
    search:          searchDebounced || undefined,
    idOrganizacion:  filtros.idOrganizacion,
    page:            pagina,
    limit:           ITEMS_POR_PAGINA,
  })

  const contactos    = data?.data       ?? []
  const total        = data?.total      ?? 0
  const totalPaginas = data?.totalPages ?? Math.ceil(total / ITEMS_POR_PAGINA)

  const handleLimpiarFiltros = () => {
    // Solo limpia la búsqueda por texto; preserva el filtro de organización
    setFiltros((prev) => ({ idOrganizacion: prev.idOrganizacion }))
    setPagina(1)
  }

  const handleQuitarFiltroOrg = () => {
    setFiltros({})
    setPagina(1)
    router.replace(ROUTES.contactos)
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
        onChange={(f) => { setFiltros(f); setPagina(1) }}
        onLimpiar={handleLimpiarFiltros}
      />

      {filtros.idOrganizacion && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200
          rounded-xl px-4 py-2.5 text-sm text-emerald-700">
          <Users size={14} className="shrink-0" />
          <span>
            Contactos asociados a{' '}
            <strong>{orgNombre ?? 'la organización'}</strong>
          </span>
          <button
            onClick={handleQuitarFiltroOrg}
            className="ml-auto flex items-center gap-1 text-xs text-red-500
              hover:text-red-700 transition-colors"
          >
            <X size={14} />
            Quitar filtro
          </button>
        </div>
      )}

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
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Contacto
                </th>
                <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Organización
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Comunicación
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
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
            <PaginacionSlidingWindow
              paginaActual={pagina}
              totalPaginas={totalPaginas}
              onChange={setPagina}
            />
          </div>
        )}
      </div>
    </div>
  )
}
