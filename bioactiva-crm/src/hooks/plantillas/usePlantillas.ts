import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { plantillasService } from '@/services/modules/plantillas.service'
import { QUERY_KEYS } from '@/lib/constants/queryKeys'
import { PlantillaFormData } from '@/types/plantilla.types'
import { getErrorMessage } from '@/lib/utils/error.utils'

export function usePlantillas(includeInactive = false) {
  return useQuery({
    queryKey: QUERY_KEYS.plantillas.list(includeInactive),
    queryFn:  () => plantillasService.getAll(includeInactive),
    staleTime: 1000 * 60 * 5,
  })
}

export function usePlantillasActivas() {
  return useQuery({
    queryKey: QUERY_KEYS.plantillas.activas(),
    queryFn:  () => plantillasService.getActivas(),
    staleTime: 1000 * 60 * 5,
  })
}

export function usePlantilla(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.plantillas.detail(id),
    queryFn:  () => plantillasService.getById(id),
    enabled:  !!id,
  })
}

export function useCrearPlantilla() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PlantillaFormData) =>
      plantillasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantillas'] })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}

export function useActualizarPlantilla(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<PlantillaFormData>) =>
      plantillasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantillas'] })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}

export function useEliminarPlantilla() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => plantillasService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantillas'] })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}

export function useDesactivarPlantilla() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => plantillasService.desactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantillas'] })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}
