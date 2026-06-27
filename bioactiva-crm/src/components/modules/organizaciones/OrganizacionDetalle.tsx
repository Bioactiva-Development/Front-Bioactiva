'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2, MapPin,
  ExternalLink, ArrowLeft, Pencil, Trash2,
  FileText, DollarSign, Globe,
  Mail, Phone, Users,
} from 'lucide-react'
import { OrganizacionConRelaciones } from '@/types/organizacion.types'
import { ROUTES } from '@/lib/constants/routes'
import { TamanoEmpresa } from '@/types/enums'
import { formatSector, formatTamano } from '@/lib/utils/organizacion.utils'

interface OrganizacionDetalleProps {
  organizacion: OrganizacionConRelaciones
  onEditar:     () => void
  onEliminar?:  () => void
  eliminando?:  boolean
}

const TAMANO_COLORS: Record<TamanoEmpresa, string> = {
  [TamanoEmpresa.Micro]:   'bg-gray-100 text-gray-600',
  [TamanoEmpresa.Pequeno]: 'bg-blue-50 text-blue-600',
  [TamanoEmpresa.Mediano]: 'bg-amber-50 text-amber-600',
  [TamanoEmpresa.Grande]:  'bg-emerald-50 text-emerald-700',
}

const ESTADO_LEAD_COLORS: Record<string, string> = {
  'En prospecto':    'bg-gray-100 text-gray-600',
  'Ofertado':        'bg-amber-50 text-amber-700',
  'Cierre con venta': 'bg-emerald-50 text-emerald-700',
  'Cierre sin venta': 'bg-red-50 text-red-600',
}

const ESTADO_COT_COLORS: Record<string, string> = {
  'Pendiente':  'bg-gray-100 text-gray-600',
  'Enviada':    'bg-blue-50 text-blue-600',
  'Aceptada':   'bg-emerald-50 text-emerald-700',
  'Rechazada':  'bg-red-50 text-red-600',
}

function InfoItem({
  icono,
  label,
  valor,
}: Readonly<{
  icono:  React.ReactNode
  label:  string
  valor?: string
}>) {
  if (!valor) return null
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center
        justify-center shrink-0 mt-0.5">
        <span className="text-gray-400">{icono}</span>
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm text-gray-700 mt-0.5">{valor}</p>
      </div>
    </div>
  )
}

