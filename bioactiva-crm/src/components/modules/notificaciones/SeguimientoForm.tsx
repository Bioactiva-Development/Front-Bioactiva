'use client'

import { useEffect, useMemo } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CalendarClock, Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { useContacto } from '@/hooks/contactos/useContactos'
import { usePlantillasActivas } from '@/hooks/plantillas/usePlantillas'
import { useLeads } from '@/hooks/pipeline/useLeads'
import { useActividades } from '@/hooks/pipeline/useActividades'
import {
  seguimientoSchema,
  SeguimientoFormValues,
} from '@/lib/validators/notificacion.schema'
import { CrearSeguimientoRequest } from '@/types/notificacion.types'
import { EstadoActividad } from '@/types/enums'

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
    () =>
      [contacto?.correo, contacto?.correo2].filter(
        (correo): correo is string => Boolean(correo)
      ),
    [contacto?.correo, contacto?.correo2]
  )
  const correoPrincipal = correosContacto[0] ?? ''
  const sinActividadActiva =
    Boolean(selectedLeadId) && !cargandoActividades && !actividadActiva

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-PE', {
      day:    '2-digit',
      month:  'short',
      year:   'numeric',
      hour:   '2-digit',
      minute: '2-digit',
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
    if (!validateActividadWindow(values)) return

    await onSubmit({
      idLead: values.idLead,
      correoCliente: values.correoCliente,
      instancias: values.instancias.map((instancia) => ({
        internal: {
          ...instancia.internal,
          fechaEnvio: new Date(instancia.internal.fechaEnvio).toISOString(),
          idTemplate: instancia.internal.idTemplate || null,
        },
        external: {
          ...instancia.external,
          fechaEnvio: new Date(instancia.external.fechaEnvio).toISOString(),
          idTemplate: instancia.external.idTemplate || null,
        },
      })),
    })
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Programar seguimiento
          </p>
          <h2 className="text-2xl font-bold text-gray-900">Nuevo seguimiento</h2>
        </div>
        <button type="button" onClick={onCancel} className="text-sm font-semibold text-gray-500">
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit(submit)} className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-1.5">
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

          <div className="space-y-1.5">
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
                <option key={correo} value={correo}>{correo}</option>
              ))}
            </select>
            {errors.correoCliente && (
              <p className="text-xs text-red-500">{errors.correoCliente.message}</p>
            )}
          </div>
        </div>

        {selectedLead && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
            <div className="flex items-start gap-3">
              <CalendarClock size={18} className="mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p>
                  El seguimiento se programa con <strong>idLead</strong>. El
                  backend resolverá la actividad activa y el encargado al
                  guardar.
                </p>
                <p>
                  Encargado actual:
                  <strong> {selectedLead.encargado_nombre ?? 'Sin nombre'}</strong>.
                </p>
                {cargandoActividades && (
                  <p className="text-emerald-700">Buscando actividad activa...</p>
                )}
                {actividadActiva && (
                  <p>
                    Actividad activa:
                    <strong> {actividadActiva.nombre_actividad}</strong> · fin:
                    <strong> {formatFecha(actividadActiva.fecha_fin)}</strong>.
                  </p>
                )}
              </div>
            </div>
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
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600"
                    >
                      <Trash2 size={14} /> Eliminar
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
        </div>

        {fields.length < 3 && (
          <button
            type="button"
            onClick={() => append(nuevaInstancia())}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700"
          >
            <Plus size={15} /> Agregar instancia
          </button>
        )}

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-800">
          Las fechas deben estar en orden, no solaparse y quedar antes del fin
          de la actividad activa. El backend aplica horario laboral
          [09:00-18:00) y puede mover envíos fuera de horario a las 09:00.
          La integración Microsoft no se invoca desde este seguimiento.
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
              sinActividadActiva ||
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
