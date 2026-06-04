'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CotizacionForm } from '@/components/modules/cotizaciones/CotizacionForm'
import { useCrearCotizacion } from '@/hooks/cotizaciones/useCotizaciones'
import { CotizacionFormValues } from '@/lib/validators/cotizacion.schema'
import { PageHeader } from '@/components/layout/PageHeader'
import { ROUTES } from '@/lib/constants/routes'
import { getErrorMessage } from '@/lib/utils/error.utils'

function NuevaCotizacionContent() {
  const router                = useRouter()
  const searchParams          = useSearchParams()
  const leadIdInicial         = searchParams.get('lead')
    ? Number(searchParams.get('lead'))
    : undefined
  const [error, setError]     = useState<string | null>(null)

  const { mutateAsync: crear, isPending } = useCrearCotizacion()

  const handleSubmit = async (data: CotizacionFormValues) => {
    try {
      setError(null)
      await crear(data)
      await new Promise((resolve) => setTimeout(resolve, 100))
      router.push(ROUTES.cotizaciones)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'No se pudo registrar la cotización.'))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Nueva Cotización"
        descripcion="Registra una nueva propuesta comercial"
      />
      <CotizacionForm
        onSubmit={handleSubmit}
        isLoading={isPending}
        error={error}
        leadIdInicial={leadIdInicial}
      />
    </div>
  )
}

export default function NuevaCotizacionPage() {
  return (
    <Suspense>
      <NuevaCotizacionContent />
    </Suspense>
  )
}