'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LeadForm } from '@/components/modules/pipeline/LeadForm'
import { useCrearLead } from '@/hooks/pipeline/useLeads'
import { LeadFormValues } from '@/lib/validators/lead.schema'
import { PageHeader } from '@/components/layout/PageHeader'
import { ROUTES } from '@/lib/constants/routes'
import { getErrorMessage } from '@/lib/utils/error.utils'
import { LeadState } from '@/types/enums'

export default function NuevoLeadPage() {
  const router            = useRouter()
  const [error, setError] = useState<string | null>(null)

  const { mutateAsync: crear, isPending } = useCrearLead()

  const handleSubmit = async (data: LeadFormValues) => {
    try {
      setError(null)
      await crear({ ...data, estado: LeadState.Prospecto })
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
        estadoInicial={LeadState.Prospecto}
        estadoEditable={false}
        onSubmit={handleSubmit}
        isLoading={isPending}
        error={error}
      />
    </div>
  )
}
