'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch, type UseFormRegister } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useContacto } from '@/hooks/contactos/useContactos'
import { usePlantillasActivas } from '@/hooks/plantillas/usePlantillas'
import { useLeads } from '@/hooks/pipeline/useLeads'
import { useActividades } from '@/hooks/pipeline/useActividades'
import { useNotificacionesProgramadas } from '@/hooks/notificaciones/useNotificaciones'
import {
  seguimientoSchema,
  SeguimientoFormValues,
} from '@/lib/validators/notificacion.schema'
import { CrearSeguimientoRequest } from '@/types/notificacion.types'
import { EstadoActividad } from '@/types/enums'
import { getContactoEmailOptions } from '@/lib/utils/contacto-email.utils'
import { APP_TIME_ZONE, limaInputToUtcISO } from '@/lib/utils/timezone.utils'

interface SeguimientoFormProps {
  onSubmit: (data: CrearSeguimientoRequest) => Promise<void>
  isLoading: boolean
  error?: string | null
  onCancel?: () => void
  leadIdInicial?: number
}

type Target = 'internal' | 'external'
type SchedulePart = 'date' | 'time'

const targets: Target[] = ['internal', 'external']

const nuevaInstancia = () => ({
  internal: {
    fechaEnvio: '',
    idTemplate: 0,
    asunto: 'Revisión interna de seguimiento comercial',
    cuerpo:
      'Hola, tienes un seguimiento pendiente asociado al lead seleccionado. Revisa la actividad antes del envío al cliente.',
  },
  external: {
    fechaEnvio: '',
    idTemplate: 0,
    asunto: 'Seguimiento a la propuesta comercial de BioActiva',
    cuerpo:
      'Hola, le escribimos para dar seguimiento a la propuesta revisada con BioActiva. Quedamos atentos a sus comentarios.',
  },
})

const formatFecha = (fecha: string) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(fecha))
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''

  return `${value('day')}/${value('month')}/${value('year')} ${value('hour')}:${value('minute')}`
}

