'use client'

import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
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
import { ROUTES } from '@/lib/constants/routes'

interface OrganizacionFormProps {
  organizacion?: Organizacion
  onSubmit:      (data: OrganizacionFormValues) => Promise<void>
  isLoading:     boolean
  error?:        string | null
  sunatData?:    SunatRucResult | null
}

type BusquedaTab = 'ruc' | 'razon'

export function OrganizacionForm({
  organizacion,
  onSubmit,
  isLoading,
  error,
  sunatData,
}: Readonly<OrganizacionFormProps>) {
  const router                        = useRouter()
  const esEdicion                     = !!organizacion
  const [busquedaTab, setBusquedaTab] = useState<BusquedaTab>('ruc')

  const {
    register,
    handleSubmit,
    setValue,
    control,
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

  const rucValue = useWatch({ control, name: 'ruc' })

  useEffect(() => {
    if (!sunatData) return

    setBusquedaTab('ruc')
    setValue('ruc',    sunatData.ruc)
    setValue('nombre', sunatData.nombre)
    if (sunatData.nombreCompleto) setValue('nombre_comercial',    sunatData.nombreCompleto)
    if (sunatData.ubicacion)      setValue('ubicacion',           sunatData.ubicacion)
    if (sunatData.actividades)    setValue('actividad_economica', sunatData.actividades)

    // Hay data de SUNAT: el código de cliente se autogenera con el patrón
    // [iniciales del nombre comercial]-[últimos 3 dígitos del RUC].
    const nombreComercial = sunatData.nombreCompleto || sunatData.nombre
    setValue('codigo_cliente', generarCodigoCliente(nombreComercial, sunatData.ruc))
  }, [sunatData, setValue])

  // El código de cliente solo es editable en registro manual o cuando la
  // búsqueda SUNAT no arrojó datos. Si proviene de SUNAT (o es edición), queda
  // bloqueado y se gestiona automáticamente.
  const codigoBloqueado = esEdicion || !!sunatData

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    ${hasError
      ? 'border-red-400 bg-red-50'
      : 'border-gray-200 focus:border-emerald-400 bg-white'
    }`

  const codigoClienteHint = codigoBloqueado
    ? <p className="text-xs text-gray-400">Generado a partir del nombre comercial y el RUC de SUNAT.</p>
    : errors.codigo_cliente
      ? <p className="text-red-500 text-xs">{errors.codigo_cliente.message}</p>
      : null

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

        {!esEdicion && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setBusquedaTab('ruc')
                  setValue('ruc', '')
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors
                  ${busquedaTab === 'ruc'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                Por RUC
              </button>
              <button
                type="button"
                onClick={() => {
                  setBusquedaTab('razon')
                  setValue('ruc', '')
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors
                  ${busquedaTab === 'razon'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                Por Razón Social
              </button>
            </div>

            {busquedaTab === 'ruc' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="of-ruc" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    RUC
                  </label>
                  <span className={`text-xs font-medium
                    ${(rucValue?.length ?? 0) === 11 ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {rucValue?.length ?? 0}/11
                  </span>
                </div>
                <input
                  id="of-ruc"
                  type="text"
                  placeholder="Ingresa RUC (11 dígitos)..."
                  maxLength={11}
                  {...register('ruc')}
                  onChange={(e) => {
                    const val = e.target.value.replaceAll(/\D/g, '').slice(0, 11)
                    setValue('ruc', val)
                  }}
                  className={inputClass(!!errors.ruc)}
                />
                <p className="text-xs text-gray-400">
                  11 dígitos → datos se completan automáticamente desde SUNAT.
                </p>
                {errors.ruc && (
                  <p className="text-red-500 text-xs">{errors.ruc.message}</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="of-nombre" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Nombre / Razón Social <span className="text-red-500">*</span>
          </label>
          <input
            id="of-nombre"
            type="text"
            placeholder="Nombre de la organización..."
            {...register('nombre')}
            className={inputClass(!!errors.nombre)}
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
            {...register('nombre_comercial')}
            className={inputClass(!!errors.nombre_comercial)}
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
              className={inputClass(!!errors.tipo)}
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
              className={inputClass(!!errors.tamano)}
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
            className={inputClass(!!errors.sector)}
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