export function OrganizacionDetalle({
  organizacion,
  onEditar,
  onEliminar,
  eliminando = false,
}: Readonly<OrganizacionDetalleProps>) {
  const router                              = useRouter()
  const [confirmarEliminar, setConfirmarEliminar]   = useState(false)
  const inicial                             = organizacion.nombre.charAt(0).toUpperCase()
  const contactosVisibles  = organizacion.contactos
  const contactosRestantes = organizacion.totalContactos - organizacion.contactos.length

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day:   '2-digit',
      month: 'short',
      year:  'numeric',
    })
  }

  const formatMonto = (monto: number, tipo: string) => {
    const simbolo = tipo === 'PEN' ? 'S/' : '$'
    return `${simbolo} ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
  }

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center
              justify-center shrink-0">
              <span className="text-2xl font-bold text-white">{inicial}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {organizacion.nombre}
              </h1>
              {organizacion.nombre_comercial !== organizacion.nombre && (
                <p className="text-sm text-gray-400 mt-0.5">
                  {organizacion.nombre_comercial}
                </p>
              )}
              {organizacion.sub_area && (
                <p className="text-sm text-gray-400">{organizacion.sub_area}</p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {organizacion.ruc && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1
                    rounded-lg font-medium">
                    RUC {organizacion.ruc}
                  </span>
                )}
                <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1
                  rounded-lg font-medium">
                  {organizacion.tipo}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-lg font-bold uppercase
                  tracking-wide ${TAMANO_COLORS[organizacion.tamano]}`}>
                  {formatTamano(organizacion.tamano)}
                </span>
                <span className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1
                  rounded-lg font-medium">
                  {formatSector(organizacion.sector)}
                  {organizacion.actividad_economica && ` / ${organizacion.actividad_economica}`}
                </span>
                {organizacion.ubicacion && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin size={12} />
                    {organizacion.ubicacion}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => router.push(ROUTES.organizaciones)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                text-gray-500 hover:text-gray-700 hover:bg-gray-50
                border border-gray-200 transition-colors"
            >
              <ArrowLeft size={14} />
              Volver a Organizaciones
            </button>

            {onEliminar && (
              <button
                onClick={() => setConfirmarEliminar(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                  text-red-500 hover:text-red-700 hover:bg-red-50
                  border border-red-200 transition-colors"
              >
                <Trash2 size={14} />
                Desactivar
              </button>
            )}

            {onEliminar && confirmarEliminar && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <button
                  type="button"
                  aria-label="Cerrar"
                  className="absolute inset-0 bg-black/40"
                  onClick={() => { if (!eliminando) setConfirmarEliminar(false) }}
                />
                <div className="relative z-10 w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
                  <h3 className="text-base font-bold text-gray-900">Desactivar organización</h3>
                  <p className="text-sm text-gray-600">
                    Se desactivará <span className="font-semibold">{organizacion.nombre}</span>
                    {organizacion.totalContactos > 0 && (
                      <>
                        {' '}y sus {organizacion.totalContactos}{' '}
                        {organizacion.totalContactos === 1 ? 'contacto quedará' : 'contactos quedarán'} como{' '}
                        <span className="font-semibold text-amber-600">VENCIDOS</span>
                      </>
                    )}
                    .
                  </p>
                  <p className="text-xs text-amber-600">
                    Un contacto VENCIDO no puede vincularse a nuevos leads. La organización
                    dejará de aparecer en los listados.
                  </p>
                  <div className="flex justify-end gap-3 pt-1">
                    <button
                      onClick={() => setConfirmarEliminar(false)}
                      disabled={eliminando}
                      className="px-3 py-2 rounded-xl text-sm font-semibold text-gray-600
                        hover:bg-gray-100 border border-gray-200 transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={onEliminar}
                      disabled={eliminando}
                      className="px-3 py-2 rounded-xl text-sm font-bold text-white
                        bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {eliminando ? 'Desactivando...' : 'Desactivar'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={onEditar}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                font-semibold bg-emerald-600 hover:bg-emerald-700
                text-white transition-colors"
            >
              <Pencil size={14} />
              Editar organización
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-emerald-600" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Contactos asociados
              {organizacion.totalContactos > 0 && (
                <span className="ml-2 text-emerald-600">
                  ({organizacion.totalContactos})
                </span>
              )}
            </h3>
          </div>
          {organizacion.totalContactos > 0 && (
            <button
              onClick={() => router.push(
                `${ROUTES.contactos}?organizacion=${organizacion.id}&orgNombre=${encodeURIComponent(organizacion.nombre)}`
              )}
              className="text-xs text-emerald-600 hover:underline font-semibold
                flex items-center gap-1"
            >
              Ver todos ({organizacion.totalContactos}) en Contactos
              <ExternalLink size={10} />
            </button>
          )}
        </div>

        {organizacion.contactos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
              <Users size={18} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">Sin contactos registrados</p>
            <button
              onClick={() => router.push(ROUTES.contactos)}
              className="text-xs text-emerald-600 hover:underline font-medium"
            >
              + Agregar contacto
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {contactosVisibles.map((contacto) => {
                const inicialesContacto = `${contacto.nombres.charAt(0)}${contacto.apellidos.charAt(0)}`.toUpperCase()
                return (
                  <button
                    key={contacto.id}
                    type="button"
                    className="w-full text-left border border-gray-100 rounded-xl p-4
                      hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors"
                    onClick={() => router.push(ROUTES.contacto(contacto.id))}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center
                        justify-center shrink-0">
                        <span className="text-xs font-bold text-emerald-700">
                          {inicialesContacto}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 leading-tight">
                          {contacto.vocativo && `${contacto.vocativo}. `}
                          {contacto.nombres} {contacto.apellidos}
                        </p>
                        {contacto.cargo && (
                          <p className="text-xs text-gray-400">{contacto.cargo}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Mail size={12} className="text-gray-400" />
                        {contacto.correo}
                      </p>
                      {contacto.telefono && (
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <Phone size={12} className="text-gray-400" />
                          {contacto.telefono}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {contactosRestantes > 0 && (
              <button
                onClick={() => router.push(
                  `${ROUTES.contactos}?organizacion=${organizacion.id}&orgNombre=${encodeURIComponent(organizacion.nombre)}`
                )}
                className="mt-3 w-full py-2.5 rounded-xl border border-dashed
                  border-emerald-200 text-sm text-emerald-600 hover:bg-emerald-50
                  transition-colors flex items-center justify-center gap-2"
              >
                <Users size={14} />
                Ver los {contactosRestantes} contactos restantes en la sección Contactos
              </button>
            )}
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} className="text-emerald-600" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Historial de leads
            {organizacion.leads.length > 0 && (
              <span className="ml-2 text-emerald-600">
                ({organizacion.leads.length})
              </span>
            )}
          </h3>
        </div>

        {organizacion.leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
              <FileText size={18} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">Sin leads registrados</p>
            <button
              onClick={() => router.push(ROUTES.pipeline)}
              className="text-xs text-emerald-600 hover:underline font-medium"
            >
              + Crear lead
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {organizacion.leads.map((lead) => (
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
                  {lead.encargado && (
                    <p className="text-xs text-gray-400 mt-0.5">{lead.encargado}</p>
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={16} className="text-emerald-600" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Historial de cotizaciones
            {organizacion.cotizaciones.length > 0 && (
              <span className="ml-2 text-emerald-600">
                ({organizacion.cotizaciones.length})
              </span>
            )}
          </h3>
        </div>

        {organizacion.cotizaciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
              <DollarSign size={18} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">Sin cotizaciones registradas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {organizacion.cotizaciones.map((cot) => (
              <div
                key={cot.id}
                className="border border-gray-100 rounded-xl p-5 hover:border-emerald-200
                  transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <p className="text-sm font-semibold text-gray-800 leading-snug">
                    {cot.nombre_servicio}
                  </p>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase
                    tracking-wide shrink-0 ${ESTADO_COT_COLORS[cot.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                    {cot.estado}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {!!cot.id && (
                    <span className="text-xs text-gray-400 font-mono">
                      COT-{String(cot.id).padStart(3, '0')}
                    </span>
                  )}
                  {cot.codigo_lead && (
                    <>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400 font-mono">
                        Lead {cot.codigo_lead}
                      </span>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                      Monto
                    </p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">
                      {formatMonto(cot.monto, cot.tipo)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                      Fecha
                    </p>
                    <p className="text-sm text-gray-700 mt-0.5">
                      {formatFecha(cot.fecha_cot)}
                    </p>
                  </div>
                  {cot.dirigido && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                        Dirigido a
                      </p>
                      <p className="text-sm text-gray-700 mt-0.5">{cot.dirigido}</p>
                    </div>
                  )}
                  {cot.nombre_remitente && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                        Remitente
                      </p>
                      <p className="text-sm text-gray-700 mt-0.5">{cot.nombre_remitente}</p>
                    </div>
                  )}
                </div>

                {(cot.observacion) && (
                  <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cot.observacion && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                          Observación
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">{cot.observacion}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {(organizacion.linkedin || organizacion.alianzas_estrategicas) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={16} className="text-emerald-600" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Información adicional
            </h3>
          </div>
          <InfoItem
            icono={<Globe size={14} />}
            label="Alianzas estratégicas"
            valor={organizacion.alianzas_estrategicas}
          />
          {organizacion.linkedin && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center
                justify-center shrink-0 mt-0.5">
                <ExternalLink size={14} className="text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  LinkedIn
                </p>
                <a 
                  href={`https://${organizacion.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-600 hover:underline mt-0.5
                    flex items-center gap-1"
                >
                  {organizacion.linkedin}
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}