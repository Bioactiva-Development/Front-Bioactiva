import { getContactoEmailOptions } from '@/lib/utils/contacto-email.utils'

describe('contacto-email utils', () => {
  it('returns the principal and alternative contact emails', () => {
    expect(getContactoEmailOptions({
      correo: 'principal@cliente.com',
      correo2: 'alternativo@cliente.com',
    })).toEqual([
      { label: 'Correo principal', value: 'principal@cliente.com' },
      { label: 'Correo alternativo', value: 'alternativo@cliente.com' },
    ])
  })

  it('trims and removes duplicated emails', () => {
    expect(getContactoEmailOptions({
      correo: ' cliente@bioactiva.com ',
      correo2: 'CLIENTE@bioactiva.com',
    })).toEqual([
      { label: 'Correo principal', value: 'cliente@bioactiva.com' },
    ])
  })
})
