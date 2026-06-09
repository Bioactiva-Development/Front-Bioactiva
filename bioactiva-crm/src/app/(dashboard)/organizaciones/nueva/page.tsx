'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { OrganizacionForm } from '@/components/modules/organizaciones/OrganizacionForm'
import { SunatBuscador } from '@/components/modules/organizaciones/SunatBuscador'
import { useCrearOrganizacion } from '@/hooks/organizaciones/useOrganizaciones'
import { OrganizacionFormValues } from '@/lib/validators/organizacion.schema'
import { ROUTES } from '@/lib/constants/routes'
import { getErrorMessage } from '@/lib/utils/error.utils'
import { SunatRucResult } from '@/types/organizacion.types'

export default function NuevaOrganizacionPage() {
  const router                          = useRouter()
  const [error, setError]               = useState<string | null>(null)
  const [sunatAbierto, setSunatAbierto] = useState(false)
  const [datosSunat, setDatosSunat]     = useState<SunatRucResult | null>(null)

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

  const handleSeleccionarSunat = (data: SunatRucResult) => {
    setDatosSunat(data)
    setSunatAbierto(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Nueva Organización</h1>
          <p className="text-sm text-gray-500 mt-0.5">Registra una nueva organización en el CRM</p>
        </div>
        <button
          type="button"
          onClick={() => setSunatAbierto(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200
            text-emerald-600 hover:bg-emerald-50 text-sm font-semibold transition-colors"
        >
          <Search size={16} />
          Validador SUNAT
        </button>
      </div>

      <OrganizacionForm
        onSubmit={handleSubmit}
        isLoading={isPending}
        error={error}
        datosSunat={datosSunat}
      />

      {sunatAbierto && (
        <SunatBuscador
          onSeleccionar={handleSeleccionarSunat}
          onCerrar={() => setSunatAbierto(false)}
        />
      )}
    </div>
  )
}
