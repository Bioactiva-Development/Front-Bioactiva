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
        .enum(Object.values(Vocativo) as [Vocativo, ...Vocativo[]])
        .optional(),

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

    // El formulario acepta solo los 9 dígitos locales; el form antepone +51 antes
    // de enviar al backend (que sigue exigiendo ^\+\d[\d\s]*$).
    telefono: z
        .string()
        .regex(/^\d{9}$/, 'Ingresa los 9 dígitos del número (sin +51)')
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
