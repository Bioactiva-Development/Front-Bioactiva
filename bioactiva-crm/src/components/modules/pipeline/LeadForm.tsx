'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { leadSchema, LeadFormValues } from '@/lib/validators/lead.schema'
import { Lead } from '@/types/lead.types'
import { ROUTES } from '@/lib/constants/routes'
import { useOrganizaciones } from '@/hooks/organizaciones/useOrganizaciones'
import { useContactosPorOrganizacion } from '@/hooks/contactos/useContactos'
import { useAuthStore } from '@/store'
import { usuariosService } from '@/services/modules/usuarios.service'
import { EstadoUsuario, LeadState } from '@/types/enums'
import { UsuarioListItem } from '@/types/usuario.types'

interface LeadFormProps {
  lead?:      Lead
  estadoInicial?: LeadState
  estadoEditable?: boolean
  onSubmit:   (data: LeadFormValues) => Promise<void>
  isLoading:  boolean
  error?:     string | null
}

interface ResponsableOption {
  id: number
  nombre: string
  correo: string
}

const CANALES_CAPTACION = [
  'Referido',
  'LinkedIn',
  'Evento presencial',
  'Web / Redes sociales',
  'Prospección directa',
] as const

const CANAL_CAPTACION_OTRO = '__otro__'

const toResponsableOption = (usuario: UsuarioListItem): ResponsableOption => ({
  id: usuario.id,
  nombre: `${usuario.nombres} ${usuario.apellidos}`.trim() || usuario.correo,
  correo: usuario.correo,
})

function getLeadFormDefaults(
  lead?: Lead,
  estadoInicial?: LeadState,
  usuario?: { id?: number; correo?: string } | null
): Partial<LeadFormValues> {
  if (lead) {
    return {
      id_org:                  lead.id_org,
      id_contacto:             lead.id_contacto,
      estado:                  lead.estado,
      servicio_interes:        lead.servicio_interes,
      comentarios:             lead.comentarios ?? '',
      desafio_oportunidad:     lead.desafio_oportunidad ?? '',
      notas_contacto:          lead.notas_contacto ?? '',
      id_encargado:            lead.id_encargado,
      encargado_correo:        lead.encargado_correo ?? '',
      canal_captacion:         lead.canal_captacion ?? '',
      fecha_cierre:            lead.fecha_cierre ?? '',
    }
  }

  return {
    estado:          estadoInicial ?? LeadState.Prospecto,
    id_encargado:    usuario?.id ?? 1,
    encargado_correo: usuario?.correo ?? '',
  }
}

