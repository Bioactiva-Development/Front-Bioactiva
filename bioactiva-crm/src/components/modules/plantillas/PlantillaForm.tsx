'use client'

import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, ArrowLeft, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  plantillaSchema,
  PlantillaFormValues,
} from '@/lib/validators/plantilla.schema'
import { Plantilla, VARIABLES_PLANTILLA } from '@/types/plantilla.types'
import { ROUTES } from '@/lib/constants/routes'

interface PlantillaFormProps {
  plantilla?: Plantilla
  onSubmit:   (data: PlantillaFormValues) => Promise<void>
  isLoading:  boolean
  error?:     string | null
}

const CATEGORIAS = ['Email', 'Reunion', 'Llamada', 'Otro'] as const
const USOS       = ['Ambos', 'Solo Recordatorio', 'Solo Seguimiento'] as const
const ESTADOS    = [
  { value: true,  label: 'Activa' },
  { value: false, label: 'Inactiva' },
]

export function PlantillaForm({
  plantilla,
  onSubmit,
  isLoading,
  error,
}: PlantillaFormProps) {
  const router    = useRouter()
  const esEdicion = !!plantilla
  const cuerpoRef = useRef<HTMLTextAreaElement | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<PlantillaFormValues>({
    resolver: zodResolver(plantillaSchema),
    defaultValues: plantilla
      ? {
          nombre:    plantilla.nombre,
          asunto:    plantilla.asunto,
          cuerpo:    plantilla.cuerpo,
          categoria: plantilla.categoria,
          uso:       plantilla.uso,
          activo:    plantilla.activo,
        }
      : {
          categoria: 'Email',
          uso:       'Ambos',
          activo:    true,
        },
  })

  // ✅ Observar activo para mostrar el valor correcto en el select
  const activoValue = watch('activo')

  const insertarVariable = (variable: string) => {
    const textarea = cuerpoRef.current
    if (!textarea) return
    const inicio = textarea.selectionStart
    const fin    = textarea.selectionEnd
    const cuerpoActual = getValues('cuerpo') ?? ''
    const nuevoCuerpo =
      cuerpoActual.slice(0, inicio) + variable + cuerpoActual.slice(fin)
    setValue('cuerpo', nuevoCuerpo)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(inicio + variable.length, inicio + variable.length)
    }, 0)
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    ${hasError
      ? 'border-red-400 bg-red-50'
      : 'border-gray-200 focus:border-emerald-400 bg-white'
    }`

  const { ref: cuerpoRegRef, ...cuerpoRegRest } = register('cuerpo')

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Nombre de la plantilla <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ej: Confirmación de reunión"
            {...register('nombre')}
            className={inputClass(!!errors.nombre)}
          />
          {errors.nombre && (
            <p className="text-red-500 text-xs">{errors.nombre.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Asunto del correo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ej: Reunión con {{nombre_organizacion}} — {{fecha_actividad}}"
            {...register('asunto')}
            className={inputClass(!!errors.asunto)}
          />
          {errors.asunto && (
            <p className="text-red-500 text-xs">{errors.asunto.message}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Categoría
            </label>
            <select
              {...register('categoria')}
              className={`${inputClass(!!errors.categoria)} cursor-pointer`}
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
              Uso
              <Info size={12} className="text-gray-400" />
            </label>
            <select
              {...register('uso')}
              className={`${inputClass(!!errors.uso)} cursor-pointer`}
            >
              {USOS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* ✅ activo manejado manualmente con setValue, no con register */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Estado
            </label>
            <select
              value={String(activoValue)}
              onChange={(e) => setValue('activo', e.target.value === 'true')}
              className={`${inputClass(false)} cursor-pointer`}
            >
              {ESTADOS.map((e) => (
                <option key={String(e.value)} value={String(e.value)}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Variables disponibles
            </label>
            <span className="text-xs text-gray-400">
              Haz clic para insertar en el cuerpo
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {VARIABLES_PLANTILLA.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => insertarVariable(v.key)}
                title={v.descripcion}
                className="px-3 py-1.5 rounded-xl border border-emerald-200
                  bg-emerald-50 text-emerald-700 text-xs font-mono
                  hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
              >
                {v.key}
                <Info size={10} className="text-emerald-400" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Cuerpo del mensaje <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={10}
            placeholder="Escribe el cuerpo del correo aquí. Usa las variables de arriba para personalizar."
            {...cuerpoRegRest}
            ref={(e) => {
              cuerpoRegRef(e)
              cuerpoRef.current = e
            }}
            className={`${inputClass(!!errors.cuerpo)} resize-y font-mono text-xs`}
          />
          {errors.cuerpo && (
            <p className="text-red-500 text-xs">{errors.cuerpo.message}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700
            text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push(ROUTES.plantillas)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
              text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Volver a Plantillas
          </button>

          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700
              disabled:bg-emerald-400 disabled:cursor-not-allowed text-white
              font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={16} />
                {esEdicion ? 'Guardar cambios' : 'Guardar plantilla'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}