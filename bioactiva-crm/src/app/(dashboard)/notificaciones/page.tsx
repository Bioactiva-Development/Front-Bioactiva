'use client'

import { useMemo, useState } from 'react'
import {
  AlertCircle,
  Bell,
  Clock,
  ExternalLink,
  Loader2,
  MessageCircle,
  Plug,
} from 'lucide-react'
import { useAuthStore } from '@/store'
import { RolUsuario } from '@/types/enums'
import { usePerfil } from '@/hooks/perfil/usePerfil'
import { useLeads } from '@/hooks/pipeline/useLeads'
import {
  useCrearRecordatorio,
  useCrearSeguimiento,
  useNotificacionesInApp,
  useNotificacionesProgramadas,
} from '@/hooks/notificaciones/useNotificaciones'
import {
  NotificacionAlerta,
  NotificacionProgramadaItem,
} from '@/components/modules/notificaciones/NotificacionItem'
import { RecordatorioForm } from '@/components/modules/notificaciones/RecordatorioForm'
import { SeguimientoForm } from '@/components/modules/notificaciones/SeguimientoForm'
import {
  CrearRecordatorioRequest,
  CrearSeguimientoRequest,
  EstadoNotificacionProgramada,
} from '@/types/notificacion.types'
import { getErrorMessage } from '@/lib/utils/error.utils'

type Seccion = 'centro' | 'recordatorio' | 'seguimiento'
type EstadoVisible = Extract<
  EstadoNotificacionProgramada,
  'PROGRAMADA' | 'VENCIDA'
>

