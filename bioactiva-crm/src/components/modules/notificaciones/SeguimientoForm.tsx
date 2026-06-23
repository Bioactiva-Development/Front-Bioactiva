'use client'

import { useEffect, useMemo } from 'react'
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
import {
  CrearSeguimientoRequest,
  EditarSeguimientoRequest,
  NotificacionProgramada,
} from '@/types/notificacion.types'
import { EstadoActividad } from '@/types/enums'
import { getContactoEmailOptions } from '@/lib/utils/contacto-email.utils'
import { APP_TIME_ZONE, limaInputToUtcISO } from '@/lib/utils/timezone.utils'

interface SeguimientoFormProps {
  onSubmit: (data: CrearSeguimientoRequest) => Promise<void>
  onEdit?: (id: number, data: EditarSeguimientoRequest) => Promise<void>
  notificacionInicial?: NotificacionProgramada
  isLoading: boolean
  error?: string | null
  onCancel?: () => void
  leadIdInicial?: number
}

type Target = 'internal' | 'external'

const getFechaHoraInputs = (fecha?: string) => {
  if (!fecha) return { fechaEnvio: '', horaEnvio: '' }
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(fecha))
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''

  return {
    fechaEnvio: `${value('year')}-${value('month')}-${value('day')}`,
    horaEnvio: `${value('hour')}:${value('minute')}`,
  }
}

const nuevaInstancia = () => ({
  internal: {
    fechaEnvio: '',
    horaEnvio: '',
    idTemplate: 0,
    asunto: 'Revisión interna de seguimiento comercial',
    cuerpo:
      'Hola, tienes un seguimiento pendiente asociado al lead seleccionado. Revisa la actividad antes del envío al cliente.',
  },
  external: {
    fechaEnvio: '',
    horaEnvio: '',
    idTemplate: 0,
    asunto: 'Seguimiento a la propuesta comercial de BioActiva',
    cuerpo:
      'Hola, le escribimos para dar seguimiento a la propuesta revisada con BioActiva. Quedamos atentos a sus comentarios.',
  },
})

