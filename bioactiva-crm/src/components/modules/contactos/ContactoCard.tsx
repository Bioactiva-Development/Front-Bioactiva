'use client'

import { Mail, Phone, ExternalLink, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Contacto } from '@/types/contacto.types'
import { ROUTES } from '@/lib/constants/routes'
import { formatVocativo } from '@/lib/utils/contacto.utils'

interface ContactoCardProps {
  contacto: Contacto
}

export function ContactoCard({ contacto }: Readonly<ContactoCardProps>) {
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
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center
            justify-center shrink-0">
            <span className="text-sm font-bold text-emerald-700">{iniciales}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              {contacto.vocativo && `${formatVocativo(contacto.vocativo)} `}
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

      <td className="px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Building2 size={13} className="text-gray-400 shrink-0" />
          {contacto.organizacion_nombre ?? '—'}
        </div>
      </td>

      <td className="px-4 py-3">
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

      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide
          ${contacto.estado_correo === 'VENCIDO'
            ? 'bg-red-50 text-red-600'
            : 'bg-emerald-50 text-emerald-700'
          }`}>
          {contacto.estado_correo === 'VENCIDO' ? 'Inactivo' : 'Activo'}
        </span>
      </td>

      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
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