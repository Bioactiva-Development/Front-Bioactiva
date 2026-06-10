'use client'

import React, { useState, useEffect } from 'react'
import { useForm, UseFormSetValue } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, X } from 'lucide-react'

import { useRouter } from 'next/navigation'
import {
  organizacionSchema,
  OrganizacionFormValues,
} from '@/lib/validators/organizacion.schema'
import { TipoEmpresa, TamanoEmpresa, Sector } from '@/types/enums'
import { Organizacion, SunatRucResult } from '@/types/organizacion.types'
import { generarCodigoCliente, formatSector } from '@/lib/utils/organizacion.utils'

interface OrganizacionFormProps {
  organizacion?: Organizacion
  datosSunat?:   SunatRucResult | null
  onSubmit:      (data: OrganizacionFormValues) => Promise<void>
  isLoading:     boolean
  error?:        string | null
}

const MAX_ACTIVIDAD_ECONOMICA = 200

function applyDatosSunat(
  datos: SunatRucResult,
  setValue: UseFormSetValue<OrganizacionFormValues>,
  setSunatAplicado: (v: boolean) => void,
): void {
  setValue('ruc', datos.ruc, { shouldValidate: true })
  setValue('nombre', datos.nombre, { shouldValidate: true })
  const nombreComercial = datos.nombreCompleto || datos.nombre
  setValue('nombre_comercial', nombreComercial, { shouldValidate: true })
  if (datos.tipo)        setValue('tipo', datos.tipo, { shouldValidate: true })
  if (datos.tamano)      setValue('tamano', datos.tamano, { shouldValidate: true })
  if (datos.sector)      setValue('sector', datos.sector, { shouldValidate: true })
  if (datos.ubicacion)   setValue('ubicacion', datos.ubicacion, { shouldValidate: true })
  if (datos.actividades) setValue('actividad_economica', datos.actividades.slice(0, MAX_ACTIVIDAD_ECONOMICA), { shouldValidate: true })
  setValue('codigo_cliente', generarCodigoCliente(nombreComercial, datos.ruc), { shouldValidate: true })
  setSunatAplicado(true)
}