export default function NotificacionesPage() {
  const [seccion, setSeccion] = useState<Seccion>('centro')
  const [estadoVisible, setEstadoVisible] = useState<EstadoVisible>('PROGRAMADA')
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const usuario = useAuthStore((state) => state.usuario)
  const idResponsable =
    usuario?.rol === RolUsuario.Trabajador ? usuario.id : undefined

  const { data: programadas = [], isLoading: loadingProgramadas } =
    useNotificacionesProgramadas({ estado: 'PROGRAMADA', idResponsable })
  const { data: vencidas = [], isLoading: loadingVencidas } =
    useNotificacionesProgramadas({ estado: 'VENCIDA', idResponsable })
  const { data: inApp = [], isLoading: loadingInApp } =
    useNotificacionesInApp()
  const { data: leadsResponse } = useLeads({ limit: 100 })

  const leadsPorId = useMemo(
    () => new Map((leadsResponse?.data ?? []).map((lead) => [lead.id, lead])),
    [leadsResponse?.data]
  )

  const visibles = estadoVisible === 'PROGRAMADA' ? programadas : vencidas
  const loadingScheduled =
    estadoVisible === 'PROGRAMADA' ? loadingProgramadas : loadingVencidas
  const noLeidas = inApp.filter((item) => item.estado === 'NO_LEIDA').length

  const { mutateAsync: crearRecordatorio, isPending: creandoRecordatorio } =
    useCrearRecordatorio()
  const { mutateAsync: crearSeguimiento, isPending: creandoSeguimiento } =
    useCrearSeguimiento()

  const {
    integraciones,
    integracionInfo,
    isLoadingIntegracion,
    conectarMicrosoft,
    desconectarMicrosoft,
  } = usePerfil()

  const resetMessages = () => {
    setFormError(null)
    setSuccessMessage(null)
  }

  const handleRecordatorio = async (values: CrearRecordatorioRequest) => {
    resetMessages()
    try {
      await crearRecordatorio(values)
      setSuccessMessage('Recordatorio programado correctamente.')
      setSeccion('centro')
      setEstadoVisible('PROGRAMADA')
    } catch (error) {
      setFormError(getErrorMessage(error, 'No se pudo programar el recordatorio.'))
    }
  }

  const handleSeguimiento = async (values: CrearSeguimientoRequest) => {
    resetMessages()
    try {
      await crearSeguimiento(values)
      setSuccessMessage('Seguimiento programado correctamente.')
      setSeccion('centro')
      setEstadoVisible('PROGRAMADA')
    } catch (error) {
      setFormError(getErrorMessage(error, 'No se pudo programar el seguimiento.'))
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Centro de notificaciones
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
          {idResponsable && (
            <p className="mt-1 text-xs text-gray-500">
              Mostrando programaciones asociadas a tu usuario.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => { resetMessages(); setSeccion('recordatorio') }}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700"
          >
            <Clock size={16} /> Recordatorio
          </button>
          <button
            type="button"
            onClick={() => { resetMessages(); setSeccion('seguimiento') }}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            <MessageCircle size={16} /> Seguimiento
          </button>
        </div>
      </header>

      {formError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {formError}
        </div>
      )}
      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      {seccion === 'recordatorio' && (
        <RecordatorioForm
          onSubmit={handleRecordatorio}
          isLoading={creandoRecordatorio}
          error={formError}
          onCancel={() => setSeccion('centro')}
        />
      )}

      {seccion === 'seguimiento' && (
        <SeguimientoForm
          onSubmit={handleSeguimiento}
          isLoading={creandoSeguimiento}
          error={formError}
          onCancel={() => setSeccion('centro')}
        />
      )}

      {seccion === 'centro' && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Metric label="Sin leer" value={noLeidas} tone="text-red-600" />
            <Metric label="Programadas" value={programadas.length} tone="text-emerald-700" />
            <Metric label="Vencidas" value={vencidas.length} tone="text-amber-700" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
            <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Bandeja personal</h2>
                  <p className="text-xs text-gray-500">
                    Incluye alertas automaticas para leads abiertos con 30+ dias sin cambio.
                  </p>
                </div>
                <Bell size={20} className="text-emerald-600" />
              </div>
              <div className="mt-5 space-y-3">
                {!loadingInApp && inApp.length === 0 && (
                  <p className="text-sm text-gray-500">No hay alertas por mostrar.</p>
                )}
                {inApp.map((notificacion) => (
                  <NotificacionAlerta key={notificacion.id} notificacion={notificacion} />
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-gray-900">Correos programados</h2>
                  <p className="text-xs text-gray-500">
                    El encargado mostrado corresponde al propietario actual del lead.
                  </p>
                </div>
                <div className="flex rounded-xl bg-gray-100 p-1">
                  {(['PROGRAMADA', 'VENCIDA'] as const).map((estado) => (
                    <button
                      key={estado}
                      type="button"
                      onClick={() => setEstadoVisible(estado)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        estadoVisible === estado
                          ? 'bg-white text-emerald-700 shadow-sm'
                          : 'text-gray-500'
                      }`}
                    >
                      {estado === 'PROGRAMADA' ? 'Programadas' : 'Vencidas'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {!loadingScheduled && visibles.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No hay notificaciones {estadoVisible === 'PROGRAMADA' ? 'programadas' : 'vencidas'}.
                  </p>
                )}
                {visibles.map((notificacion) => {
                  const lead = leadsPorId.get(notificacion.idLead)
                  return (
                    <NotificacionProgramadaItem
                      key={notificacion.id}
                      notificacion={notificacion}
                      leadLabel={lead
                        ? `${lead.codigo} · ${lead.organizacion_nombre ?? lead.contacto_nombre ?? 'Lead'}`
                        : `Lead ${notificacion.idLead}`}
                      responsableActual={lead?.encargado_nombre}
                    />
                  )
                })}
              </div>
            </section>
          </div>
        </>
      )}

      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50">
            <Plug size={16} className="text-indigo-600" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Integración Microsoft</h2>
            <p className="text-xs text-gray-500">
              Conecta Microsoft para crear eventos Outlook/Teams desde actividades tipo reunion.
            </p>
          </div>
        </div>
        <div className="space-y-4 px-6 py-5">
            {integracionInfo && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> {integracionInfo}
            </div>
          )}
          {integraciones?.outlook.cuenta && (
            <p className="text-sm text-gray-600">
              Cuenta conectada: <span className="font-semibold">{integraciones.outlook.cuenta}</span>
            </p>
          )}
          <button
            type="button"
            onClick={
              integraciones?.teams.conectado || integraciones?.outlook.conectado
                ? desconectarMicrosoft
                : () => conectarMicrosoft('/notificaciones')
            }
            disabled={isLoadingIntegracion}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0078D4] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isLoadingIntegracion
              ? <Loader2 size={16} className="animate-spin" />
              : <ExternalLink size={15} />}
            {integraciones?.teams.conectado || integraciones?.outlook.conectado
              ? 'Desconectar Microsoft'
              : 'Conectar con Microsoft'}
          </button>
        </div>
      </section>
    </div>
  )
}

function Metric({
  label,
  value,
  tone,
}: Readonly<{ label: string; value: number; tone: string }>) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`mt-3 text-3xl font-bold ${tone}`}>{value}</p>
    </div>
  )
}
