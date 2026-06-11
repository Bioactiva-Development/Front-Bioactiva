'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, X } from 'lucide-react'
import {
  actividadSchema,
  ActividadFormValues,
} from '@/lib/validators/actividad.schema'
import { EstadoActividad, EstadoUsuario, TipoActividad } from '@/types/enums'
import { useAuthStore } from '@/store'
import { usuariosService } from '@/services/modules/usuarios.service'
import { UsuarioListItem } from '@/types/usuario.types'

interface ActividadFormProps {
  leadId: number
  onSubmit: (data: ActividadFormValues) => Promise<void>
  onCancelar: () => void
  isLoading: boolean
  error?: string | null
}

interface ResponsableOption {
  id: number
  nombre: string
}

const toResponsableOption = (usuario: UsuarioListItem): ResponsableOption => ({
  id: usuario.id,
  nombre: `${usuario.nombres} ${usuario.apellidos}`.trim() || usuario.correo,
})

const toDateTimeLocalValue = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0')
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') + `T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const addDefaultDuration = (value?: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  date.setHours(date.getHours() + 1)
  return toDateTimeLocalValue(date)
}

export function ActividadForm({
  leadId,
  onSubmit,
  onCancelar,
  isLoading,
  error,
}: ActividadFormProps) {
  const { usuario } = useAuthStore()
  const [responsables, setResponsables] = useState<ResponsableOption[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ActividadFormValues>({
    resolver: zodResolver(actividadSchema),
    defaultValues: {
      id_lead: leadId,
      estado: EstadoActividad.Pendiente,
      tipo: TipoActividad.Llamada,
      id_responsable: usuario?.id ?? 0,
    },
  })
  const fecha = useWatch({ control, name: 'fecha_inicio' })
  const responsableSelected = useWatch({ control, name: 'id_responsable' })

  const usuarioActualOption = useMemo<ResponsableOption | null>(() => {
    if (!usuario) return null
    return {
      id: usuario.id,
      nombre: `${usuario.nombres} ${usuario.apellidos}`.trim() || usuario.correo,
    }
  }, [usuario])

  const responsablesDisponibles = useMemo(() => {
    const options = [...responsables]

    if (
      usuarioActualOption &&
      !options.some((responsable) => responsable.id === usuarioActualOption.id)
    ) {
      options.unshift(usuarioActualOption)
    }

    return options
  }, [responsables, usuarioActualOption])

  useEffect(() => {
    setValue('fecha_fin', addDefaultDuration(fecha), {
      shouldValidate: Boolean(fecha),
    })
  }, [fecha, setValue])

  useEffect(() => {
    let isMounted = true

    async function cargarResponsables() {
      try {
        const response = await usuariosService.getUsuarios({
          estado: EstadoUsuario.Activo,
          limit: 100,
        })

        if (!isMounted) return
        setResponsables(response.usuarios.map(toResponsableOption))
      } catch {
        if (!isMounted) return
        setResponsables(usuarioActualOption ? [usuarioActualOption] : [])
      }
    }

    cargarResponsables()

    return () => {
      isMounted = false
    }
  }, [usuarioActualOption])

  useEffect(() => {
    if (responsablesDisponibles.length === 0) return

    const selected = Number(responsableSelected)
    const selectedExists = responsablesDisponibles.some(
      (responsable) => responsable.id === selected
    )

    if (selected && selectedExists) return

    const fallback =
      usuarioActualOption &&
        responsablesDisponibles.some(
          (responsable) => responsable.id === usuarioActualOption.id
        )
        ? usuarioActualOption
        : responsablesDisponibles[0]

    setValue('id_responsable', fallback.id, { shouldValidate: true })
  }, [
    responsableSelected,
    responsablesDisponibles,
    setValue,
    usuarioActualOption,
  ])

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
        <input type="hidden" {...register('fecha_fin')} />

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

        <div className="space-y-1">
          <label htmlFor="af-responsable" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Responsable <span className="text-red-500">*</span>
          </label>
          <select
            id="af-responsable"
            {...register('id_responsable', { valueAsNumber: true })}
            className={`${inputClass(!!errors.id_responsable)} cursor-pointer`}
          >
            <option value="">Seleccionar...</option>
            {responsablesDisponibles.map((r) => (
              <option key={r.id} value={r.id}>{r.nombre}</option>
            ))}
          </select>
          {errors.id_responsable && (
            <p className="text-red-500 text-xs">{errors.id_responsable.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Fecha <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            {...register('fecha_inicio')}
            className={inputClass(!!errors.fecha_inicio || !!errors.fecha_fin)}
          />
          {(errors.fecha_inicio || errors.fecha_fin) && (
            <p className="text-red-500 text-xs">
              {errors.fecha_inicio?.message ?? errors.fecha_fin?.message}
            </p>
          )}
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
