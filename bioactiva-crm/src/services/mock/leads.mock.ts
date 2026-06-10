import { LeadState, TipoActividad, EstadoActividad } from '@/types/enums'
import { Lead, LeadFiltros, LeadsResponse, PipelineData } from '@/types/lead.types'
import { Actividad, ComentarioActividad } from '@/types/actividad.types'
import { getLeadAlertLabel } from '@/lib/utils/activity-flow.utils'
import { mockGetOrganizacion } from '@/services/mock/organizaciones.mock'
import { mockGetContacto } from '@/services/mock/contactos.mock'

const MOCK_LEADS: Lead[] = [
  {
    id:                  1,
    codigo:              'LEAD-2025-003',
    id_org:              'org-003',
    id_contacto:         13,
    estado:              LeadState.Prospecto,
    servicio_interes:    'Beneficios tributarios Ley 30309',
    comentarios:         'Interesados en conocer los beneficios de la ley de I+D',
    desafio_oportunidad: 'Reducir carga tributaria mediante proyectos I+D',
    id_encargado:        1,
    canal_captacion:     'Referido',
    sector:              'ADMINISTRACION_PUBLICA',
    tipo_org:            'Publica',
    tamano:              'Grande',
    id_author:           1,
    created_at:          '2025-03-01T08:00:00Z',
    updated_at:          '2025-03-01T08:00:00Z',
    organizacion_nombre: 'Municipalidad de Miraflores',
    contacto_nombre:     'Jorge Mamani Quispe',
    encargado_nombre:    'Karien Diaz',
    encargado_correo:    'kdiaz@bioactiva.pe',
    tiene_alerta:        true,
  },
  {
    id:                  2,
    codigo:              'LEAD-2026-001',
    id_org:              'org-004',
    estado:              LeadState.Prospecto,
    servicio_interes:    'Ley 30309 - Deducción I+D+i',
    comentarios:         'Startup de tecnología agrícola con potencial',
    id_encargado:        4,
    canal_captacion:     'Web / Redes sociales',
    sector:              'TECNOLOGIA',
    tipo_org:            'Privada',
    tamano:              'Pequena',
    id_author:           2,
    created_at:          '2026-01-15T08:00:00Z',
    updated_at:          '2026-01-15T08:00:00Z',
    organizacion_nombre: 'AgroTech Innova',
    encargado_nombre:    'Carlos Mamani',
    encargado_correo:    'cmamani@bioactiva.pe',
    tiene_alerta:        false,
  },
  {
    id:                  3,
    codigo:              'LEAD-2025-005',
    id_org:              'org-005',
    id_contacto:         10,
    estado:              LeadState.Ofertado,
    servicio_interes:    'Ley 30309 - Deducción I+D+i',
    comentarios:         'Empresa interesada en deducción tributaria',
    desafio_oportunidad: 'Optimizar procesos de producción con I+D',
    id_encargado:        2,
    canal_captacion:     'Prospección directa',
    sector:              'MANUFACTURA',
    tipo_org:            'Privada',
    tamano:              'Mediana',
    id_author:           1,
    created_at:          '2025-04-01T08:00:00Z',
    updated_at:          '2025-04-01T08:00:00Z',
    organizacion_nombre: 'Inversiones Pisco S.A.',
    contacto_nombre:     'Milagros Panduro Reátegui',
    encargado_nombre:    'Luis Torres',
    encargado_correo:    'ltorres@bioactiva.pe',
    tiene_alerta:        true,
  },
  {
    id:                  4,
    codigo:              'LEAD-2025-008',
    id_org:              'org-001',
    id_contacto:         4,
    estado:              LeadState.Ofertado,
    servicio_interes:    'Diagnóstico de innovación y hoja de ruta tecnológica',
    comentarios:         'Cliente con alta prioridad',
    desafio_oportunidad: 'Transformación digital y gestión de innovación',
    id_encargado:        3,
    canal_captacion:     'Referido',
    sector:              'AGROALIMENTARIA',
    tipo_org:            'Privada',
    tamano:              'Grande',
    id_author:           1,
    created_at:          '2025-03-15T08:00:00Z',
    updated_at:          '2025-04-03T08:00:00Z',
    organizacion_nombre: 'Altomayo',
    contacto_nombre:     'Patricia Ccopa Mamani',
    encargado_nombre:    'Administración',
    encargado_correo:    'admin@bioactiva.pe',
    tiene_alerta:        true,
  },
]


