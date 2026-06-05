'use client'

import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info, Loader2, Save } from 'lucide-react'
import { usePlantillasActivas } from '@/hooks/plantillas/usePlantillas'
import { useLeads } from '@/hooks/pipeline/useLeads'
import { useActividades } from '@/hooks/pipeline/useActividades'
import {
  seguimientoSchema,
  SeguimientoFormValues,
} from '@/lib/validators/notificacion.schema'
import { NotificacionProgramada } from '@/types/notificacion.types'

interface SeguimientoFormProps {
  onSubmit: (data: SeguimientoFormValues & Partial<NotificacionProgramada>) => Promise<void>
  isLoading: boolean
  error?: string | null
  onCancel?: () => void
}

export function SeguimientoForm({
  onSubmit,
  isLoading,
  error,
  onCancel,
}: Readonly<SeguimientoFormProps>) {
  const { data: leadsResponse } = useLeads({ limit: 100 })
  const leads = leadsResponse?.data ?? []
  const plantillasActivas = usePlantillasActivas()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<SeguimientoFormValues>({
    resolver: zodResolver(seguimientoSchema),
    defaultValues: {
      id_lead: 0,
      id_actividad: 0,
      id_plantilla_interno: 0,
      fecha_envio_interno: '',
      hora_envio_interno: '',
      asunto_interno: '',
      cuerpo_interno: '',
      id_plantilla_externo: 0,
      fecha_envio_externo: '',
      hora_envio_externo: '',
      asunto_externo: '',
      cuerpo_externo: '',
      correo_cliente: '',
    },
  })

  const selectedLeadId = useWatch({ control, name: 'id_lead' })
  const selectedActividadId = useWatch({ control, name: 'id_actividad' })
  const plantillaInternaId = useWatch({ control, name: 'id_plantilla_interno' })
  const plantillaExternaId = useWatch({ control, name: 'id_plantilla_externo' })

  const selectedLead = leads.find((lead) => lead.id === selectedLeadId)
  const { data: actividades = [] } = useActividades(selectedLeadId)
  const selectedActividad = actividades.find(
    (actividad) => actividad.id === selectedActividadId
  )

  const plantillasSeguimiento = plantillasActivas.data?.filter(
    (plantilla) =>
      plantilla.activo &&
      (plantilla.uso === 'Ambos' || plantilla.uso === 'Solo Seguimiento')
  ) ?? []

  const selectedPlantillaInterna = plantillasSeguimiento.find(
    (plantilla) => plantilla.id === plantillaInternaId
  )

  const selectedPlantillaExterna = plantillasSeguimiento.find(
    (plantilla) => plantilla.id === plantillaExternaId
  )

  useEffect(() => {
    if (selectedPlantillaInterna) {
      const asuntoActual = getValues('asunto_interno')
      const cuerpoActual = getValues('cuerpo_interno')
      if (!asuntoActual) {
        setValue('asunto_interno', selectedPlantillaInterna.asunto)
      }
      if (!cuerpoActual) {
        setValue('cuerpo_interno', selectedPlantillaInterna.cuerpo)
      }
    }
  }, [selectedPlantillaInterna?.id, selectedPlantillaInterna, getValues, setValue])

  useEffect(() => {
    if (selectedPlantillaExterna) {
      const asuntoActual = getValues('asunto_externo')
      const cuerpoActual = getValues('cuerpo_externo')
      if (!asuntoActual) {
        setValue('asunto_externo', selectedPlantillaExterna.asunto)
      }
      if (!cuerpoActual) {
        setValue('cuerpo_externo', selectedPlantillaExterna.cuerpo)
      }
    }
  }, [selectedPlantillaExterna?.id, selectedPlantillaExterna, getValues, setValue])

  useEffect(() => {
    if (selectedLead?.encargado_correo) {
      const correoActual = getValues('correo_cliente')
      if (!correoActual) {
        setValue('correo_cliente', selectedLead.encargado_correo)
      }
    }
  }, [selectedLead?.encargado_correo, getValues, setValue])

  const handleFormSubmit = async (data: SeguimientoFormValues) => {
    if (!selectedLead || !selectedActividad) return

    await onSubmit({
      ...data,
      fecha_envio_interno: `${data.fecha_envio_interno}T${data.hora_envio_interno}`,
      fecha_envio_externo: `${data.fecha_envio_externo}T${data.hora_envio_externo}`,
      destinatario: data.correo_cliente,
      lead_codigo: selectedLead.codigo,
      lead_org: selectedLead.organizacion_nombre ?? selectedLead.contacto_nombre,
      actividad_nombre: selectedActividad.nombre_actividad,
    })
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
      transition-colors placeholder:text-gray-400
      ${hasError
        ? 'border-red-400 bg-red-50'
        : 'border-gray-200 focus:border-emerald-400 bg-white'
      }`

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Programar seguimiento
          </p>
          <h2 className="text-2xl font-bold text-gray-900">Nuevo seguimiento</h2>
        </div>
        <button
          type="button"
          onClick={() => onCancel?.()}
          className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="seg-lead" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Lead <span className="text-red-500">*</span>
            </label>
            <select
              id="seg-lead"
              {...register('id_lead', { valueAsNumber: true })}
              className={inputClass(!!errors.id_lead)}
            >
              <option value={0}>Selecciona un lead</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.codigo} · {lead.organizacion_nombre ?? lead.contacto_nombre}
                </option>
              ))}
            </select>
            {errors.id_lead && (
              <p className="text-red-500 text-xs">{errors.id_lead.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="seg-actividad" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Actividad <span className="text-red-500">*</span>
            </label>
            <select
              id="seg-actividad"
              {...register('id_actividad', { valueAsNumber: true })}
              className={inputClass(!!errors.id_actividad)}
              disabled={!selectedLead}
            >
              <option value={0}>
                {selectedLead ? 'Selecciona una actividad' : 'Selecciona primero un lead'}
              </option>
              {actividades.map((actividad) => (
                <option key={actividad.id} value={actividad.id}>
                  {actividad.nombre_actividad}
                </option>
              ))}
            </select>
            {errors.id_actividad && (
              <p className="text-red-500 text-xs">{errors.id_actividad.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="seg-plantilla-interno" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Plantilla interna <span className="text-red-500">*</span>
            </label>
            <select
              id="seg-plantilla-interno"
              {...register('id_plantilla_interno', { valueAsNumber: true })}
              className={inputClass(!!errors.id_plantilla_interno)}
            >
              <option value={0}>Selecciona una plantilla interna</option>
              {plantillasSeguimiento.map((plantilla) => (
                <option key={plantilla.id} value={plantilla.id}>
                  {plantilla.nombre}
                </option>
              ))}
            </select>
            {errors.id_plantilla_interno && (
              <p className="text-red-500 text-xs">{errors.id_plantilla_interno.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="seg-plantilla-externo" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Plantilla externa <span className="text-red-500">*</span>
            </label>
            <select
              id="seg-plantilla-externo"
              {...register('id_plantilla_externo', { valueAsNumber: true })}
              className={inputClass(!!errors.id_plantilla_externo)}
            >
              <option value={0}>Selecciona una plantilla externa</option>
              {plantillasSeguimiento.map((plantilla) => (
                <option key={plantilla.id} value={plantilla.id}>
                  {plantilla.nombre}
                </option>
              ))}
            </select>
            {errors.id_plantilla_externo && (
              <p className="text-red-500 text-xs">{errors.id_plantilla_externo.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="seg-fecha-interno" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Fecha interna <span className="text-red-500">*</span>
            </label>
            <input
              id="seg-fecha-interno"
              type="date"
              {...register('fecha_envio_interno')}
              className={inputClass(!!errors.fecha_envio_interno)}
            />
            {errors.fecha_envio_interno && (
              <p className="text-red-500 text-xs">{errors.fecha_envio_interno.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="seg-hora-interno" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Hora interna <span className="text-red-500">*</span>
            </label>
            <input
              id="seg-hora-interno"
              type="time"
              {...register('hora_envio_interno')}
              className={inputClass(!!errors.hora_envio_interno)}
            />
            {errors.hora_envio_interno && (
              <p className="text-red-500 text-xs">{errors.hora_envio_interno.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="seg-asunto-interno" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Asunto interno <span className="text-red-500">*</span>
          </label>
          <input
            id="seg-asunto-interno"
            type="text"
            {...register('asunto_interno')}
            className={inputClass(!!errors.asunto_interno)}
            placeholder="Asunto interno"
          />
          {errors.asunto_interno && (
            <p className="text-red-500 text-xs">{errors.asunto_interno.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="seg-cuerpo-interno" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Cuerpo interno <span className="text-red-500">*</span>
          </label>
          <textarea
            id="seg-cuerpo-interno"
            rows={5}
            {...register('cuerpo_interno')}
            className={`${inputClass(!!errors.cuerpo_interno)} resize-y font-mono text-xs`}
            placeholder="Texto del mensaje interno"
          />
          {errors.cuerpo_interno && (
            <p className="text-red-500 text-xs">{errors.cuerpo_interno.message}</p>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="seg-fecha-externo" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Fecha externa <span className="text-red-500">*</span>
            </label>
            <input
              id="seg-fecha-externo"
              type="date"
              {...register('fecha_envio_externo')}
              className={inputClass(!!errors.fecha_envio_externo)}
            />
            {errors.fecha_envio_externo && (
              <p className="text-red-500 text-xs">{errors.fecha_envio_externo.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="seg-hora-externo" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Hora externa <span className="text-red-500">*</span>
            </label>
            <input
              id="seg-hora-externo"
              type="time"
              {...register('hora_envio_externo')}
              className={inputClass(!!errors.hora_envio_externo)}
            />
            {errors.hora_envio_externo && (
              <p className="text-red-500 text-xs">{errors.hora_envio_externo.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="seg-correo-cliente" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Correo del cliente <span className="text-red-500">*</span>
          </label>
          <input
            id="seg-correo-cliente"
            type="email"
            {...register('correo_cliente')}
            className={inputClass(!!errors.correo_cliente)}
            placeholder="cliente@empresa.com"
          />
          {errors.correo_cliente && (
            <p className="text-red-500 text-xs">{errors.correo_cliente.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="seg-asunto-externo" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Asunto externo <span className="text-red-500">*</span>
          </label>
          <input
            id="seg-asunto-externo"
            type="text"
            {...register('asunto_externo')}
            className={inputClass(!!errors.asunto_externo)}
            placeholder="Asunto del mensaje al cliente"
          />
          {errors.asunto_externo && (
            <p className="text-red-500 text-xs">{errors.asunto_externo.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="seg-cuerpo-externo" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Cuerpo externo <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Info size={12} /> Usa variables si lo deseas
            </span>
          </div>
          <textarea
            id="seg-cuerpo-externo"
            rows={7}
            {...register('cuerpo_externo')}
            className={`${inputClass(!!errors.cuerpo_externo)} resize-y font-mono text-xs`}
            placeholder="Texto del mensaje al cliente"
          />
          {errors.cuerpo_externo && (
            <p className="text-red-500 text-xs">{errors.cuerpo_externo.message}</p>
          )}
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => onCancel?.()}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600
              hover:bg-gray-50 transition-colors"
          >
            Volver
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white
              hover:bg-emerald-700 transition-colors disabled:bg-emerald-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Programando...
              </>
            ) : (
              <>
                <Save size={16} />
                Programar seguimiento
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
