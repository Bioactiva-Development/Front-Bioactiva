'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, ArrowLeft, Target, Building2, User, MessageSquare, Radio, Search, X } from 'lucide-react'
import { formatVocativo } from '@/lib/utils/contacto.utils'
import { useRouter } from 'next/navigation'
import {
  createLeadSchema,
  leadSchema,
  LeadFormValues,
} from '@/lib/validators/lead.schema'
import { Lead } from '@/types/lead.types'
import { ROUTES } from '@/lib/constants/routes'
import { useOrganizaciones } from '@/hooks/organizaciones/useOrganizaciones'
import { useDebounce } from '@/hooks/shared/useDebounce'
import { useContactosPorOrganizacion } from '@/hooks/contactos/useContactos'
import { usuariosService } from '@/services/modules/usuarios.service'
import { LeadState } from '@/types/enums'
import { AssignableUsuario } from '@/types/usuario.types'

// Secciones a las que se puede posicionar el formulario al abrir en edición.
export type LeadEditFocus = 'datos' | 'contexto'

// Cada foco apunta al primer campo editable de la sección equivalente del detalle.
const FOCUS_ANCHOR: Record<LeadEditFocus, string> = {
  datos:    'ldf-servicio',
  contexto: 'ldf-comentarios',
}

interface LeadFormProps {
  lead?:      Lead
  estadoInicial?: LeadState
  estadoEditable?: boolean
  onSubmit:   (data: LeadFormValues) => Promise<void>
  isLoading:  boolean
  error?:     string | null
  focusField?: LeadEditFocus
  onVolver?:  () => void
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

const toResponsableOption = (usuario: AssignableUsuario): ResponsableOption => ({
  id: usuario.id,
  nombre: `${usuario.nombres} ${usuario.apellidos}`.trim() || usuario.correo,
  correo: usuario.correo,
})

// En edicion, organizacion / contacto / encargado no son editables: se muestran
// como informacion de solo lectura (no como inputs deshabilitados).
function CampoInfo({
  label,
  valor,
  hint,
}: {
  label: string
  valor?: string | null
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <p className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <div className="w-full px-4 py-2.5 rounded-xl border border-gray-100
        bg-gray-50 text-sm text-gray-700">
        {valor?.trim() ? valor : '—'}
      </div>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

function getLeadFormDefaults(
  lead?: Lead,
  estadoInicial?: LeadState
): Partial<LeadFormValues> {
  if (lead) {
    return {
      id_org:                  lead.id_org,
      id_contacto:             lead.id_contacto,
      estado:                  lead.estado,
      servicio_interes:        lead.servicio_interes,
      comentarios:             lead.comentarios ?? '',
      desafio_oportunidad:     lead.desafio_oportunidad ?? '',
      id_encargado:            lead.id_encargado,
      canal_captacion:         lead.canal_captacion ?? '',
    }
  }

  return {
    estado:           estadoInicial ?? LeadState.Prospecto,
    id_encargado:     undefined,
  }
}

export function LeadForm({
  lead,
  estadoInicial,
  estadoEditable = false,
  onSubmit,
  isLoading,
  error,
  focusField,
  onVolver,
}: Readonly<LeadFormProps>) {
  const router    = useRouter()
  const esEdicion = !!lead
  const [errorLocal, setErrorLocal] = useState<string | null>(null)
  const [responsables, setResponsables] = useState<ResponsableOption[]>([])
  const [responsablesLoading, setResponsablesLoading] = useState(false)
  const [responsablesError, setResponsablesError] = useState<string | null>(null)
  const [canalOtroActivo, setCanalOtroActivo] = useState(false)
  const [orgQuery, setOrgQuery] = useState('')
  const [orgDisplayName, setOrgDisplayName] = useState('')
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false)
  const orgComboRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(esEdicion ? leadSchema : createLeadSchema),
    defaultValues: getLeadFormDefaults(lead, estadoInicial),
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
  const debouncedOrgQuery = useDebounce(orgQuery, 300)
  const { data: orgSearchData, isLoading: orgSearchLoading } = useOrganizaciones(
    !esEdicion && debouncedOrgQuery.length >= 1
      ? { search: debouncedOrgQuery, limit: 20 }
      : { limit: 0 }
  )
  const orgResults = !esEdicion && debouncedOrgQuery.length >= 1
    ? (orgSearchData?.data ?? [])
    : organizaciones.slice(0, 5)
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
  // Mantis #434 — el selector lista TODOS los usuarios habilitados (sin sesgo al
  // usuario logueado). En edicion, si el encargado actual quedo deshabilitado y no
  // viene en la lista, se inyecta como opcion para no perder el valor seleccionado.
  const responsablesDisponibles = useMemo(() => {
    const options = [...responsables]

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
  }, [lead, responsables])

  useEffect(() => {
    let isMounted = true

    async function cargarResponsables() {
      setResponsablesLoading(true)
      setResponsablesError(null)
      try {
        const data = await usuariosService.getAssignables()

        if (!isMounted) return
        setResponsables(data.map(toResponsableOption))
      } catch {
        if (!isMounted) return
        setResponsables([])
        setResponsablesError('No se pudieron cargar los encargados. Intenta nuevamente.')
      } finally {
        if (isMounted) setResponsablesLoading(false)
      }
    }

    cargarResponsables()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    reset(getLeadFormDefaults(lead, estadoInicial))
  }, [estadoInicial, lead, reset])

  // Posiciona el formulario en la sección desde la que se pidió editar (al venir
  // del detalle del lead). Hace scroll y enfoca el primer campo de la sección.
  useEffect(() => {
    if (!focusField) return
    const anchorId = FOCUS_ANCHOR[focusField]
    const timer = setTimeout(() => {
      const el = document.getElementById(anchorId) as
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement
        | null
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      if (!el.disabled) el.focus({ preventScroll: true })
    }, 120)
    return () => clearTimeout(timer)
  }, [focusField])

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

  // Mantis #432 — el correo es solo informativo: se deriva del encargado
  // seleccionado (lista de GET /users/assignable). No es estado del formulario.
  const correoEncargado = useMemo(() => {
    const responsable = responsablesDisponibles.find(
      (r) => r.id === Number(encargadoSelected)
    )
    return responsable?.correo ?? ''
  }, [encargadoSelected, responsablesDisponibles])

  useEffect(() => {
    if (!esEdicion) {
      setValue('id_contacto', undefined)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgSeleccionada])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (orgComboRef.current && !orgComboRef.current.contains(e.target as Node)) {
        setOrgDropdownOpen(false)
        if (!orgSeleccionada) setOrgQuery('')
        else setOrgQuery(orgDisplayName)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [orgDisplayName, orgSeleccionada])

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
        setErrorLocal('El contacto seleccionado está inactivo y no puede asociarse a nuevos leads.')
        return
      }
    }

    await onSubmit(data)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Header del formulario */}
        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Target size={18} className="text-emerald-700" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">
              {esEdicion ? 'Editar lead' : 'Nueva oportunidad comercial'}
            </h2>
            <p className="text-xs text-gray-400">
              {esEdicion
                ? 'Actualiza la información del lead'
                : 'Completa los datos para registrar el lead en el pipeline'
              }
            </p>
          </div>
        </div>