const MOCK_ACTIVIDADES: Actividad[] = [
  {
    id:                     1,
    id_lead:                1,
    id_responsable:         1,
    nombre_actividad:       'Llamada de seguimiento inicial',
    fecha_inicio:           '2025-03-05T09:00:00Z',
    fecha_fin:              '2025-03-05T10:00:00Z',
    tipo:                   TipoActividad.Llamada,
    estado:                 EstadoActividad.Completada,
    notas:                  'Se coordinó reunión para la próxima semana',
    outlook_imported:       false,
    seguimiento_automatico: false,
    id_author:              1,
    created_at:             '2025-03-05T08:00:00Z',
    updated_at:             '2025-03-05T10:00:00Z',
    responsable_nombre:     'Karien Diaz',
  },
  {
    id:                     2,
    id_lead:                1,
    id_responsable:         1,
    nombre_actividad:       'Reunión de presentación',
    fecha_inicio:           '2025-03-10T10:00:00Z',
    fecha_fin:              '2025-03-10T11:00:00Z',
    tipo:                   TipoActividad.Reunion,
    estado:                 EstadoActividad.Pendiente,
    notas:                  'Presentar propuesta de servicios',
    outlook_imported:       false,
    seguimiento_automatico: false,
    id_author:              1,
    created_at:             '2025-03-08T08:00:00Z',
    updated_at:             '2025-03-08T08:00:00Z',
    responsable_nombre:     'Karien Diaz',
  },
  {
    id:                     3,
    id_lead:                4,
    id_responsable:         1,
    nombre_actividad:       'Envío de propuesta técnica',
    fecha_inicio:           '2025-04-01T09:00:00Z',
    fecha_fin:              '2025-04-01T10:00:00Z',
    tipo:                   TipoActividad.Email,
    estado:                 EstadoActividad.Completada,
    notas:                  'Propuesta enviada y confirmada',
    outlook_imported:       false,
    seguimiento_automatico: false,
    id_author:              1,
    created_at:             '2025-04-01T08:00:00Z',
    updated_at:             '2025-04-01T10:00:00Z',
    responsable_nombre:     'Administración',
  },
  {
    id:                     4,
    id_lead:                4,
    id_responsable:         1,
    nombre_actividad:       'Seguimiento post-propuesta',
    fecha_inicio:           '2025-04-10T09:00:00Z',
    fecha_fin:              '2025-04-10T10:00:00Z',
    tipo:                   TipoActividad.Llamada,
    estado:                 EstadoActividad.Pendiente,
    outlook_imported:       false,
    seguimiento_automatico: false,
    id_author:              1,
    created_at:             '2025-04-05T08:00:00Z',
    updated_at:             '2025-04-05T08:00:00Z',
    responsable_nombre:     'Administración',
  },
]

const MOCK_COMENTARIOS: ComentarioActividad[] = [
  {
    id:           1,
    id_actividad: 1,
    texto:        'Llamada exitosa, cliente muy interesado en los servicios',
    autor:        'Karien Diaz',
    created_at:   '2025-03-05T10:00:00Z',
  },
  {
    id:           2,
    id_actividad: 3,
    texto:        'Propuesta enviada con éxito, esperamos respuesta en 5 días hábiles',
    autor:        'Administración',
    created_at:   '2025-04-01T10:00:00Z',
  },
]

const delay = (ms: number = 600) =>
  new Promise((resolve) => setTimeout(resolve, ms))

const RESPONSABLES_MOCK: Record<number, { nombre: string; correo: string }> = {
  1: { nombre: 'Karien Diaz', correo: 'kdiaz@bioactiva.pe' },
  2: { nombre: 'Luis Torres', correo: 'ltorres@bioactiva.pe' },
  3: { nombre: 'Administración', correo: 'admin@bioactiva.pe' },
  4: { nombre: 'Carlos Mamani', correo: 'cmamani@bioactiva.pe' },
}

const withAlertState = (lead: Lead): Lead => {
  const alertLabel = getLeadAlertLabel(
    lead,
    MOCK_ACTIVIDADES.filter((actividad) => actividad.id_lead === lead.id)
  )

  return {
    ...lead,
    tiene_alerta: Boolean(alertLabel),
    alerta_motivo: alertLabel ?? undefined,
  }
}

