'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/constants/queryKeys'
import { usuariosService } from '@/services/modules/usuarios.service'
import { ListInvitacionesParams } from '@/types/usuario.types'

export function useInvitaciones(params?: ListInvitacionesParams) {
    const queryClient = useQueryClient()

    const listQuery = useQuery({
        queryKey: QUERY_KEYS.invitaciones.list(params as Record<string, unknown>),
        queryFn: () => usuariosService.listInvitaciones(params),
    })

    const createMutation = useMutation({
        mutationFn: ({ correo, rol }: { correo: string; rol: number }) =>
            usuariosService.createInvitacion(correo, rol),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invitaciones'] })
        },
    })

    const revokeMutation = useMutation({
        mutationFn: (id: number) => usuariosService.revokeInvitacion(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invitaciones'] })
        },
    })

    return {
        invitaciones: listQuery.data?.data ?? [],
        total: listQuery.data?.total ?? 0,
        isLoading: listQuery.isLoading,
        isError: listQuery.isError,

        createInvitacion: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        createError: createMutation.error as { message?: string } | null,

        revokeInvitacion: revokeMutation.mutateAsync,
        isRevoking: revokeMutation.isPending,
        revokingId: revokeMutation.variables as number | undefined,
    }
}
