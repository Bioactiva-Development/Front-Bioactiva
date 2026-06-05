import { Plantilla, PlantillaFiltros } from '@/types/plantilla.types'

const MOCK_PLANTILLAS: Plantilla[] = [
  {
    id:         1,
    nombre:     'Confirmación de reunión',
    asunto:     'Confirmación: Reunión con {{nombre_organizacion}} — {{fecha_actividad}}',
    cuerpo:     `Estimado/a {{nombre_contacto}},\n\nLe confirmamos la reunión programada para el {{fecha_actividad}}.\n\nEn esta sesión abordaremos los avances relacionados a {{servicio_interes}}.\n\nLe pedimos presentarse con 5 minutos de anticipación. Cualquier consulta, comuníquese con {{nombre_encargado}}.\n\nSaludos cordiales,\nEquipo BioActiva`,
    categoria:  'Reunion',
    uso:        'Solo Seguimiento',
    activo:     true,
    en_uso:     true,
    autor:      'Karien Diaz',
    created_at: '2025-01-14T08:00:00Z',
    updated_at: '2025-01-14T08:00:00Z',
  },
  {
    id:         2,
    nombre:     'Seguimiento post-llamada',
    asunto:     'Seguimiento a nuestra llamada — {{nombre_organizacion}}',
    cuerpo:     `Estimado/a {{nombre_contacto}},\n\nGracias por su tiempo en nuestra llamada de hoy.\n\nComo conversamos, el siguiente paso es {{servicio_interes}}.\n\nQuedamos a su disposición para cualquier consulta.\n\nSaludos,\n{{nombre_encargado}}\nEquipo BioActiva`,
    categoria:  'Llamada',
    uso:        'Ambos',
    activo:     true,
    en_uso:     false,
    autor:      'Luis Torres',
    created_at: '2025-01-19T08:00:00Z',
    updated_at: '2025-01-19T08:00:00Z',
  },
  {
    id:         3,
    nombre:     'Propuesta enviada',
    asunto:     'Propuesta técnica — {{servicio_interes}} para {{nombre_organizacion}}',
    cuerpo:     `Estimado/a {{nombre_contacto}},\n\nAdjuntamos la propuesta técnica para {{servicio_interes}}.\n\nEl estado actual de su oportunidad es: {{estado_lead}}.\n\nPara cualquier consulta, no dude en contactarnos.\n\nSaludos cordiales,\n{{nombre_encargado}}\nEquipo BioActiva`,
    categoria:  'Email',
    uso:        'Solo Seguimiento',
    activo:     true,
    en_uso:     false,
    autor:      'Administración',
    created_at: '2025-01-31T08:00:00Z',
    updated_at: '2025-01-31T08:00:00Z',
  },
  {
    id:         4,
    nombre:     'Recordatorio de actividad próxima',
    asunto:     'Recordatorio: {{servicio_interes}} — actividad el {{fecha_actividad}}',
    cuerpo:     `Hola {{nombre_encargado}},\n\nTe recordamos que tienes una actividad programada para {{fecha_actividad}} con {{nombre_organizacion}}.\n\nServicio: {{servicio_interes}}\nEstado del lead: {{estado_lead}}\n\nPor favor revisa el detalle en el CRM.\n\nEquipo BioActiva`,
    categoria:  'Reunion',
    uso:        'Solo Recordatorio',
    activo:     true,
    en_uso:     true,
    autor:      'Karien Diaz',
    created_at: '2025-02-14T08:00:00Z',
    updated_at: '2025-02-14T08:00:00Z',
  },
  {
    id:         5,
    nombre:     'Cierre exitoso — agradecimiento',
    asunto:     '¡Felicitaciones! Proyecto aprobado — {{nombre_organizacion}}',
    cuerpo:     `Estimado/a {{nombre_contacto}},\n\nNos complace informarle que su proyecto ha sido aprobado exitosamente.\n\nServicio: {{servicio_interes}}\nEstado: {{estado_lead}}\n\nNuestro equipo estará en contacto para coordinar los siguientes pasos.\n\nSaludos cordiales,\n{{nombre_encargado}}\nEquipo BioActiva`,
    categoria:  'Email',
    uso:        'Solo Seguimiento',
    activo:     true,
    en_uso:     false,
    autor:      'Administración',
    created_at: '2025-02-28T08:00:00Z',
    updated_at: '2025-02-28T08:00:00Z',
  },
  {
    id:         6,
    nombre:     'Reactivación de lead inactivo',
    asunto:     'Retomamos contacto — {{nombre_organizacion}}',
    cuerpo:     `Estimado/a {{nombre_contacto}},\n\nHan pasado algunos días desde nuestro último contacto sobre {{servicio_interes}}.\n\nNos gustaría retomar la conversación y conocer si podemos apoyarle.\n\nQuedamos atentos a su respuesta.\n\nSaludos,\n{{nombre_encargado}}\nEquipo BioActiva`,
    categoria:  'Otro',
    uso:        'Ambos',
    activo:     true,
    en_uso:     false,
    autor:      'Administración',
    created_at: '2025-03-09T08:00:00Z',
    updated_at: '2025-03-09T08:00:00Z',
  },
  {
    id:         7,
    nombre:     'Recordatorio de pendiente interno',
    asunto:     'Pendiente: {{servicio_interes}} — {{nombre_organizacion}}',
    cuerpo:     `Hola {{nombre_encargado}},\n\nTienes una actividad pendiente con {{nombre_organizacion}} sobre {{servicio_interes}}.\n\nEstado del lead: {{estado_lead}}\nFecha actividad: {{fecha_actividad}}\n\nPor favor actualiza el estado en el CRM.\n\nEquipo BioActiva`,
    categoria:  'Otro',
    uso:        'Solo Recordatorio',
    activo:     true,
    en_uso:     false,
    autor:      'Administración',
    created_at: '2025-03-31T08:00:00Z',
    updated_at: '2025-03-31T08:00:00Z',
  },
]