export const mockGetPipeline = async (
  filtros?: LeadFiltros
): Promise<PipelineData> => {
  await delay()

  let resultado = MOCK_LEADS.map(withAlertState)

  if (filtros?.search) {
    const q = filtros.search.toLowerCase()
    resultado = resultado.filter(
      (l) =>
        l.codigo.toLowerCase().includes(q) ||
        l.organizacion_nombre?.toLowerCase().includes(q) ||
        l.contacto_nombre?.toLowerCase().includes(q) ||
        l.servicio_interes.toLowerCase().includes(q) ||
        l.encargado_nombre?.toLowerCase().includes(q) ||
        l.encargado_correo?.toLowerCase().includes(q)
    )
  }

  if (filtros?.id_encargado) {
    resultado = resultado.filter(
      (l) => l.id_encargado === filtros.id_encargado
    )
  }

  if (filtros?.estado) {
    resultado = resultado.filter((l) => l.estado === filtros.estado)
  }

  if (filtros?.canal_captacion) {
    resultado = resultado.filter(
      (l) => l.canal_captacion === filtros.canal_captacion
    )
  }

  if (filtros?.solo_alerta) {
    resultado = resultado.filter((l) => l.tiene_alerta)
  }

  return {
    prospecto:      resultado.filter((l) => l.estado === LeadState.Prospecto),
    ofertado:       resultado.filter((l) => l.estado === LeadState.Ofertado),
    cierreVenta:    resultado.filter((l) => l.estado === LeadState.CierreVenta),
    cierreSinVenta: resultado.filter((l) => l.estado === LeadState.CierreSinVenta),
    total:          resultado.length,
  }
}

export const mockGetLeads = async (
  filtros?: LeadFiltros
): Promise<LeadsResponse> => {
  await delay()

  let resultado = MOCK_LEADS.map(withAlertState)

  if (filtros?.search) {
    const q = filtros.search.toLowerCase()
    resultado = resultado.filter(
      (l) =>
        l.codigo.toLowerCase().includes(q) ||
        l.organizacion_nombre?.toLowerCase().includes(q) ||
        l.contacto_nombre?.toLowerCase().includes(q) ||
        l.servicio_interes.toLowerCase().includes(q) ||
        l.encargado_nombre?.toLowerCase().includes(q) ||
        l.encargado_correo?.toLowerCase().includes(q)
    )
  }

  if (filtros?.estado) {
    resultado = resultado.filter((l) => l.estado === filtros.estado)
  }

  if (filtros?.id_encargado) {
    resultado = resultado.filter(
      (l) => l.id_encargado === filtros.id_encargado
    )
  }

  if (filtros?.canal_captacion) {
    resultado = resultado.filter(
      (l) => l.canal_captacion === filtros.canal_captacion
    )
  }

  if (filtros?.solo_alerta) {
    resultado = resultado.filter((l) => l.tiene_alerta)
  }

  const page  = filtros?.page  ?? 1
  const limit = filtros?.limit ?? 10
  const start = (page - 1) * limit
  const data  = resultado.slice(start, start + limit)

  return { data, total: resultado.length, page, limit }
}

export const mockGetLead = async (id: number): Promise<Lead> => {
  await delay(400)

  const lead = MOCK_LEADS.find((l) => l.id === id)
  if (!lead) {
    throw Object.assign(new Error('Lead no encontrado.'), { status: 404 })
  }
  return withAlertState(lead)
}

export const mockCreateLead = async (
  data: Partial<Lead>
): Promise<Lead> => {
  await delay()

  const anio   = new Date().getFullYear()
  const codigo = `LEAD-${anio}-${String(MOCK_LEADS.length + 1).padStart(3, '0')}`
  const responsable = RESPONSABLES_MOCK[data.id_encargado ?? 3]
  const organizacion = data.id_org
    ? await mockGetOrganizacion(data.id_org).catch(() => null)
    : null
  const contacto = data.id_contacto
    ? await mockGetContacto(data.id_contacto).catch(() => null)
    : null

  const nuevo: Lead = {
    id:                  Date.now(),
    codigo,
    id_org:              data.id_org!,
    id_contacto:         data.id_contacto,
    estado:              data.estado ?? LeadState.Prospecto,
    servicio_interes:    data.servicio_interes!,
    comentarios:         data.comentarios,
    desafio_oportunidad: data.desafio_oportunidad,
    notas_contacto:      data.notas_contacto,
    id_encargado:        data.id_encargado!,
    canal_captacion:     data.canal_captacion,
    fecha_cierre:        data.fecha_cierre,
    id_author:           1,
    created_at:          new Date().toISOString(),
    updated_at:          new Date().toISOString(),
    organizacion_nombre: data.organizacion_nombre ?? organizacion?.nombre,
    contacto_nombre:     data.contacto_nombre ??
      (contacto ? `${contacto.nombres} ${contacto.apellidos ?? ''}`.trim() : undefined),
    encargado_nombre:    data.encargado_nombre ?? responsable.nombre,
    encargado_correo:    data.encargado_correo ?? responsable.correo,
    tiene_alerta:        false,
  }

  MOCK_LEADS.push(nuevo)
  return nuevo
}

