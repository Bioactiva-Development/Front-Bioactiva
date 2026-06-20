'use client'

import { useEffect, useMemo } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  CalendarClock,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
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

const nuevaInstancia = () => ({
  internal: { fechaEnvio: '', idTemplate: 0, asunto: '', cuerpo: '' },
  external: { fechaEnvio: '', idTemplate: 0, asunto: '', cuerpo: '' },
})

const targets = ['internal', 'external'] as const

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

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'instancias',
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

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-PE', {
      timeZone: APP_TIME_ZONE,
      day:      '2-digit',
      month:    'short',
      year:     'numeric',
      hour:     '2-digit',
      minute:   '2-digit',
    })

  useEffect(() => {
    if (leadIdInicial) setValue('idLead', leadIdInicial)
  }, [leadIdInicial, setValue])

  useEffect(() => {
    setValue('correoCliente', correoPrincipal)
  }, [contacto?.id, correoPrincipal, setValue])

  const applyTemplate = (
    index: number,
    target: 'internal' | 'external',
    templateId: number
  ) => {
    const template = plantillas.find((item) => item.id === templateId)
    if (!template) return
    setValue(`instancias.${index}.${target}.asunto`, template.asunto)
    setValue(`instancias.${index}.${target}.cuerpo`, template.cuerpo)
  }

  const validateActividadWindow = (values: SeguimientoFormValues) => {
    clearErrors('instancias')

    const actividadFin = actividadActiva
      ? new Date(actividadActiva.fecha_fin).getTime()
      : undefined
    let isValid = true

    values.instancias.forEach((instancia, index) => {
      targets.forEach((target) => {
        const fechaEnvio = instancia[target].fechaEnvio
        const fechaEnvioTime = new Date(fechaEnvio).getTime()
        const field = `instancias.${index}.${target}.fechaEnvio` as const

        if (!Number.isFinite(fechaEnvioTime)) return

        if (actividadFin !== undefined && fechaEnvioTime >= actividadFin) {
          setError(field, {
            type: 'validate',
            message:
              'Debe enviarse antes de la fecha fin de la actividad activa',
          })
          isValid = false
        }
      })
    })

    return isValid
  }

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border px-3 py-2.5 text-sm text-gray-900 outline-none ${
      hasError
        ? 'border-red-400 bg-red-50'
        : 'border-gray-200 bg-white focus:border-emerald-400'
    }`

  const submit = async (values: SeguimientoFormValues) => {
    if (notificacionProgramadaExistente) return
    if (!validateActividadWindow(values)) return

    await onSubmit({
      idLead: values.idLead,
      correoCliente: values.correoCliente,
      instancias: values.instancias.map((instancia) => ({
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
      })),
    })
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-950">Crear seguimiento</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configura una secuencia de correos por instancia: uno interno y otro para el contacto.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(submit)} className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-1.5 lg:col-span-2">
            <label htmlFor="seg-lead" className="text-xs font-semibold uppercase text-gray-500">
              Lead <span className="text-red-500">*</span>
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
                  {lead.codigo} · {lead.organizacion_nombre ?? lead.contacto_nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 lg:col-span-2">
            <label htmlFor="seg-correo" className="text-xs font-semibold uppercase text-gray-500">
              Correo del contacto <span className="text-red-500">*</span>
            </label>
            <select
              id="seg-correo"
              {...register('correoCliente')}
              className={inputClass(!!errors.correoCliente)}
              disabled={correosContacto.length === 0}
            >
              <option value="">
                {correosContacto.length ? 'Selecciona un correo' : 'El lead no tiene contacto con correo'}
              </option>
              {correosContacto.map((correo) => (
                <option key={correo.value} value={correo.value}>
                  {correo.label} · {correo.value}
                </option>
              ))}
            </select>
            {tieneMultiplesCorreos && (
              <p className="text-xs text-gray-400">
                El contacto tiene más de un correo. Selecciona el destinatario
                que recibirá todas las instancias externas.
              </p>
            )}
            {correosContacto.length === 1 && (
              <p className="text-xs text-gray-400">
                Se usará el único correo vigente registrado para el contacto.
              </p>
            )}
            {errors.correoCliente && (
              <p className="text-xs text-red-500">{errors.correoCliente.message}</p>
            )}
          </div>
        </div>

        {selectedLead && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                <CalendarClock size={17} /> Actividad asociada
              </div>
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
          <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <p>
              Este lead no tiene una actividad pendiente activa. El backend
              requiere una actividad activa para asociar el seguimiento.
            </p>
          </div>
        )}

        {notificacionProgramadaExistente && (
          <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <p>
              Ya existe un {tipoNotificacionExistente} programado para la
              actividad activa de este lead. Cancélalo antes de crear una
              secuencia de seguimiento.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {fields.map((field, index) => {
            const instanceErrors = errors.instancias?.[index]
            return (
              <section key={field.id} className="rounded-2xl border border-gray-200 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Instancia {index + 1}</h3>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={13} /> Eliminar instancia
                    </button>
                  )}
                </div>

                {targets.map((target) => {
                  const label = target === 'internal'
                    ? 'Recordatorio interno al encargado'
                    : 'Correo externo al cliente'
                  const templateLabel = target === 'internal'
                    ? 'Plantilla para recordatorio interno'
                    : 'Plantilla para correo externo'
                  const targetErrors = instanceErrors?.[target]
                  return (
                    <div key={target} className="mb-5 grid gap-4 border-b border-gray-100 pb-5 last:mb-0 last:border-0 last:pb-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                        {label}
                      </p>
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div>
                          <label className="text-xs font-semibold text-gray-500">Fecha y hora</label>
                          <input
                            type="datetime-local"
                            {...register(`instancias.${index}.${target}.fechaEnvio`)}
                            className={inputClass(!!targetErrors?.fechaEnvio)}
                          />
                          {targetErrors?.fechaEnvio && (
                            <p className="mt-1 text-xs text-red-500">{targetErrors.fechaEnvio.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500">{templateLabel}</label>
                          <select
                            {...register(`instancias.${index}.${target}.idTemplate`, {
                              valueAsNumber: true,
                              onChange: (event) =>
                                applyTemplate(index, target, Number(event.target.value)),
                            })}
                            className={inputClass(false)}
                            disabled={plantillasQuery.isLoading}
                          >
                            <option value={0}>
                              {plantillasQuery.isLoading ? 'Cargando plantillas...' : 'Sin plantilla'}
                            </option>
                            {plantillas.map((plantilla) => (
                              <option key={plantilla.id} value={plantilla.id}>{plantilla.nombre}</option>
                            ))}
                          </select>
                          <p className="mt-1 text-[11px] text-gray-400">
                            Copia asunto y cuerpo; puedes editarlos antes de programar.
                          </p>
                        </div>
                      </div>
                      <input
                        placeholder="Asunto"
                        {...register(`instancias.${index}.${target}.asunto`)}
                        className={inputClass(!!targetErrors?.asunto)}
                      />
                      <textarea
                        rows={4}
                        placeholder="Cuerpo del correo"
                        {...register(`instancias.${index}.${target}.cuerpo`)}
                        className={`${inputClass(!!targetErrors?.cuerpo)} resize-y font-mono text-xs`}
                      />
                    </div>
                  )
                })}
              </section>
            )
          })}
          {fields.length < 3 && (
            <button
              type="button"
              onClick={() => append(nuevaInstancia())}
              className="inline-flex items-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              <Plus size={15} /> Agregar instancia ({fields.length}/3)
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-800">
          El correo externo al cliente debe programarse después del correo
          interno y antes del fin de la actividad activa. El backend aplica
          horario laboral [09:00-18:00) y puede mover envíos fuera de horario a
          las 09:00. La integración Microsoft no se invoca desde este
          seguimiento.
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
              cargandoActividades ||
              cargandoNotificaciones ||
              sinActividadActiva ||
              Boolean(notificacionProgramadaExistente) ||
              correosContacto.length === 0
            }
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isLoading ? 'Programando...' : 'Programar seguimiento'}
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
