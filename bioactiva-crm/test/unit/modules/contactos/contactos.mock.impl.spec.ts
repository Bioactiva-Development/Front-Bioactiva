import {
  mockGetContactos,
  mockGetContacto,
  mockCreateContacto,
  mockUpdateContacto,
} from '@/services/mock/contactos.mock'

describe('contactos/contactos.mock (implementation)', () => {
  describe('mockGetContactos', () => {
    it('returns all contacts with pagination', async () => {
      const result = await mockGetContactos()

      expect(result.data.length).toBeGreaterThan(0)
      expect(result.total).toBeGreaterThan(0)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
    })

    it('filters by search term', async () => {
      const result = await mockGetContactos({ search: 'Ricardo' })

      expect(result.data.every(c => c.nombres.includes('Ricardo'))).toBe(true)
    })

    it('filters by organization', async () => {
      const result = await mockGetContactos({ idOrganizacion: 'org-002' })

      expect(result.data.every(c => c.idOrganizacion === 'org-002')).toBe(true)
    })

    it('paginates results', async () => {
      const result = await mockGetContactos({ page: 1, limit: 3 })

      expect(result.data.length).toBeLessThanOrEqual(3)
    })
  })

  describe('mockGetContacto', () => {
    it('returns contact by id', async () => {
      const result = await mockGetContacto(1)

      expect(result.id).toBe(1)
      expect(result.nombres).toBe('Ricardo')
    })

    it('throws 404 for unknown contact', async () => {
      await expect(mockGetContacto(999)).rejects.toMatchObject({ status: 404 })
    })
  })

  describe('mockCreateContacto', () => {
    it('creates a new contact', async () => {
      const result = await mockCreateContacto({
        nombres: 'Nuevo',
        correo: 'nuevo@test.com',
        idOrganizacion: 'org-001',
      })

      expect(result.id).toBeDefined()
      expect(result.nombres).toBe('Nuevo')
      expect(result.correo).toBe('nuevo@test.com')
    })

    it('throws 409 for duplicate email', async () => {
      await expect(
        mockCreateContacto({
          nombres: 'Duplicate',
          correo: 'rperales@altomayo.com.pe',
          idOrganizacion: 'org-001',
        }),
      ).rejects.toMatchObject({ status: 409 })
    })

    it('throws 409 when correo2 matches an existing email', async () => {
      await expect(
        mockCreateContacto({
          nombres: 'Secondary',
          correo: 'correo2-dupe@test.com',
          correo2: 'rperales@altomayo.com.pe',
          idOrganizacion: 'org-001',
        }),
      ).rejects.toMatchObject({ status: 409 })
    })
  })

  describe('mockUpdateContacto', () => {
    it('updates an existing contact', async () => {
      const result = await mockUpdateContacto(1, { nombres: 'Ricardo Updated' })

      expect(result.nombres).toBe('Ricardo Updated')
    })

    it('throws 404 for unknown contact', async () => {
      await expect(
        mockUpdateContacto(999, { nombres: 'Ghost' }),
      ).rejects.toMatchObject({ status: 404 })
    })

    it('throws 409 when updating to an existing email', async () => {
      await expect(
        mockUpdateContacto(1, { correo: 'lhuanca@altomayo.com.pe' }),
      ).rejects.toMatchObject({ status: 409 })
    })

    it('updates without error when email is not a duplicate', async () => {
      const result = await mockUpdateContacto(1, { correo: 'nuevo-unico@test.com' })

      expect(result.correo).toBe('nuevo-unico@test.com')
    })
  })
})
