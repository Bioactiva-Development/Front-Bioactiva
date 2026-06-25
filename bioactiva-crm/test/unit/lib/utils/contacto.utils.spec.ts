import { formatVocativo } from '@/lib/utils/contacto.utils'

describe('contacto.utils', () => {
  it('formats SR vocativo', () => {
    expect(formatVocativo('SR')).toBe('Sr.')
  })

  it('formats SRA vocativo', () => {
    expect(formatVocativo('SRA')).toBe('Sra.')
  })

  it('formats SRTA vocativo', () => {
    expect(formatVocativo('SRTA')).toBe('Srta.')
  })

  it('returns unknown vocativo as-is', () => {
    expect(formatVocativo('DR')).toBe('DR')
    expect(formatVocativo('')).toBe('')
    expect(formatVocativo('ING')).toBe('ING')
  })
})
