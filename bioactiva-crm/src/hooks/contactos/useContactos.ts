import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactosService } from '@/services/modules/contactos.service'
import { QUERY_KEYS } from '@/lib/constants/queryKeys'
import { ContactoFiltros, ContactoFormData } from '@/types/contacto.types'
import { getErrorMessage } from '@/lib/utils/error.utils'

export function useContactos(filtros?: ContactoFiltros) {
  return useQuery({
    queryKey: QUERY_KEYS.contactos.list(filtros),
    queryFn:  () => contactosService.getAll(filtros),
    staleTime: 1000 * 60 * 5,
  })
}

export function useContacto(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.contactos.detail(id),
    queryFn:  () => contactosService.getById(id),
    enabled:  !!id,
  })
}

export function useContactosPorOrganizacion(orgId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.contactos.byOrganizacion(orgId),
    queryFn:  () => contactosService.getByOrganizacion(orgId),
    enabled:  !!orgId,
  })
}

export function useCrearContacto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ContactoFormData) =>
      contactosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactos'] })
      queryClient.invalidateQueries({ queryKey: ['organizaciones'] })
    },
  })
}

export function useActualizarContacto(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<ContactoFormData>) =>
      contactosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactos'] })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contactos.detail(id) })
      queryClient.invalidateQueries({ queryKey: ['organizaciones'] })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}