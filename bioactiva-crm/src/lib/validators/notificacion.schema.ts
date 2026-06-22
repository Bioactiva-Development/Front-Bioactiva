import { z } from 'zod'

const templateIdSchema = z
  .number()
  .int()
  .nonnegative('La plantilla seleccionada no es válida')

const minutosAntesSchema = z
  .number({ error: 'Los minutos de anticipación son obligatorios' })
  .int('Los minutos deben ser un número entero')
  .refine(
    (value) => [15, 30, 60].includes(value),
    'Seleccione 15 minutos, 30 minutos o 1 hora'
  )

export const recordatorioSchema = z.object({
  idLead: z
    .number({ error: 'El lead es obligatorio' })
    .int()
    .min(1, 'Debe seleccionar un lead'),
  minutosAntes: minutosAntesSchema,
  idTemplate: templateIdSchema,
  asunto: z
    .string()
    .trim()
    .min(1, 'El asunto es obligatorio')
    .max(255, 'Máximo 255 caracteres'),
  cuerpo: z.string().trim().min(1, 'El cuerpo es obligatorio'),
})

export type RecordatorioFormValues = z.infer<typeof recordatorioSchema>

const fechaEnvioSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha de envío es obligatoria')

const horaEnvioSchema = z
  .string()
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'La hora de envío es obligatoria')

const mensajeSeguimientoSchema = z.object({
  fechaEnvio: fechaEnvioSchema,
  horaEnvio: horaEnvioSchema,
  idTemplate: templateIdSchema,
  asunto: z
    .string()
    .trim()
    .min(1, 'El asunto es obligatorio')
    .max(255, 'Máximo 255 caracteres'),
  cuerpo: z.string().trim().min(1, 'El cuerpo es obligatorio'),
})

const instanciaSeguimientoSchema = z
  .object({
    internal: mensajeSeguimientoSchema,
    external: mensajeSeguimientoSchema,
  })
  .refine(
    ({ internal, external }) =>
      `${internal.fechaEnvio}T${internal.horaEnvio}` <
      `${external.fechaEnvio}T${external.horaEnvio}`,
    {
      message:
        'La fecha y hora de envío para el usuario debe ser anterior a la fecha y hora de envío para el contacto',
      path: ['external', 'fechaEnvio'],
    }
  )

export const seguimientoSchema = z.object({
  idLead: z
    .number({ error: 'El lead es obligatorio' })
    .int()
    .min(1, 'Debe seleccionar un lead'),
  correoCliente: z
    .email('Correo del cliente inválido')
    .min(1, 'El correo del cliente es obligatorio'),
  // El backend (POST /notifications/follow-ups) exige exactamente una
  // instancia por seguimiento: un correo interno y luego uno externo.
  instancias: z
    .array(instanciaSeguimientoSchema)
    .length(1, 'El seguimiento debe tener exactamente una instancia'),
})

export type SeguimientoFormValues = z.infer<typeof seguimientoSchema>
