import { z } from 'zod'

const templateIdSchema = z
  .number()
  .int()
  .nonnegative('La plantilla seleccionada no es válida')

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
  fechaEnvio: z.string().min(1, 'La fecha y hora son obligatorias'),
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
      new Date(external.fechaEnvio).getTime() >
      new Date(internal.fechaEnvio).getTime(),
    {
      message: 'El correo al cliente debe enviarse después del correo interno',
      path: ['external', 'fechaEnvio'],
    }
  )

export const seguimientoSchema = z
  .object({
    idLead: z
      .number({ error: 'El lead es obligatorio' })
      .int()
      .min(1, 'Debe seleccionar un lead'),
    correoCliente: z
      .email('Correo del cliente inválido')
      .min(1, 'El correo del cliente es obligatorio'),
    instancias: z
      .array(instanciaSeguimientoSchema)
      .min(1, 'Debe agregar al menos una instancia')
      .max(3, 'Solo se permiten hasta 3 instancias'),
  })
  .superRefine(({ instancias }, ctx) => {
    for (let index = 0; index < instancias.length - 1; index += 1) {
      const actual = instancias[index]
      const siguiente = instancias[index + 1]
      if (
        new Date(actual.external.fechaEnvio).getTime() >=
        new Date(siguiente.internal.fechaEnvio).getTime()
      ) {
        ctx.addIssue({
          code: 'custom',
          message:
            'Cada instancia debe comenzar después del correo externo anterior',
          path: ['instancias', index + 1, 'internal', 'fechaEnvio'],
        })
      }
    }
  })

export type SeguimientoFormValues = z.infer<typeof seguimientoSchema>
