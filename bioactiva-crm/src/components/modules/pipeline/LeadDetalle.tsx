'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Pencil, Building2, User,
  Briefcase, Calendar, Mail, Phone,
  Plus, MessageSquare,
} from 'lucide-react'
import { Lead } from '@/types/lead.types'
import { LeadState } from '@/types/enums'
import { ROUTES } from '@/lib/constants/routes'
import { ActividadHistorial } from './ActividadHistorial'
import { ActividadForm } from './ActividadForm'
import { useActividades, useCrearActividad } from '@/hooks/pipeline/useActividades'
import { useActualizarEstadoLead } from '@/hooks/pipeline/useLeads'
import { ActividadFormValues } from '@/lib/validators/actividad.schema'
import { getErrorMessage } from '@/lib/utils/error.utils'

interface LeadDetalleProps {
  lead:     Lead
  onEditar: () => void
}

const ESTADO_COLORS: Record<LeadState, string> = {
  [LeadState.Prospecto]:     'bg-gray-100 text-gray-600',
  [LeadState.Ofertado]:      'bg-amber-50 text-amber-700',
  [LeadState.CierreVenta]:   'bg-emerald-50 text-emerald-700',
  [LeadState.CierreSinVenta]: 'bg-red-50 text-red-600',
}

const ESTADOS_PIPELINE = [
  LeadState.Prospecto,
  LeadState.Ofertado,
  LeadState.CierreVenta,
  LeadState.CierreSinVenta,
]

function InfoItem({
  icono,
  label,
  valor,
}: {
  icono:  React.ReactNode
  label:  string
  valor?: string
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

export function LeadDetalle({ lead, onEditar }: LeadDetalleProps) {
  const router                          = useRouter()
  const [tab, setTab]                   = useState<'info' | 'actividades'>('info')
  const [mostrarForm, setMostrarForm]   = useState(false)
  const [errorActividad, setErrorActividad] = useState<string | null>(null)

  const { data: actividades = [], isLoading: loadingActividades } =
    useActividades(lead.id)

  const { mutateAsync: crearActividad, isPending: creando } =
    useCrearActividad()

  const { mutateAsync: actualizarEstado, isPending: actualizandoEstado } =
    useActualizarEstadoLead()

  const handleCrearActividad = async (data: ActividadFormValues) => {
    try {
      setErrorActividad(null)
      await crearActividad(data)
      setMostrarForm(false)
    } catch (err: unknown) {
      setErrorActividad(getErrorMessage(err, 'No se pudo registrar la actividad.'))
    }
  }

  const handleCambiarEstado = async (estado: LeadState) => {
    try {
      await actualizarEstado({ id: lead.id, estado })
    } catch (err: unknown) {
      console.error(getErrorMessage(err))
    }
  }

  const formatFecha = (fecha?: string) => {
    if (!fecha) return '—'
    return new Date(fecha).toLocaleDateString('es-PE', {
      day:   '2-digit',
      month: 'short',
      year:  'numeric',
    })
  }

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(ROUTES.pipeline)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                text-gray-500 hover:text-gray-700 hover:bg-gray-50
                border border-gray-200 transition-colors shrink-0"
            >
              <ArrowLeft size={14} />
              Pipeline
            </button>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs text-gray-400 font-mono">{lead.codigo}</p>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg
                  uppercase tracking-wide ${ESTADO_COLORS[lead.estado]}`}>
                  {lead.estado}
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mt-1">
                {lead.organizacion_nombre}
              </h1>
              {lead.servicio_interes && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {lead.servicio_interes}
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
            Editar lead
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-50">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
            Mover a estado
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {ESTADOS_PIPELINE.map((estado) => (
              <button
                key={estado}
                onClick={() => handleCambiarEstado(estado)}
                disabled={lead.estado === estado || actualizandoEstado}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold
                  transition-colors disabled:cursor-not-allowed
                  ${lead.estado === estado
                    ? `${ESTADO_COLORS[estado]} opacity-100 cursor-default`
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
              >
                {estado}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { key: 'info',        label: 'Información',  icono: <Briefcase size={14} /> },
          { key: 'actividades', label: 'Actividades',  icono: <MessageSquare size={14} /> },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm
              font-semibold transition-colors
              ${tab === t.key
                ? 'bg-emerald-700 text-white'
                : 'bg-white border border-gray-100 text-gray-500 hover:text-emerald-600'
              }`}
          >
            {t.icono}
            {t.label}
            {t.key === 'actividades' && actividades.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full
                ${tab === t.key ? 'bg-white/20' : 'bg-gray-100'}`}>
                {actividades.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Datos del lead
            </h3>
            <div className="space-y-4">
              <InfoItem
                icono={<Building2 size={14} />}
                label="Organización"
                valor={lead.organizacion_nombre}
              />
              <InfoItem
                icono={<User size={14} />}
                label="Contacto"
                valor={lead.contacto_nombre}
              />
              <InfoItem
                icono={<Briefcase size={14} />}
                label="Servicio de interés"
                valor={lead.servicio_interes}
              />
              <InfoItem
                icono={<Mail size={14} />}
                label="Canal de captación"
                valor={lead.canal_captacion}
              />
              <InfoItem
                icono={<Phone size={14} />}
                label="Encargado"
                valor={lead.encargado_nombre}
              />
              <InfoItem
                icono={<Calendar size={14} />}
                label="Fecha de cierre estimada"
                valor={formatFecha(lead.fecha_cierre)}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Contexto comercial
            </h3>
            <div className="space-y-4">
              {lead.comentarios && (
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                    Comentarios
                  </p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">
                    {lead.comentarios}
                  </p>
                </div>
              )}
              {lead.desafio_oportunidad && (
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                    Desafío u oportunidad
                  </p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">
                    {lead.desafio_oportunidad}
                  </p>
                </div>
              )}
              {lead.notas_contacto && (
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                    Historial de contacto
                  </p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">
                    {lead.notas_contacto}
                  </p>
                </div>
              )}
              {!lead.comentarios && !lead.desafio_oportunidad && !lead.notas_contacto && (
                <p className="text-sm text-gray-400 italic">Sin notas registradas.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'actividades' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Actividades de seguimiento
            </h3>
            {!mostrarForm && (
              <button
                onClick={() => setMostrarForm(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                  font-semibold bg-emerald-600 hover:bg-emerald-700
                  text-white transition-colors"
              >
                <Plus size={14} />
                Nueva actividad
              </button>
            )}
          </div>

          {mostrarForm && (
            <div className="mb-4">
              <ActividadForm
                leadId={lead.id}
                onSubmit={handleCrearActividad}
                onCancelar={() => setMostrarForm(false)}
                isLoading={creando}
                error={errorActividad}
              />
            </div>
          )}

          {loadingActividades ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-emerald-600
                border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ActividadHistorial
              leadId={lead.id}
              actividades={actividades}
            />
          )}
        </div>
      )}
    </div>
  )
}