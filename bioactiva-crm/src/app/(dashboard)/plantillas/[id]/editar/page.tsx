'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { usePlantilla, useActualizarPlantilla } from '@/hooks/plantillas/usePlantillas'
import { PlantillaForm } from '@/components/modules/plantillas/PlantillaForm'
import { PlantillaFormValues } from '@/lib/validators/plantilla.schema'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { ROUTES } from '@/lib/constants/routes'
import { getErrorMessage } from '@/lib/utils/error.utils'

export default function EditarPlantillaPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)
  const [error, setError] = useState<string | null>(null)

  const { data: plantilla, isLoading, isError } = usePlantilla(id)
  const { mutateAsync: actualizar, isPending } = useActualizarPlantilla(id)

  const handleSubmit = async (data: PlantillaFormValues) => {
    try {
      setError(null)
      await actualizar(data)
      await new Promise((resolve) => setTimeout(resolve, 100))
      router.push(`/plantillas/${id}`)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'No se pudo actualizar la plantilla.'))
    }
  }

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
        titulo="Editar plantilla"
        descripcion="Modifica los datos de la plantilla de correo"
        acciones={
          <button
            type="button"
            onClick={() => router.push(`/plantillas/${id}`)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Volver al detalle
          </button>
        }
      />

      {(!plantilla || isLoading) ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Cargando plantilla...</p>
        </div>
      ) : (
        <PlantillaForm
          plantilla={plantilla}
          onSubmit={handleSubmit}
          isLoading={isPending}
          error={error}
        />
      )}
    </div>
  )
}