const delay = (ms: number = 600) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const mockGetPlantillas = async (
  filtros?: PlantillaFiltros
): Promise<Plantilla[]> => {
  await delay()

  let resultado = [...MOCK_PLANTILLAS]

  if (filtros?.search) {
    const q = filtros.search.toLowerCase()
    resultado = resultado.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.asunto.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q)
    )
  }

  if (filtros?.categoria) {
    resultado = resultado.filter((p) => p.categoria === filtros.categoria)
  }

  if (filtros?.activo !== undefined) {
    resultado = resultado.filter((p) => p.activo === filtros.activo)
  }

  return resultado
}

export const mockGetPlantillasActivas = async (): Promise<Plantilla[]> => {
  await delay(300)
  return MOCK_PLANTILLAS.filter((p) => p.activo)
}

export const mockGetPlantilla = async (id: number): Promise<Plantilla> => {
  await delay(400)
  const plantilla = MOCK_PLANTILLAS.find((p) => p.id === id)
  if (!plantilla) {
    throw Object.assign(new Error('Plantilla no encontrada.'), { status: 404 })
  }
  return plantilla
}

export const mockCreatePlantilla = async (
  data: Partial<Plantilla>
): Promise<Plantilla> => {
  await delay()

  const existe = MOCK_PLANTILLAS.find(
    (p) => p.nombre.toLowerCase() === data.nombre?.toLowerCase()
  )
  if (existe) {
    throw Object.assign(new Error('Ya existe una plantilla con este nombre.'), { status: 409 })
  }

  const nueva: Plantilla = {
    id:         Date.now(),
    nombre:     data.nombre!,
    asunto:     data.asunto!,
    cuerpo:     data.cuerpo!,
    categoria:  data.categoria!,
    uso:        data.uso!,
    activo:     data.activo ?? true,
    en_uso:     false,
    autor:      'Administración',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  MOCK_PLANTILLAS.push(nueva)
  return nueva
}

export const mockUpdatePlantilla = async (
  id: number,
  data: Partial<Plantilla>
): Promise<Plantilla> => {
  await delay()

  const index = MOCK_PLANTILLAS.findIndex((p) => p.id === id)
  if (index === -1) {
    throw Object.assign(new Error('Plantilla no encontrada.'), { status: 404 })
  }

  if (data.nombre) {
    const existe = MOCK_PLANTILLAS.find(
      (p) => p.nombre.toLowerCase() === data.nombre!.toLowerCase() && p.id !== id
    )
    if (existe) {
      throw Object.assign(new Error('Ya existe una plantilla con este nombre.'), { status: 409 })
    }
  }

  const actualizada = {
    ...MOCK_PLANTILLAS[index],
    ...data,
    updated_at: new Date().toISOString(),
  }

  MOCK_PLANTILLAS[index] = actualizada
  return actualizada
}

export const mockDeletePlantilla = async (id: number): Promise<void> => {
  await delay()

  const plantilla = MOCK_PLANTILLAS.find((p) => p.id === id)
  if (!plantilla) {
    throw Object.assign(new Error('Plantilla no encontrada.'), { status: 404 })
  }

  if (plantilla.en_uso) {
    throw Object.assign(
      new Error('La plantilla está siendo utilizada y no puede eliminarse. Reintente la eliminación, cuando deje de estar en uso.'),
      { status: 409 }
    )
  }

  const index = MOCK_PLANTILLAS.findIndex((p) => p.id === id)
  MOCK_PLANTILLAS.splice(index, 1)
}