export function LeadForm({
  lead,
  estadoInicial,
  estadoEditable = false,
  onSubmit,
  isLoading,
  error,
}: Readonly<LeadFormProps>) {
  const router    = useRouter()
  const esEdicion = !!lead
  const { usuario } = useAuthStore()
  const [errorLocal, setErrorLocal] = useState<string | null>(null)
  const [responsables, setResponsables] = useState<ResponsableOption[]>([])
  const [canalOtroActivo, setCanalOtroActivo] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: getLeadFormDefaults(lead, estadoInicial, usuario),
  })

  const orgSeleccionada   = useWatch({ control, name: 'id_org' })
  const encargadoSelected = useWatch({ control, name: 'id_encargado' })
  const canalCaptacion    = useWatch({ control, name: 'canal_captacion' }) ?? ''
  const estadoActual      = useWatch({ control, name: 'estado' }) ?? LeadState.Prospecto
  const canalCaptacionEsOpcion = CANALES_CAPTACION.some(
    (canal) => canal === canalCaptacion
  )
  const mostrarCanalOtro = canalOtroActivo || Boolean(
    canalCaptacion && !canalCaptacionEsOpcion
  )
  const valorSelectorCanal = mostrarCanalOtro
    ? CANAL_CAPTACION_OTRO
    : canalCaptacion

  const { data: orgsData }      = useOrganizaciones({ limit: 100 })
  const organizaciones          = useMemo(
    () => orgsData?.data ?? [],
    [orgsData?.data]
  )
  const { data: contactosOrg }  = useContactosPorOrganizacion(orgSeleccionada)
  const contactos               = contactosOrg ?? []
  const includeCurrentOrgOption = Boolean(
    lead?.id_org &&
    lead.organizacion_nombre &&
    !organizaciones.some((org) => org.id === lead.id_org)
  )
  const includeCurrentContactOption = Boolean(
    lead?.id_contacto &&
    lead.contacto_nombre &&
    !contactos.some((contacto) => contacto.id === lead.id_contacto)
  )
  const usuarioActualOption = useMemo<ResponsableOption | null>(() => {
    if (!usuario) return null
    return {
      id: usuario.id,
      nombre: `${usuario.nombres} ${usuario.apellidos}`.trim() || usuario.correo,
      correo: usuario.correo,
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

    if (
      lead?.id_encargado &&
      lead.encargado_nombre &&
      !options.some((responsable) => responsable.id === lead.id_encargado)
    ) {
      options.unshift({
        id: lead.id_encargado,
        nombre: lead.encargado_nombre,
        correo: lead.encargado_correo ?? '',
      })
    }

    return options
  }, [lead, responsables, usuarioActualOption])

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
    reset(getLeadFormDefaults(lead, estadoInicial, usuario))
  }, [estadoInicial, lead, reset, usuario])

  useEffect(() => {
    if (!esEdicion || orgSeleccionada) return

    if (lead?.id_org && organizaciones.some((org) => org.id === lead.id_org)) {
      setValue('id_org', lead.id_org)
      return
    }

    if (!lead?.organizacion_nombre) return

    const organizacionActual = organizaciones.find(
      (org) =>
        org.nombre.toLowerCase() === lead.organizacion_nombre!.toLowerCase() ||
        org.nombre_comercial.toLowerCase() ===
          lead.organizacion_nombre!.toLowerCase()
    )

    if (organizacionActual) {
      setValue('id_org', organizacionActual.id)
    }
  }, [
    esEdicion,
    lead?.id_org,
    lead?.organizacion_nombre,
    organizaciones,
    orgSeleccionada,
    setValue,
  ])

  useEffect(() => {
    const responsable = responsablesDisponibles.find(
      (r) => r.id === Number(encargadoSelected)
    )
    if (responsable) {
      setValue('encargado_correo', responsable.correo)
    }
  }, [encargadoSelected, responsablesDisponibles, setValue])

  useEffect(() => {
    if (esEdicion || responsablesDisponibles.length === 0) return

    const selected = Number(encargadoSelected)
    const selectedExists = responsablesDisponibles.some(
      (responsable) => responsable.id === selected
    )

    if (selected && selectedExists) return

    const fallback =
      usuarioActualOption &&
      responsablesDisponibles.some((responsable) => responsable.id === usuarioActualOption.id)
        ? usuarioActualOption
        : responsablesDisponibles[0]

    setValue('id_encargado', fallback.id)
    setValue('encargado_correo', fallback.correo)
  }, [
    encargadoSelected,
    esEdicion,
    responsablesDisponibles,
    setValue,
    usuarioActualOption,
  ])

  useEffect(() => {
    if (!esEdicion) {
      setValue('id_contacto', undefined)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgSeleccionada])

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 outline-none
    transition-colors placeholder:text-gray-400
    ${hasError
      ? 'border-red-400 bg-red-50'
      : 'border-gray-200 focus:border-emerald-400 bg-white'
    }`

  const handleValidSubmit = async (data: LeadFormValues) => {
    setErrorLocal(null)

    if (data.id_contacto && contactos.length > 0) {
      const contactoSeleccionado = contactos.find((c) => c.id === data.id_contacto)

      if (!contactoSeleccionado) {
        setErrorLocal('El contacto seleccionado no pertenece a la organización elegida.')
        return
      }

      if (contactoSeleccionado.estado_correo === 'VENCIDO') {
        setErrorLocal('El contacto seleccionado está vencido y no puede asociarse a nuevos leads.')
        return
      }
    }

    await onSubmit(data)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">

        <div className="space-y-1.5">
          <label htmlFor="ldf-codigo" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            ID Lead (se genera al guardar)
          </label>
          <input
            id="ldf-codigo"
            type="text"
            value={lead?.codigo ?? `LEAD-${new Date().getFullYear()}-XXX`}
            disabled
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200
              bg-gray-50 text-sm text-gray-400 cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="ldf-org" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Organización <span className="text-red-500">*</span>
          </label>
          <select
            id="ldf-org"
            {...register('id_org')}
            disabled={esEdicion}
            className={`${inputClass(!!errors.id_org)} cursor-pointer
              ${esEdicion ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <option value="">Buscar organización existente...</option>
            {includeCurrentOrgOption && (
              <option value={lead!.id_org}>{lead!.organizacion_nombre}</option>
            )}
            {organizaciones.map((org) => (
              <option key={org.id} value={org.id}>{org.nombre}</option>
            ))}
          </select>
          {errors.id_org && (
            <p className="text-red-500 text-xs">{errors.id_org.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="ldf-contacto" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Contacto{' '}
            <span className="text-gray-400 normal-case font-normal">
              (opcional — puedes vincularlo después)
            </span>
          </label>
          <select
            {...register('id_contacto', {
              setValueAs: (value) => value ? Number(value) : undefined,
            })}
            disabled={!orgSeleccionada}
            className={`${inputClass(!!errors.id_contacto)} cursor-pointer
              ${!orgSeleccionada ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <option value="">
              {orgSeleccionada
                ? 'Seleccionar contacto...'
                : 'Primero selecciona una organización'
              }
            </option>
            {includeCurrentContactOption && (
              <option value={lead!.id_contacto}>
                {lead!.contacto_nombre}
              </option>
            )}
            {contactos.filter((c) => c.estado_correo !== 'VENCIDO').map((c) => (
              <option key={c.id} value={c.id}>
                {c.vocativo ? `${c.vocativo}. ` : ''}
                {c.nombres} {c.apellidos}
                {c.cargo ? ` — ${c.cargo}` : ''}
              </option>
            ))}
          </select>
        </div>


        {!estadoEditable && <input type="hidden" {...register('estado')} />}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Estado del pipeline
            </label>
            {estadoEditable ? (
              <select
                {...register('estado')}
                className={`${inputClass(!!errors.estado)} cursor-pointer`}
              >
                {Object.values(LeadState).map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full px-4 py-2.5 rounded-xl border border-gray-200
                bg-gray-50 text-sm text-gray-600">
                {estadoActual}
              </div>
            )}
            <p className="text-xs text-gray-400">
              {estadoEditable
                ? 'El cambio de estado valida las cotizaciones asociadas al lead.'
                : esEdicion
                  ? 'El cambio de estado se gestiona desde el pipeline.'
                  : 'Todo lead nuevo inicia en prospecto. El cambio de estado se gestiona desde el pipeline.'
              }
            </p>
            {errors.estado && (
              <p className="text-red-500 text-xs">{errors.estado.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Fecha de creación
            </label>
            <input
              type="text"
              value={new Date().toISOString().split('T')[0]}
              disabled
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200
                bg-gray-50 text-sm text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="ldf-servicio" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Servicio de interés <span className="text-red-500">*</span>
          </label>
          <input
            id="ldf-servicio"
            type="text"
            placeholder="Ej: Formulación de proyecto Innovasuyu"
            {...register('servicio_interes')}
            className={inputClass(!!errors.servicio_interes)}
          />
          {errors.servicio_interes && (
            <p className="text-red-500 text-xs">{errors.servicio_interes.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="ldf-comentarios" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Comentarios
          </label>
          <textarea
            id="ldf-comentarios"
            rows={3}
            placeholder="Notas internas del lead..."
            {...register('comentarios')}
            className={`${inputClass(!!errors.comentarios)} resize-none`}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="ldf-desafio" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Desafío u oportunidad
          </label>
          <textarea
            id="ldf-desafio"
            rows={3}
            placeholder="Problema concreto o necesidad comercial detectada..."
            {...register('desafio_oportunidad')}
            className={`${inputClass(!!errors.desafio_oportunidad)} resize-none`}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="ldf-notas-contacto" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Notas de contacto
          </label>
          <textarea
            id="ldf-notas-contacto"
            rows={3}
            placeholder="Resumen de reuniones, correos o contexto previo..."
            {...register('notas_contacto')}
            className={`${inputClass(!!errors.notas_contacto)} resize-none`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="ldf-encargado" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Encargado <span className="text-red-500">*</span>
            </label>
            <select
              id="ldf-encargado"
              {...register('id_encargado', { valueAsNumber: true })}
              className={`${inputClass(!!errors.id_encargado)} cursor-pointer`}
            >
              <option value="">Seleccionar...</option>
              {responsablesDisponibles.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
            {errors.id_encargado && (
              <p className="text-red-500 text-xs">{errors.id_encargado.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="ldf-encargado-correo" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Correo del encargado
            </label>
            <input
              id="ldf-encargado-correo"
              type="email"
              placeholder="correo@bioactiva.pe"
              {...register('encargado_correo')}
              className={inputClass(!!errors.encargado_correo)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="ldf-canal" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Canal de captación
            </label>
            <select
              id="ldf-canal"
              value={valorSelectorCanal}
              onChange={(event) => {
                const value = event.target.value

                if (value === CANAL_CAPTACION_OTRO) {
                  setCanalOtroActivo(true)
                  if (!canalCaptacion || canalCaptacionEsOpcion) {
                    setValue('canal_captacion', '', {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  return
                }

                setCanalOtroActivo(false)
                setValue('canal_captacion', value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }}
              className={`${inputClass(!!errors.canal_captacion)} cursor-pointer`}
            >
              <option value="">Seleccionar canal...</option>
              {CANALES_CAPTACION.map((canal) => (
                <option key={canal} value={canal}>
                  {canal}
                </option>
              ))}
              <option value={CANAL_CAPTACION_OTRO}>Otro</option>
            </select>
            {mostrarCanalOtro && (
              <input
                id="ldf-canal-otro"
                type="text"
                placeholder="Especifica el canal de captación..."
                {...register('canal_captacion')}
                className={inputClass(!!errors.canal_captacion)}
              />
            )}
            {errors.canal_captacion && (
              <p className="text-red-500 text-xs">{errors.canal_captacion.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="ldf-fecha-cierre" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Fecha de cierre
            </label>
            <input
              id="ldf-fecha-cierre"
              type="date"
              {...register('fecha_cierre')}
              className={inputClass(!!errors.fecha_cierre)}
            />
          </div>
        </div>

        {(errorLocal || error) && (
          <div className="bg-red-50 border border-red-200 text-red-700
            text-sm rounded-xl px-4 py-3">
            {errorLocal ?? error}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push(ROUTES.pipeline)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
              text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit(handleValidSubmit)}
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
                {esEdicion ? 'Guardar cambios' : 'Guardar lead'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
