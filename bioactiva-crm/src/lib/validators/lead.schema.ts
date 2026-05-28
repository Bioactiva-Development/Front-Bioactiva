import { z } from 'zod'
import { LeadState } from '@/types/enums'

export const leadSchema = z.object({
  id_org: z
    .string()
    .min(1, 'La organización es obligatoria'),

  id_contacto: z
    .number()
    .optional(),

  estado: z.nativeEnum(LeadState, {
    error: 'El estado es obligatorio',
  }),

  servicio_interes: z
    .string()
    .min(1, 'El servicio de interés es obligatorio')
    .max(120, 'Máximo 120 caracteres'),

  comentarios: z
    .string()
    .max(500, 'Máximo 500 caracteres')
    .optional()
    .or(z.literal('')),

  desafio_oportunidad: z
    .string()
    .max(500, 'Máximo 500 caracteres')
    .optional()
    .or(z.literal('')),

  notas_contacto: z
    .string()
    .max(1000, 'Máximo 1000 caracteres')
    .optional()
    .or(z.literal('')),

  id_encargado: z
    .number({ error: 'El encargado es obligatorio' })
    .min(1, 'El encargado es obligatorio'),

  encargado_correo: z
    .string()
    .email('Ingrese un correo válido')
    .optional()
    .or(z.literal('')),

  canal_captacion: z
    .string()
    .max(60, 'Máximo 60 caracteres')
    .optional()
    .or(z.literal('')),

  fecha_cierre: z
    .string()
    .optional()
    .or(z.literal('')),

  proxima_actividad: z
    .string()
    .max(120, 'Máximo 120 caracteres')
    .optional()
    .or(z.literal('')),

  fecha_proxima_actividad: z
    .string()
    .optional()
    .or(z.literal('')),
})

export type LeadFormValues = z.infer<typeof leadSchema>