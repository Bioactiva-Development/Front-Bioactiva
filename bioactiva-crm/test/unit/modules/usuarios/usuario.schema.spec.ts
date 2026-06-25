jest.mock('@/lib/constants/config', () => ({
  DOMINIO_INSTITUCIONAL: 'bioactiva.pe',
}))

import { invitarUsuarioSchema, editarUsuarioSchema, cambiarPasswordSchema, cambiarPasswordPerfilSchema } from '@/lib/validators/usuario.schema'
import { RolUsuario } from '@/types/enums'

describe('usuarios/usuario.schema', () => {
  describe('invitarUsuarioSchema', () => {
    it('accepts valid data', () => {
      expect(
        invitarUsuarioSchema.parse({
          correo: 'nuevo@bioactiva.pe',
          rol: RolUsuario.Trabajador,
        })
      ).toEqual({
        correo: 'nuevo@bioactiva.pe',
        rol: RolUsuario.Trabajador,
      })
    })

    it('accepts @utec.edu.pe domain', () => {
      expect(
        invitarUsuarioSchema.parse({
          correo: 'nuevo@utec.edu.pe',
          rol: RolUsuario.Administrador,
        })
      ).toMatchObject({ correo: 'nuevo@utec.edu.pe' })
    })

    it('rejects empty correo', () => {
      expect(() =>
        invitarUsuarioSchema.parse({ correo: '', rol: RolUsuario.Trabajador })
      ).toThrow('El correo es obligatorio')
    })

    it('rejects invalid email format', () => {
      expect(() =>
        invitarUsuarioSchema.parse({ correo: 'not-an-email', rol: RolUsuario.Trabajador })
      ).toThrow('Formato de correo inválido')
    })

    it('rejects non-institutional email', () => {
      expect(() =>
        invitarUsuarioSchema.parse({ correo: 'user@gmail.com', rol: RolUsuario.Trabajador })
      ).toThrow(/correo institucional/)
    })

    it('accepts all RolUsuario values', () => {
      Object.values(RolUsuario).forEach((rol) => {
        expect(
          invitarUsuarioSchema.parse({ correo: 'test@bioactiva.pe', rol })
        ).toMatchObject({ rol })
      })
    })
  })

  describe('editarUsuarioSchema', () => {
    it('accepts valid data', () => {
      expect(
        editarUsuarioSchema.parse({
          nombre_completo: 'Juan Pérez',
          correo: 'jperez@bioactiva.pe',
          rol: RolUsuario.Trabajador,
        })
      ).toEqual({
        nombre_completo: 'Juan Pérez',
        correo: 'jperez@bioactiva.pe',
        rol: RolUsuario.Trabajador,
      })
    })

    it('rejects short nombre_completo', () => {
      expect(() =>
        editarUsuarioSchema.parse({
          nombre_completo: 'A',
          correo: 'test@bioactiva.pe',
          rol: RolUsuario.Trabajador,
        })
      ).toThrow('al menos 2 caracteres')
    })

    it('rejects long nombre_completo', () => {
      expect(() =>
        editarUsuarioSchema.parse({
          nombre_completo: 'X'.repeat(101),
          correo: 'test@bioactiva.pe',
          rol: RolUsuario.Trabajador,
        })
      ).toThrow('demasiado largo')
    })

    it('rejects empty correo', () => {
      expect(() =>
        editarUsuarioSchema.parse({
          nombre_completo: 'Juan Pérez',
          correo: '',
          rol: RolUsuario.Trabajador,
        })
      ).toThrow('El correo es obligatorio')
    })

    it('rejects non-institutional email for edit', () => {
      expect(() =>
        editarUsuarioSchema.parse({
          nombre_completo: 'Juan Pérez',
          correo: 'user@gmail.com',
          rol: RolUsuario.Trabajador,
        })
      ).toThrow(/correo institucional/)
    })
  })

  describe('cambiarPasswordPerfilSchema', () => {
    it('accepts valid current/new/confirm passwords', () => {
      expect(
        cambiarPasswordPerfilSchema.parse({
          currentPassword: 'OldPass1!',
          newPassword: 'NewPass1!',
          confirmPassword: 'NewPass1!',
        })
      ).toEqual({
        currentPassword: 'OldPass1!',
        newPassword: 'NewPass1!',
        confirmPassword: 'NewPass1!',
      })
    })

    it('rejects empty currentPassword', () => {
      expect(() =>
        cambiarPasswordPerfilSchema.parse({
          currentPassword: '',
          newPassword: 'NewPass1!',
          confirmPassword: 'NewPass1!',
        })
      ).toThrow('Ingrese su contraseña actual')
    })

    it('rejects mismatched new and confirm passwords', () => {
      expect(() =>
        cambiarPasswordPerfilSchema.parse({
          currentPassword: 'OldPass1!',
          newPassword: 'NewPass1!',
          confirmPassword: 'NewPass2!',
        })
      ).toThrow('Las contraseñas no coinciden')
    })

    it('rejects newPassword same as currentPassword', () => {
      expect(() =>
        cambiarPasswordPerfilSchema.parse({
          currentPassword: 'SamePass1!',
          newPassword: 'SamePass1!',
          confirmPassword: 'SamePass1!',
        })
      ).toThrow('La nueva contraseña debe ser distinta de la actual')
    })

    it('rejects newPassword without uppercase', () => {
      expect(() =>
        cambiarPasswordPerfilSchema.parse({
          currentPassword: 'OldPass1!',
          newPassword: 'newpass1!',
          confirmPassword: 'newpass1!',
        })
      ).toThrow('letra mayúscula')
    })

    it('rejects newPassword without digit', () => {
      expect(() =>
        cambiarPasswordPerfilSchema.parse({
          currentPassword: 'OldPass1!',
          newPassword: 'NewPass!',
          confirmPassword: 'NewPass!',
        })
      ).toThrow('número')
    })

    it('rejects newPassword without special character', () => {
      expect(() =>
        cambiarPasswordPerfilSchema.parse({
          currentPassword: 'OldPass1!',
          newPassword: 'NewPass1',
          confirmPassword: 'NewPass1',
        })
      ).toThrow('carácter especial')
    })
  })

  describe('cambiarPasswordSchema', () => {
    it('accepts matching passwords', () => {
      expect(
        cambiarPasswordSchema.parse({
          password: 'Test123!',
          confirmPassword: 'Test123!',
        })
      ).toEqual({ password: 'Test123!', confirmPassword: 'Test123!' })
    })

    it('rejects short password', () => {
      expect(() =>
        cambiarPasswordSchema.parse({
          password: 'Ab1!',
          confirmPassword: 'Ab1!',
        })
      ).toThrow('al menos 8 caracteres')
    })

    it('rejects empty confirmPassword', () => {
      expect(() =>
        cambiarPasswordSchema.parse({
          password: 'Test123!',
          confirmPassword: '',
        })
      ).toThrow('Confirme la contraseña')
    })

    it('rejects mismatched passwords', () => {
      expect(() =>
        cambiarPasswordSchema.parse({
          password: 'Test123!',
          confirmPassword: 'Test1234!',
        })
      ).toThrow('Las contraseñas no coinciden')
    })
  })
})
