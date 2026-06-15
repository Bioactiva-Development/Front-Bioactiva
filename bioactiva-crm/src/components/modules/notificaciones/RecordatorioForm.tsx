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
import { CrearRecordatorioRequest } from '@/types/notificacion.types'
import { EstadoActividad } from '@/types/enums'

interface RecordatorioFormProps {
  onSubmit: (data: CrearRecordatorioRequest) => Promise<void>
  isLoading: boolean
  error?: string | null
  onCancel?: () => void
  leadIdInicial?: number
}

export function RecordatorioForm({
  onSubmit,
  isLoading,
  error,
  onCancel,
  leadIdInicial,
}: Readonly<RecordatorioFormProps>) {
  const { data: leadsResponse } = useLeads({ limit: 100 })
  const leads = leadsResponse?.data ?? []
  const plantillasActivas = usePlantillasActivas()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<RecordatorioFormValues>({
    resolver: zodResolver(recordatorioSchema),
    defaultValues: {
      idLead: leadIdInicial ?? 0,
      minutosAntes: 30,
      idTemplate: 0,
      asunto: '',
      cuerpo: '',
    },
  })

  const selectedLeadId = useWatch({ control, name: 'idLead' })
  const selectedTemplateId = useWatch({ control, name: 'idTemplate' })
  const selectedLead = leads.find((lead) => lead.id === selectedLeadId)
  const { data: actividades = [] } = useActividades(selectedLeadId)
  const actividadActiva = actividades.find(
    (actividad) => actividad.estado === EstadoActividad.Pendiente
  )

  const plantillas = plantillasActivas.data ?? []
  const selectedTemplate = plantillas.find(
    (plantilla) => plantilla.id === selectedTemplateId
  )

  useEffect(() => {
    if (leadIdInicial) setValue('idLead', leadIdInicial)
  }, [leadIdInicial, setValue])

  useEffect(() => {
    if (!selectedTemplate) return
    setValue('asunto', selectedTemplate.asunto)
    setValue('cuerpo', selectedTemplate.cuerpo)
  }, [selectedTemplate, setValue])

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 outline-none
      transition-colors placeholder:text-gray-400 ${
        hasError
          ? 'border-red-400 bg-red-50'
          : 'border-gray-200 bg-white focus:border-emerald-400'
      }`

  const submit = async (values: RecordatorioFormValues) => {
    await onSubmit({
      idLead: values.idLead,
      minutosAntes: values.minutosAntes,
      idTemplate: values.idTemplate || null,
      asunto: values.asunto,
      cuerpo: values.cuerpo,
    })
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Programar recordatorio
          </p>
          <h2 className="text-2xl font-bold text-gray-900">Nuevo recordatorio</h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-semibold text-gray-500 hover:text-gray-700"
        >
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit(submit)} className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="rec-lead" className="text-xs font-semibold uppercase text-gray-500">
              Lead <span className="text-red-500">*</span>
            </label>
            <select
              id="rec-lead"
              {...register('idLead', { valueAsNumber: true })}
              className={inputClass(!!errors.idLead)}
              disabled={Boolean(leadIdInicial)}
            >
              <option value={0}>Selecciona un lead</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.codigo} · {lead.organizacion_nombre ?? lead.contacto_nombre}
                </option>
              ))}
            </select>
            {errors.idLead && (
              <p className="text-xs text-red-500">{errors.idLead.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="rec-minutos" className="text-xs font-semibold uppercase text-gray-500">
              Minutos antes del fin <span className="text-red-500">*</span>
            </label>
            <input
              id="rec-minutos"
              type="number"
              min={1}
              max={120}
              {...register('minutosAntes', { valueAsNumber: true })}
              className={inputClass(!!errors.minutosAntes)}
            />
            {errors.minutosAntes && (
              <p className="text-xs text-red-500">{errors.minutosAntes.message}</p>
            )}
          </div>
        </div>

        {selectedLead && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
            <p className="font-semibold">
              Encargado actual: {selectedLead.encargado_nombre ?? 'Sin nombre'}
            </p>
            <p className="mt-1 text-xs">
              {actividadActiva
                ? `Actividad activa: ${actividadActiva.nombre_actividad}. El backend calculará el envío desde su fecha de fin.`
                : 'Este lead no tiene una actividad pendiente; el backend rechazará la programación.'}
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="rec-template" className="text-xs font-semibold uppercase text-gray-500">
            Plantilla opcional
          </label>
          <select
            id="rec-template"
            {...register('idTemplate', { valueAsNumber: true })}
            className={inputClass(!!errors.idTemplate)}
          >
            <option value={0}>Sin plantilla</option>
            {plantillas.map((plantilla) => (
              <option key={plantilla.id} value={plantilla.id}>
                {plantilla.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="rec-asunto" className="text-xs font-semibold uppercase text-gray-500">
            Asunto <span className="text-red-500">*</span>
          </label>
          <input
            id="rec-asunto"
            {...register('asunto')}
            className={inputClass(!!errors.asunto)}
          />
          {errors.asunto && (
            <p className="text-xs text-red-500">{errors.asunto.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="rec-cuerpo" className="text-xs font-semibold uppercase text-gray-500">
              Cuerpo <span className="text-red-500">*</span>
            </label>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Info size={12} /> Admite texto o HTML
            </span>
          </div>
          <textarea
            id="rec-cuerpo"
            rows={7}
            {...register('cuerpo')}
            className={`${inputClass(!!errors.cuerpo)} resize-y font-mono text-xs`}
          />
          {errors.cuerpo && (
            <p className="text-xs text-red-500">{errors.cuerpo.message}</p>
          )}
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button type="button" onClick={onCancel} className="rounded-xl border px-4 py-2.5 text-sm font-semibold text-gray-600">
            Volver
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isLoading ? 'Programando...' : 'Programar recordatorio'}
          </button>
        </div>
      </form>
    </div>
  )
}
