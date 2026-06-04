'use client'

import { Mail, Phone, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Contacto } from '@/types/contacto.types'
import { ROUTES } from '@/lib/constants/routes'

interface ContactoCardProps {
  contacto: Contacto
}

export function ContactoCard({ contacto }: ContactoCardProps) {
  const router   = useRouter()
  const iniciales = `${contacto.nombres.charAt(0)}${contacto.apellidos?.charAt(0) ?? ''}`.toUpperCase()

  const handleVerDetalle = () => {
    router.push(ROUTES.contacto(contacto.id))
  }

  return (
    <tr
      className="border-b border-gray-50 hover:bg-emerald-50/30 transition-colors cursor-pointer"
      onClick={handleVerDetalle}
    >
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center
            justify-center shrink-0">
            <span className="text-sm font-bold text-emerald-700">{iniciales}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              {contacto.vocativo && `${contacto.vocativo}. `}
              {contacto.nombres} {contacto.apellidos}
            </p>
            {contacto.cargo && (
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                {contacto.cargo}
              </p>
            )}
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center shrink-0">
            <span className="text-xs text-gray-500">🏢</span>
          </div>
          {contacto.organizacion_nombre ?? '—'}
        </div>
      </td>

      <td className="px-4 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail size={13} className="text-emerald-500 shrink-0" />
            <span>{contacto.correo}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Phone size={13} className="text-emerald-500 shrink-0" />
            <span>{contacto.telefono ?? '—'}</span>
          </div>
        </div>
      </td>

      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleVerDetalle}
          className="p-2 rounded-lg text-gray-400 hover:text-emerald-600
            hover:bg-emerald-50 transition-colors"
        >
          <ExternalLink size={15} />
        </button>
      </td>
    </tr>
  )
}