'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { PlantillaForm } from '@/components/modules/plantillas/PlantillaForm'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { useCrearPlantilla } from '@/hooks/plantillas/usePlantillas'
import { PlantillaFormValues } from '@/lib/validators/plantilla.schema'
import { ROUTES } from '@/lib/constants/routes'
import { getErrorMessage } from '@/lib/utils/error.utils'

export default function NuevaPlantillaPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const { mutateAsync: crear, isPending } = useCrearPlantilla()

  const handleSubmit = async (data: PlantillaFormValues) => {
    try {
      setError(null)
      await crear(data)
      await new Promise((resolve) => setTimeout(resolve, 100))
      router.push(ROUTES.plantillas)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'No se pudo crear la plantilla.'))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Nueva Plantilla"
        descripcion="Crea una plantilla de correo para recordatorios y seguimientos"
        acciones={
          <button
            type="button"
            onClick={() => router.push(ROUTES.plantillas)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Plus size={16} /> Volver a plantillas
          </button>
        }
      />

      <PlantillaForm
        onSubmit={handleSubmit}
        isLoading={isPending}
        error={error}
      />
    </div>
  )
}