        <div className="p-8 space-y-6">

          {/* Sección: Organización y contacto */}
          <div className="space-y-4">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
              <Building2 size={12} className="text-gray-400" />
              Organización y contacto
            </p>

            {esEdicion ? (
              <>
                {/* Inmutables en edición: se conservan en el formulario y se
                    muestran como información, no como inputs editables. */}
                <input type="hidden" {...register('id_org')} />
                <input
                  type="hidden"
                  {...register('id_contacto', {
                    setValueAs: (value) => (value ? Number(value) : undefined),
                  })}
                />

                <CampoInfo
                  label="Organización"
                  valor={lead!.organizacion_nombre}
                />
                {lead!.contacto_nombre && (
                  <CampoInfo label="Contacto" valor={lead!.contacto_nombre} />
                )}
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="ldf-org" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Organización <span className="text-red-500">*</span>
                  </label>
                  <div ref={orgComboRef} className="relative">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        id="ldf-org"
                        type="text"
                        autoComplete="off"
                        value={orgQuery}
                        onFocus={() => setOrgDropdownOpen(true)}
                        onChange={(e) => {
                          const val = e.target.value
                          setOrgQuery(val)
                          setOrgDropdownOpen(true)
                          if (!val || val !== orgDisplayName) {
                            setValue('id_org', '', { shouldValidate: true })
                            setOrgDisplayName('')
                            setValue('id_contacto', undefined)
                          }
                        }}
                        placeholder="Buscar organización..."
                        className={`${inputClass(!!errors.id_org)} pl-9 ${orgQuery ? 'pr-8' : ''}`}
                      />
                      {orgQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setOrgQuery('')
                            setOrgDisplayName('')
                            setValue('id_org', '', { shouldValidate: true })
                            setValue('id_contacto', undefined)
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <input type="hidden" {...register('id_org')} />

                    {orgDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200
                        rounded-xl shadow-lg max-h-56 overflow-y-auto">
                        {debouncedOrgQuery.length >= 1 && orgSearchLoading ? (
                          <div className="flex items-center gap-2 px-4 py-3">
                            <Loader2 size={14} className="animate-spin text-gray-400" />
                            <span className="text-sm text-gray-400">Buscando...</span>
                          </div>
                        ) : debouncedOrgQuery.length >= 1 && orgResults.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-gray-400">
                            Sin resultados para &ldquo;{debouncedOrgQuery}&rdquo;
                          </p>
                        ) : (
                          <>
                          {debouncedOrgQuery.length < 1 && (
                            <p className="px-4 pt-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                              Recientes
                            </p>
                          )}
                          {orgResults.map((org) => (
                            <button
                              key={org.id}
                              type="button"
                              onClick={() => {
                                setValue('id_org', org.id, { shouldValidate: true })
                                setOrgQuery(org.nombre)
                                setOrgDisplayName(org.nombre)
                                setOrgDropdownOpen(false)
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                                hover:bg-emerald-50 hover:text-emerald-700
                                ${orgSeleccionada === org.id
                                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                                  : 'text-gray-700'
                                }`}
                            >
                              {org.nombre}
                              {org.nombre_comercial && org.nombre_comercial !== org.nombre && (
                                <span className="text-xs text-gray-400 ml-1.5">
                                  · {org.nombre_comercial}
                                </span>
                              )}
                            </button>
                          ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {errors.id_org && (
                    <p className="text-red-500 text-xs">{errors.id_org.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="ldf-contacto" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Contacto{' '}
                    <span className="text-gray-400 normal-case font-normal">Opcional</span>
                  </label>
                  <select
                    id="ldf-contacto"
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
                        {c.vocativo ? `${formatVocativo(c.vocativo)} ` : ''}
                        {c.nombres} {c.apellidos}
                        {c.cargo ? ` — ${c.cargo}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Sección: Información del lead */}
          <div className="space-y-4">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
              <Target size={12} className="text-gray-400" />
              Información del lead
            </p>

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
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full px-4 py-2.5 rounded-xl border border-gray-100
                    bg-gray-50 text-sm text-gray-500">
                    {estadoActual}
                  </div>
                )}
                {errors.estado && (
                  <p className="text-red-500 text-xs">{errors.estado.message}</p>
                )}
                <p className="text-xs text-gray-400">
                  {estadoEditable
                    ? 'Valida las cotizaciones asociadas al lead.'
                    : esEdicion
                      ? 'Gestión desde el pipeline.'
                      : 'Todo lead nuevo inicia en prospecto.'
                  }
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Fecha de creación
                </label>
                <input
                  type="text"
                  value={new Date().toISOString().split('T')[0]}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-100
                    bg-gray-50 text-sm text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="ldf-canal" className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <Radio size={12} className="text-gray-400" />
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
                        setValue('canal_captacion', '', { shouldDirty: true, shouldValidate: true })
                      }
                      return
                    }
                    setCanalOtroActivo(false)
                    setValue('canal_captacion', value, { shouldDirty: true, shouldValidate: true })
                  }}
                  className={`${inputClass(!!errors.canal_captacion)} cursor-pointer`}
                >
                  <option value="">Seleccionar canal...</option>
                  {CANALES_CAPTACION.map((canal) => (
                    <option key={canal} value={canal}>{canal}</option>
                  ))}
                  <option value={CANAL_CAPTACION_OTRO}>Otro</option>
                </select>
                {mostrarCanalOtro && (
                  <input
                    id="ldf-canal-otro"
                    type="text"
                    placeholder="Especifica el canal..."
                    {...register('canal_captacion')}
                    className={inputClass(!!errors.canal_captacion)}
                  />
                )}
                {errors.canal_captacion && (
                  <p className="text-red-500 text-xs">{errors.canal_captacion.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sección: Notas y contexto — solo en creación. En edición, comentarios
              y desafío se editan inline desde el detalle del lead. */}
          {!esEdicion && (
            <div className="space-y-4">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                <MessageSquare size={12} className="text-gray-400" />
                Notas y contexto
              </p>

              <div className="space-y-1.5">
                <label htmlFor="ldf-comentarios" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Comentarios
                </label>
                <textarea
                  id="ldf-comentarios"
                  rows={2}
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
                  rows={2}
                  placeholder="Problema concreto o necesidad comercial detectada..."
                  {...register('desafio_oportunidad')}
                  className={`${inputClass(!!errors.desafio_oportunidad)} resize-none`}
                />
              </div>
            </div>
          )}

          {/* Sección: Responsable */}
          <div className="space-y-4">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
              <User size={12} className="text-gray-400" />
              Responsable
            </p>

            {esEdicion ? (
              <>
                {/* El encargado no se edita aquí: se conserva y se muestra como info. */}
                <input
                  type="hidden"
                  {...register('id_encargado', {
                    setValueAs: (value) => value === '' ? 0 : Number(value),
                  })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <CampoInfo
                    label="Encargado"
                    valor={lead!.encargado_nombre}
                  />
                  <CampoInfo
                    label="Correo del encargado"
                    valor={lead!.encargado_correo ?? correoEncargado}
                  />
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="ldf-encargado" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Encargado <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="ldf-encargado"
                    disabled={responsablesLoading}
                    {...register('id_encargado', {
                      setValueAs: (value) => value === '' ? 0 : Number(value),
                    })}
                    className={`${inputClass(!!errors.id_encargado)} cursor-pointer
                      ${responsablesLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <option value="">
                      {responsablesLoading ? 'Cargando encargados...' : 'Seleccionar encargado'}
                    </option>
                    {responsablesDisponibles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre}{r.correo ? ` — ${r.correo}` : ''}
                      </option>
                    ))}
                  </select>
                  {responsablesError && (
                    <p className="text-red-500 text-xs">{responsablesError}</p>
                  )}
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
                    value={correoEncargado}
                    placeholder="Se completa con el encargado seleccionado"
                    readOnly
                    aria-readonly="true"
                    tabIndex={-1}
                    className={`${inputClass(false)} bg-gray-50 text-gray-500 cursor-default`}
                  />
                  <p className="text-xs text-gray-400">Solo lectura. Corresponde al encargado seleccionado.</p>
                </div>
              </div>
            )}
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
              onClick={() => (onVolver ? onVolver() : router.push(ROUTES.pipeline))}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
                text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
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
    </div>
  )
}