export function SeguimientoForm({
  onSubmit,
  isLoading,
  error,
  onCancel,
  leadIdInicial,
}: Readonly<SeguimientoFormProps>) {
  const { data: leadsResponse } = useLeads({ limit: 100 })
  const leads = leadsResponse?.data ?? []
  const plantillasQuery = usePlantillasActivas()
  const plantillas = plantillasQuery.data ?? []
  const [internalDate, setInternalDate] = useState('')
  const [internalTime, setInternalTime] = useState('')
  const [externalDate, setExternalDate] = useState('')
  const [externalTime, setExternalTime] = useState('')

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<SeguimientoFormValues>({
    resolver: zodResolver(seguimientoSchema),
    defaultValues: {
      idLead: leadIdInicial ?? 0,
      correoCliente: '',
      instancias: [nuevaInstancia()],
    },
  })

  const selectedLeadId = useWatch({ control, name: 'idLead' })
  const selectedLead = leads.find((lead) => lead.id === selectedLeadId)
  const { data: actividades = [], isLoading: cargandoActividades } =
    useActividades(selectedLeadId || 0)
  const { data: contacto } = useContacto(selectedLead?.id_contacto ?? 0)
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
  const correosContacto = useMemo(
    () => getContactoEmailOptions(contacto),
    [contacto]
  )
  const correoPrincipal = correosContacto[0]?.value ?? ''
  const tieneMultiplesCorreos = correosContacto.length > 1
  const sinActividadActiva =
    Boolean(selectedLeadId) && !cargandoActividades && !actividadActiva
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
  const instanceErrors = errors.instancias?.[0]

  useEffect(() => {
    if (leadIdInicial) setValue('idLead', leadIdInicial)
  }, [leadIdInicial, setValue])

  useEffect(() => {
    setValue('correoCliente', correoPrincipal)
  }, [contacto?.id, correoPrincipal, setValue])

  const inputClass = (hasError: boolean, readOnly = false) =>
    `w-full rounded-xl border px-3 py-2.5 text-sm text-gray-900 outline-none ${
      hasError
        ? 'border-red-400 bg-red-50'
        : readOnly
          ? 'border-gray-200 bg-gray-50'
          : 'border-gray-200 bg-white focus:border-emerald-400'
    }`

  const applyTemplate = (target: Target, templateId: number) => {
    const template = plantillas.find((item) => item.id === templateId)
    if (!template) return
    setValue(`instancias.0.${target}.asunto`, template.asunto)
    setValue(`instancias.0.${target}.cuerpo`, template.cuerpo)
  }

  const updateSchedule = (
    target: Target,
    part: SchedulePart,
    nextValue: string
  ) => {
    const currentDate = target === 'internal' ? internalDate : externalDate
    const currentTime = target === 'internal' ? internalTime : externalTime
    const nextDate = part === 'date' ? nextValue : currentDate
    const nextTime = part === 'time' ? nextValue : currentTime

    if (target === 'internal') {
      if (part === 'date') setInternalDate(nextValue)
      else setInternalTime(nextValue)
    } else if (part === 'date') {
      setExternalDate(nextValue)
    } else {
      setExternalTime(nextValue)
    }

    setValue(
      `instancias.0.${target}.fechaEnvio`,
      nextDate && nextTime ? `${nextDate}T${nextTime}` : '',
      { shouldDirty: true, shouldValidate: true }
    )
  }

  const validateActividadWindow = (values: SeguimientoFormValues) => {
    clearErrors('instancias')
    const actividadFin = actividadActiva
      ? new Date(actividadActiva.fecha_fin).getTime()
      : undefined
    let isValid = true

    targets.forEach((target) => {
      const fechaEnvio = values.instancias[0][target].fechaEnvio
      const fechaEnvioTime = new Date(fechaEnvio).getTime()
      if (!Number.isFinite(fechaEnvioTime)) return

      if (actividadFin !== undefined && fechaEnvioTime >= actividadFin) {
        setError(`instancias.0.${target}.fechaEnvio`, {
          type: 'validate',
          message: 'Debe enviarse antes de la fecha fin de la actividad activa',
        })
        isValid = false
      }
    })

    return isValid
  }

  const submit = async (values: SeguimientoFormValues) => {
    if (notificacionProgramadaExistente) return
    if (!validateActividadWindow(values)) return

    const instancia = values.instancias[0]
    await onSubmit({
      idLead: values.idLead,
      correoCliente: values.correoCliente,
      instancias: [{
        internal: {
          ...instancia.internal,
          fechaEnvio: limaInputToUtcISO(instancia.internal.fechaEnvio),
          idTemplate: instancia.internal.idTemplate || null,
        },
        external: {
          ...instancia.external,
          fechaEnvio: limaInputToUtcISO(instancia.external.fechaEnvio),
          idTemplate: instancia.external.idTemplate || null,
        },
      }],
    })
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 border-b border-gray-100 pb-5">
        <h2 className="text-lg font-bold text-gray-950">Crear seguimiento</h2>
        <p className="mt-1 text-sm text-gray-500">
          Configura una secuencia de correos por instancia: uno interno y otro para el contacto.
        </p>
      </div>

      <form onSubmit={handleSubmit(submit)} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="seg-lead" className="text-sm font-semibold text-gray-700">
            Lead
          </label>
          <select
            id="seg-lead"
            {...register('idLead', { valueAsNumber: true })}
            className={inputClass(!!errors.idLead)}
            disabled={Boolean(leadIdInicial)}
          >
            <option value={0}>Selecciona un lead</option>
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.servicio_interes} - {lead.organizacion_nombre ?? lead.contacto_nombre}
              </option>
            ))}
          </select>
          {errors.idLead && (
            <p className="text-xs text-red-500">{errors.idLead.message}</p>
          )}
        </div>

        {selectedLead && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-bold text-emerald-800">Actividad asociada</div>
              <span className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                Solo lectura
              </span>
            </div>
            {cargandoActividades && (
              <p className="mt-3 text-sm text-emerald-700">Buscando actividad activa...</p>
            )}
            {!cargandoActividades && actividadActiva && (
              <dl className="mt-4 grid gap-3 md:grid-cols-3">
                <ActivityValue
                  label="Encargado"
                  value={selectedLead.encargado_nombre ?? actividadActiva.responsable_nombre ?? 'Sin asignar'}
                />
                <ActivityValue label="Nombre de actividad" value={actividadActiva.nombre_actividad} />
                <ActivityValue label="Fecha fin" value={formatFecha(actividadActiva.fecha_fin)} />
              </dl>
            )}
          </div>
        )}

        {sinActividadActiva && (
          <Warning>
            Este lead no tiene una actividad pendiente activa. El backend requiere
            una actividad activa para asociar el seguimiento.
          </Warning>
        )}

        {notificacionProgramadaExistente && (
          <Warning>
            Ya existe un {tipoNotificacionExistente} programado para la actividad
            activa de este lead. Cancélalo antes de crear un seguimiento.
          </Warning>
        )}

        <section className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
          <MessageHeader
            tone="internal"
            title="Correo para el usuario"
            description="Correo interno para que el encargado revise la actividad antes del envío al cliente."
          />
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="space-y-1.5">
              <FieldLabel htmlFor="seg-internal-template" optional>Plantilla</FieldLabel>
              <select
                id="seg-internal-template"
                {...register('instancias.0.internal.idTemplate', {
                  valueAsNumber: true,
                  onChange: (event) => applyTemplate('internal', Number(event.target.value)),
                })}
                className={inputClass(false)}
                disabled={plantillasQuery.isLoading}
              >
                <TemplateOptions loading={plantillasQuery.isLoading} plantillas={plantillas} />
              </select>
            </div>
            <div className="space-y-1.5">
              <FieldLabel htmlFor="seg-internal-recipient">Destinatario</FieldLabel>
              <input
                id="seg-internal-recipient"
                value={selectedLead?.encargado_nombre ?? ''}
                readOnly
                className={inputClass(false, true)}
              />
            </div>
            <ScheduleFields
              prefix="seg-internal"
              date={internalDate}
              time={internalTime}
              error={instanceErrors?.internal?.fechaEnvio?.message}
              onDateChange={(value) => updateSchedule('internal', 'date', value)}
              onTimeChange={(value) => updateSchedule('internal', 'time', value)}
            />
          </div>
          <input type="hidden" {...register('instancias.0.internal.fechaEnvio')} />
          <MessageFields
            prefix="seg-internal"
            register={register}
            target="internal"
            subjectError={instanceErrors?.internal?.asunto?.message}
            bodyError={instanceErrors?.internal?.cuerpo?.message}
            inputClass={inputClass}
          />
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
          <MessageHeader
            tone="external"
            title="Correo para el contacto"
            description="Correo externo. Cada seguimiento puede tener fechas y contenido distintos."
          />
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="space-y-1.5">
              <FieldLabel htmlFor="seg-correo">Destinatario</FieldLabel>
              <select
                id="seg-correo"
                {...register('correoCliente')}
                className={inputClass(!!errors.correoCliente)}
                disabled={correosContacto.length === 0}
              >
                <option value="">
                  {correosContacto.length
                    ? 'Selecciona un correo'
                    : 'El lead no tiene contacto con correo'}
                </option>
                {correosContacto.map((correo) => (
                  <option key={correo.value} value={correo.value}>
                    {correo.label} - {correo.value}
                  </option>
                ))}
              </select>
              {tieneMultiplesCorreos && (
                <p className="text-xs text-gray-400">
                  Selecciona el correo que recibirá el seguimiento externo.
                </p>
              )}
              {errors.correoCliente && (
                <p className="text-xs text-red-500">{errors.correoCliente.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <FieldLabel htmlFor="seg-external-template" optional>Plantilla</FieldLabel>
              <select
                id="seg-external-template"
                {...register('instancias.0.external.idTemplate', {
                  valueAsNumber: true,
                  onChange: (event) => applyTemplate('external', Number(event.target.value)),
                })}
                className={inputClass(false)}
                disabled={plantillasQuery.isLoading}
              >
                <TemplateOptions loading={plantillasQuery.isLoading} plantillas={plantillas} />
              </select>
            </div>
            <ScheduleFields
              prefix="seg-external"
              date={externalDate}
              time={externalTime}
              error={instanceErrors?.external?.fechaEnvio?.message}
              onDateChange={(value) => updateSchedule('external', 'date', value)}
              onTimeChange={(value) => updateSchedule('external', 'time', value)}
            />
          </div>
          <input type="hidden" {...register('instancias.0.external.fechaEnvio')} />
          <MessageFields
            prefix="seg-external"
            register={register}
            target="external"
            subjectError={instanceErrors?.external?.asunto?.message}
            bodyError={instanceErrors?.external?.cuerpo?.message}
            inputClass={inputClass}
          />
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={
              isLoading ||
              cargandoActividades ||
              cargandoNotificaciones ||
              sinActividadActiva ||
              Boolean(notificacionProgramadaExistente) ||
              correosContacto.length === 0
            }
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isLoading ? 'Guardando...' : 'Guardar seguimiento'}
          </button>
        </div>
      </form>
    </div>
  )
}

