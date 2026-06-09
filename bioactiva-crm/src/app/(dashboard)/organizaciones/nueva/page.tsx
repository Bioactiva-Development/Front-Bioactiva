'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OrganizacionForm } from '@/components/modules/organizaciones/OrganizacionForm'
import { useCrearOrganizacion } from '@/hooks/organizaciones/useOrganizaciones'
import { OrganizacionFormValues } from '@/lib/validators/organizacion.schema'
import { PageHeader } from '@/components/layout/PageHeader'
import { ROUTES } from '@/lib/constants/routes'
import { getErrorMessage } from '@/lib/utils/error.utils'

export default function NuevaOrganizacionPage() {
  const router            = useRouter()
  const [error, setError] = useState<string | null>(null)

  const { mutateAsync: crear, isPending } = useCrearOrganizacion()

    const handleSubmit = async (data: OrganizacionFormValues) => {
      try {
        setError(null)
        await crear(data)
        await new Promise((resolve) => setTimeout(resolve, 100))
        router.push(ROUTES.organizaciones)
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'No se pudo registrar la organización.'))
      }
    }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Nueva Organización"
        descripcion="Registra una nueva organización en el CRM"
      />

      <OrganizacionForm
        onSubmit={handleSubmit}
        isLoading={isPending}
        error={error}
      />
    </div>
  )
}
