'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, ArrowLeft, User, Mail, Phone, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  contactoSchema,
  ContactoFormValues,
} from '@/lib/validators/contacto.schema'
import { Vocativo } from '@/types/enums'
import { Contacto } from '@/types/contacto.types'
import { ROUTES } from '@/lib/constants/routes'
import { useOrganizaciones } from '@/hooks/organizaciones/useOrganizaciones'
import { formatVocativo } from '@/lib/utils/contacto.utils'

interface ContactoFormProps {
  contacto?:     Contacto
  onSubmit:      (data: ContactoFormValues) => Promise<void>
  isLoading:     boolean
  error?:        string | null
  orgIdInicial?: string
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

  const { data: orgsData } = useOrganizaciones({ limit: 100 })
  const organizaciones     = orgsData?.data ?? []

  const {
    register,
    handleSubmit,
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
          // El backend devuelve +51XXXXXXXXX → mostramos solo los 9 dígitos locales
          telefono:       contacto.telefono?.replace(/^\+51/, '') ?? '',
          comentarios:    contacto.comentarios ?? '',
          idOrganizacion: contacto.idOrganizacion,
        }
      : {
          idOrganizacion: orgIdInicial ?? '',
        },
  })

  // Antepone +51 antes de enviar al backend (que requiere formato internacional)
  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit({
      ...data,
      telefono: data.telefono ? `+51${data.telefono}` : '',
    })
  })

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
            <select
              id="cf-org"
              {...register('idOrganizacion')}
              className={`${inputClass(!!errors.idOrganizacion || !!orgError)} cursor-pointer`}
            >
              <option value="">Seleccionar organización...</option>
              {organizaciones.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.nombre}
                </option>
              ))}
            </select>
            {(errors.idOrganizacion || orgError) && (
              <p className="text-red-500 text-xs">
                {errors.idOrganizacion?.message ?? orgError}
              </p>
            )}
            {esEdicion && !errors.idOrganizacion && !orgError && (
              <p className="text-xs text-gray-400">
                Cambiar la organización moverá el contacto a la organización seleccionada.
                Solo se listan organizaciones vigentes.
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
              <Mail size={11} className="text-gray-400" />
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
                ${errors.telefono ? 'border-red-400' : 'border-gray-200 focus-within:border-emerald-400'}`}>
                <span className="px-3 py-2.5 text-sm text-gray-500 bg-gray-50 border-r border-gray-200 shrink-0 select-none">
                  +51
                </span>
                <input
                  id="cf-telefono"
                  type="tel"
                  inputMode="numeric"
                  maxLength={9}
                  placeholder="987 654 321"
                  {...register('telefono')}
                  className="flex-1 px-3 py-2.5 text-sm text-gray-900 outline-none bg-white placeholder:text-gray-400"
                />
              </div>
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
