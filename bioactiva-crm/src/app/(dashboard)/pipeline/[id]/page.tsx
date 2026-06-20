'use client'

import { useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import {
  useLead,
  useActualizarLead,
  useEliminarLead,
} from '@/hooks/pipeline/useLeads'
import { LeadDetalle } from '@/components/modules/pipeline/LeadDetalle'
import { LeadForm, LeadEditFocus } from '@/components/modules/pipeline/LeadForm'
import { LeadFormValues } from '@/lib/validators/lead.schema'
import { getErrorMessage } from '@/lib/utils/error.utils'

export default function LeadDetallePage() {
  const params                          = useParams()
  const searchParams                    = useSearchParams()
  const id                              = Number(params.id)
  const accionInicial                   = searchParams.get('accion')
  const [editando, setEditando]         = useState(accionInicial === 'editar')
  const [focusField, setFocusField]     = useState<LeadEditFocus | undefined>(undefined)
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null)

  const { data: lead, isLoading, isError } = useLead(id)

  const { mutateAsync: actualizar, isPending } = useActualizarLead(id)
  const { mutateAsync: eliminar, isPending: eliminando } = useEliminarLead()

  const handleGuardar = async (data: LeadFormValues) => {
    try {
      setErrorGuardar(null)
      await actualizar(data)
      setEditando(false)
    } catch (err: unknown) {
      setErrorGuardar(getErrorMessage(err, 'No se pudo guardar el lead.'))
    }
  }

  const handleEliminar = async () => {
    const confirmado = window.confirm(
      '¿Eliminar este lead? Esta acción no se puede deshacer.'
    )
    if (!confirmado) return

    try {
      setErrorGuardar(null)
      await eliminar(id)
      await new Promise((resolve) => setTimeout(resolve, 100))
      window.location.href = '/pipeline'
    } catch (err: unknown) {
      setErrorGuardar(getErrorMessage(err, 'No se pudo eliminar el lead.'))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Cargando lead...</span>
        </div>
      </div>
    )
  }

  if (isError || !lead) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <p className="text-sm font-semibold text-red-500">
          No se pudo cargar el lead
        </p>
        <p className="text-xs text-gray-400">
          Verifica que el ID sea correcto o intenta nuevamente
        </p>
      </div>
    )
  }

  if (editando) {
    return (
      <div>
        <LeadForm
          lead={lead}
          onSubmit={handleGuardar}
          isLoading={isPending}
          error={errorGuardar}
          focusField={focusField}
        />
      </div>
    )
  }

  return (
    <LeadDetalle
      lead={lead}
      onEditar={(focus) => { setFocusField(focus); setEditando(true) }}
      onEliminar={handleEliminar}
      eliminando={eliminando}
      initialAction={
        accionInicial === 'actividad' || accionInicial === 'seguimiento'
          ? accionInicial
          : undefined
      }
    />
  )
}
