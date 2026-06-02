import { z } from 'zod'

export const plantillaSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'Máximo 100 caracteres'),

  asunto: z
    .string()
    .min(1, 'El asunto es obligatorio')
    .max(255, 'Máximo 255 caracteres'),

  cuerpo: z
    .string()
    .min(1, 'El cuerpo del mensaje es obligatorio'),

  categoria: z.enum(
    ['Email', 'Reunion', 'Llamada', 'Otro'] as const,
  ),

  uso: z.enum(
    ['Ambos', 'Solo Recordatorio', 'Solo Seguimiento'] as const,
  ),
  activo: z.boolean(),
})

export type PlantillaFormValues = z.infer<typeof plantillaSchema>