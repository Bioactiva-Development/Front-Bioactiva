import { z } from 'zod'

const templateIdSchema = z
  .number()
  .int()
  .nonnegative('La plantilla seleccionada no es válida')

const fechaEnvioSchema = z
  .string()
  .min(1, 'La fecha y hora son obligatorias')
  .refine(
    (value) => Number.isFinite(new Date(value).getTime()),
    'La fecha y hora no es válida'
  )

const getTime = (value: string) => new Date(value).getTime()

export const recordatorioSchema = z.object({
  idLead: z
    .number({ error: 'El lead es obligatorio' })
    .int()
    .min(1, 'Debe seleccionar un lead'),
  minutosAntes: z
    .number({ error: 'Los minutos de anticipación son obligatorios' })
    .int('Los minutos deben ser un número entero')
    .min(1, 'El mínimo es 1 minuto')
    .max(120, 'El máximo es 120 minutos'),
  idTemplate: templateIdSchema,
  asunto: z
    .string()
    .trim()
    .min(1, 'El asunto es obligatorio')
    .max(255, 'Máximo 255 caracteres'),
  cuerpo: z.string().trim().min(1, 'El cuerpo es obligatorio'),
})

export type RecordatorioFormValues = z.infer<typeof recordatorioSchema>

const mensajeSeguimientoSchema = z.object({
  fechaEnvio: fechaEnvioSchema,
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
    ({ internal, external }) => {
      const internalTime = getTime(internal.fechaEnvio)
      const externalTime = getTime(external.fechaEnvio)
      if (!Number.isFinite(internalTime) || !Number.isFinite(externalTime)) {
        return true
      }
      return externalTime > internalTime
    },
    {
      message: 'El correo al cliente debe enviarse después del correo interno',
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
