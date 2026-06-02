'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  contactoSchema,
  ContactoFormValues,
} from '@/lib/validators/contacto.schema'
import { Vocativo } from '@/types/enums'
import { Contacto } from '@/types/contacto.types'
import { ROUTES } from '@/lib/constants/routes'
import { useOrganizaciones } from '@/hooks/organizaciones/useOrganizaciones'

interface ContactoFormProps {
  contacto?:  Contacto
  onSubmit:   (data: ContactoFormValues) => Promise<void>
  isLoading:  boolean
  error?:     string | null
  orgIdInicial?: string
}

export function ContactoForm({
  contacto,
  onSubmit,
  isLoading,
  error,
  orgIdInicial,
}: ContactoFormProps) {
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
          telefono:       contacto.telefono ?? '',
          comentarios:    contacto.comentarios ?? '',
          idOrganizacion: contacto.idOrganizacion,
        }
      : {
          idOrganizacion: orgIdInicial ?? '',
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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-4">

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Organización <span className="text-red-500">*</span>
          </label>
          <select
            {...register('idOrganizacion')}
            disabled={esEdicion}
            className={`${inputClass(!!errors.idOrganizacion)}
              ${esEdicion ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
          >
            <option value="">Seleccionar organización...</option>
            {organizaciones.map((org) => (
              <option key={org.id} value={org.id}>
                {org.nombre}
              </option>
            ))}
          </select>
          {errors.idOrganizacion && (
            <p className="text-red-500 text-xs">{errors.idOrganizacion.message}</p>
          )}
          {esEdicion && (
            <p className="text-xs text-gray-400">
              La organización no puede modificarse una vez creado el contacto.
            </p>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Vocativo
            </label>
            <select
              {...register('vocativo')}
              className={`${inputClass(!!errors.vocativo)} cursor-pointer`}
            >
              <option value="">—</option>
              {Object.values(Vocativo).map((v) => (
                <option key={v} value={v}>{v}.</option>
              ))}
            </select>
          </div>

          <div className="col-span-3 space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Nombres <span className="text-red-500">*</span>
            </label>
            <input
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
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Apellidos <span className="text-red-500">*</span>
          </label>
          <input
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
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Cargo{' '}
            <span className="text-gray-400 normal-case font-normal">Opcional</span>
          </label>
          <input
            type="text"
            placeholder="Ej: Gerente de Proyectos"
            {...register('cargo')}
            className={inputClass(!!errors.cargo)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Correo electrónico <span className="text-red-500">*</span>
          </label>
          <input
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
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Correo secundario{' '}
            <span className="text-gray-400 normal-case font-normal">Opcional</span>
          </label>
          <input
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
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Teléfono{' '}
            <span className="text-gray-400 normal-case font-normal">Opcional</span>
          </label>
          <input
            type="text"
            placeholder="Ej: 999 123 456"
            {...register('telefono')}
            className={inputClass(!!errors.telefono)}
          />
          {errors.telefono && (
            <p className="text-red-500 text-xs">{errors.telefono.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Comentarios
            <span className="text-gray-400 normal-case font-normal ml-1">Opcional</span>
          </label>
          <textarea
            rows={3}
            placeholder="Notas o comentarios adicionales sobre el contacto..."
            {...register('comentarios')}
            className={`${inputClass(!!errors.comentarios)} resize-none`}
          />
          {errors.comentarios && (
            <p className="text-red-500 text-xs">{errors.comentarios.message}</p>
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
            onClick={() => router.push(ROUTES.contactos)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
              text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Volver a Contactos
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
                {esEdicion ? 'Guardar cambios' : 'Guardar contacto'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}