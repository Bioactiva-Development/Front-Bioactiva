'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, ArrowLeft, User, Mail, Phone, Building2, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  contactoSchema,
  ContactoFormValues,
} from '@/lib/validators/contacto.schema'
import { Vocativo } from '@/types/enums'
import { Contacto } from '@/types/contacto.types'
import { ROUTES } from '@/lib/constants/routes'
import { useOrganizaciones, useOrganizacion } from '@/hooks/organizaciones/useOrganizaciones'
import { useDebounce } from '@/hooks/shared/useDebounce'
import { formatVocativo } from '@/lib/utils/contacto.utils'

interface OrgDropdownContentProps {
  query:       string
  isSearching: boolean
  results:     { id: string; nombre: string }[]
  selected:    string | undefined
  onSelect:    (id: string, nombre: string) => void
}

function OrgDropdownContent({ query, isSearching, results, selected, onSelect }: Readonly<OrgDropdownContentProps>) {
  if (query.length >= 1 && isSearching) {
    return (
      <div className="flex items-center gap-2 px-4 py-3">
        <Loader2 size={14} className="animate-spin text-gray-400" />
        <span className="text-sm text-gray-400">Buscando...</span>
      </div>
    )
  }
  if (query.length >= 1 && results.length === 0) {
    return (
      <p className="px-4 py-3 text-sm text-gray-400">
        Sin resultados para &ldquo;{query}&rdquo;
      </p>
    )
  }
  return (
    <>
      {query.length < 1 && (
        <p className="px-4 pt-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
          Recientes
        </p>
      )}
      {results.map((org) => (
        <button
          key={org.id}
          type="button"
          onClick={() => onSelect(org.id, org.nombre)}
          className={`w-full text-left px-4 py-2.5 text-sm transition-colors
            hover:bg-emerald-50 hover:text-emerald-700
            ${selected === org.id
              ? 'bg-emerald-50 text-emerald-700 font-medium'
              : 'text-gray-700'
            }`}
        >
          {org.nombre}
        </button>
      ))}
    </>
  )
}

interface ContactoFormProps {
  contacto?:     Contacto
  onSubmit:      (data: ContactoFormValues) => Promise<void>
  isLoading:     boolean
  error?:        string | null
  orgIdInicial?: string
}

function splitPhone(full: string | null | undefined): { codigo: string; numero: string } {
  if (!full) return { codigo: '+51', numero: '' }
  if (full.startsWith('+51')) return { codigo: '+51', numero: full.slice(3) }
  const m = /^(\+\d{1,4}?)(\d{6,})$/.exec(full)
  return m ? { codigo: m[1], numero: m[2] } : { codigo: '+51', numero: '' }
}

