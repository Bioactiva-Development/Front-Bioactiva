'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  cotizacionSchema,
  CotizacionFormValues,
} from '@/lib/validators/cotizacion.schema'
import { TipoMoneda } from '@/types/enums'
import { Cotizacion } from '@/types/cotizacion.types'
import { ROUTES } from '@/lib/constants/routes'
import { useLead } from '@/hooks/pipeline/useLeads'
import { useAuthStore } from '@/store'
import { usuariosService } from '@/services/modules/usuarios.service'
import { EstadoUsuario } from '@/types/enums'
import { UsuarioListItem } from '@/types/usuario.types'

interface CotizacionFormProps {
  cotizacion?:     Cotizacion
  onSubmit:        (data: CotizacionFormValues) => Promise<void>
  isLoading:       boolean
  error?:          string | null
  leadIdInicial?:  number
}

interface RemitenteOption {
  id: number
  nombre: string
}

const getTodayLocalDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const toRemitenteOption = (usuario: UsuarioListItem): RemitenteOption => ({
  id: usuario.id,
  nombre: `${usuario.nombres} ${usuario.apellidos}`.trim() || usuario.correo,
})

export function CotizacionForm({
  cotizacion,
  onSubmit,
  isLoading,
  error,
  leadIdInicial,
}: Readonly<CotizacionFormProps>) {
  const router    = useRouter()
  const esEdicion = !!cotizacion
  const { usuario } = useAuthStore()
  const [remitentes, setRemitentes] = useState<RemitenteOption[]>([])
  const usuarioActualOption = useMemo<RemitenteOption | null>(() => {
    if (!usuario) return null
    return {
      id: usuario.id,
      nombre: `${usuario.nombres} ${usuario.apellidos}`.trim() || usuario.correo,
    }
  }, [usuario])
  const remitentesDisponibles = useMemo(() => {
    const options = [...remitentes]

    if (
      usuarioActualOption &&
      !options.some((remitente) => remitente.id === usuarioActualOption.id)
    ) {
      options.unshift(usuarioActualOption)
    }

    if (
      cotizacion?.id_remitente &&
      cotizacion.nombre_remitente &&
      !options.some((remitente) => remitente.id === cotizacion.id_remitente)
    ) {
      options.unshift({
        id: cotizacion.id_remitente,
        nombre: cotizacion.nombre_remitente,
      })
    }

    return options
  }, [cotizacion, remitentes, usuarioActualOption])

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CotizacionFormValues>({
    resolver: zodResolver(cotizacionSchema),
    defaultValues: cotizacion
      ? {
          id_lead:         cotizacion.id_lead,
          id_remitente:    cotizacion.id_remitente,
          fecha_cot:       cotizacion.fecha_cot.split('T')[0],
          dirigido:        cotizacion.dirigido,
          cliente:         cotizacion.cliente ?? '',
          producto:        cotizacion.producto ?? '',
          nombre_servicio: cotizacion.nombre_servicio,
          monto:           cotizacion.monto,
          tipo:            cotizacion.tipo,
          observacion:     cotizacion.observacion ?? '',
          link_propuesta:  cotizacion.link_propuesta ?? '',
        }
      : {
          fecha_cot:    getTodayLocalDate(),
          tipo:         TipoMoneda.Soles,
          monto:        0,
          id_remitente: usuario?.id ?? 0,
          id_lead:      leadIdInicial ?? 0,
        },
  })

  // Autocompletar campos desde el lead seleccionado
  const leadSeleccionado = useWatch({ control, name: 'id_lead' })
  const remitenteSeleccionado = useWatch({ control, name: 'id_remitente' })
  const leadIdParaAutocompletar = !esEdicion
    ? Number(leadSeleccionado || leadIdInicial || 0)
    : 0
  const { data: leadAutocompletado } = useLead(leadIdParaAutocompletar)
  const bloquearCamposDesdeLead = Boolean(leadAutocompletado) && !esEdicion
  const bloquearCamposFijos = esEdicion || bloquearCamposDesdeLead
  const bloquearDirigido = bloquearCamposFijos && Boolean(leadAutocompletado?.contacto_nombre)
  const disabledClass = 'bg-gray-50 text-gray-500 cursor-not-allowed focus:border-gray-200'

  useEffect(() => {
    let isMounted = true

    async function cargarRemitentes() {
      try {
        const response = await usuariosService.getUsuarios({
          estado: EstadoUsuario.Activo,
          limit: 100,
        })

        if (!isMounted) return
        setRemitentes(response.usuarios.map(toRemitenteOption))
      } catch {
        if (!isMounted) return
        setRemitentes(usuarioActualOption ? [usuarioActualOption] : [])
      }
    }

    cargarRemitentes()

    return () => {
      isMounted = false
    }
  }, [usuarioActualOption])

  useEffect(() => {
    if (esEdicion || remitentesDisponibles.length === 0) return

    if (leadAutocompletado?.id_encargado) {
      const leadRemitenteExists = remitentesDisponibles.some(
        (remitente) => remitente.id === leadAutocompletado.id_encargado
      )

      if (leadRemitenteExists) {
        setValue('id_remitente', leadAutocompletado.id_encargado, { shouldValidate: true })
        return
      }
    }

    const selected = Number(remitenteSeleccionado)
    const selectedExists = remitentesDisponibles.some(
      (remitente) => remitente.id === selected
    )

    if (selected && selectedExists) return

    const fallback =
      usuarioActualOption &&
        remitentesDisponibles.some(
          (remitente) => remitente.id === usuarioActualOption.id
        )
        ? usuarioActualOption
        : remitentesDisponibles[0]

    setValue('id_remitente', fallback.id, { shouldValidate: true })
  }, [
    esEdicion,
    leadAutocompletado,
    remitenteSeleccionado,
    remitentesDisponibles,
    setValue,
    usuarioActualOption,
  ])

  useEffect(() => {
    if (!leadAutocompletado || esEdicion) return

    setValue('id_lead', leadAutocompletado.id, { shouldValidate: true })
    setValue('fecha_cot', getTodayLocalDate(), { shouldValidate: true })
    setValue('dirigido', leadAutocompletado.contacto_nombre ?? '', {
      shouldValidate: true,
    })
    setValue('cliente', leadAutocompletado.organizacion_nombre ?? '', {
      shouldValidate: true,
    })
    setValue('id_remitente', leadAutocompletado.id_encargado, {
      shouldValidate: true,
    })
    setValue('nombre_servicio', leadAutocompletado.servicio_interes ?? '', {
      shouldValidate: true,
    })
  }, [esEdicion, leadAutocompletado, setValue])

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    ${hasError
      ? 'border-red-400 bg-red-50'
      : 'border-gray-200 focus:border-emerald-400 bg-white'
    }`

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
        <input type="hidden" {...register('id_lead', { valueAsNumber: true })} />

        {/* Fecha */}
        <div className="space-y-1.5">
          <label htmlFor="cot-fecha" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Fecha cotización <span className="text-red-500">*</span>
          </label>
          <input
            id="cot-fecha"
            type="date"
            readOnly
            {...register('fecha_cot')}
            className={`${inputClass(!!errors.fecha_cot)} ${disabledClass} pointer-events-none`}
          />
          {errors.fecha_cot && (
            <p className="text-red-500 text-xs">{errors.fecha_cot.message}</p>
          )}
        </div>

        {/* Dirigido / Cliente */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="cot-dirigido" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Dirigido a <span className="text-red-500">*</span>
            </label>
            <input
              id="cot-dirigido"
              type="text"
              placeholder="Nombre del destinatario"
              readOnly={bloquearDirigido}
              {...register('dirigido')}
              className={`${inputClass(!!errors.dirigido)} ${bloquearDirigido ? disabledClass : ''}`}
            />
            {errors.dirigido && (
              <p className="text-red-500 text-xs">{errors.dirigido.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="cot-cliente" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Cliente
            </label>
            <input
              id="cot-cliente"
              type="text"
              placeholder="Razón social o empresa"
              readOnly={bloquearCamposFijos}
              {...register('cliente')}
              className={`${inputClass(!!errors.cliente)} ${bloquearCamposFijos ? disabledClass : ''}`}
            />
          </div>
        </div>

        {/* Producto / Remitente */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="cot-producto" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Producto
            </label>
            <input
              id="cot-producto"
              type="text"
              placeholder="Ej: Consultoría, Formulación"
              {...register('producto')}
              className={inputClass(!!errors.producto)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="cot-remitente" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Remitente <span className="text-red-500">*</span>
            </label>
            <select
              id="cot-remitente"
              {...register('id_remitente', { valueAsNumber: true })}
              aria-disabled={bloquearCamposFijos}
              tabIndex={bloquearCamposFijos ? -1 : undefined}
              className={`${inputClass(!!errors.id_remitente)} cursor-pointer
                ${bloquearCamposFijos ? `${disabledClass} pointer-events-none` : ''}`}
            >
              <option value={0}>Seleccionar...</option>
              {leadAutocompletado?.id_encargado &&
                leadAutocompletado.encargado_nombre &&
                !remitentesDisponibles.some(
                  (remitente) => remitente.id === leadAutocompletado.id_encargado
                ) && (
                  <option value={leadAutocompletado.id_encargado}>
                    {leadAutocompletado.encargado_nombre}
                  </option>
                )}
              {remitentesDisponibles.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
            {esEdicion && (
              <p className="text-xs text-gray-400">
                El remitente queda fijado al crear la cotización.
              </p>
            )}
            {errors.id_remitente && (
              <p className="text-red-500 text-xs">{errors.id_remitente.message}</p>
            )}
          </div>
        </div>

        {/* Nombre del servicio */}
        <div className="space-y-1.5">
          <label htmlFor="cot-servicio" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Nombre del servicio <span className="text-red-500">*</span>
          </label>
          <input
            id="cot-servicio"
            type="text"
            placeholder="Descripción del servicio ofertado"
            readOnly={bloquearCamposFijos}
            {...register('nombre_servicio')}
            className={`${inputClass(!!errors.nombre_servicio)} ${bloquearCamposFijos ? disabledClass : ''}`}
          />
          {errors.nombre_servicio && (
            <p className="text-red-500 text-xs">{errors.nombre_servicio.message}</p>
          )}
        </div>

        {/* Monto / Moneda */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="cot-monto" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Monto <span className="text-red-500">*</span>
            </label>
            <input
              id="cot-monto"
              type="number"
              min={0}
              step={0.01}
              {...register('monto', { valueAsNumber: true })}
              className={inputClass(!!errors.monto)}
            />
            {errors.monto && (
              <p className="text-red-500 text-xs">{errors.monto.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="cot-moneda" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Moneda <span className="text-red-500">*</span>
            </label>
            <select
              id="cot-moneda"
              {...register('tipo')}
              className={`${inputClass(!!errors.tipo)} cursor-pointer`}
            >
              {Object.values(TipoMoneda).map((t) => (
                <option key={t} value={t}>{t === TipoMoneda.Soles ? 'Soles (PEN)' : 'Dólares (USD)'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Observación */}
        <div className="space-y-1.5">
          <label htmlFor="cot-observacion" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Observación
          </label>
          <textarea
            id="cot-observacion"
            rows={3}
            placeholder="Notas adicionales sobre la propuesta"
            {...register('observacion')}
            className={`${inputClass(!!errors.observacion)} resize-none`}
          />
        </div>

        {/* Link propuesta */}
        <div className="space-y-1.5">
          <label htmlFor="cot-link" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Link de propuesta
          </label>
          <input
            id="cot-link"
            type="url"
            placeholder="https://drive.google.com/..."
            {...register('link_propuesta')}
            className={inputClass(!!errors.link_propuesta)}
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
            onClick={() => router.push(ROUTES.cotizaciones)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
              text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Volver a Cotizaciones
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
              <><Loader2 size={16} className="animate-spin" />Guardando...</>
            ) : (
              <><Save size={16} />{esEdicion ? 'Guardar cambios' : 'Guardar cotización'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
