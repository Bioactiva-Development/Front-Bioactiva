'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, X } from 'lucide-react'
import {
  actividadSchema,
  ActividadFormValues,
} from '@/lib/validators/actividad.schema'
import { TipoActividad, EstadoActividad } from '@/types/enums'

interface ActividadFormProps {
  leadId:    number
  onSubmit:  (data: ActividadFormValues) => Promise<void>
  onCancelar: () => void
  isLoading: boolean
  error?:    string | null
}

const RESPONSABLES = [
  { id: 1, nombre: 'Karien Diaz' },
  { id: 2, nombre: 'Luis Torres' },
  { id: 3, nombre: 'Administración' },
  { id: 4, nombre: 'Carlos Mamani' },
]

export function ActividadForm({
  leadId,
  onSubmit,
  onCancelar,
  isLoading,
  error,
}: ActividadFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActividadFormValues>({
    resolver: zodResolver(actividadSchema),
    defaultValues: {
      id_lead:    leadId,
      estado:     EstadoActividad.Pendiente,
      tipo:       TipoActividad.Llamada,
      id_responsable: 1,
    },
  })

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
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ej: Llamada de seguimiento, Envío de propuesta..."
            {...register('nombre_actividad')}
            className={inputClass(!!errors.nombre_actividad)}
          />
          {errors.nombre_actividad && (
            <p className="text-red-500 text-xs">{errors.nombre_actividad.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Tipo <span className="text-red-500">*</span>
            </label>
            <select
              {...register('tipo')}
              className={`${inputClass(!!errors.tipo)} cursor-pointer`}
            >
              {Object.values(TipoActividad).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              {...register('estado')}
              className={`${inputClass(!!errors.estado)} cursor-pointer`}
            >
              {Object.values(EstadoActividad).map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Responsable <span className="text-red-500">*</span>
          </label>
          <select
            {...register('id_responsable', { valueAsNumber: true })}
            className={`${inputClass(!!errors.id_responsable)} cursor-pointer`}
          >
            <option value="">Seleccionar...</option>
            {RESPONSABLES.map((r) => (
              <option key={r.id} value={r.id}>{r.nombre}</option>
            ))}
          </select>
          {errors.id_responsable && (
            <p className="text-red-500 text-xs">{errors.id_responsable.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Fecha inicio <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              {...register('fecha_inicio')}
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
              {...register('fecha_fin')}
              className={inputClass(!!errors.fecha_fin)}
            />
            {errors.fecha_fin && (
              <p className="text-red-500 text-xs">{errors.fecha_fin.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Notas
          </label>
          <textarea
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