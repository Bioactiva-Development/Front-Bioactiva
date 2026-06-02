import { createInvitacionSchema, acceptInvitacionSchema } from '@/lib/validators/invitacion.schema'

describe('usuarios/invitacion.schema', () => {
  describe('createInvitacionSchema', () => {
    it('accepts valid data', () => {
      expect(
        createInvitacionSchema.parse({ correo: 'nuevo@bioactiva.pe', rol: 2 })
      ).toEqual({ correo: 'nuevo@bioactiva.pe', rol: 2 })
    })

    it('rejects empty correo', () => {
      expect(() =>
        createInvitacionSchema.parse({ correo: '', rol: 2 })
      ).toThrow('El correo es obligatorio')
    })

    it('rejects invalid email', () => {
      expect(() =>
        createInvitacionSchema.parse({ correo: 'bad', rol: 2 })
      ).toThrow('Ingrese un correo válido')
    })

    it('rejects negative rol', () => {
      expect(() =>
        createInvitacionSchema.parse({ correo: 'test@test.com', rol: -1 })
      ).toThrow('Seleccione un rol válido')
    })

    it('rejects non-integer rol', () => {
      expect(() =>
        createInvitacionSchema.parse({ correo: 'test@test.com', rol: 1.5 })
      ).toThrow()
    })
  })

  describe('acceptInvitacionSchema', () => {
    const VALID = {
      nombres: 'Juan',
      apellidos: 'Pérez',
      password: 'Password1!',
      confirmPassword: 'Password1!',
    }

    it('accepts valid data', () => {
      expect(acceptInvitacionSchema.parse(VALID)).toEqual(VALID)
    })

    it('rejects empty nombres', () => {
      expect(() =>
        acceptInvitacionSchema.parse({ ...VALID, nombres: '' })
      ).toThrow('El nombre es obligatorio')
    })

    it('rejects nombres exceeding 90 chars', () => {
      expect(() =>
        acceptInvitacionSchema.parse({ ...VALID, nombres: 'X'.repeat(91) })
      ).toThrow('Máximo 90 caracteres')
    })

    it('rejects empty apellidos', () => {
      expect(() =>
        acceptInvitacionSchema.parse({ ...VALID, apellidos: '' })
      ).toThrow('Los apellidos son obligatorios')
    })

    it('rejects short password (< 8 chars)', () => {
      expect(() =>
        acceptInvitacionSchema.parse({ ...VALID, password: 'Short1!' })
      ).toThrow('al menos 8 caracteres')
    })

    it('rejects password without uppercase', () => {
      expect(() =>
        acceptInvitacionSchema.parse({ ...VALID, password: 'password1!' })
      ).toThrow('mayúscula')
    })

    it('rejects password without number', () => {
      expect(() =>
        acceptInvitacionSchema.parse({ ...VALID, password: 'Password!' })
      ).toThrow('número')
    })

    it('rejects password without special char', () => {
      expect(() =>
        acceptInvitacionSchema.parse({ ...VALID, password: 'Password1' })
      ).toThrow('carácter especial')
    })

    it('rejects mismatched passwords', () => {
      expect(() =>
        acceptInvitacionSchema.parse({ ...VALID, confirmPassword: 'Different1!' })
      ).toThrow('Las contraseñas no coinciden')
    })
  })
})
