'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ContactoForm } from '@/components/modules/contactos/ContactoForm'
import { useCrearContacto } from '@/hooks/contactos/useContactos'
import { ContactoFormValues } from '@/lib/validators/contacto.schema'
import { PageHeader } from '@/components/layout/PageHeader'
import { ROUTES } from '@/lib/constants/routes'
import { getErrorMessage } from '@/lib/utils/error.utils'

function NuevoContactoContent() {
  const router                = useRouter()
  const searchParams          = useSearchParams()
  const orgIdInicial          = searchParams.get('organizacion') ?? undefined
  const [error, setError]     = useState<string | null>(null)

  const { mutateAsync: crear, isPending } = useCrearContacto()

  const handleSubmit = async (data: ContactoFormValues) => {
    try {
      setError(null)
      await crear(data)
      await new Promise((resolve) => setTimeout(resolve, 100))
      router.push(ROUTES.contactos)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'No se pudo registrar el contacto.'))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Nuevo Contacto"
        descripcion="Registra un nuevo contacto en el CRM"
      />
      <ContactoForm
        onSubmit={handleSubmit}
        isLoading={isPending}
        error={error}
        orgIdInicial={orgIdInicial}
      />
    </div>
  )
}

export default function NuevoContactoPage() {
  return (
    <Suspense>
      <NuevoContactoContent />
    </Suspense>
  )
}