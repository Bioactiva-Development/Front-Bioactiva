import { Contacto } from '@/types/contacto.types'

export interface ContactoEmailOption {
  value: string
  label: string
}

export function getContactoEmailOptions(
  contacto?: Pick<Contacto, 'correo' | 'correo2'> | null
): ContactoEmailOption[] {
  if (!contacto) return []

  const entries = [
    { value: contacto.correo, label: 'Correo principal' },
    { value: contacto.correo2, label: 'Correo alternativo' },
  ]

  const seen = new Set<string>()
  return entries.flatMap((entry) => {
    const value = entry.value?.trim()
    if (!value || seen.has(value.toLowerCase())) return []
    seen.add(value.toLowerCase())
    return [{ ...entry, value }]
  })
}