export const mockUpdateLead = async (
  id: number,
  data: Partial<Lead>
): Promise<Lead> => {
  await delay()

  const index = MOCK_LEADS.findIndex((l) => l.id === id)
  if (index === -1) {
    throw Object.assign(new Error('Lead no encontrado.'), { status: 404 })
  }

  const actualizado = {
    ...MOCK_LEADS[index],
    ...data,
    updated_at: new Date().toISOString(),
  }

  MOCK_LEADS[index] = actualizado
  return withAlertState(actualizado)
}

export const mockUpdateEstadoLead = async (
  id: number,
  estado: LeadState
): Promise<Lead> => {
  return mockUpdateLead(id, { estado })
}

export const mockDeleteLead = async (id: number): Promise<void> => {
  await delay()

  const index = MOCK_LEADS.findIndex((l) => l.id === id)
  if (index === -1) {
    throw { status: 404, message: 'Lead no encontrado.' }
  }

  MOCK_LEADS.splice(index, 1)
}


export const mockGetActividades = async (
  leadId: number
): Promise<Actividad[]> => {
  await delay(400)
  return MOCK_ACTIVIDADES.filter((a) => a.id_lead === leadId)
}

export const mockCreateActividad = async (
  data: Partial<Actividad>
): Promise<Actividad> => {
  await delay()

  const hasPendingActivity = MOCK_ACTIVIDADES.some(
    (actividad) =>
      actividad.id_lead === data.id_lead &&
      actividad.estado === EstadoActividad.Pendiente
  )

  if (hasPendingActivity) {
    throw {
      status: 409,
      message: 'No se puede registrar una nueva actividad mientras exista una actividad pendiente.',
    }
  }

  const nueva: Actividad = {
    id:                     Date.now(),
    id_lead:                data.id_lead!,
    id_responsable:         data.id_responsable!,
    nombre_actividad:       data.nombre_actividad!,
    fecha_inicio:           data.fecha_inicio!,
    fecha_fin:              data.fecha_fin!,
    tipo:                   data.tipo!,
    estado:                 data.estado ?? EstadoActividad.Pendiente,
    notas:                  data.notas,
    outlook_imported:       false,
    seguimiento_automatico: false,
    id_author:              1,
    created_at:             new Date().toISOString(),
    updated_at:             new Date().toISOString(),
    responsable_nombre:     data.responsable_nombre ?? 'Administración',
  }

  MOCK_ACTIVIDADES.push(nueva)
  return nueva
}

export const mockUpdateActividad = async (
  id: number,
  data: Partial<Actividad>
): Promise<Actividad> => {
  await delay()

  const index = MOCK_ACTIVIDADES.findIndex((a) => a.id === id)
  if (index === -1) {
    throw Object.assign(new Error('Actividad no encontrada.'), { status: 404 })
  }

  const actualizada = {
    ...MOCK_ACTIVIDADES[index],
    ...data,
    updated_at: new Date().toISOString(),
  }

  MOCK_ACTIVIDADES[index] = actualizada
  return actualizada
}

export const mockDeleteActividad = async (id: number): Promise<void> => {
  await delay()
  const index = MOCK_ACTIVIDADES.findIndex((a) => a.id === id)
  if (index !== -1) MOCK_ACTIVIDADES.splice(index, 1)
}

export const mockCompleteActividad = async (
  id: number,
  notas?: string
): Promise<Actividad> => {
  const actividad = MOCK_ACTIVIDADES.find((a) => a.id === id)
  const notasFinales = notas?.trim()
    ? [actividad?.notas, `Cierre: ${notas.trim()}`].filter(Boolean).join('\n\n')
    : actividad?.notas

  return mockUpdateActividad(id, {
    estado: EstadoActividad.Completada,
    ...(notasFinales ? { notas: notasFinales } : {}),
  })
}

export const mockCancelarActividad = async (id: number): Promise<Actividad> =>
  mockUpdateActividad(id, {
    estado: EstadoActividad.Cancelada,
  })

export const mockGetComentarios = async (
  actividadId: number
): Promise<ComentarioActividad[]> => {
  await delay(300)
  return MOCK_COMENTARIOS.filter((c) => c.id_actividad === actividadId)
}

export const mockCreateComentario = async (
  actividadId: number,
  texto: string,
  autor: string
): Promise<ComentarioActividad> => {
  await delay()

  const nuevo: ComentarioActividad = {
    id:           Date.now(),
    id_actividad: actividadId,
    texto,
    autor,
    created_at:   new Date().toISOString(),
  }

  MOCK_COMENTARIOS.push(nuevo)
  return nuevo
}
