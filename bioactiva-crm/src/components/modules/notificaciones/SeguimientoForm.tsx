'use client'

import { useEffect, useMemo } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { useContacto } from '@/hooks/contactos/useContactos'
import { usePlantillasActivas } from '@/hooks/plantillas/usePlantillas'
import { useLeads } from '@/hooks/pipeline/useLeads'
import {
  seguimientoSchema,
  SeguimientoFormValues,
} from '@/lib/validators/notificacion.schema'
import { CrearSeguimientoRequest } from '@/types/notificacion.types'

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
  const { data: contacto } = useContacto(selectedLead?.id_contacto ?? 0)

  const correosContacto = useMemo(
    () =>
      [contacto?.correo, contacto?.correo2].filter(
        (correo): correo is string => Boolean(correo)
      ),
    [contacto?.correo, contacto?.correo2]
  )
  const correoPrincipal = correosContacto[0] ?? ''

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

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border px-3 py-2.5 text-sm text-gray-900 outline-none ${
      hasError
        ? 'border-red-400 bg-red-50'
        : 'border-gray-200 bg-white focus:border-emerald-400'
    }`

  const submit = async (values: SeguimientoFormValues) => {
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
            Los correos internos se asociarán al encargado actual:
            <strong> {selectedLead.encargado_nombre ?? 'Sin nombre'}</strong>.
            Si cambia el encargado, el backend debe reasignar las programaciones existentes.
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

                {(['internal', 'external'] as const).map((target) => {
                  const label = target === 'internal' ? 'Correo interno' : 'Correo al cliente'
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
                          <label className="text-xs font-semibold text-gray-500">Plantilla opcional</label>
                          <select
                            {...register(`instancias.${index}.${target}.idTemplate`, {
                              valueAsNumber: true,
                              onChange: (event) =>
                                applyTemplate(index, target, Number(event.target.value)),
                            })}
                            className={inputClass(false)}
                          >
                            <option value={0}>Sin plantilla</option>
                            {plantillas.map((plantilla) => (
                              <option key={plantilla.id} value={plantilla.id}>{plantilla.nombre}</option>
                            ))}
                          </select>
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
            disabled={isLoading || correosContacto.length === 0}
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
