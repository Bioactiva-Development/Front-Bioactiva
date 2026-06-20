'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileText, ExternalLink, ArrowLeft, Loader2 } from 'lucide-react'
import { CotizacionForm } from '@/components/modules/cotizaciones/CotizacionForm'
import {
  useCrearCotizacion,
  useCotizacionesPorLead,
} from '@/hooks/cotizaciones/useCotizaciones'
import { CotizacionFormValues } from '@/lib/validators/cotizacion.schema'
import { PageHeader } from '@/components/layout/PageHeader'
import { ROUTES } from '@/lib/constants/routes'
import { getErrorMessage } from '@/lib/utils/error.utils'

// Mapea los 409 del backend (POST /quotations) a mensajes claros: el backend
// solo permite UNA cotización por lead y exige que no haya actividades pendientes.
function mensajeCrearCotizacionError(err: unknown): string {
  const e = err as { status?: number; message?: string }
  if (e?.status === 409) {
    const msg = (e.message ?? '').toLowerCase()
    if (msg.includes('activit') || msg.includes('actividad')) {
      return 'El lead tiene una actividad pendiente. Complétala o cancélala antes de crear la cotización.'
    }
    return 'Este lead ya tiene una cotización. Solo se permite una cotización por lead.'
  }
  return getErrorMessage(err, 'No se pudo registrar la cotización.')
}

function NuevaCotizacionContent() {
  const router                = useRouter()
  const searchParams          = useSearchParams()
  const leadIdInicial         = searchParams.get('lead')
    ? Number(searchParams.get('lead'))
    : undefined
  const [error, setError]     = useState<string | null>(null)

  const { mutateAsync: crear, isPending } = useCrearCotizacion()

  // El backend permite una sola cotización por lead. Verificamos si ya existe
  // antes de mostrar el formulario para no provocar un 409.
  const {
    data: cotizacionesLead = [],
    isLoading: cargandoCotizaciones,
  } = useCotizacionesPorLead(leadIdInicial ?? 0)
  const cotizacionExistente = cotizacionesLead[0]

  useEffect(() => {
    if (!leadIdInicial) {
      router.replace(ROUTES.pipeline)
    }
  }, [leadIdInicial, router])

  if (!leadIdInicial) return null

  const handleSubmit = async (data: CotizacionFormValues) => {
    try {
      setError(null)
      await crear(data)
      await new Promise((resolve) => setTimeout(resolve, 100))
      router.push(ROUTES.cotizaciones)
    } catch (err: unknown) {
      setError(mensajeCrearCotizacionError(err))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Nueva Cotización"
        descripcion="Registra una nueva propuesta comercial"
      />

      {cargandoCotizaciones ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={22} className="animate-spin text-gray-300" />
        </div>
      ) : cotizacionExistente ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mx-auto">
              <FileText size={20} className="text-amber-600" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-gray-800">
                Este lead ya tiene una cotización
              </h2>
              <p className="text-sm text-gray-500">
                Solo se permite una cotización por lead. Edita la existente
                ({cotizacionExistente.codigo}) en lugar de crear una nueva.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push(ROUTES.pipeline)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
                  text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={16} />
                Volver al pipeline
              </button>
              <button
                type="button"
                onClick={() => router.push(ROUTES.cotizacion(cotizacionExistente.id))}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700
                  text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors"
              >
                <ExternalLink size={16} />
                Ver cotización
              </button>
            </div>
          </div>
        </div>
      ) : (
        <CotizacionForm
          onSubmit={handleSubmit}
          isLoading={isPending}
          error={error}
          leadIdInicial={leadIdInicial}
        />
      )}
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
