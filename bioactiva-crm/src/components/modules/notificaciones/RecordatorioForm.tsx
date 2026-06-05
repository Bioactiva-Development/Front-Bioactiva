'use client'

import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info, Loader2, Save } from 'lucide-react'
import { usePlantillasActivas } from '@/hooks/plantillas/usePlantillas'
import { useLeads } from '@/hooks/pipeline/useLeads'
import { useActividades } from '@/hooks/pipeline/useActividades'
import {
  recordatorioSchema,
  RecordatorioFormValues,
} from '@/lib/validators/notificacion.schema'
import { NotificacionProgramada } from '@/types/notificacion.types'

interface RecordatorioFormProps {
  onSubmit: (data: RecordatorioFormValues & Partial<NotificacionProgramada>) => Promise<void>
  isLoading: boolean
  error?: string | null
  onCancel?: () => void
}

export function RecordatorioForm({
  onSubmit,
  isLoading,
  error,
  onCancel,
}: Readonly<RecordatorioFormProps>) {
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
  } = useForm<RecordatorioFormValues>({
    resolver: zodResolver(recordatorioSchema),
    defaultValues: {
      id_lead: 0,
      id_actividad: 0,
      id_plantilla: 0,
      fecha_envio: '',
      hora_envio: '',
      asunto: '',
      cuerpo: '',
    },
  })

  const selectedLeadId = useWatch({ control, name: 'id_lead' })
  const selectedPlantillaId = useWatch({ control, name: 'id_plantilla' })
  const selectedActividadId = useWatch({ control, name: 'id_actividad' })

  const selectedLead = leads.find((lead) => lead.id === selectedLeadId)
  const { data: actividades = [] } = useActividades(selectedLeadId)
  const selectedActividad = actividades.find(
    (actividad) => actividad.id === selectedActividadId
  )

  const plantillasDisponibles = plantillasActivas.data?.filter(
    (plantilla) =>
      plantilla.activo &&
      (plantilla.uso === 'Ambos' || plantilla.uso === 'Solo Recordatorio')
  ) ?? []

  const selectedPlantilla = plantillasDisponibles.find(
    (plantilla) => plantilla.id === selectedPlantillaId
  )

  useEffect(() => {
    if (!selectedPlantilla) return

    const cuerpoActual = getValues('cuerpo')
    const asuntoActual = getValues('asunto')

    if (!asuntoActual) {
      setValue('asunto', selectedPlantilla.asunto)
    }

    if (!cuerpoActual) {
      setValue('cuerpo', selectedPlantilla.cuerpo)
    }
  }, [selectedPlantilla?.id, selectedPlantilla, getValues, setValue])

  const handleFormSubmit = async (data: RecordatorioFormValues) => {
    if (!selectedLead || !selectedActividad) return

    await onSubmit({
      ...data,
      fecha_envio: `${data.fecha_envio}T${data.hora_envio}`,
      destinatario: selectedLead.encargado_nombre ?? 'Responsable',
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
            Programar recordatorio
          </p>
          <h2 className="text-2xl font-bold text-gray-900">Nuevo recordatorio</h2>
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
            <label htmlFor="rec-lead" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Lead <span className="text-red-500">*</span>
            </label>
            <select
              id="rec-lead"
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
            <label htmlFor="rec-actividad" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Actividad <span className="text-red-500">*</span>
            </label>
            <select
              id="rec-actividad"
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
            <label htmlFor="rec-plantilla" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Plantilla <span className="text-red-500">*</span>
            </label>
            <select
              id="rec-plantilla"
              {...register('id_plantilla', { valueAsNumber: true })}
              className={inputClass(!!errors.id_plantilla)}
            >
              <option value={0}>Selecciona una plantilla</option>
              {plantillasDisponibles.map((plantilla) => (
                <option key={plantilla.id} value={plantilla.id}>
                  {plantilla.nombre}
                </option>
              ))}
            </select>
            {errors.id_plantilla && (
              <p className="text-red-500 text-xs">{errors.id_plantilla.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="rec-fecha" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                id="rec-fecha"
                type="date"
                {...register('fecha_envio')}
                className={inputClass(!!errors.fecha_envio)}
              />
              {errors.fecha_envio && (
                <p className="text-red-500 text-xs">{errors.fecha_envio.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="rec-hora" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Hora <span className="text-red-500">*</span>
              </label>
              <input
                id="rec-hora"
                type="time"
                {...register('hora_envio')}
                className={inputClass(!!errors.hora_envio)}
              />
              {errors.hora_envio && (
                <p className="text-red-500 text-xs">{errors.hora_envio.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="rec-asunto" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Asunto <span className="text-red-500">*</span>
          </label>
          <input
            id="rec-asunto"
            type="text"
            {...register('asunto')}
            className={inputClass(!!errors.asunto)}
            placeholder="Asunto del mensaje"
          />
          {errors.asunto && (
            <p className="text-red-500 text-xs">{errors.asunto.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="rec-cuerpo" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Cuerpo del mensaje <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Info size={12} />
              El cuerpo se puede personalizar luego de seleccionar plantilla
            </span>
          </div>
          <textarea
            id="rec-cuerpo"
            rows={8}
            {...register('cuerpo')}
            className={`${inputClass(!!errors.cuerpo)} resize-y font-mono text-xs`}
            placeholder="Texto del recordatorio"
          />
          {errors.cuerpo && (
            <p className="text-red-500 text-xs">{errors.cuerpo.message}</p>
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
                Programar recordatorio
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
