'use client'

import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { leadSchema, LeadFormValues } from '@/lib/validators/lead.schema'
import { LeadState } from '@/types/enums'
import { Lead } from '@/types/lead.types'
import { ROUTES } from '@/lib/constants/routes'
import { useOrganizaciones } from '@/hooks/organizaciones/useOrganizaciones'
import { useContactosPorOrganizacion } from '@/hooks/contactos/useContactos'
import { useAuthStore } from '@/store'

interface LeadFormProps {
  lead?:      Lead
  estadoInicial?: LeadState
  estadoEditable?: boolean
  onSubmit:   (data: LeadFormValues) => Promise<void>
  isLoading:  boolean
  error?:     string | null
}

const RESPONSABLES = [
  { id: 1, nombre: 'Karien Diaz',    correo: 'kdiaz@bioactiva.pe' },
  { id: 2, nombre: 'Luis Torres',    correo: 'ltorres@bioactiva.pe' },
  { id: 3, nombre: 'Administración', correo: 'admin@bioactiva.pe' },
  { id: 4, nombre: 'Carlos Mamani',  correo: 'cmamani@bioactiva.pe' },
]

export function LeadForm({
  lead,
  estadoInicial,
  estadoEditable = false,
  onSubmit,
  isLoading,
  error,
}: LeadFormProps) {
  const router    = useRouter()
  const esEdicion = !!lead
  const { usuario } = useAuthStore()
  const [errorLocal, setErrorLocal] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: lead
      ? {
          id_org:                  lead.id_org,
          id_contacto:             lead.id_contacto,
          estado:                  lead.estado,
          servicio_interes:        lead.servicio_interes,
          comentarios:             lead.comentarios ?? '',
          desafio_oportunidad:     lead.desafio_oportunidad ?? '',
          notas_contacto:          lead.notas_contacto ?? '',
          id_encargado:            lead.id_encargado,
          encargado_correo:        lead.encargado_correo ?? '',
          canal_captacion:         lead.canal_captacion ?? '',
          fecha_cierre:            lead.fecha_cierre ?? '',
          proxima_actividad:       lead.proxima_actividad ?? '',
          fecha_proxima_actividad: lead.fecha_proxima_actividad ?? '',
        }
      : {
          estado:          estadoInicial ?? LeadState.Prospecto,
          id_encargado:    usuario?.id ?? 1,
          encargado_correo: usuario?.correo ?? '',
        },
  })

  const orgSeleccionada   = useWatch({ control, name: 'id_org' })
  const encargadoSelected = useWatch({ control, name: 'id_encargado' })
  const estadoActual      = useWatch({ control, name: 'estado' }) ?? LeadState.Prospecto

  const { data: orgsData }      = useOrganizaciones({ limit: 100 })
  const organizaciones          = orgsData?.data ?? []
  const { data: contactosOrg }  = useContactosPorOrganizacion(orgSeleccionada)
  const contactos               = contactosOrg ?? []

  useEffect(() => {
    const responsable = RESPONSABLES.find(
      (r) => r.id === Number(encargadoSelected)
    )
    if (responsable) {
      setValue('encargado_correo', responsable.correo)
    }
  }, [encargadoSelected, setValue])

  useEffect(() => {
    if (!esEdicion) {
      setValue('id_contacto', undefined)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgSeleccionada])

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    ${hasError
      ? 'border-red-400 bg-red-50'
      : 'border-gray-200 focus:border-emerald-400 bg-white'
    }`

  const handleValidSubmit = async (data: LeadFormValues) => {
    setErrorLocal(null)

    if (data.id_contacto) {
      const contactoPertenece = contactos.some(
        (contacto) => contacto.id === data.id_contacto
      )

      if (!contactoPertenece) {
        setErrorLocal('El contacto seleccionado no pertenece a la organización elegida.')
        return
      }
    }

    await onSubmit(data)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            ID Lead (se genera al guardar)
          </label>
          <input
            type="text"
            value={lead?.codigo ?? `LEAD-${new Date().getFullYear()}-XXX`}
            disabled
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200
              bg-gray-50 text-sm text-gray-400 cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Organización <span className="text-red-500">*</span>
          </label>
          <select
            {...register('id_org')}
            disabled={esEdicion}
            className={`${inputClass(!!errors.id_org)} cursor-pointer
              ${esEdicion ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <option value="">Buscar organización existente...</option>
            {organizaciones.map((org) => (
              <option key={org.id} value={org.id}>{org.nombre}</option>
            ))}
          </select>
          {errors.id_org && (
            <p className="text-red-500 text-xs">{errors.id_org.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Contacto{' '}
            <span className="text-gray-400 normal-case font-normal">
              (opcional — puedes vincularlo después)
            </span>
          </label>
          <select
            {...register('id_contacto', {
              setValueAs: (value) => value ? Number(value) : undefined,
            })}
            disabled={!orgSeleccionada}
            className={`${inputClass(!!errors.id_contacto)} cursor-pointer
              ${!orgSeleccionada ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <option value="">
              {orgSeleccionada
                ? 'Seleccionar contacto...'
                : 'Primero selecciona una organización'
              }
            </option>
            {contactos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.vocativo ? `${c.vocativo}. ` : ''}
                {c.nombres} {c.apellidos}
                {c.cargo ? ` — ${c.cargo}` : ''}
              </option>
            ))}
          </select>
        </div>


        {!estadoEditable && <input type="hidden" {...register('estado')} />}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Estado del pipeline
            </label>
            {estadoEditable ? (
              <select
                {...register('estado')}
                className={`${inputClass(!!errors.estado)} cursor-pointer`}
              >
                {Object.values(LeadState).map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full px-4 py-2.5 rounded-xl border border-gray-200
                bg-gray-50 text-sm text-gray-600">
                {estadoActual}
              </div>
            )}
            <p className="text-xs text-gray-400">
              {estadoEditable
                ? 'La cotización inicial se creará con el estado coherente al pipeline.'
                : 'El cambio de estado se gestiona desde la ficha del lead y valida las cotizaciones asociadas.'
              }
            </p>
            {errors.estado && (
              <p className="text-red-500 text-xs">{errors.estado.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Fecha de creación
            </label>
            <input
              type="text"
              value={new Date().toISOString().split('T')[0]}
              disabled
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200
                bg-gray-50 text-sm text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Servicio de interés <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ej: Formulación de proyecto Innovasuyu"
            {...register('servicio_interes')}
            className={inputClass(!!errors.servicio_interes)}
          />
          {errors.servicio_interes && (
            <p className="text-red-500 text-xs">{errors.servicio_interes.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Comentarios
          </label>
          <textarea
            rows={3}
            placeholder="Notas internas del lead..."
            {...register('comentarios')}
            className={`${inputClass(!!errors.comentarios)} resize-none`}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Desafío u oportunidad
          </label>
          <textarea
            rows={3}
            placeholder="Problema concreto o necesidad comercial detectada..."
            {...register('desafio_oportunidad')}
            className={`${inputClass(!!errors.desafio_oportunidad)} resize-none`}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Historial de contacto
          </label>
          <textarea
            rows={3}
            placeholder="Resumen de reuniones, correos o contexto previo..."
            {...register('notas_contacto')}
            className={`${inputClass(!!errors.notas_contacto)} resize-none`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Encargado <span className="text-red-500">*</span>
            </label>
            <select
              {...register('id_encargado', { valueAsNumber: true })}
              className={`${inputClass(!!errors.id_encargado)} cursor-pointer`}
            >
              <option value="">Seleccionar...</option>
              {RESPONSABLES.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
            {errors.id_encargado && (
              <p className="text-red-500 text-xs">{errors.id_encargado.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Correo del encargado
            </label>
            <input
              type="email"
              placeholder="correo@bioactiva.pe"
              {...register('encargado_correo')}
              className={inputClass(!!errors.encargado_correo)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Canal de captación
            </label>
            <input
              type="text"
              placeholder="Ej: Referido, LinkedIn, Evento presencial"
              {...register('canal_captacion')}
              className={inputClass(!!errors.canal_captacion)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Próxima actividad
            </label>
            <input
              type="text"
              placeholder="Ej: Enviar propuesta técnica"
              {...register('proxima_actividad')}
              className={inputClass(!!errors.proxima_actividad)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Fecha próxima actividad
            </label>
            <input
              type="date"
              {...register('fecha_proxima_actividad')}
              className={inputClass(!!errors.fecha_proxima_actividad)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Fecha de cierre
            </label>
            <input
              type="date"
              {...register('fecha_cierre')}
              className={inputClass(!!errors.fecha_cierre)}
            />
          </div>
        </div>

        {(errorLocal || error) && (
          <div className="bg-red-50 border border-red-200 text-red-700
            text-sm rounded-xl px-4 py-3">
            {errorLocal ?? error}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push(ROUTES.pipeline)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
              text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Volver al pipeline
          </button>

          <button
            type="button"
            onClick={handleSubmit(handleValidSubmit)}
            disabled={isLoading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700
              disabled:bg-emerald-400 disabled:cursor-not-allowed text-white
              font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={16} />
                {esEdicion ? 'Guardar cambios' : 'Guardar lead'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
