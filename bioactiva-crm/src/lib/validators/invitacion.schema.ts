import { z } from 'zod'

export const createInvitacionSchema = z.object({
    correo: z
        .string()
        .min(1, 'El correo es obligatorio')
        .email('Ingrese un correo válido'),
    rol: z
        .number()
        .int()
        .min(1, 'Seleccione un rol válido'),
})

export type CreateInvitacionFormValues = z.infer<typeof createInvitacionSchema>

export const acceptInvitacionSchema = z
    .object({
        nombres: z
            .string()
            .min(1, 'El nombre es obligatorio')
            .max(90, 'Máximo 90 caracteres'),
        apellidos: z
            .string()
            .min(1, 'Los apellidos son obligatorios')
            .max(90, 'Máximo 90 caracteres'),
        password: z
            .string()
            .min(8, 'La contraseña debe tener al menos 8 caracteres')
            .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
            .regex(/[0-9]/, 'Debe contener al menos un número')
            .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
        confirmPassword: z.string().min(1, 'Confirme su contraseña'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    })

export type AcceptInvitacionFormValues = z.infer<typeof acceptInvitacionSchema>
