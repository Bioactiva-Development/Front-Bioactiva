import { z } from 'zod'


export const recordatorioSchema = z.object({
  id_lead: z
    .number({ error: 'El lead es obligatorio' })
    .min(1, 'Debe seleccionar un lead'),

  id_actividad: z
    .number({ error: 'La actividad es obligatoria' }),

  id_plantilla: z
    .number({ error: 'La plantilla es obligatoria' })
    .min(1, 'Debe seleccionar una plantilla'),

  fecha_envio: z
    .string()
    .min(1, 'La fecha de envío es obligatoria'),

  hora_envio: z
    .string()
    .min(1, 'La hora de envío es obligatoria'),

  asunto: z
    .string()
    .min(1, 'El asunto es obligatorio')
    .max(255, 'Máximo 255 caracteres'),

  cuerpo: z
    .string()
    .min(1, 'El cuerpo es obligatorio'),
})

export type RecordatorioFormValues = z.infer<typeof recordatorioSchema>

export const seguimientoSchema = z.object({
  id_lead: z
    .number({ error: 'El lead es obligatorio' })
    .min(1, 'Debe seleccionar un lead'),

  id_actividad: z
    .number({ error: 'La actividad es obligatoria' }),

  id_plantilla_interno: z
    .number({ error: 'La plantilla interna es obligatoria' })
    .min(1, 'Debe seleccionar una plantilla para el responsable'),

  fecha_envio_interno: z
    .string()
    .min(1, 'La fecha del correo interno es obligatoria'),

  hora_envio_interno: z
    .string()
    .min(1, 'La hora del correo interno es obligatoria'),

  asunto_interno: z
    .string()
    .min(1, 'El asunto interno es obligatorio'),

  cuerpo_interno: z
    .string()
    .min(1, 'El cuerpo interno es obligatorio'),

  id_plantilla_externo: z
    .number({ error: 'La plantilla externa es obligatoria' })
    .min(1, 'Debe seleccionar una plantilla para el cliente'),

  fecha_envio_externo: z
    .string()
    .min(1, 'La fecha del correo externo es obligatoria'),

  hora_envio_externo: z
    .string()
    .min(1, 'La hora del correo externo es obligatoria'),

  asunto_externo: z
    .string()
    .min(1, 'El asunto externo es obligatorio'),

  cuerpo_externo: z
    .string()
    .min(1, 'El cuerpo externo es obligatorio'),

  correo_cliente: z
    .email('Correo del cliente inválido')
    .min(1, 'El correo del cliente es obligatorio'),
})

.refine(
  (data) => {
    if (!data.fecha_envio_interno || !data.fecha_envio_externo) return true
    const interno = new Date(`${data.fecha_envio_interno}T${data.hora_envio_interno}`)
    const externo = new Date(`${data.fecha_envio_externo}T${data.hora_envio_externo}`)
    return externo > interno
  },
  {
    message: 'El correo al cliente debe programarse después del recordatorio interno',
    path:    ['fecha_envio_externo'],
  }
)

export type SeguimientoFormValues = z.infer<typeof seguimientoSchema>