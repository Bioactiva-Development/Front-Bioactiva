import { Plantilla, PlantillaFormData } from '@/types/plantilla.types'

const MOCK_PLANTILLAS: Plantilla[] = [
    {
        id:        1,
        nombre:    'Confirmación de reunión',
        asunto:    'Confirmación: Reunión con {{nombre_organizacion}} — {{fecha_actividad}}',
        cuerpo:    '<p>Estimado/a {{nombre_contacto}},</p><p>Le confirmamos la reunión programada para el <strong>{{fecha_actividad}}</strong>. En esta sesión abordaremos los avances relacionados a {{servicio_interes}}.</p><p>Cualquier consulta, comuníquese con {{nombre_encargado}}.</p><p>Saludos cordiales,<br/>Equipo BioActiva</p>',
        activo:    true,
        createdAt: '2025-01-14T08:00:00Z',
        updatedAt: '2025-01-14T08:00:00Z',
    },
    {
        id:        2,
        nombre:    'Seguimiento post-llamada',
        asunto:    'Seguimiento a nuestra llamada — {{nombre_organizacion}}',
        cuerpo:    '<p>Estimado/a {{nombre_contacto}},</p><p>Gracias por su tiempo en nuestra llamada de hoy. Como conversamos, el siguiente paso es {{servicio_interes}}.</p><p>Quedamos a su disposición para cualquier consulta.</p><p>Saludos,<br/>{{nombre_encargado}}<br/>Equipo BioActiva</p>',
        activo:    true,
        createdAt: '2025-01-19T08:00:00Z',
        updatedAt: '2025-01-19T08:00:00Z',
    },
    {
        id:        3,
        nombre:    'Propuesta enviada',
        asunto:    'Propuesta técnica — {{servicio_interes}} para {{nombre_organizacion}}',
        cuerpo:    '<p>Estimado/a {{nombre_contacto}},</p><p>Adjuntamos la propuesta técnica para {{servicio_interes}}. El estado actual de su oportunidad es: {{estado_lead}}.</p><p>Para cualquier consulta, no dude en contactarnos.</p><p>Saludos cordiales,<br/>{{nombre_encargado}}<br/>Equipo BioActiva</p>',
        activo:    true,
        createdAt: '2025-01-31T08:00:00Z',
        updatedAt: '2025-01-31T08:00:00Z',
    },
    {
        id:        4,
        nombre:    'Recordatorio de actividad próxima',
        asunto:    'Recordatorio: actividad el {{fecha_actividad}} con {{nombre_organizacion}}',
        cuerpo:    '<p>Hola {{nombre_encargado}},</p><p>Te recordamos que tienes una actividad programada para <strong>{{fecha_actividad}}</strong> con {{nombre_organizacion}}.</p><p>Servicio: {{servicio_interes}}<br/>Estado del lead: {{estado_lead}}</p><p>Por favor revisa el detalle en el CRM.<br/>Equipo BioActiva</p>',
        activo:    true,
        createdAt: '2025-02-14T08:00:00Z',
        updatedAt: '2025-02-14T08:00:00Z',
    },
    {
        id:        5,
        nombre:    'Cierre exitoso — agradecimiento',
        asunto:    '¡Felicitaciones! Proyecto aprobado — {{nombre_organizacion}}',
        cuerpo:    '<p>Estimado/a {{nombre_contacto}},</p><p>Nos complace informarle que su proyecto ha sido aprobado exitosamente.</p><p>Servicio: {{servicio_interes}}<br/>Estado: {{estado_lead}}</p><p>Nuestro equipo estará en contacto para coordinar los siguientes pasos.</p><p>Saludos cordiales,<br/>{{nombre_encargado}}<br/>Equipo BioActiva</p>',
        activo:    true,
        createdAt: '2025-02-28T08:00:00Z',
        updatedAt: '2025-02-28T08:00:00Z',
    },
    {
        id:        6,
        nombre:    'Reactivación de lead inactivo',
        asunto:    'Retomamos contacto — {{nombre_organizacion}}',
        cuerpo:    '<p>Estimado/a {{nombre_contacto}},</p><p>Han pasado algunos días desde nuestro último contacto sobre {{servicio_interes}}. Nos gustaría retomar la conversación.</p><p>Quedamos atentos a su respuesta.</p><p>Saludos,<br/>{{nombre_encargado}}<br/>Equipo BioActiva</p>',
        activo:    false,
        createdAt: '2025-03-09T08:00:00Z',
        updatedAt: '2025-04-01T10:00:00Z',
    },
    {
        id:        7,
        nombre:    'Recordatorio de pendiente interno',
        asunto:    'Pendiente: {{servicio_interes}} — {{nombre_organizacion}}',
        cuerpo:    '<p>Hola {{nombre_encargado}},</p><p>Tienes una actividad pendiente con {{nombre_organizacion}} sobre {{servicio_interes}}.</p><p>Estado del lead: {{estado_lead}}<br/>Fecha actividad: {{fecha_actividad}}</p><p>Por favor actualiza el estado en el CRM.<br/>Equipo BioActiva</p>',
        activo:    true,
        createdAt: '2025-03-31T08:00:00Z',
        updatedAt: '2025-03-31T08:00:00Z',
    },
]

