import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { organizacionesService } from '@/services/modules/organizaciones.service'
import { QUERY_KEYS } from '@/lib/constants/queryKeys'
import { getErrorMessage } from '@/lib/utils/error.utils'
import { useAuthStore } from '@/store/auth.store'
import {
  OrganizacionFiltros,
  OrganizacionFormData,
  SunatRucResult,
  SunatNombreResult,
  OrganizacionConRelaciones
} from '@/types/organizacion.types'

export function useOrganizaciones(filtros?: OrganizacionFiltros) {
  return useQuery({
    queryKey:        QUERY_KEYS.organizaciones.list(filtros),
    queryFn:         () => organizacionesService.getAll(filtros),
    staleTime:       1000 * 60 * 5,
    placeholderData: keepPreviousData,
  })
}

export function useOrganizacion(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.organizaciones.detail(id),
    queryFn:  () => organizacionesService.getById(id),
    enabled:  !!id,
  })
}

export function useCrearOrganizacion() {
  const queryClient = useQueryClient()
  const idAuthor = useAuthStore((s) => s.usuario?.id)

  return useMutation({
    mutationFn: (data: OrganizacionFormData) => {
      if (!idAuthor) {
        return Promise.reject(new Error('Sesión expirada. Vuelve a iniciar sesión para registrar una organización.'))
      }
      return organizacionesService.create(data, idAuthor)
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['organizaciones'] })
      queryClient.setQueryData(
        QUERY_KEYS.organizaciones.detail(created.id),
        created
      )
    },
  })
}


export function useActualizarOrganizacion(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<OrganizacionFormData>) =>
      organizacionesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.organizaciones.list(),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.organizaciones.detail(id),
      })
    },
  })
}

export function useEliminarOrganizacion() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (id: string) => organizacionesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizaciones'] })
      router.push('/organizaciones')
    },
  })
}

export function useSunat() {
  const [loadingRuc,    setLoadingRuc]    = useState(false)
  const [loadingNombre, setLoadingNombre] = useState(false)
  const [errorSunat,    setErrorSunat]    = useState<string | null>(null)
  const [resultadoRuc,  setResultadoRuc]  = useState<SunatRucResult | null>(null)
  const [resultadosNombre, setResultadosNombre] = useState<SunatNombreResult[]>([])

  const consultarPorRuc = async (ruc: string) => {
    try {
      setLoadingRuc(true)
      setErrorSunat(null)
      setResultadoRuc(null)
      const resultado = await organizacionesService.sunatPorRuc(ruc)
      setResultadoRuc(resultado)
      return resultado
    } catch (err: unknown) {
        setErrorSunat(getErrorMessage(err, 'No se pudo consultar SUNAT.'))
    } finally {
      setLoadingRuc(false)
    }
  }

  const consultarPorNombre = async (nombre: string) => {
    try {
      setLoadingNombre(true)
      setErrorSunat(null)
      setResultadosNombre([])
      const resultados = await organizacionesService.sunatPorNombre(nombre)
      setResultadosNombre(resultados)
      return resultados
    } catch (err: unknown) {
        setErrorSunat(getErrorMessage(err, 'No se pudo consultar SUNAT.'))
    } finally {
      setLoadingNombre(false)
    }
  }

  const limpiar = () => {
    setResultadoRuc(null)
    setResultadosNombre([])
    setErrorSunat(null)
  }

  return {
    loadingRuc,
    loadingNombre,
    errorSunat,
    resultadoRuc,
    resultadosNombre,
    consultarPorRuc,
    consultarPorNombre,
    limpiar,
  }
}

export function useOrganizacionConRelaciones(id: string) {
  return useQuery<OrganizacionConRelaciones>({
    queryKey: [...QUERY_KEYS.organizaciones.detail(id), 'relaciones'],
    queryFn:  () => organizacionesService.getByIdConRelaciones(id),
    enabled:  !!id,
  })
}