const VOCATIVO_LABELS: Record<string, string> = {
  SR:   'Sr.',
  SRA:  'Sra.',
  SRTA: 'Srta.',
}

export function formatVocativo(vocativo: string): string {
  return VOCATIVO_LABELS[vocativo] ?? vocativo
}
