'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import {
  useOrganizacionConRelaciones,
  useActualizarOrganizacion,
  useEliminarOrganizacion,
} from '@/hooks/organizaciones/useOrganizaciones'
import { OrganizacionDetalle } from '@/components/modules/organizaciones/OrganizacionDetalle'
import { OrganizacionForm } from '@/components/modules/organizaciones/OrganizacionForm'
import { OrganizacionFormValues } from '@/lib/validators/organizacion.schema'
import { getErrorMessage } from '@/lib/utils/error.utils'

export default function OrganizacionDetallePage() {
  const params                          = useParams()
  const id                              = params.id as string
  const [editando, setEditando]         = useState(false)
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null)

  const { data: organizacion, isLoading, isError } =
    useOrganizacionConRelaciones(id)

  const { mutateAsync: actualizar, isPending } = useActualizarOrganizacion(id)
  const { mutateAsync: desactivar, isPending: desactivando } = useEliminarOrganizacion()

  const handleGuardar = async (data: OrganizacionFormValues) => {
    try {
      setErrorGuardar(null)
      await actualizar(data)
      setEditando(false)
    } catch (err: unknown) {
      setErrorGuardar(getErrorMessage(err, 'No se pudo guardar la organización.'))
    }
  }

  // Soft-delete: DELETE /organizations/:id. El hook invalida el listado y
  // redirige a /organizaciones, así la org desactivada desaparece de la vista.
  const handleDesactivar = async () => {
    try {
      await desactivar(id)
    } catch (err: unknown) {
      setErrorGuardar(getErrorMessage(err, 'No se pudo desactivar la organización.'))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Cargando organización...</span>
        </div>
      </div>
    )
  }

  if (isError || !organizacion) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <p className="text-sm font-semibold text-red-500">
          No se pudo cargar la organización
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
        <OrganizacionForm
          organizacion={organizacion}
          onSubmit={handleGuardar}
          isLoading={isPending}
          error={errorGuardar}
        />
      </div>
    )
  }

  return (
    <OrganizacionDetalle
      organizacion={organizacion}
      onEditar={() => setEditando(true)}
      onEliminar={handleDesactivar}
      eliminando={desactivando}
    />
  )
}