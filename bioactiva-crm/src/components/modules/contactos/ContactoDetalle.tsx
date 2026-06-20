'use client'

import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Pencil, Mail, Phone,
  Building2, FileText, Loader2,
} from 'lucide-react'
import { Contacto } from '@/types/contacto.types'
import { Lead } from '@/types/lead.types'
import { ROUTES } from '@/lib/constants/routes'

interface ContactoDetalleProps {
  contacto:          Contacto
  leads:             Lead[]
  onEditar:          () => void
  onCambiarEstado:   () => void
  isCambiandoEstado: boolean
}

const ESTADO_LEAD_COLORS: Record<string, string> = {
  'En prospecto':     'bg-gray-100 text-gray-600',
  'Ofertado':         'bg-amber-50 text-amber-700',
  'Cierre con venta': 'bg-emerald-50 text-emerald-700',
  'Cierre sin venta': 'bg-red-50 text-red-600',
}

const formatFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

function InfoItem({
  icono,
  label,
  valor,
}: Readonly<{
  icono:  React.ReactNode
  label:  string
  valor?: string | null
}>) {
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
  leads,
  onEditar,
  onCambiarEstado,
  isCambiandoEstado,
}: Readonly<ContactoDetalleProps>) {
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
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">
                  {contacto.vocativo && `${contacto.vocativo}. `}
                  {contacto.nombres} {contacto.apellidos}
                </h1>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide
                  ${contacto.estado_correo === 'VENCIDO'
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                  {contacto.estado_correo === 'VENCIDO' ? 'Vencido' : 'Vigente'}
                </span>
              </div>
              {contacto.cargo && (
                <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mt-0.5">
                  {contacto.cargo}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCambiarEstado}
              disabled={isCambiandoEstado}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                font-semibold border transition-colors disabled:opacity-50
                disabled:cursor-not-allowed
                ${contacto.estado_correo === 'VENCIDO'
                  ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-50'
                  : 'border-red-300 text-red-500 hover:bg-red-50'
                }`}
            >
              {isCambiandoEstado
                ? <Loader2 size={14} className="animate-spin" />
                : null
              }
              {contacto.estado_correo === 'VENCIDO' ? 'Marcar como Vigente' : 'Marcar como Vencido'}
            </button>

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
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Leads asociados
              {leads.length > 0 && (
                <span className="ml-2 text-emerald-600">({leads.length})</span>
              )}
            </h3>
          </div>

          {leads.length === 0 ? (
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
          ) : (
            <div className="space-y-2">
              {leads.map((lead) => (
                <button
                  key={lead.id}
                  type="button"
                  className="w-full text-left flex items-center justify-between p-4
                    border border-gray-100 rounded-xl hover:border-emerald-200
                    hover:bg-emerald-50/30 transition-colors"
                  onClick={() => router.push(ROUTES.lead(lead.id))}
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {lead.servicio_interes}
                    </p>
                    {lead.encargado_nombre && (
                      <p className="text-xs text-gray-400 mt-0.5">{lead.encargado_nombre}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase
                      tracking-wide ${ESTADO_LEAD_COLORS[lead.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                      {lead.estado}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatFecha(lead.created_at)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}