const getInstanciaInicial = (notificacion?: NotificacionProgramada) => {
  const instancia = notificacion?.instancias?.[0]
  if (!instancia) return nuevaInstancia()
  const internalSchedule = getFechaHoraInputs(instancia.fechaEnvioInterno)
  const externalSchedule = getFechaHoraInputs(instancia.fechaEnvioExterno)
  return {
    internal: {
      ...internalSchedule,
      idTemplate: 0,
      asunto: instancia.asuntoInterno,
      cuerpo: '',
    },
    external: {
      ...externalSchedule,
      idTemplate: 0,
      asunto: instancia.asuntoExterno,
      cuerpo: '',
    },
  }
}

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
  onEdit,
  notificacionInicial,
  isLoading,
  error,
  onCancel,
  leadIdInicial,
}: Readonly<SeguimientoFormProps>) {
  const editando = Boolean(notificacionInicial)
  const instanciaInicial = getInstanciaInicial(notificacionInicial)
  const { data: leadsResponse } = useLeads({
    limit: 100,
    mis_leads: true,
    con_actividades_pendientes: true,
  })
  const leads = leadsResponse?.data ?? []
  const plantillasQuery = usePlantillasActivas()
  const plantillas = plantillasQuery.data ?? []
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
      idLead: notificacionInicial?.idLead ?? leadIdInicial ?? 0,
      correoCliente: notificacionInicial?.correoCliente ?? '',
      instancias: [instanciaInicial],
    },
  })

  const selectedLeadId = useWatch({ control, name: 'idLead' })
  const internalDate = useWatch({
    control,
    name: 'instancias.0.internal.fechaEnvio',
  })
  const internalTime = useWatch({
    control,
    name: 'instancias.0.internal.horaEnvio',
  })
  const externalDate = useWatch({
    control,
    name: 'instancias.0.external.fechaEnvio',
  })
  const externalTime = useWatch({
    control,
    name: 'instancias.0.external.horaEnvio',
  })
  const selectedLead = leads.find((lead) => lead.id === selectedLeadId)
  const { data: actividades = [], isLoading: cargandoActividades } =
    useActividades(selectedLeadId || 0)
  const { data: contacto } = useContacto(selectedLead?.id_contacto ?? 0)
  const { data: notificacionesResponse, isLoading: cargandoNotificaciones } =
    useNotificacionesProgramadas(
    { estado: 'PROGRAMADA', idLead: selectedLeadId, page: 1, limit: 10 },
    { enabled: Boolean(selectedLeadId) }
  )
  const notificacionesProgramadas = useMemo(
    () => notificacionesResponse?.data ?? [],
    [notificacionesResponse?.data]
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
  const actividadFinInputs = useMemo(
    () => getFechaHoraInputs(actividadActiva?.fecha_fin),
    [actividadActiva?.fecha_fin]
  )
  const fechaActual = getFechaHoraInputs(new Date().toISOString()).fechaEnvio
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
          notificacion.id !== notificacionInicial?.id &&
          notificacion.idLead === selectedLeadId &&
          (!actividadActiva || notificacion.idActividad === actividadActiva.id)
      ),
    [
      actividadActiva,
      notificacionInicial?.id,
      notificacionesProgramadas,
      selectedLeadId,
    ]
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
    setValue(
      'correoCliente',
      notificacionInicial?.correoCliente ?? correoPrincipal
    )
  }, [contacto?.id, correoPrincipal, notificacionInicial?.correoCliente, setValue])

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

  const fechaEnvioDesdeCampos = (fecha: string, hora: string) => {
    if (!fecha || !hora) return null
    try {
      return limaInputToUtcISO(`${fecha}T${hora}`)
    } catch {
      return null
    }
  }

  const validateActividadWindow = (values: SeguimientoFormValues) => {
    clearErrors('instancias')
    if (!actividadActiva) return false
    let isValid = true
    const finActividad = new Date(actividadActiva.fecha_fin).getTime()
    const fechas: Partial<Record<Target, number>> = {}

    ;(['internal', 'external'] as const).forEach((target) => {
      const schedule = values.instancias[0][target]
      const fechaEnvio = fechaEnvioDesdeCampos(
        schedule.fechaEnvio,
        schedule.horaEnvio
      )
      const fechaEnvioTime = fechaEnvio
        ? new Date(fechaEnvio).getTime()
        : Number.NaN
      if (!Number.isFinite(fechaEnvioTime)) {
        setError(`instancias.0.${target}.fechaEnvio`, {
          type: 'validate',
          message: 'Ingrese una fecha y hora de envío válidas',
        })
        isValid = false
        return
      }
      fechas[target] = fechaEnvioTime

      if (fechaEnvioTime <= Date.now()) {
        setError(`instancias.0.${target}.fechaEnvio`, {
          type: 'validate',
          message: 'La fecha y hora de envío deben ser posteriores al momento actual',
        })
        isValid = false
      }

      if (!Number.isFinite(finActividad) || fechaEnvioTime >= finActividad) {
        setError(`instancias.0.${target}.fechaEnvio`, {
          type: 'validate',
          message: 'La fecha y hora de envío deben ser anteriores al fin de la actividad',
        })
        isValid = false
      }
    })

    if (
      fechas.internal !== undefined &&
      fechas.external !== undefined &&
      fechas.internal >= fechas.external
    ) {
      setError('instancias.0.external.fechaEnvio', {
        type: 'validate',
        message:
          'La fecha y hora de envío para el usuario debe ser anterior a la fecha y hora de envío para el contacto',
      })
      isValid = false
    }

    return isValid
  }

  const submit = async (values: SeguimientoFormValues) => {
    if (notificacionProgramadaExistente) return
    if (!validateActividadWindow(values)) return

    const instancia = values.instancias[0]
    const internalFecha = fechaEnvioDesdeCampos(
      instancia.internal.fechaEnvio,
      instancia.internal.horaEnvio
    )
    const externalFecha = fechaEnvioDesdeCampos(
      instancia.external.fechaEnvio,
      instancia.external.horaEnvio
    )
    if (!internalFecha || !externalFecha) return
    const internal = {
      fechaEnvio: internalFecha,
      idTemplate: instancia.internal.idTemplate || null,
      asunto: instancia.internal.asunto,
      cuerpo: instancia.internal.cuerpo,
    }
    const external = {
      fechaEnvio: externalFecha,
      idTemplate: instancia.external.idTemplate || null,
      asunto: instancia.external.asunto,
      cuerpo: instancia.external.cuerpo,
    }

    if (notificacionInicial && onEdit) {
      await onEdit(notificacionInicial.id, {
        correoCliente: values.correoCliente,
        internal,
        external,
      })
      return
    }

    await onSubmit({
      idLead: values.idLead,
      correoCliente: values.correoCliente,
      instancias: [{ internal, external }],
    })
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 border-b border-gray-100 pb-5">
        <h2 className="text-lg font-bold text-gray-950">
          {editando ? 'Editar seguimiento' : 'Crear seguimiento'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Programa la fecha y hora de envío para el correo interno y el correo
          al contacto.
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
            disabled={Boolean(leadIdInicial) || editando}
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

        {editando && (
          <Warning>
            La API no devuelve los cuerpos ni las plantillas usadas previamente.
            Vuelve a seleccionar una plantilla o escribe ambos cuerpos para
            reemplazar la programación actual.
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
              target="internal"
              register={register}
              dateError={instanceErrors?.internal?.fechaEnvio?.message}
              timeError={instanceErrors?.internal?.horaEnvio?.message}
              inputClass={inputClass}
              minDate={fechaActual}
              maxDate={externalDate || actividadFinInputs.fechaEnvio}
              maxTime={internalDate === externalDate ? externalTime : undefined}
            />
          </div>
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
            description="Correo externo que se enviará después del aviso interno al encargado."
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
              target="external"
              register={register}
              dateError={instanceErrors?.external?.fechaEnvio?.message}
              timeError={instanceErrors?.external?.horaEnvio?.message}
              inputClass={inputClass}
              minDate={internalDate || fechaActual}
              maxDate={actividadFinInputs.fechaEnvio}
              minTime={internalDate === externalDate ? internalTime : undefined}
              maxTime={
                externalDate === actividadFinInputs.fechaEnvio
                  ? actividadFinInputs.horaEnvio
                  : undefined
              }
            />
          </div>
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
            {isLoading
              ? 'Guardando...'
              : editando
                ? 'Actualizar seguimiento'
                : 'Guardar seguimiento'}
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
  target,
  register,
  dateError,
  timeError,
  inputClass,
  minDate,
  maxDate,
  minTime,
  maxTime,
}: Readonly<{
  prefix: string
  target: Target
  register: UseFormRegister<SeguimientoFormValues>
  dateError?: string
  timeError?: string
  inputClass: (hasError: boolean, readOnly?: boolean) => string
  minDate?: string
  maxDate?: string
  minTime?: string
  maxTime?: string
}>) {
  return (
    <fieldset className="space-y-2 lg:col-span-2">
      <legend className="text-sm font-semibold text-gray-700">
        Anticipación al fin de la actividad
      </legend>
      <div className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <FieldLabel htmlFor={`${prefix}-date`}>Fecha de envío</FieldLabel>
          <input
            id={`${prefix}-date`}
            type="date"
            min={minDate}
            max={maxDate}
            {...register(`instancias.0.${target}.fechaEnvio`)}
            className={inputClass(Boolean(dateError))}
          />
          {dateError && <p className="text-xs text-red-500">{dateError}</p>}
        </div>
        <div className="space-y-1.5">
          <FieldLabel htmlFor={`${prefix}-time`}>Hora de envío</FieldLabel>
          <input
            id={`${prefix}-time`}
            type="time"
            min={minTime}
            max={maxTime}
            step={60}
            {...register(`instancias.0.${target}.horaEnvio`)}
            className={inputClass(Boolean(timeError))}
          />
          {timeError && <p className="text-xs text-red-500">{timeError}</p>}
        </div>
      </div>
    </fieldset>
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
