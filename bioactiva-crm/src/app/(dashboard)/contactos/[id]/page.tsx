'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import {
  useContacto,
  useActualizarContacto,
} from '@/hooks/contactos/useContactos'
import { ContactoDetalle } from '@/components/modules/contactos/ContactoDetalle'
import { ContactoForm } from '@/components/modules/contactos/ContactoForm'
import { ContactoFormValues } from '@/lib/validators/contacto.schema'
import { getErrorMessage } from '@/lib/utils/error.utils'

export default function ContactoDetallePage() {
  const params                          = useParams()
  const id                              = Number(params.id)
  const [editando, setEditando]         = useState(false)
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null)

  const { data: contacto, isLoading, isError } = useContacto(id)

  const { mutateAsync: actualizar, isPending } = useActualizarContacto(id)

  const handleGuardar = async (data: ContactoFormValues) => {
    try {
      setErrorGuardar(null)
      await actualizar(data)
      setEditando(false)
    } catch (err: unknown) {
      setErrorGuardar(getErrorMessage(err, 'No se pudo guardar el contacto.'))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Cargando contacto...</span>
        </div>
      </div>
    )
  }

  if (isError || !contacto) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <p className="text-sm font-semibold text-red-500">
          No se pudo cargar el contacto
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
        <ContactoForm
          contacto={contacto}
          onSubmit={handleGuardar}
          isLoading={isPending}
          error={errorGuardar}
        />
      </div>
    )
  }

  return (
    <ContactoDetalle
      contacto={contacto}
      onEditar={() => setEditando(true)}
    />
  )
}