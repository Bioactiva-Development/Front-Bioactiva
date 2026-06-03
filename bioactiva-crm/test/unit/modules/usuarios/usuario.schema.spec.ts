jest.mock('@/lib/constants/config', () => ({
  DOMINIO_INSTITUCIONAL: 'bioactiva.pe',
}))

import { invitarUsuarioSchema, editarUsuarioSchema, cambiarPasswordSchema } from '@/lib/validators/usuario.schema'
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

  describe('cambiarPasswordSchema', () => {
    it('accepts matching passwords', () => {
      expect(
        cambiarPasswordSchema.parse({
          password: '123456',
          confirmPassword: '123456',
        })
      ).toEqual({ password: '123456', confirmPassword: '123456' })
    })

    it('rejects short password', () => {
      expect(() =>
        cambiarPasswordSchema.parse({
          password: '12345',
          confirmPassword: '12345',
        })
      ).toThrow('al menos 6 caracteres')
    })

    it('rejects empty confirmPassword', () => {
      expect(() =>
        cambiarPasswordSchema.parse({
          password: '123456',
          confirmPassword: '',
        })
      ).toThrow('Confirme la contraseña')
    })

    it('rejects mismatched passwords', () => {
      expect(() =>
        cambiarPasswordSchema.parse({
          password: '123456',
          confirmPassword: '654321',
        })
      ).toThrow('Las contraseñas no coinciden')
    })
  })
})
