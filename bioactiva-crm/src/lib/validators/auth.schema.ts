import { z } from 'zod'

export const loginSchema = z.object({
    correo: z
        .email({ message: 'Ingrese un correo válido' })
        .min(1, 'El correo es obligatorio'),
    password: z
        .string()
        .min(1, 'La contraseña es obligatoria'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({
    correo: z
        .email({ message: 'Ingrese correo válido' })
        .min(1, 'El correo es obligatorio'),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(6, 'La contraseña debe tener al menos 6 caracteres'),
        confirmPassword: z
            .string()
            .min(1, 'Confirme su contraseña'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>


