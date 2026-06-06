'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { OrganizacionForm } from '@/components/modules/organizaciones/OrganizacionForm'
import { SunatBuscador } from '@/components/modules/organizaciones/SunatBuscador'
import { useCrearOrganizacion } from '@/hooks/organizaciones/useOrganizaciones'
import { OrganizacionFormValues } from '@/lib/validators/organizacion.schema'
import { SunatRucResult } from '@/types/organizacion.types'
import { PageHeader } from '@/components/layout/PageHeader'
import { ROUTES } from '@/lib/constants/routes'
import { getErrorMessage } from '@/lib/utils/error.utils'

export default function NuevaOrganizacionPage() {
  const router                          = useRouter()
  const [sunatAbierto, setSunatAbierto] = useState(false)
  const [sunatData, setSunatData]       = useState<SunatRucResult | null>(null)
  const [error, setError]               = useState<string | null>(null)

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
    setSunatData(data)
    setSunatAbierto(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Nueva Organización"
        descripcion="Registra una nueva organización en el CRM"
        acciones={
          <button
            onClick={() => setSunatAbierto(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-2
              border-emerald-600 text-emerald-600 hover:bg-emerald-50
              text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            Validador SUNAT
          </button>
        }
      />

      {sunatData && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <p className="text-sm font-semibold text-emerald-700">
            Datos obtenidos de SUNAT
          </p>
          <p className="text-xs text-emerald-600 mt-0.5">
            {sunatData.nombre} — RUC: {sunatData.ruc}
          </p>
        </div>
      )}

      <OrganizacionForm
        onSubmit={handleSubmit}
        isLoading={isPending}
        error={error}
        sunatData={sunatData}
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