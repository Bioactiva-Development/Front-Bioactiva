interface AppError {
  status?:  number
  message?: string
  data?:    unknown
}

export const getErrorMessage = (
  err: unknown,
  fallback = 'Ocurrió un error inesperado'
): string => {
  if (typeof err === 'object' && err !== null) {
    const e = err as AppError
    if (typeof e.message === 'string') return e.message
  }
  if (err instanceof Error) return err.message
  return fallback
}