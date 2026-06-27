import { z } from 'zod'
import { Vocativo } from '@/types/enums'

export const contactoSchema = z.object({
    estado_correo: z
        .enum(['VIGENTE', 'VENCIDO'])
        .optional(),

    nombres: z
        .string()
        .min(1, 'El nombre es obligatorio')
        .max(90, 'Máximo 90 caracteres'),

    apellidos: z
        .string()
        .max(90, 'Máximo 90 caracteres')
        .optional()
        .or(z.literal('')),

    vocativo: z
        .enum(Object.values(Vocativo) as [Vocativo, ...Vocativo[]], {
            message: 'El campo Vocativo es obligatorio',
        }),

    cargo: z
        .string()
        .max(120, 'Máximo 120 caracteres')
        .optional()
        .or(z.literal('')),

    correo: z
        .email({ message: 'Ingrese un correo válido' })
        .min(1, 'El correo es obligatorio')
        .max(254, 'Máximo 254 caracteres'),

    correo2: z
        .email({ message: 'Ingrese un correo válido' })
        .max(254, 'Máximo 254 caracteres')
        .optional()
        .or(z.literal('')),

    telefono: z
        .string()
        .regex(/^\d{4,15}$/, 'Ingresa solo los dígitos del número (sin código de país)')
        .optional()
        .or(z.literal('')),

    comentarios: z
        .string()
        .max(500, 'Máximo 500 caracteres')
        .optional()
        .or(z.literal('')),

    idOrganizacion: z
        .string()
        .min(1, 'La organización es obligatoria'),
})

export type ContactoFormValues = z.infer<typeof contactoSchema>
