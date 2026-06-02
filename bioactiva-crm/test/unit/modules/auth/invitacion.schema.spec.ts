import {
  createInvitacionSchema,
  acceptInvitacionSchema,
} from '@/lib/validators/invitacion.schema'

/**
 * InvitacionSchema
 * ----------------
 * Responsable de:
 * - validar datos para crear una invitación (correo + rol)
 * - validar datos para aceptar una invitación (nombres, apellidos, password)
 */
// STATUS: Implementación parcial (schemas base de invitación).

describe('security/invitacion.schema', () => {
  describe('createInvitacionSchema', () => {
    it('validates valid invitation data', () => {
      expect(
        createInvitacionSchema.parse({
          correo: 'nuevo@bioactiva.pe',
          rol: 0,
        })
      ).toEqual({ correo: 'nuevo@bioactiva.pe', rol: 0 })
    })

    it('accepts rol as 1 (Trabajador)', () => {
      expect(
        createInvitacionSchema.parse({
          correo: 'trabajador@bioactiva.pe',
          rol: 1,
        })
      ).toEqual({ correo: 'trabajador@bioactiva.pe', rol: 1 })
    })

    it('rejects empty email', () => {
      expect(() =>
        createInvitacionSchema.parse({ correo: '', rol: 0 })
      ).toThrow('El correo es obligatorio')
    })

    it('rejects invalid email', () => {
      expect(() =>
        createInvitacionSchema.parse({ correo: 'not-an-email', rol: 0 })
      ).toThrow('Ingrese un correo válido')
    })

    it('rejects negative rol', () => {
      expect(() =>
        createInvitacionSchema.parse({ correo: 'test@bioactiva.pe', rol: -1 })
      ).toThrow('Seleccione un rol válido')
    })
  })

  describe('acceptInvitacionSchema', () => {
    const validData = {
      nombres: 'Juan',
      apellidos: 'Pérez',
      password: 'Secret123!',
      confirmPassword: 'Secret123!',
    }

    it('validates accept invitation data', () => {
      expect(acceptInvitacionSchema.parse(validData)).toEqual(validData)
    })

    it('rejects empty nombres', () => {
      expect(() =>
        acceptInvitacionSchema.parse({ ...validData, nombres: '' })
      ).toThrow('El nombre es obligatorio')
    })

    it('rejects nombres exceeding 90 characters', () => {
      expect(() =>
        acceptInvitacionSchema.parse({
          ...validData,
          nombres: 'A'.repeat(91),
        })
      ).toThrow('Máximo 90 caracteres')
    })

    it('rejects empty apellidos', () => {
      expect(() =>
        acceptInvitacionSchema.parse({ ...validData, apellidos: '' })
      ).toThrow('Los apellidos son obligatorios')
    })

    it('rejects apellidos exceeding 90 characters', () => {
      expect(() =>
        acceptInvitacionSchema.parse({
          ...validData,
          apellidos: 'A'.repeat(91),
        })
      ).toThrow('Máximo 90 caracteres')
    })

    it('rejects password without uppercase letter', () => {
      expect(() =>
        acceptInvitacionSchema.parse({
          ...validData,
          password: 'secret123!',
          confirmPassword: 'secret123!',
        })
      ).toThrow('Debe contener al menos una letra mayúscula')
    })

    it('rejects password without number', () => {
      expect(() =>
        acceptInvitacionSchema.parse({
          ...validData,
          password: 'Secret!!!',
          confirmPassword: 'Secret!!!',
        })
      ).toThrow('Debe contener al menos un número')
    })

    it('rejects password without special char', () => {
      expect(() =>
        acceptInvitacionSchema.parse({
          ...validData,
          password: 'Secret123',
          confirmPassword: 'Secret123',
        })
      ).toThrow('Debe contener al menos un carácter especial')
    })

    it('rejects password shorter than 8 characters', () => {
      expect(() =>
        acceptInvitacionSchema.parse({
          ...validData,
          password: 'Sec1!',
          confirmPassword: 'Sec1!',
        })
      ).toThrow('La contraseña debe tener al menos 8 caracteres')
    })

    it('rejects password mismatch', () => {
      expect(() =>
        acceptInvitacionSchema.parse({
          ...validData,
          confirmPassword: 'Different1!',
        })
      ).toThrow('Las contraseñas no coinciden')
    })
  })
})