export function OrganizacionForm({
  organizacion,
  datosSunat,
  onSubmit,
  isLoading,
  error,
}: Readonly<OrganizacionFormProps>) {
  const router                          = useRouter()
  const esEdicion                       = !!organizacion
  const [sunatAplicado, setSunatAplicado] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OrganizacionFormValues>({
    resolver: zodResolver(organizacionSchema),
    defaultValues: organizacion
      ? {
          nombre:                organizacion.nombre,
          nombre_comercial:      organizacion.nombre_comercial ?? '',
          sub_area:              organizacion.sub_area ?? '',
          ruc:                   organizacion.ruc ?? '',
          codigo_cliente:        organizacion.codigo_cliente ?? '',
          tipo:                  organizacion.tipo,
          tamano:                organizacion.tamano,
          sector:                organizacion.sector,
          ubicacion:             organizacion.ubicacion ?? '',
          actividad_economica:   organizacion.actividad_economica ?? '',
          linkedin:              organizacion.linkedin ?? '',
          alianzas_estrategicas: organizacion.alianzas_estrategicas ?? '',
        }
      : undefined,
  })

  useEffect(() => {
    if (!datosSunat) return
    applyDatosSunat(datosSunat, setValue, setSunatAplicado)
  }, [datosSunat, setValue])

  const codigoBloqueado = esEdicion || sunatAplicado

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    ${hasError
      ? 'border-red-400 bg-red-50'
      : 'border-gray-200 focus:border-emerald-400 bg-white'
    }`
  const readOnlyClass = 'bg-gray-50 text-gray-500 cursor-default focus:border-gray-200'
  const autocompletadoBloqueado = sunatAplicado && !esEdicion
  const selectOverrideClass = autocompletadoBloqueado
    ? `${readOnlyClass} pointer-events-none appearance-none`
    : ''

  let codigoClienteHint: React.ReactElement | null = null
  if (codigoBloqueado) {
    codigoClienteHint = <p className="text-xs text-gray-400">Generado a partir del nombre comercial y el RUC de SUNAT.</p>
  } else if (errors.codigo_cliente) {
    codigoClienteHint = <p className="text-red-500 text-xs">{errors.codigo_cliente.message}</p>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">

        <div className="space-y-1.5">
          <label htmlFor="of-codigo" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Código de Cliente{' '}
            {codigoBloqueado
              ? <span className="text-gray-400 normal-case font-normal">— generado automáticamente</span>
              : <span className="text-red-500">*</span>}
          </label>
          <input
            id="of-codigo"
            type="text"
            placeholder="Ej: ORG-2026-001"
            {...register('codigo_cliente')}
            readOnly={codigoBloqueado}
            aria-readonly={codigoBloqueado}
            className={codigoBloqueado
              ? `w-full px-4 py-2.5 rounded-xl border border-gray-200
                bg-gray-50 text-sm text-gray-500 cursor-not-allowed`
              : inputClass(!!errors.codigo_cliente)}
          />
          {codigoClienteHint}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="of-ruc" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            RUC{' '}
            {sunatAplicado
              ? <span className="text-gray-400 normal-case font-normal">— completado desde SUNAT</span>
              : <span className="text-gray-400 normal-case font-normal">Opcional</span>}
          </label>
          <input
            id="of-ruc"
            type="text"
            placeholder="Ej: 20123456789"
            readOnly={sunatAplicado}
            {...register('ruc')}
            className={sunatAplicado
              ? `w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500 cursor-not-allowed`
              : inputClass(!!errors.ruc)}
          />
          {errors.ruc && <p className="text-red-500 text-xs">{errors.ruc.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="of-nombre" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Nombre / Razón Social <span className="text-red-500">*</span>
          </label>
          <input
            id="of-nombre"
            type="text"
            placeholder="Nombre de la organización..."
            readOnly={autocompletadoBloqueado}
            {...register('nombre')}
            className={`${inputClass(!!errors.nombre)} ${autocompletadoBloqueado ? readOnlyClass : ''}`}
          />
          {errors.nombre && (
            <p className="text-red-500 text-xs">{errors.nombre.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="of-nombre-comercial" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Nombre Comercial <span className="text-red-500">*</span>
          </label>
          <input
            id="of-nombre-comercial"
            type="text"
            placeholder="Nombre comercial o marca..."
            readOnly={autocompletadoBloqueado}
            {...register('nombre_comercial')}
            className={`${inputClass(!!errors.nombre_comercial)} ${autocompletadoBloqueado ? readOnlyClass : ''}`}
          />
          {errors.nombre_comercial && (
            <p className="text-red-500 text-xs">{errors.nombre_comercial.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="of-sub-area" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Área / Departamento{' '}
            <span className="text-gray-400 normal-case font-normal">Opcional</span>
          </label>
          <input
            id="of-sub-area"
            type="text"
            placeholder="Ej: Área de Innovación, Gerencia de Proyectos"
            {...register('sub_area')}
            className={inputClass(!!errors.sub_area)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="of-tipo" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Tipo <span className="text-red-500">*</span>
            </label>
            <select
              id="of-tipo"
              {...register('tipo')}
              aria-disabled={autocompletadoBloqueado}
              tabIndex={autocompletadoBloqueado ? -1 : undefined}
              className={`${inputClass(!!errors.tipo)} ${selectOverrideClass}`}
            >
              <option value="">Seleccionar...</option>
              {Object.values(TipoEmpresa).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.tipo && (
              <p className="text-red-500 text-xs">{errors.tipo.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="of-tamano" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Tamaño <span className="text-red-500">*</span>
            </label>
            <select
              id="of-tamano"
              {...register('tamano')}
              aria-disabled={autocompletadoBloqueado}
              tabIndex={autocompletadoBloqueado ? -1 : undefined}
              className={`${inputClass(!!errors.tamano)} ${selectOverrideClass}`}
            >
              <option value="">Seleccionar...</option>
              {Object.values(TamanoEmpresa).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.tamano && (
              <p className="text-red-500 text-xs">{errors.tamano.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="of-sector" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Sector <span className="text-red-500">*</span>
          </label>
          <select
            id="of-sector"
            {...register('sector')}
            aria-disabled={autocompletadoBloqueado}
            tabIndex={autocompletadoBloqueado ? -1 : undefined}
            className={`${inputClass(!!errors.sector)} ${selectOverrideClass}`}
          >
            <option value="">Seleccionar...</option>
            {Object.values(Sector).map((s) => (
              <option key={s} value={s}>{formatSector(s)}</option>
            ))}
          </select>
          {errors.sector && (
            <p className="text-red-500 text-xs">{errors.sector.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="of-ubicacion" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Ubicación
          </label>
          <input
            id="of-ubicacion"
            type="text"
            placeholder="Ciudad, Región..."
            {...register('ubicacion')}
            className={inputClass(!!errors.ubicacion)}
          />
          {errors.ubicacion && (
            <p className="text-red-500 text-xs">{errors.ubicacion.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="of-actividad" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Actividades Económicas{' '}
            <span className="text-gray-400 normal-case font-normal">
              Opcional — SUNAT lo completa
            </span>
          </label>
          <input
            id="of-actividad"
            type="text"
            placeholder="Ej: Fabricación de productos orgánicos..."
            {...register('actividad_economica')}
            className={inputClass(!!errors.actividad_economica)}
          />
          {errors.actividad_economica && (
            <p className="text-red-500 text-xs">{errors.actividad_economica.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="of-linkedin" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            LinkedIn
          </label>
          <input
            id="of-linkedin"
            type="text"
            placeholder="linkedin.com/company/ejemplo"
            {...register('linkedin')}
            className={inputClass(!!errors.linkedin)}
          />
          {errors.linkedin && (
            <p className="text-red-500 text-xs">{errors.linkedin.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="of-alianzas" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Alianzas Estratégicas
          </label>
          <input
            id="of-alianzas"
            type="text"
            placeholder="Ej: USAID, Rainforest Alliance"
            {...register('alianzas_estrategicas')}
            className={inputClass(!!errors.alianzas_estrategicas)}
          />
          {errors.alianzas_estrategicas && (
            <p className="text-red-500 text-xs">{errors.alianzas_estrategicas.message}</p>
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
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
              text-gray-500 hover:text-gray-700 hover:bg-gray-50
              border border-gray-200 transition-colors"
          >
            <X size={16} />
            Cancelar
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
                {esEdicion ? 'Guardar cambios' : 'Guardar organización'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
