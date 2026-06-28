'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, X } from 'lucide-react'
import {
  actividadSchema,
  ActividadFormValues,
} from '@/lib/validators/actividad.schema'
import { EstadoActividad, TipoActividad } from '@/types/enums'

interface ActividadFormProps {
  leadId: number
  onSubmit: (data: ActividadFormValues) => Promise<void>
  onCancelar: () => void
  isLoading: boolean
  error?: string | null
}


export function ActividadForm({
  leadId,
  onSubmit,
  onCancelar,
  isLoading,
  error,
}: ActividadFormProps) {
  const nowStr = new Date().toISOString().slice(0, 16)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ActividadFormValues>({
    resolver: zodResolver(actividadSchema),
    defaultValues: {
      id_lead: leadId,
      estado: EstadoActividad.Pendiente,
      tipo: TipoActividad.Llamada,
    },
  })

  const fechaInicioWatch = useWatch({ control, name: 'fecha_inicio' })
  const minFechaFin = fechaInicioWatch || nowStr

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    ${hasError
      ? 'border-red-400 bg-red-50'
      : 'border-gray-200 focus:border-emerald-400 bg-white'
    }`

  return (
    <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-700">Nueva actividad</h4>
        <button
          type="button"
          onClick={onCancelar}
          className="p-1 rounded-lg text-gray-400 hover:text-gray-600
            hover:bg-gray-100 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3"
      >
        <input type="hidden" {...register('id_lead', { valueAsNumber: true })} />

        <div className="space-y-1">
          <label htmlFor="af-nombre" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="af-nombre"
            type="text"
            placeholder="Ej: Llamada de seguimiento, Envío de propuesta..."
            {...register('nombre_actividad')}
            className={inputClass(!!errors.nombre_actividad)}
          />
          {errors.nombre_actividad && (
            <p className="text-red-500 text-xs">{errors.nombre_actividad.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="af-tipo" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Tipo <span className="text-red-500">*</span>
          </label>
          <select
            id="af-tipo"
            {...register('tipo')}
            className={`${inputClass(!!errors.tipo)} cursor-pointer`}
          >
            {Object.values(TipoActividad).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Fecha inicio <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              min={nowStr}
              {...register('fecha_inicio', {
                onChange: (e) => {
                  const inicio = e.target.value
                  const fin = getValues('fecha_fin')
                  if (fin && inicio && fin < inicio) {
                    setValue('fecha_fin', inicio, { shouldValidate: true })
                  }
                },
              })}
              className={inputClass(!!errors.fecha_inicio)}
            />
            {errors.fecha_inicio && (
              <p className="text-red-500 text-xs">{errors.fecha_inicio.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Fecha fin <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              min={minFechaFin}
              {...register('fecha_fin', {
                onChange: (e) => {
                  const fin = e.target.value
                  const inicio = getValues('fecha_inicio')
                  if (fin && inicio && fin < inicio) {
                    setValue('fecha_fin', inicio, { shouldValidate: true })
                  }
                },
              })}
              className={inputClass(!!errors.fecha_fin)}
            />
            {errors.fecha_fin && (
              <p className="text-red-500 text-xs">{errors.fecha_fin.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="af-notas" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Notas
          </label>
          <textarea
            id="af-notas"
            rows={2}
            placeholder="Observaciones adicionales..."
            {...register('notas')}
            className={`${inputClass(!!errors.notas)} resize-none`}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700
            text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 rounded-xl text-sm text-gray-500
              hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700
              disabled:bg-emerald-400 disabled:cursor-not-allowed text-white
              font-semibold py-2 px-4 rounded-xl text-sm transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={14} />
                Registrar actividad
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