// IDs que simulan estar asociados a notificaciones (no se pueden eliminar)
const EN_USO_IDS = new Set([1, 4])

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockGetPlantillas = async (
    includeInactive = false,
): Promise<Plantilla[]> => {
    await delay()
    return includeInactive
        ? [...MOCK_PLANTILLAS]
        : MOCK_PLANTILLAS.filter((p) => p.activo)
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
    return { ...plantilla }
}

export const mockCreatePlantilla = async (
    data: PlantillaFormData,
): Promise<Plantilla> => {
    await delay()
    const existe = MOCK_PLANTILLAS.find(
        (p) => p.nombre.toLowerCase() === data.nombre.toLowerCase(),
    )
    if (existe) {
        throw Object.assign(
            new Error('Ya existe una plantilla con ese nombre.'),
            { status: 409 },
        )
    }
    const nueva: Plantilla = {
        id:        Date.now(),
        nombre:    data.nombre,
        asunto:    data.asunto,
        cuerpo:    data.cuerpo,
        activo:    data.activo ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
    MOCK_PLANTILLAS.push(nueva)
    return { ...nueva }
}

export const mockUpdatePlantilla = async (
    id: number,
    data: Partial<PlantillaFormData>,
): Promise<Plantilla> => {
    await delay()
    const index = MOCK_PLANTILLAS.findIndex((p) => p.id === id)
    if (index === -1) {
        throw Object.assign(new Error('Plantilla no encontrada.'), { status: 404 })
    }
    if (data.nombre) {
        const existe = MOCK_PLANTILLAS.find(
            (p) => p.nombre.toLowerCase() === data.nombre!.toLowerCase() && p.id !== id,
        )
        if (existe) {
            throw Object.assign(
                new Error('Ya existe una plantilla con ese nombre.'),
                { status: 409 },
            )
        }
    }
    const actualizada: Plantilla = {
        ...MOCK_PLANTILLAS[index],
        ...data,
        updatedAt: new Date().toISOString(),
    }
    MOCK_PLANTILLAS[index] = actualizada
    return { ...actualizada }
}

export const mockDeletePlantilla = async (id: number): Promise<void> => {
    await delay()
    const plantilla = MOCK_PLANTILLAS.find((p) => p.id === id)
    if (!plantilla) {
        throw Object.assign(new Error('Plantilla no encontrada.'), { status: 404 })
    }
    if (EN_USO_IDS.has(id)) {
        throw Object.assign(
            new Error('No se puede eliminar la plantilla porque está asociada a una notificación. Desactívela en su lugar.'),
            { status: 409 },
        )
    }
    const index = MOCK_PLANTILLAS.findIndex((p) => p.id === id)
    MOCK_PLANTILLAS.splice(index, 1)
}
