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
      {/* Contacto — siempre visible; muestra org + estado debajo en móvil */}
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
            <div className="sm:hidden mt-1 space-y-1">
              {contacto.organizacion_nombre && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Building2 size={12} className="text-gray-400 shrink-0" />
                  {contacto.organizacion_nombre}
                </p>
              )}
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                ${contacto.estado_correo === 'VENCIDO'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
                }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                {contacto.estado_correo === 'VENCIDO' ? 'Vencido' : 'Vigente'}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* Organización — oculta en móvil, visible en sm+ */}
      <td className="hidden sm:table-cell px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Building2 size={14} className="text-gray-400 shrink-0" />
          {contacto.organizacion_nombre ?? '—'}
        </div>
      </td>

      {/* Comunicación — oculta en móvil y tablet, visible en md+ */}
      <td className="hidden md:table-cell px-4 py-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail size={14} className="text-emerald-500 shrink-0" />
            <span>{contacto.correo}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Phone size={14} className="text-emerald-500 shrink-0" />
            <span>{contacto.telefono ?? '—'}</span>
          </div>
        </div>
      </td>

      {/* Estado — oculto en móvil y tablet, visible en md+ */}
      <td className="hidden md:table-cell px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
          ${contacto.estado_correo === 'VENCIDO'
            ? 'bg-red-100 text-red-700'
            : 'bg-green-100 text-green-700'
          }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
          {contacto.estado_correo === 'VENCIDO' ? 'Vencido' : 'Vigente'}
        </span>
      </td>

      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleVerDetalle}
          aria-label={`Ver detalle de ${contacto.nombres} ${contacto.apellidos}`}
          className="p-2 rounded-lg text-gray-400 hover:text-emerald-600
            hover:bg-emerald-50 transition-colors"
        >
          <ExternalLink size={16} />
        </button>
      </td>
    </tr>
  )
}