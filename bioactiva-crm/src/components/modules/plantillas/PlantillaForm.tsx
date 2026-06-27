'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, ArrowLeft, LayoutTemplate, Code2, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  plantillaSchema,
  PlantillaFormValues,
} from '@/lib/validators/plantilla.schema'
import { Plantilla } from '@/types/plantilla.types'
import { ROUTES } from '@/lib/constants/routes'

interface PlantillaFormProps {
  plantilla?: Plantilla
  onSubmit:   (data: PlantillaFormValues) => Promise<void>
  isLoading:  boolean
  error?:     string | null
}

const ESTADOS = [
  { value: true,  label: 'Activa' },
  { value: false, label: 'Inactiva' },
]

export function PlantillaForm({
  plantilla,
  onSubmit,
  isLoading,
  error,
}: Readonly<PlantillaFormProps>) {
  const router    = useRouter()
  const esEdicion = !!plantilla

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<PlantillaFormValues>({
    resolver: zodResolver(plantillaSchema),
    defaultValues: plantilla
      ? {
          nombre: plantilla.nombre,
          asunto: plantilla.asunto,
          cuerpo: plantilla.cuerpo,
          activo: plantilla.activo,
        }
      : {
          activo: true,
        },
  })

  const activoValue = useWatch({ control, name: 'activo' })

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    ${hasError
      ? 'border-red-400 bg-red-50'
      : 'border-gray-200 focus:border-emerald-400 bg-white'
    }`

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <LayoutTemplate size={18} className="text-emerald-700" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">
              {esEdicion ? 'Editar plantilla' : 'Nueva plantilla de correo'}
            </h2>
            <p className="text-xs text-gray-400">
              {esEdicion
                ? 'Modifica el contenido de la plantilla'
                : 'Crea una plantilla reutilizable para notificaciones y correos'
              }
            </p>
          </div>
        </div>

        <div className="p-8 space-y-6">

          {/* Sección: Identificación */}
          <div className="space-y-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
              Identificación
            </p>

            <div className="space-y-1.5">
              <label htmlFor="pf-nombre" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Nombre de la plantilla <span className="text-red-500">*</span>
              </label>
              <input
                id="pf-nombre"
                type="text"
                placeholder="Ej: Seguimiento comercial"
                {...register('nombre')}
                className={inputClass(!!errors.nombre)}
              />
              {errors.nombre && (
                <p className="text-red-500 text-xs">{errors.nombre.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pf-asunto" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Asunto del correo <span className="text-red-500">*</span>
              </label>
              <input
                id="pf-asunto"
                type="text"
                placeholder="Ej: Seguimiento de propuesta comercial"
                {...register('asunto')}
                className={inputClass(!!errors.asunto)}
              />
              {errors.asunto && (
                <p className="text-red-500 text-xs">{errors.asunto.message}</p>
              )}
            </div>
          </div>

          {/* Sección: Contenido */}
          <div className="space-y-4">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
              <Code2 size={12} className="text-gray-400" />
              Contenido del mensaje
            </p>

            <div className="space-y-1.5">
              <label htmlFor="pf-cuerpo" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Cuerpo del mensaje <span className="text-red-500">*</span>
              </label>
              <textarea
                id="pf-cuerpo"
                rows={12}
                placeholder="Escribe aquí el contenido del mensaje."
                {...register('cuerpo')}
                className={`${inputClass(!!errors.cuerpo)} resize-y font-mono text-xs leading-relaxed`}
              />
              {errors.cuerpo && (
                <p className="text-red-500 text-xs">{errors.cuerpo.message}</p>
              )}
            </div>
          </div>

          {/* Sección: Configuración (solo edición) */}
          {esEdicion && (
            <div className="space-y-4">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                <Settings size={12} className="text-gray-400" />
                Configuración
              </p>

              <div className="space-y-1.5">
                <label htmlFor="pf-estado" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Estado de la plantilla
                </label>
                <select
                  id="pf-estado"
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
                <p className="text-xs text-amber-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  Una plantilla inactiva no puede seleccionarse al programar notificaciones.
                </p>
              </div>
            </div>
          )}

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
    </div>
  )
}
