'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LeadForm } from '@/components/modules/pipeline/LeadForm'
import { useCrearLead } from '@/hooks/pipeline/useLeads'
import { LeadFormValues } from '@/lib/validators/lead.schema'
import { PageHeader } from '@/components/layout/PageHeader'
import { ROUTES } from '@/lib/constants/routes'
import { getErrorMessage } from '@/lib/utils/error.utils'
import { LeadState } from '@/types/enums'

const ESTADOS_VALIDOS = new Set<string>(Object.values(LeadState))

export default function NuevoLeadPage() {
  const router            = useRouter()
  const searchParams      = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const estadoParam       = searchParams.get('estado')
  const estadoInicial     = estadoParam && ESTADOS_VALIDOS.has(estadoParam)
    ? estadoParam as LeadState
    : undefined

  const { mutateAsync: crear, isPending } = useCrearLead()

  const handleSubmit = async (data: LeadFormValues) => {
    try {
      setError(null)
      await crear(data)
      await new Promise((resolve) => setTimeout(resolve, 100))
      router.push(ROUTES.pipeline)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'No se pudo registrar el lead.'))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Nuevo Lead"
        descripcion="Registra una nueva oportunidad comercial"
      />
      <LeadForm
        estadoInicial={estadoInicial}
        onSubmit={handleSubmit}
        isLoading={isPending}
        error={error}
      />
    </div>
  )
}
