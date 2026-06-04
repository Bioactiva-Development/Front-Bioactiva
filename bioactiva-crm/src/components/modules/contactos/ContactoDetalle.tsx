'use client'

import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Pencil, Mail, Phone,
  Building2, FileText,
} from 'lucide-react'
import { Contacto } from '@/types/contacto.types'
import { ROUTES } from '@/lib/constants/routes'

interface ContactoDetalleProps {
  contacto: Contacto
  onEditar: () => void
}

function InfoItem({
  icono,
  label,
  valor,
}: {
  icono:  React.ReactNode
  label:  string
  valor?: string | null
}) {
  if (!valor) return null
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center
        justify-center shrink-0 mt-0.5">
        <span className="text-emerald-600">{icono}</span>
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm text-gray-800 font-medium mt-0.5">{valor}</p>
      </div>
    </div>
  )
}

export function ContactoDetalle({
  contacto,
  onEditar,
}: ContactoDetalleProps) {
  const router    = useRouter()
  const iniciales = `${contacto.nombres.charAt(0)}${contacto.apellidos?.charAt(0) ?? ''}`.toUpperCase()

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(ROUTES.contactos)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                text-gray-500 hover:text-gray-700 hover:bg-gray-50
                border border-gray-200 transition-colors shrink-0"
            >
              <ArrowLeft size={14} />
              Volver a Contactos
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center
              justify-center shrink-0">
              <span className="text-lg font-bold text-white">{iniciales}</span>
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {contacto.vocativo && `${contacto.vocativo}. `}
                {contacto.nombres} {contacto.apellidos}
              </h1>
              {contacto.cargo && (
                <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mt-0.5">
                  {contacto.cargo}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onEditar}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
              font-semibold border border-emerald-600 text-emerald-600
              hover:bg-emerald-50 transition-colors"
          >
            <Pencil size={14} />
            Editar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            Datos de contacto
          </h3>

          <div className="space-y-4">
            <InfoItem
              icono={<Building2 size={14} />}
              label="Organización"
              valor={contacto.organizacion_nombre}
            />
            <InfoItem
              icono={<Mail size={14} />}
              label="Correo principal"
              valor={contacto.correo}
            />
            {contacto.correo2 && (
              <InfoItem
                icono={<Mail size={14} />}
                label="Correo secundario"
                valor={contacto.correo2}
              />
            )}
            <InfoItem
              icono={<Phone size={14} />}
              label="Teléfono"
              valor={contacto.telefono ?? ""}
            />
            {contacto.comentarios && (
              <div className="pt-2 border-t border-gray-50">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                  Comentarios
                </p>
                <p className="text-sm text-gray-600">{contacto.comentarios}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} className="text-emerald-600" />
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Leads asociados (0)
            </h3>
          </div>

          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
              <FileText size={18} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">Sin leads asociados.</p>
            <button
              onClick={() => router.push(ROUTES.pipeline)}
              className="text-xs text-emerald-600 hover:underline font-medium"
            >
              + Crear lead
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}