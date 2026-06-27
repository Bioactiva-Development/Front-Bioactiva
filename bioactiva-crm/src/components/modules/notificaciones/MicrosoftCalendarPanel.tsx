'use client'

import { useMemo, useState } from 'react'
import {
  AlertCircle,
  CalendarPlus,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import {
  useActividadesCalendario,
  useCrearEventoCalendario,
} from '@/hooks/pipeline/useActividades'
import { APP_TIME_ZONE } from '@/lib/utils/timezone.utils'
import { getErrorMessage } from '@/lib/utils/error.utils'
import { Actividad } from '@/types/actividad.types'
import { IntegracionesResponse } from '@/types/integracion.types'
import { Lead } from '@/types/lead.types'

interface MicrosoftCalendarPanelProps {
  leads: Lead[]
  idResponsable?: number
  integraciones: IntegracionesResponse | null
  integracionInfo: string | null
  isLoadingIntegracion: boolean
  onDisconnect: () => void
}

const formatFecha = (fecha: string) =>
  new Date(fecha).toLocaleString('es-PE', {
    timeZone: APP_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export function MicrosoftCalendarPanel({
  leads,
  idResponsable,
  integraciones,
  integracionInfo,
  isLoadingIntegracion,
  onDisconnect,
}: Readonly<MicrosoftCalendarPanelProps>) {
  const { data: actividades = [], isLoading, isError } =
    useActividadesCalendario(idResponsable)
  const leadsPorId = useMemo(
    () => new Map(leads.map((lead) => [lead.id, lead])),
    [leads]
  )
  const conectado = Boolean(
    integraciones?.outlook.conectado || integraciones?.teams.conectado
  )
  const integrationStatusLoaded = integraciones !== null

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-950">Calendario Microsoft</h2>
          <p className="mt-1 text-sm text-gray-500">
            Crea eventos Outlook y reuniones Teams desde actividades tipo reunión.
          </p>
        </div>
        {integrationStatusLoaded && (
          <MicrosoftStatus
            conectado={conectado}
            cuenta={integraciones?.outlook.cuenta}
          />
        )}
      </div>

      <div className="space-y-5 p-6">
        {integracionInfo && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {integracionInfo}
          </div>
        )}

        {conectado && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onDisconnect}
              disabled={isLoadingIntegracion}
              className="text-xs font-semibold text-gray-500 hover:text-red-600 disabled:opacity-50"
            >
              Desconectar Microsoft
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-8 text-sm text-gray-500">
            <Loader2 size={17} className="animate-spin" /> Cargando reuniones...
          </div>
        )}
        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-5 text-sm text-red-700">
            No se pudieron cargar las actividades de calendario.
          </div>
        )}
        {!isLoading && !isError && actividades.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-10 text-center text-sm text-gray-500">
            No hay reuniones pendientes para mostrar.
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-2">
          {actividades.map((actividad) => (
            <CalendarActivityCard
              key={actividad.id}
              actividad={actividad}
              lead={leadsPorId.get(actividad.id_lead)}
              microsoftConnected={conectado}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function CalendarActivityCard({
  actividad,
  lead,
  microsoftConnected,
}: Readonly<{
  actividad: Actividad
  lead?: Lead
  microsoftConnected: boolean
}>) {
  const { mutateAsync: crearEvento, isPending } =
    useCrearEventoCalendario(actividad.id_lead)
  const [error, setError] = useState<string | null>(null)
  const eventoCreado = Boolean(actividad.outlook_event_id || actividad.outlook_imported)

  const handleCrearEvento = async () => {
    try {
      setError(null)
      await crearEvento(actividad.id)
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo crear el evento de calendario.'))
    }
  }

  return (
    <article className="flex min-h-60 flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-950">{actividad.nombre_actividad}</h3>
            <p className="mt-1 text-xs font-semibold text-gray-500">
              {lead?.servicio_interes ?? lead?.codigo ?? `Lead ${actividad.id_lead}`}
              {lead?.organizacion_nombre ? ` · ${lead.organizacion_nombre}` : ''}
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            Activa
          </span>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 text-sm">
          <div>
            <dt className="font-semibold text-gray-900">Encargado</dt>
            <dd className="mt-1 text-gray-600">
              {actividad.responsable_nombre ?? lead?.encargado_nombre ?? 'Sin asignar'}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">Estado</dt>
            <dd className="mt-1 text-gray-600">{actividad.estado}</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">Inicio</dt>
            <dd className="mt-1 text-gray-600">{formatFecha(actividad.fecha_inicio)}</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">Fin</dt>
            <dd className="mt-1 text-gray-600">{formatFecha(actividad.fecha_fin)}</dd>
          </div>
        </dl>

        {error && <p className="mt-4 text-xs font-semibold text-red-600">{error}</p>}
      </div>

      {actividad.teamsMeetingUrl && (
        <a
          href={actividad.teamsMeetingUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Abrir reunión de Teams <ExternalLink size={13} />
        </a>
      )}

      <button
        type="button"
        onClick={handleCrearEvento}
        disabled={!microsoftConnected || eventoCreado || isPending}
        className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed ${
          eventoCreado
            ? 'bg-violet-400'
            : 'bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300'
        }`}
      >
        {isPending && <Loader2 size={16} className="animate-spin" />}
        {!isPending && eventoCreado && <CheckCircle2 size={16} />}
        {!isPending && !eventoCreado && <CalendarPlus size={16} />}
        {eventoCreado ? 'Evento creado en el calendario' : 'Crear evento en Calendar'}
      </button>
    </article>
  )
}

function MicrosoftStatus({
  conectado,
  cuenta,
}: Readonly<{ conectado: boolean; cuenta?: string }>) {
  return (
    <div className={`inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold leading-snug ${
      conectado
        ? 'bg-emerald-50 text-emerald-700'
        : 'bg-gray-100 text-gray-500'
    }`}>
      <span className={`h-2 w-2 rounded-full ${conectado ? 'bg-emerald-500' : 'bg-gray-400'}`} />
      {conectado
        ? cuenta ?? 'Microsoft conectado'
        : 'Conexión con Microsoft no activa, inicie sesión desde su perfil'}
    </div>
  )
}
