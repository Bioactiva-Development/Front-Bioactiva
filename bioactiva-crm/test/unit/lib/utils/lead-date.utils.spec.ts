import {
  parseLeadDateOnly,
  toLeadDateInputValue,
  formatLeadDateOnly,
  getLeadCloseDateStatus,
  getLocalTodayDateInputValue,
} from '@/lib/utils/lead-date.utils'

function localDateOffset(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return getLocalTodayDateInputValue(d)
}

describe('lead-date.utils', () => {
  describe('parseLeadDateOnly', () => {
    it('parses ISO date prefix', () => {
      const result = parseLeadDateOnly('2026-06-15T10:00:00.000Z')
      expect(result.getFullYear()).toBe(2026)
      expect(result.getMonth()).toBe(5)
      expect(result.getDate()).toBe(15)
    })

    it('parses plain date string', () => {
      const result = parseLeadDateOnly('2026-06-15')
      expect(result.getFullYear()).toBe(2026)
      expect(result.getMonth()).toBe(5)
      expect(result.getDate()).toBe(15)
    })

    it('parses date without match using new Date()', () => {
      const result = parseLeadDateOnly('2026/06/15')
      expect(result.getFullYear()).toBe(2026)
    })

    it('handles empty string returning Invalid Date', () => {
      const result = parseLeadDateOnly('')
      expect(Number.isNaN(result.getTime())).toBe(true)
    })
  })

  describe('toLeadDateInputValue', () => {
    it('extracts date prefix from ISO string', () => {
      expect(toLeadDateInputValue('2026-06-15T10:00:00.000Z')).toBe('2026-06-15')
    })

    it('returns empty string for null', () => {
      expect(toLeadDateInputValue(null)).toBe('')
    })

    it('returns empty string for undefined', () => {
      expect(toLeadDateInputValue(undefined)).toBe('')
    })

    it('returns empty string for empty string', () => {
      expect(toLeadDateInputValue('')).toBe('')
    })
  })

  describe('formatLeadDateOnly', () => {
    it('formats date in es-PE locale', () => {
      const result = formatLeadDateOnly('2026-06-15')
      expect(result).toContain('2026')
    })

    it('returns em dash for empty input', () => {
      expect(formatLeadDateOnly('')).toBe('—')
    })

    it('returns em dash for undefined input', () => {
      expect(formatLeadDateOnly(undefined)).toBe('—')
    })

    it('returns em dash for invalid date', () => {
      expect(formatLeadDateOnly('not-a-date')).toBe('—')
    })

    it('uses custom format options', () => {
      const result = formatLeadDateOnly('2026-06-15', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      expect(result).toContain('2026')
    })
  })

  describe('getLeadCloseDateStatus', () => {
    it('returns null for empty fecha', () => {
      expect(getLeadCloseDateStatus('')).toBeNull()
    })

    it('returns null for undefined', () => {
      expect(getLeadCloseDateStatus(undefined)).toBeNull()
    })

    it('returns null for invalid date', () => {
      expect(getLeadCloseDateStatus('invalid')).toBeNull()
    })

    it('returns future days label for future date', () => {
      const status = getLeadCloseDateStatus(localDateOffset(5))
      expect(status).not.toBeNull()
      expect(status!.label).toContain('Faltan')
      expect(status!.className).toContain('emerald')
    })

    it('returns "Falta 1 día" for tomorrow', () => {
      const status = getLeadCloseDateStatus(localDateOffset(1))
      expect(status).not.toBeNull()
      expect(status!.label).toBe('Falta 1 día')
    })

    it('returns "Cierra hoy" for today', () => {
      const status = getLeadCloseDateStatus(localDateOffset(0))
      expect(status).not.toBeNull()
      expect(status!.label).toBe('Cierra hoy')
      expect(status!.className).toContain('amber')
    })

    it('returns elapsed days label for past date', () => {
      const status = getLeadCloseDateStatus(localDateOffset(-5))
      expect(status).not.toBeNull()
      expect(status!.label).toContain('Pasó hace')
      expect(status!.className).toContain('red')
    })

    it('returns "Pasó hace 1 día" for yesterday', () => {
      const status = getLeadCloseDateStatus(localDateOffset(-1))
      expect(status).not.toBeNull()
      expect(status!.label).toBe('Pasó hace 1 día')
    })
  })
})