function MessageHeader({
  tone,
  title,
  description,
}: Readonly<{
  tone: 'internal' | 'external'
  title: string
  description: string
}>) {
  return (
    <div className="border-b border-gray-200 pb-3">
      <div className={`border-l-[3px] pl-3 ${
        tone === 'internal' ? 'border-emerald-500' : 'border-blue-600'
      }`}>
        <h3 className="text-sm font-bold text-gray-950">{title}</h3>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
    </div>
  )
}

function ScheduleFields({
  prefix,
  date,
  time,
  error,
  onDateChange,
  onTimeChange,
}: Readonly<{
  prefix: string
  date: string
  time: string
  error?: string
  onDateChange: (value: string) => void
  onTimeChange: (value: string) => void
}>) {
  return (
    <>
      <div className="space-y-1.5">
        <FieldLabel htmlFor={`${prefix}-date`}>Fecha de envío</FieldLabel>
        <input
          id={`${prefix}-date`}
          type="date"
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
          className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
          }`}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
      <div className="space-y-1.5">
        <FieldLabel htmlFor={`${prefix}-time`}>Hora de envío</FieldLabel>
        <input
          id={`${prefix}-time`}
          type="time"
          value={time}
          onChange={(event) => onTimeChange(event.target.value)}
          className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
          }`}
        />
      </div>
    </>
  )
}

