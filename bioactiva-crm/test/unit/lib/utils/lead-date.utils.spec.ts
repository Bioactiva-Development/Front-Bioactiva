import {
  parseLeadDateOnly,
  toLeadDateInputValue,
  formatLeadDateOnly,
  getLeadCloseDateStatus,
} from '@/lib/utils/lead-date.utils'

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
      const future = new Date()
      future.setDate(future.getDate() + 5)
      const dateStr = future.toISOString().split('T')[0]
      const status = getLeadCloseDateStatus(dateStr)
      expect(status).not.toBeNull()
      expect(status!.label).toContain('Faltan')
      expect(status!.className).toContain('emerald')
    })

    it('returns "Falta 1 día" for tomorrow', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateStr = tomorrow.toISOString().split('T')[0]
      const status = getLeadCloseDateStatus(dateStr)
      expect(status).not.toBeNull()
      expect(status!.label).toBe('Falta 1 día')
    })

    it('returns "Cierra hoy" for today', () => {
      const today = new Date()
      const dateStr = today.toISOString().split('T')[0]
      const status = getLeadCloseDateStatus(dateStr)
      expect(status).not.toBeNull()
      expect(status!.label).toBe('Cierra hoy')
      expect(status!.className).toContain('amber')
    })

    it('returns elapsed days label for past date', () => {
      const past = new Date()
      past.setDate(past.getDate() - 5)
      const dateStr = past.toISOString().split('T')[0]
      const status = getLeadCloseDateStatus(dateStr)
      expect(status).not.toBeNull()
      expect(status!.label).toContain('Pasó hace')
      expect(status!.className).toContain('red')
    })

    it('returns "Pasó hace 1 día" for yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const dateStr = yesterday.toISOString().split('T')[0]
      const status = getLeadCloseDateStatus(dateStr)
      expect(status).not.toBeNull()
      expect(status!.label).toBe('Pasó hace 1 día')
    })
  })
})
