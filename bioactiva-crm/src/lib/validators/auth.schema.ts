import { z } from 'zod'

export const loginSchema = z.object({
    correo: z
        .string()
        .min(1, 'El correo es obligatorio')
        .email('Ingrese un correo válido'),
    password: z
        .string()
        .min(1, 'La contraseña es obligatoria'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({
    correo: z
        .string()
        .min(1, 'El correo es obligatorio')
        .email('Ingrese correo válido'),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(8, 'La contraseña debe tener al menos 8 caracteres')
            .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
            .regex(/[0-9]/, 'Debe contener al menos un número')
            .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
        confirmPassword: z
            .string()
            .min(1, 'Confirme su contraseña'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>


