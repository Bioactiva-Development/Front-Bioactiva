import { z } from 'zod'

export const plantillaSchema = z.object({
    nombre: z
        .string()
        .trim()
        .min(1, 'El nombre es obligatorio')
        .max(100, 'Máximo 100 caracteres'),

    asunto: z
        .string()
        .trim()
        .min(1, 'El asunto es obligatorio')
        .max(255, 'Máximo 255 caracteres'),

    cuerpo: z
        .string()
        .trim()
        .min(1, 'El cuerpo del mensaje es obligatorio'),

    activo: z.boolean().optional(),
})

export type PlantillaFormValues = z.infer<typeof plantillaSchema>
