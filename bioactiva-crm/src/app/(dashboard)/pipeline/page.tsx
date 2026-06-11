'use client'

import { Suspense, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, FileText, Plus, X } from 'lucide-react'
import { useMoverLeadPipeline, usePipelineColumns } from '@/hooks/pipeline/useLeads'
import { KanbanBoard } from '@/components/modules/pipeline/KanbanBoard'
import { LeadFiltros } from '@/components/modules/pipeline/LeadFiltros'
import { LeadDrawer } from '@/components/modules/pipeline/LeadDrawer'
import { LeadFiltros as FiltrosType, Lead } from '@/types/lead.types'
import { LeadState } from '@/types/enums'
import { getErrorMessage } from '@/lib/utils/error.utils'

// Los filtros viven en la URL (camelCase del contrato) para que sean compartibles.
function filtrosFromParams(sp: URLSearchParams): FiltrosType {
  const filtros: FiltrosType = {}

  const estado = sp.get('estado')
  if (estado && (Object.values(LeadState) as string[]).includes(estado)) {
    filtros.estado = estado as LeadState
  }

  const idEncargado = sp.get('idEncargado')
  if (idEncargado) filtros.id_encargado = Number(idEncargado)

  const idOrg = sp.get('idOrg')
  if (idOrg) filtros.id_org = idOrg

  const search = sp.get('search')
  if (search) filtros.search = search

  const fechaDesde = sp.get('fechaDesde')
  if (fechaDesde) filtros.fecha_desde = fechaDesde

  const fechaHasta = sp.get('fechaHasta')
  if (fechaHasta) filtros.fecha_hasta = fechaHasta

  if (sp.get('conActividadesPorVencer') === 'true') {
    filtros.con_actividades_por_vencer = true
  }

  return filtros
}

function paramsFromFiltros(filtros: FiltrosType): string {
  const sp = new URLSearchParams()
  if (filtros.estado) sp.set('estado', filtros.estado)
  if (filtros.id_encargado) sp.set('idEncargado', String(filtros.id_encargado))
  if (filtros.id_org) sp.set('idOrg', filtros.id_org)
  if (filtros.search) sp.set('search', filtros.search)
  if (filtros.fecha_desde) sp.set('fechaDesde', filtros.fecha_desde)
  if (filtros.fecha_hasta) sp.set('fechaHasta', filtros.fecha_hasta)
  if (filtros.con_actividades_por_vencer) sp.set('conActividadesPorVencer', 'true')
  return sp.toString()
}

function PipelineContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const spString     = searchParams.toString()
  const filtros      = useMemo(() => filtrosFromParams(new URLSearchParams(spString)), [spString])

  const [leadSeleccionado, setLeadSeleccionado] = useState<Lead | null>(null)
  const [dragError, setDragError]   = useState<string | null>(null)
  const [borradorId, setBorradorId] = useState<number | null>(null)

  const columnas = usePipelineColumns(filtros)
  const { mutateAsync: moverLead, isPending: actualizandoEstado } =
    useMoverLeadPipeline()

  const total =
    columnas.prospecto.total +
    columnas.ofertado.total +
    columnas.cierreVenta.total +
    columnas.cierreSinVenta.total

  const isLoading =
    columnas.prospecto.isLoading ||
    columnas.ofertado.isLoading ||
    columnas.cierreVenta.isLoading ||
    columnas.cierreSinVenta.isLoading

  const isError =
    columnas.prospecto.isError &&
    columnas.ofertado.isError &&
    columnas.cierreVenta.isError &&
    columnas.cierreSinVenta.isError

  const handleFiltrosChange = (next: FiltrosType) => {
    const query = paramsFromFiltros(next)
    router.replace(query ? `/pipeline?${query}` : '/pipeline', { scroll: false })
  }

  const handleLimpiarFiltros = () => router.replace('/pipeline', { scroll: false })

  const handleQuickAction = (
    lead: Lead,
    action: 'detalle' | 'editar' | 'actividad' | 'cotizacion' | 'seguimiento'
  ) => {
    if (action === 'cotizacion') {
      router.push(`/cotizaciones/nueva?lead=${lead.id}`)
      return
    }

    const accionMap = {
      detalle: '',
      editar: '?accion=editar',
      actividad: '?accion=actividad',
      seguimiento: '?accion=seguimiento',
    } as const

    router.push(`/pipeline/${lead.id}${accionMap[action]}`)
  }

  const handleMoveLead = async (lead: Lead, estado: LeadState) => {
    try {
      setDragError(null)
      setBorradorId(null)
      const { borrador } = await moverLead({ lead, estado })
      if (borrador) setBorradorId(borrador.id)
    } catch (err: unknown) {
      setDragError(getErrorMessage(err, 'No se pudo actualizar el estado del lead.'))
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-100
          rounded-xl px-1 py-1 shadow-sm">
          <button className="px-4 py-2 rounded-lg text-sm font-semibold
            bg-emerald-50 text-emerald-700">
            Pipeline
          </button>
        </div>
        <button
          onClick={() => router.push('/pipeline/nuevo')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl
            bg-emerald-600 hover:bg-emerald-700 text-white
            text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          Nuevo Lead
        </button>
      </div>

      {/* Filtros */}
      <LeadFiltros
        filtros={filtros}
        onChange={handleFiltrosChange}
        onLimpiar={handleLimpiarFiltros}
        total={total}
      />

      {dragError && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200
          bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <p>{dragError}</p>
        </div>
      )}

      {borradorId && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200
          bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <FileText size={16} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p>Se generó una cotización borrador. Complétala.</p>
            <button
              type="button"
              onClick={() => router.push(`/cotizaciones/${borradorId}`)}
              className="mt-1 text-xs font-bold text-emerald-700 underline underline-offset-2"
            >
              Completar cotización
            </button>
          </div>
          <button
            type="button"
            aria-label="Cerrar aviso"
            onClick={() => setBorradorId(null)}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error global (las 4 columnas fallaron) */}
      {isError && (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-red-500">
            Error al cargar el pipeline. Intente nuevamente.
          </p>
        </div>
      )}

      {/* Tablero — cada columna gestiona su propia carga/paginación */}
      {!isError && (
        <KanbanBoard
          columnas={columnas}
          onClickLead={setLeadSeleccionado}
          onQuickAction={handleQuickAction}
          onMoveLead={handleMoveLead}
        />
      )}

      {(actualizandoEstado || isLoading) && (
        <div className="fixed bottom-4 right-4 rounded-xl bg-emerald-700
          px-4 py-3 text-sm font-semibold text-white shadow-lg">
          {actualizandoEstado ? 'Actualizando estado...' : 'Cargando pipeline...'}
        </div>
      )}

      {/* Drawer */}
      {leadSeleccionado && (
        <LeadDrawer
          lead={leadSeleccionado}
          onCerrar={() => setLeadSeleccionado(null)}
        />
      )}
    </div>
  )
}

export default function PipelinePage() {
  return (
    <Suspense fallback={null}>
      <PipelineContent />
    </Suspense>
  )
}
