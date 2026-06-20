'use client'

import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CalendarClock, Info, Loader2, Save } from 'lucide-react'
import { usePlantillasActivas } from '@/hooks/plantillas/usePlantillas'
import { useLeads } from '@/hooks/pipeline/useLeads'
import { useActividades } from '@/hooks/pipeline/useActividades'
import { useNotificacionesProgramadas } from '@/hooks/notificaciones/useNotificaciones'
import {
  recordatorioSchema,
  RecordatorioFormValues,
} from '@/lib/validators/notificacion.schema'
import { CrearRecordatorioRequest } from '@/types/notificacion.types'
import { EstadoActividad } from '@/types/enums'
import { APP_TIME_ZONE } from '@/lib/utils/timezone.utils'

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
  const selectedLead = leads.find((lead) => lead.id === selectedLeadId)
  const { data: actividades = [] } = useActividades(selectedLeadId)
  const {
    data: notificacionesProgramadas = [],
    isLoading: cargandoNotificaciones,
  } = useNotificacionesProgramadas(
    { estado: 'PROGRAMADA', idLead: selectedLeadId },
    { enabled: Boolean(selectedLeadId) }
  )
  const actividadActiva = useMemo(
    () =>
      actividades
        .filter((actividad) => actividad.estado === EstadoActividad.Pendiente)
        .sort(
          (a, b) =>
            new Date(a.fecha_fin).getTime() - new Date(b.fecha_fin).getTime()
        )[0],
    [actividades]
  )
  const notificacionProgramadaExistente = useMemo(
    () =>
      notificacionesProgramadas.find(
        (notificacion) =>
          notificacion.estado === 'PROGRAMADA' &&
          notificacion.idLead === selectedLeadId &&
          (!actividadActiva || notificacion.idActividad === actividadActiva.id)
      ),
    [actividadActiva, notificacionesProgramadas, selectedLeadId]
  )
  const tipoNotificacionExistente =
    notificacionProgramadaExistente?.tipo === 'SEGUIMIENTO'
      ? 'seguimiento'
      : 'recordatorio'

  const plantillas = plantillasActivas.data ?? []

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleString('es-PE', {
      timeZone: APP_TIME_ZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  useEffect(() => {
    if (leadIdInicial) setValue('idLead', leadIdInicial)
  }, [leadIdInicial, setValue])

  const applyTemplate = (templateId: number) => {
    const template = plantillas.find((item) => item.id === templateId)
    if (!template) return
    setValue('asunto', template.asunto)
    setValue('cuerpo', template.cuerpo)
  }

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 outline-none
      transition-colors placeholder:text-gray-400 ${
        hasError
          ? 'border-red-400 bg-red-50'
          : 'border-gray-200 bg-white focus:border-emerald-400'
      }`

  const submit = async (values: RecordatorioFormValues) => {
    if (notificacionProgramadaExistente) return

    await onSubmit({
      idLead: values.idLead,
      minutosAntes: values.minutosAntes,
      idTemplate: values.idTemplate || null,
      asunto: values.asunto,
      cuerpo: values.cuerpo,
    })
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-950">Crear recordatorio</h2>
          <p className="mt-1 text-sm text-gray-500">
            Programa un correo interno para el encargado antes de que la actividad concluya.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(submit)} className="space-y-6">
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

        {selectedLead && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
              <CalendarClock size={17} /> Actividad asociada
            </div>
            {actividadActiva ? (
              <dl className="mt-4 grid gap-3 md:grid-cols-3">
                <ActivityValue
                  label="Encargado"
                  value={selectedLead.encargado_nombre ?? actividadActiva.responsable_nombre ?? 'Sin asignar'}
                />
                <ActivityValue label="Nombre de actividad" value={actividadActiva.nombre_actividad} />
                <ActivityValue label="Fecha fin" value={formatFecha(actividadActiva.fecha_fin)} />
              </dl>
            ) : (
              <p className="mt-3 text-sm text-amber-700">
                Este lead no tiene una actividad pendiente; el backend rechazará la programación.
              </p>
            )}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
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
          <div className="flex items-center rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800">
            El backend restará esta cantidad a la fecha fin de la actividad para calcular el envío.
          </div>
        </div>

        {notificacionProgramadaExistente && (
          <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <p>
              Ya existe un {tipoNotificacionExistente} programado para la
              actividad activa de este lead. Cancélalo antes de crear una nueva
              notificación.
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="rec-template" className="text-xs font-semibold uppercase text-gray-500">
            Plantilla opcional
          </label>
          <select
            id="rec-template"
            {...register('idTemplate', {
              valueAsNumber: true,
              onChange: (event) => applyTemplate(Number(event.target.value)),
            })}
            className={inputClass(!!errors.idTemplate)}
            disabled={plantillasActivas.isLoading}
          >
            <option value={0}>
              {plantillasActivas.isLoading ? 'Cargando plantillas...' : 'Sin plantilla'}
            </option>
            {plantillas.map((plantilla) => (
              <option key={plantilla.id} value={plantilla.id}>
                {plantilla.nombre}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400">
            La plantilla solo precarga asunto y cuerpo; puedes editarlos sin
            modificar la plantilla original.
          </p>
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
            disabled={
              isLoading ||
              cargandoNotificaciones ||
              Boolean(notificacionProgramadaExistente)
            }
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

function ActivityValue({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-3">
      <dt className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-gray-900">{value}</dd>
    </div>
  )
}
