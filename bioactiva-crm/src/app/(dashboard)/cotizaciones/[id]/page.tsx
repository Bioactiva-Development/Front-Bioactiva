'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import {
  useCotizacion,
  useActualizarCotizacion,
} from '@/hooks/cotizaciones/useCotizaciones'
import { CotizacionDetalle } from '@/components/modules/cotizaciones/CotizacionDetalle'
import { CotizacionForm } from '@/components/modules/cotizaciones/CotizacionForm'
import { CotizacionFormValues } from '@/lib/validators/cotizacion.schema'
import { getErrorMessage } from '@/lib/utils/error.utils'

export default function CotizacionDetallePage() {
  const params                          = useParams()
  const id                              = Number(params.id)
  const [editando, setEditando]         = useState(false)
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null)

  const { data: cotizacion, isLoading, isError } = useCotizacion(id)

  const { mutateAsync: actualizar, isPending } = useActualizarCotizacion(id)

  const handleGuardar = async (data: CotizacionFormValues) => {
    try {
      setErrorGuardar(null)
      await actualizar(data)
      setEditando(false)
    } catch (err: unknown) {
      setErrorGuardar(getErrorMessage(err, 'No se pudo guardar la cotización.'))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Cargando cotización...</span>
        </div>
      </div>
    )
  }

  if (isError || !cotizacion) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <p className="text-sm font-semibold text-red-500">
          No se pudo cargar la cotización
        </p>
        <p className="text-xs text-gray-400">
          Verifica que el ID sea correcto o intenta nuevamente
        </p>
      </div>
    )
  }

  if (editando) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditando(false)}
            className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
          >
            ← Cancelar edición
          </button>
        </div>
        <CotizacionForm
          cotizacion={cotizacion}
          onSubmit={handleGuardar}
          isLoading={isPending}
          error={errorGuardar}
        />
      </div>
    )
  }

  return (
    <CotizacionDetalle
      cotizacion={cotizacion}
      onEditar={() => setEditando(true)}
    />
  )
}