export function ContactoForm({
  contacto,
  onSubmit,
  isLoading,
  error,
  orgIdInicial,
}: Readonly<ContactoFormProps>) {
  const router    = useRouter()
  const esEdicion = !!contacto

  const phoneInit = splitPhone(contacto?.telefono)
  const [codigoPais, setCodigoPais]           = useState(phoneInit.codigo)
  const [codigoPaisError, setCodigoPaisError] = useState('')

  const [orgQuery, setOrgQuery]                   = useState('')
  const [orgNombreSeleccionado, setOrgNombreSeleccionado] = useState(contacto?.organizacion_nombre ?? '')
  const [orgDropdownOpen, setOrgDropdownOpen]     = useState(false)
  const orgComboRef = useRef<HTMLDivElement>(null)

  const debouncedOrgQuery = useDebounce(orgQuery, 300)
  const { data: orgsIniciales }  = useOrganizaciones({ limit: 5 })
  const { data: orgSearchData, isLoading: orgSearchLoading } = useOrganizaciones(
    debouncedOrgQuery.length >= 1
      ? { search: debouncedOrgQuery, limit: 20 }
      : { limit: 0 }
  )
  const { data: orgInicial } = useOrganizacion(orgIdInicial ?? '')
  const orgResults = debouncedOrgQuery.length >= 1
    ? (orgSearchData?.data ?? [])
    : (orgsIniciales?.data ?? [])

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ContactoFormValues>({
    resolver: zodResolver(contactoSchema),
    defaultValues: contacto
      ? {
          nombres:        contacto.nombres,
          apellidos:      contacto.apellidos ?? '',
          vocativo:       contacto.vocativo,
          cargo:          contacto.cargo ?? '',
          correo:         contacto.correo,
          correo2:        contacto.correo2 ?? '',
          telefono:       phoneInit.numero,
          comentarios:    contacto.comentarios ?? '',
          idOrganizacion: contacto.idOrganizacion,
        }
      : {
          idOrganizacion: orgIdInicial ?? '',
        },
  })

  const handleFormSubmit = handleSubmit(async (data) => {
    if (data.telefono && !/^\+\d{1,4}$/.test(codigoPais)) {
      setCodigoPaisError('Formato inválido (ej: +51)')
      return
    }
    setCodigoPaisError('')
    await onSubmit({
      ...data,
      telefono: data.telefono ? `${codigoPais}${data.telefono}` : '',
    })
  })

  const orgSeleccionada = useWatch({ control, name: 'idOrganizacion' })

  // Nombre a mostrar en el input cuando el dropdown está cerrado
  const orgDisplayValue = orgNombreSeleccionado || (orgIdInicial ? (orgInicial?.nombre ?? '') : '')

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (orgComboRef.current && !orgComboRef.current.contains(e.target as Node)) {
        setOrgDropdownOpen(false)
        setOrgQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    ${hasError
      ? 'border-red-400 bg-red-50'
      : 'border-gray-200 focus:border-emerald-400 bg-white'
    }`

  // El backend responde 404 si la organización destino no existe o está
  // desactivada (PATCH /contacts/:id). Mostramos ese error en el campo de
  // organización en vez del bloque general.
  const ORG_DESTINO_ERROR = /organizaci[oó]n.*(no encontrada|desactivada)/i
  const orgError    = error && ORG_DESTINO_ERROR.test(error) ? error : null
  const errorGeneral = orgError ? null : error

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Header del formulario */}
        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <User size={18} className="text-emerald-700" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">
              {esEdicion ? 'Editar contacto' : 'Nuevo contacto'}
            </h2>
            <p className="text-xs text-gray-400">Completa los datos del contacto</p>
          </div>
        </div>

        <div className="p-8 space-y-6">

          {/* Organización */}
          <div className="space-y-1.5">
            <label htmlFor="cf-org" className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <Building2 size={12} className="text-gray-400" />
              Organización <span className="text-red-500">*</span>
            </label>
            <div ref={orgComboRef} className="relative">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="cf-org"
                  type="text"
                  autoComplete="off"
                  value={orgDropdownOpen ? orgQuery : orgDisplayValue}
                  onFocus={() => { setOrgQuery(''); setOrgDropdownOpen(true) }}
                  onChange={(e) => {
                    setOrgQuery(e.target.value)
                    setOrgNombreSeleccionado('')
                    setValue('idOrganizacion', '', { shouldValidate: true })
                  }}
                  placeholder="Buscar organización..."
                  className={`${inputClass(!!errors.idOrganizacion || !!orgError)} pl-9 ${orgDropdownOpen && orgQuery ? 'pr-8' : ''}`}
                />
                {orgDropdownOpen && orgQuery && (
                  <button
                    type="button"
                    onClick={() => { setOrgQuery(''); setOrgNombreSeleccionado(''); setValue('idOrganizacion', '', { shouldValidate: true }) }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <input type="hidden" {...register('idOrganizacion')} />

              {orgDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                  <OrgDropdownContent
                    query={debouncedOrgQuery}
                    isSearching={orgSearchLoading}
                    results={orgResults}
                    selected={orgSeleccionada}
                    onSelect={(id, nombre) => {
                      setValue('idOrganizacion', id, { shouldValidate: true })
                      setOrgNombreSeleccionado(nombre)
                      setOrgQuery('')
                      setOrgDropdownOpen(false)
                    }}
                  />
                </div>
              )}
            </div>
            {(errors.idOrganizacion || orgError) && (
              <p className="text-red-500 text-xs">
                {errors.idOrganizacion?.message ?? orgError}
              </p>
            )}
            {esEdicion && !errors.idOrganizacion && !orgError && (
              <p className="text-xs text-gray-400">
                Cambiar la organización moverá el contacto a la organización seleccionada.
              </p>
            )}
          </div>

          {/* Sección: Datos personales */}
          <div className="space-y-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
              Datos personales
            </p>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="cf-vocativo" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Vocativo <span className="text-red-500">*</span>
                </label>
                <select
                  id="cf-vocativo"
                  {...register('vocativo')}
                  className={`${inputClass(!!errors.vocativo)} cursor-pointer`}
                >
                  <option value="">—</option>
                  {Object.values(Vocativo).map((v) => (
                    <option key={v} value={v}>{formatVocativo(v)}</option>
                  ))}
                </select>
                {errors.vocativo && (
                  <p className="text-red-500 text-xs">{errors.vocativo.message}</p>
                )}
              </div>

              <div className="col-span-3 space-y-1.5">
                <label htmlFor="cf-nombres" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Nombres <span className="text-red-500">*</span>
                </label>
                <input
                  id="cf-nombres"
                  type="text"
                  placeholder="Nombres del contacto"
                  {...register('nombres')}
                  className={inputClass(!!errors.nombres)}
                />
                {errors.nombres && (
                  <p className="text-red-500 text-xs">{errors.nombres.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cf-apellidos" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Apellidos{' '}
                <span className="text-gray-400 normal-case font-normal">Opcional</span>
              </label>
              <input
                id="cf-apellidos"
                type="text"
                placeholder="Apellidos del contacto"
                {...register('apellidos')}
                className={inputClass(!!errors.apellidos)}
              />
              {errors.apellidos && (
                <p className="text-red-500 text-xs">{errors.apellidos.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cf-cargo" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Cargo{' '}
                <span className="text-gray-400 normal-case font-normal">Opcional</span>
              </label>
              <input
                id="cf-cargo"
                type="text"
                placeholder="Ej: Gerente de Proyectos"
                {...register('cargo')}
                className={inputClass(!!errors.cargo)}
              />
            </div>
          </div>

          {/* Sección: Información de contacto */}
          <div className="space-y-4">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
              <Mail size={12} className="text-gray-400" />
              Información de contacto
            </p>

            <div className="space-y-1.5">
              <label htmlFor="cf-correo" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <input
                id="cf-correo"
                type="email"
                placeholder="correo@empresa.com"
                {...register('correo')}
                className={inputClass(!!errors.correo)}
              />
              {errors.correo && (
                <p className="text-red-500 text-xs">{errors.correo.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cf-correo2" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Correo secundario{' '}
                <span className="text-gray-400 normal-case font-normal">Opcional</span>
              </label>
              <input
                id="cf-correo2"
                type="email"
                placeholder="correo.alternativo@empresa.com"
                {...register('correo2')}
                className={inputClass(!!errors.correo2)}
              />
              {errors.correo2 && (
                <p className="text-red-500 text-xs">{errors.correo2.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cf-telefono" className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <Phone size={12} className="text-gray-400" />
                Teléfono{' '}
                <span className="text-gray-400 normal-case font-normal">Opcional</span>
              </label>
              <div className={`flex rounded-xl border overflow-hidden transition-colors
                ${errors.telefono || codigoPaisError ? 'border-red-400' : 'border-gray-200 focus-within:border-emerald-400'}`}>
                <input
                  type="text"
                  aria-label="Código de país"
                  value={codigoPais}
                  onChange={(e) => {
                    setCodigoPais(e.target.value)
                    setCodigoPaisError('')
                  }}
                  maxLength={5}
                  placeholder="+51"
                  className="w-16 px-3 py-2.5 text-sm text-gray-500 bg-gray-50 border-r border-gray-200 outline-none text-center focus:bg-white"
                />
                <input
                  id="cf-telefono"
                  type="tel"
                  inputMode="numeric"
                  placeholder="987 654 321"
                  {...register('telefono')}
                  className="flex-1 px-3 py-2.5 text-sm text-gray-900 outline-none bg-white placeholder:text-gray-400"
                />
              </div>
              {codigoPaisError && (
                <p className="text-red-500 text-xs">{codigoPaisError}</p>
              )}
              {errors.telefono && (
                <p className="text-red-500 text-xs">{errors.telefono.message}</p>
              )}
            </div>
          </div>

          {/* Comentarios */}
          <div className="space-y-1.5">
            <label htmlFor="cf-comentarios" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Comentarios{' '}
              <span className="text-gray-400 normal-case font-normal ml-1">Opcional</span>
            </label>
            <textarea
              id="cf-comentarios"
              rows={3}
              placeholder="Notas o comentarios adicionales sobre el contacto..."
              {...register('comentarios')}
              className={`${inputClass(!!errors.comentarios)} resize-none`}
            />
            {errors.comentarios && (
              <p className="text-red-500 text-xs">{errors.comentarios.message}</p>
            )}
          </div>

          {errorGeneral && (
            <div className="bg-red-50 border border-red-200 text-red-700
              text-sm rounded-xl px-4 py-3">
              {errorGeneral}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.push(ROUTES.contactos)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
                text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleFormSubmit}
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
                  {esEdicion ? 'Guardar cambios' : 'Guardar contacto'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
