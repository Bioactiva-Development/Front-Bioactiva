'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import {
  useLead,
  useActualizarLead,
} from '@/hooks/pipeline/useLeads'
import { LeadDetalle } from '@/components/modules/pipeline/LeadDetalle'
import { LeadForm } from '@/components/modules/pipeline/LeadForm'
import { LeadFormValues } from '@/lib/validators/lead.schema'
import { getErrorMessage } from '@/lib/utils/error.utils'

export default function LeadDetallePage() {
  const params                          = useParams()
  const id                              = Number(params.id)
  const [editando, setEditando]         = useState(false)
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null)

  const { data: lead, isLoading, isError } = useLead(id)

  const { mutateAsync: actualizar, isPending } = useActualizarLead(id)

  const handleGuardar = async (data: LeadFormValues) => {
    try {
      setErrorGuardar(null)
      await actualizar(data)
      setEditando(false)
    } catch (err: unknown) {
      setErrorGuardar(getErrorMessage(err, 'No se pudo guardar el lead.'))
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
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditando(false)}
            className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
          >
            ← Cancelar edición
          </button>
        </div>
        <LeadForm
          lead={lead}
          onSubmit={handleGuardar}
          isLoading={isPending}
          error={errorGuardar}
        />
      </div>
    )
  }

  return (
    <LeadDetalle
      lead={lead}
      onEditar={() => setEditando(true)}
    />
  )
}