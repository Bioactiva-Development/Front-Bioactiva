'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { usePlantilla } from '@/hooks/plantillas/usePlantillas'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { ROUTES } from '@/lib/constants/routes'

export default function PlantillaDetallePage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)
  const [error] = useState<string | null>(null)

  const { data: plantilla, isLoading, isError } = usePlantilla(id)

  if (!id || isError) {
    return (
      <div className="space-y-6">
        <PageHeader titulo="Plantilla no encontrada" />
        <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
          No se encontró la plantilla solicitada. Verifica el enlace o regresa al listado.
        </div>
        <button
          type="button"
          onClick={() => router.push(ROUTES.plantillas)}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Volver a plantillas
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo={plantilla?.nombre ?? 'Detalle de plantilla'}
        descripcion="Revisa la plantilla y edita si es necesario"
        acciones={
          <button
            type="button"
            onClick={() => router.push(`/plantillas/${id}/editar`)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            <Pencil size={16} /> Editar
          </button>
        }
      />

      {!plantilla || isLoading ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Cargando plantilla...</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Asunto</p>
                <p className="mt-2 text-base text-gray-900">{plantilla.asunto}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Cuerpo</p>
                <pre className="whitespace-pre-wrap rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">{plantilla.cuerpo}</pre>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Categoría</p>
              <p className="mt-2 text-sm text-gray-900">{plantilla.categoria}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Uso</p>
              <p className="mt-2 text-sm text-gray-900">{plantilla.uso}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Estado</p>
              <p className="mt-2 text-sm text-gray-900">
                {plantilla.activo ? 'Activa' : 'Inactiva'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Creada</p>
              <p className="mt-2 text-sm text-gray-900">{new Date(plantilla.created_at).toLocaleDateString('es-PE')}</p>
            </div>
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
