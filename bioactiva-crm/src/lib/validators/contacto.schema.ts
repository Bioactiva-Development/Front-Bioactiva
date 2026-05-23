import { z } from 'zod'
import { Vocativo } from '@/types/enums'

export const contactoSchema = z.object({
  nombres: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(90, 'Máximo 90 caracteres'),

  apellidos: z
    .string()
    .min(1, 'El apellido es obligatorio')
    .max(90, 'Máximo 90 caracteres'),

  vocativo: z
    .nativeEnum(Vocativo)
    .optional(),

  cargo: z
    .string()
    .max(120, 'Máximo 120 caracteres')
    .optional()
    .or(z.literal('')),

  correo: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Ingrese un correo válido')
    .max(254, 'Máximo 254 caracteres'),

  correo2: z
    .string()
    .email('Ingrese un correo válido')
    .max(254, 'Máximo 254 caracteres')
    .optional()
    .or(z.literal('')),

  telefono: z
    .string()
    .max(20, 'Máximo 20 caracteres')
    .optional()
    .or(z.literal('')),

  comentarios: z
    .string()
    .max(500, 'Máximo 500 caracteres')
    .optional()
    .or(z.literal('')),

  id_organizacion: z
    .string()
    .min(1, 'La organización es obligatoria'),
})

export type ContactoFormValues = z.infer<typeof contactoSchema>