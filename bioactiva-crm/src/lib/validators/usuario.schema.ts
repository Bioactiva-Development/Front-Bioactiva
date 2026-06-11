import { z } from 'zod'
import { RolUsuario } from '@/types/enums'
import { DOMINIO_INSTITUCIONAL } from '@/lib/constants/config'

const correoInstitucional = z
    .email({ message: 'Formato de correo inválido' })
    .min(1, 'El correo es obligatorio')
    .refine(
        (val) => val.endsWith(`@${DOMINIO_INSTITUCIONAL}`) || val.endsWith('@utec.edu.pe'),
        `Debe ser un correo institucional (@${DOMINIO_INSTITUCIONAL})`,
    )

const rolSchema = z.enum([RolUsuario.Administrador, RolUsuario.Trabajador])

export const invitarUsuarioSchema = z.object({
    correo: correoInstitucional,
    rol: rolSchema,
})

export const editarUsuarioSchema = z.object({
    nombre_completo: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre es demasiado largo'),
    correo: correoInstitucional,
    rol: rolSchema,
})

export const cambiarPasswordSchema = z
    .object({
        password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
        confirmPassword: z.string().min(1, 'Confirme la contraseña'),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    })

// Mantis #333 — cambio de contraseña desde "Mi perfil": requiere la contraseña
// actual y una nueva de 8–72 caracteres distinta de la actual.
export const cambiarPasswordPerfilSchema = z
    .object({
        currentPassword: z.string().min(1, 'Ingrese su contraseña actual'),
        newPassword: z
            .string()
            .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
            .max(72, 'La nueva contraseña no puede superar los 72 caracteres'),
        confirmPassword: z.string().min(1, 'Confirme la nueva contraseña'),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    })
    .refine((d) => d.newPassword !== d.currentPassword, {
        message: 'La nueva contraseña debe ser distinta de la actual',
        path: ['newPassword'],
    })

export type InvitarUsuarioFormValues = z.infer<typeof invitarUsuarioSchema>
export type EditarUsuarioFormValues = z.infer<typeof editarUsuarioSchema>
export type CambiarPasswordFormValues = z.infer<typeof cambiarPasswordSchema>
export type CambiarPasswordPerfilFormValues = z.infer<typeof cambiarPasswordPerfilSchema>
