import { z } from 'zod'
import { TipoEmpresa, TamanoEmpresa, Sector } from '@/types'

export const organizacionSchema = z.object({
    nombre: z
        .string()
        .min(1, 'El nombre es obligatorio')
        .max(120, 'Maximo 120 caracteres'),

    // Backend: obligatorio, máximo 100 caracteres (POST /organizations)
    nombre_comercial: z
        .string()
        .min(1, 'El nombre comercial es obligatorio')
        .max(100, 'Máximo 100 caracteres'),

    ruc: z
        .string()
        .length(11, 'El RUC debe tener 11 dígitos')
        .regex(/^\d{11}$/, 'El RUC debe contener solo números')
        .optional()
        .or(z.literal('')),

    // Backend: obligatorio (POST /organizations), máximo 20 caracteres.
    // Si la organización no tiene RUC, debe generarse un código interno (RN-004).
    codigo_cliente: z
        .string()
        .min(1, 'El código de cliente es obligatorio')
        .max(20, 'Máximo de 20 caracteres'),

    sub_area: z
        .string()
        .max(20, 'Maximo de 20 caracteres')
        .optional(),

    tipo: z.nativeEnum(TipoEmpresa, {
        error: 'El tipo es obligatorio',
    }),

    tamano: z.nativeEnum(TamanoEmpresa, {
        error: 'El tamaño es obligatorio',
    }),

    sector: z.nativeEnum(Sector, {
        error: 'El sector es obligatorio',
    }),

    ubicacion: z
        .string()
        .max(200, 'Maximo de 200 caracteres')
        .optional(),

    actividad_economica: z
        .string()
        .max(200, 'Maximo de 200 caracteres')
        .optional(),

    linkedin: z
        .string()
        .max(255, 'Maximo de 255 caracteres')
        .optional(),

    alianzas_estrategicas: z
        .string()
        .max(300, 'Maximo de 300 caracteres')
        .optional(),

    id_contacto_activo: z
        .number()
        .optional(),

})

export type OrganizacionFormValues = z.infer<typeof organizacionSchema>