function MessageFields({
  prefix,
  register,
  target,
  subjectError,
  bodyError,
  inputClass,
}: Readonly<{
  prefix: string
  register: UseFormRegister<SeguimientoFormValues>
  target: Target
  subjectError?: string
  bodyError?: string
  inputClass: (hasError: boolean, readOnly?: boolean) => string
}>) {
  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-1.5">
        <FieldLabel htmlFor={`${prefix}-subject`}>Asunto</FieldLabel>
        <input
          id={`${prefix}-subject`}
          {...register(`instancias.0.${target}.asunto`)}
          className={inputClass(Boolean(subjectError))}
        />
        {subjectError && <p className="text-xs text-red-500">{subjectError}</p>}
      </div>
      <div className="space-y-1.5">
        <FieldLabel htmlFor={`${prefix}-body`}>Cuerpo</FieldLabel>
        <textarea
          id={`${prefix}-body`}
          rows={4}
          {...register(`instancias.0.${target}.cuerpo`)}
          className={`${inputClass(Boolean(bodyError))} resize-y`}
        />
        {bodyError && <p className="text-xs text-red-500">{bodyError}</p>}
      </div>
    </div>
  )
}

function FieldLabel({
  htmlFor,
  optional = false,
  children,
}: Readonly<{
  htmlFor: string
  optional?: boolean
  children: React.ReactNode
}>) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-gray-700">
      {children}
      {optional && <span className="font-normal text-gray-400"> (opcional)</span>}
    </label>
  )
}

function TemplateOptions({
  loading,
  plantillas,
}: Readonly<{
  loading: boolean
  plantillas: Array<{ id: number; nombre: string }>
}>) {
  return (
    <>
      <option value={0}>{loading ? 'Cargando plantillas...' : 'Sin plantilla'}</option>
      {plantillas.map((plantilla) => (
        <option key={plantilla.id} value={plantilla.id}>{plantilla.nombre}</option>
      ))}
    </>
  )
}

function Warning({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <AlertCircle size={17} className="mt-0.5 shrink-0" />
      <p>{children}</p>
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
