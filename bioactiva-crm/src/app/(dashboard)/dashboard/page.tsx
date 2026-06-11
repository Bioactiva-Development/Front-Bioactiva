'use client'

import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  Target, Percent, Clock, Timer,
  Activity, DollarSign, TrendingUp, Calendar,
  RefreshCw
} from 'lucide-react'
import { useLeads } from '@/hooks/pipeline/useLeads'
import { useCotizaciones } from '@/hooks/cotizaciones/useCotizaciones'
import { useDashboardMetrics } from '@/hooks/dashboard/useDashboardMetrics'
import { EstadoCot, LeadState } from '@/types/enums'


interface KpiCardProps {
  label:       string
  valor:       string | number
  descripcion: string
  icono:       React.ReactNode
  iconoBg:     string
  extra?:      React.ReactNode
}

interface PeriodoTab {
  key:    string
  label:  string
  sub:    string
}

const ANIOS = ['2024', '2025', '2026']
const DASHBOARD_FETCH_LIMIT = 500

const PIPELINE_ESTADOS = [
  { estado: LeadState.Prospecto,      color: '#6b7280' },
  { estado: LeadState.Ofertado,       color: '#f59e0b' },
  { estado: LeadState.CierreVenta,    color: '#10b981' },
  { estado: LeadState.CierreSinVenta, color: '#ef4444' },
]

const COTIZACION_ESTADOS = [
  { name: EstadoCot.Pendiente,  color: '#9ca3af' },
  { name: EstadoCot.Enviada,    color: '#3b82f6' },
  { name: EstadoCot.Aceptada,   color: '#10b981' },
  { name: EstadoCot.Rechazada,  color: '#ef4444' },
]

const parseDateBoundary = (date: string) => new Date(`${date}T00:00:00`)

const toIsoDateBoundary = (date: string) =>
  new Date(`${date}T00:00:00.000Z`).toISOString()

const isWithinPeriod = (isoDate: string | undefined, start: Date, end: Date) => {
  if (!isoDate) return false
  const time = new Date(isoDate).getTime()
  return time >= start.getTime() && time < end.getTime()
}

function KpiCard({ label, valor, descripcion, icono, iconoBg, extra }: Readonly<KpiCardProps>) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide leading-tight">
          {label}
        </p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconoBg}`}>
          {icono}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{valor}</p>
      <p className="text-xs text-gray-400">{descripcion}</p>
      {extra}
    </div>
  )
}

const getPeriodos = (anio: string): PeriodoTab[] => [
  { key: 'anio', label: 'AÑO COMPLETO', sub: anio },
  { key: 'q1',   label: '1ER TRIMESTRE', sub: 'Enero - Marzo' },
  { key: 'q2',   label: '2DO TRIMESTRE', sub: 'Abril - Junio' },
  { key: 'q3',   label: '3ER TRIMESTRE', sub: 'Julio - Setiembre' },
  { key: 'q4',   label: '4TO TRIMESTRE', sub: 'Octubre - Diciembre' },
]

const getPeriodDates = (periodo: string, anio: string) => {
  const year = Number.parseInt(anio)

  switch (periodo) {
    case 'q1':
      return { inicio: `${year}-01-01`, fin: `${year}-04-01` }
    case 'q2':
      return { inicio: `${year}-04-01`, fin: `${year}-07-01` }
    case 'q3':
      return { inicio: `${year}-07-01`, fin: `${year}-10-01` }
    case 'q4':
      return { inicio: `${year}-10-01`, fin: `${year + 1}-01-01` }
    default:
      return { inicio: `${year}-01-01`, fin: `${year + 1}-01-01` }
  }
}

const formatCurrency = (value?: number) =>
  `S/ ${(value ?? 0).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const formatPercent = (value?: number) =>
  `${(value ?? 0).toLocaleString('es-PE', {
    maximumFractionDigits: 2,
  })}%`

const formatDays = (value?: number) =>
  `${(value ?? 0).toLocaleString('es-PE', {
    maximumFractionDigits: 1,
  })} días`

const formatAverage = (value?: number) =>
  (value ?? 0).toLocaleString('es-PE', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })

export default function DashboardPage() {
  const [periodoActivo, setPeriodoActivo] = useState('anio')
  const [anioActivo, setAnioActivo]       = useState('2026')
  const [fechaInicio, setFechaInicio]     = useState('2026-01-01')
  const [fechaFin, setFechaFin]           = useState('2027-01-01')
  const { data: leadsResponse, isLoading: cargandoLeads, isError: errorLeads } =
    useLeads({ page: 1, limit: DASHBOARD_FETCH_LIMIT })
  const {
    data: cotizacionesResponse,
    isLoading: cargandoCotizaciones,
    isError: errorCotizaciones,
  } = useCotizaciones({ page: 1, limit: DASHBOARD_FETCH_LIMIT })
  const dashboardParams = useMemo(() => ({
    startDate: toIsoDateBoundary(fechaInicio),
    endDate: toIsoDateBoundary(fechaFin),
  }), [fechaFin, fechaInicio])
  const {
    data: metrics,
    isLoading: cargandoMetricas,
    isError: errorMetricas,
  } = useDashboardMetrics(dashboardParams)
  const kpiValor = (value: string) => cargandoMetricas ? '...' : value

  const hoy = useMemo(() => {
    return new Date().toLocaleDateString('es-PE', {
      day:   '2-digit',
      month: 'short',
      year:  'numeric',
    })
  }, [])

  const handlePeriodo = (key: string) => {
    setPeriodoActivo(key)
    const { inicio, fin } = getPeriodDates(key, anioActivo)
    setFechaInicio(inicio)
    setFechaFin(fin)
  }

  const handleAnio = (anio: string) => {
    setAnioActivo(anio)
    const { inicio, fin } = getPeriodDates(periodoActivo, anio)
    setFechaInicio(inicio)
    setFechaFin(fin)
  }

  const handleReiniciar = () => {
    setPeriodoActivo('anio')
    setAnioActivo('2026')
    setFechaInicio('2026-01-01')
    setFechaFin('2027-01-01')
  }

  const rangoFechas = useMemo(() => ({
    inicio: parseDateBoundary(fechaInicio),
    fin:    parseDateBoundary(fechaFin),
  }), [fechaFin, fechaInicio])
  const periodos = useMemo(() => getPeriodos(anioActivo), [anioActivo])

  const pipelineData = useMemo(() => {
    const leadsPeriodo = (leadsResponse?.data ?? []).filter((lead) =>
      isWithinPeriod(lead.created_at, rangoFechas.inicio, rangoFechas.fin)
    )

    return PIPELINE_ESTADOS.map(({ estado, color }) => ({
      estado,
      cantidad: leadsPeriodo.filter((lead) => lead.estado === estado).length,
      color,
    }))
  }, [leadsResponse?.data, rangoFechas])

  const cotizacionesData = useMemo(() => {
    const cotizacionesPeriodo = (cotizacionesResponse?.data ?? []).filter((cotizacion) =>
      isWithinPeriod(cotizacion.fecha_cot, rangoFechas.inicio, rangoFechas.fin)
    )

    return COTIZACION_ESTADOS
      .map(({ name, color }) => ({
        name,
        value: cotizacionesPeriodo.filter((cotizacion) => cotizacion.estado === name).length,
        color,
      }))
      .filter((item) => item.value > 0)
  }, [cotizacionesResponse?.data, rangoFechas])

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Activity size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                BioActiva CRM
              </p>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard comercial
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Activo · {hoy}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-emerald-600" />
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                Periodo de análisis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Año</span>
              <select
                value={anioActivo}
                onChange={(e) => handleAnio(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 outline-none
                  focus:border-emerald-400 text-gray-700"
              >
                {ANIOS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {periodos.map((p) => (
              <button
                key={p.key}
                onClick={() => handlePeriodo(p.key)}
                className={`
                  rounded-xl p-3 text-left transition-all
                  ${periodoActivo === p.key
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-200'
                    : 'bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700'
                  }
                `}
              >
                <p className={`text-xs font-bold uppercase tracking-wide
                  ${periodoActivo === p.key ? 'text-emerald-100' : 'text-gray-400'}`}>
                  {p.label}
                </p>
                <p className={`text-sm font-semibold mt-0.5
                  ${periodoActivo === p.key ? 'text-white' : 'text-gray-600'}`}>
                  {p.sub}
                </p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_260px_auto] gap-4 items-end">
            <div className="space-y-1">
              <label htmlFor="dash-fecha-inicio" className="text-xs text-gray-500">Fecha inicio</label>
              <input
                id="dash-fecha-inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                  outline-none focus:border-emerald-400 text-gray-700"
              />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1">
                <label htmlFor="dash-fecha-fin" className="text-xs text-gray-500">Fecha fin</label>
                <input
                  id="dash-fecha-fin"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                    outline-none focus:border-emerald-400 text-gray-700"
                />
              </div>
            </div>
            <button
              onClick={handleReiniciar}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200
                text-emerald-600 hover:bg-emerald-50 text-sm font-medium transition-colors shrink-0"
            >
              <RefreshCw size={14} />
              Reiniciar
            </button>
          </div>
        </div>
      </div>

      {errorMetricas && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          No se pudieron cargar las métricas del dashboard.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Leads generados"
          valor={kpiValor(String(metrics?.totalLeads ?? 0))}
          descripcion="Registrados en el periodo"
          iconoBg="bg-gray-100"
          icono={<Target size={20} className="text-gray-500" />}
        />
        <KpiCard
          label="Tasa de conversión"
          valor={kpiValor(formatPercent(metrics?.conversionRate))}
          descripcion="Leads convertidos en venta"
          iconoBg="bg-blue-50"
          icono={<Percent size={20} className="text-blue-500" />}
        />
        <KpiCard
          label="Propuesta → Venta"
          valor={kpiValor(formatPercent(metrics?.proposalToCloseRate))}
          descripcion="Propuestas que cierran con venta"
          iconoBg="bg-cyan-50"
          icono={<Percent size={20} className="text-cyan-600" />}
        />
        <KpiCard
          label="Ticket promedio"
          valor={kpiValor(formatCurrency(metrics?.averageTicketAmount))}
          descripcion="Promedio de cierres con venta"
          iconoBg="bg-emerald-50"
          icono={<DollarSign size={20} className="text-emerald-500" />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Tiempo promedio de cierre"
          valor={kpiValor(formatDays(metrics?.avgClosingTimeDays))}
          descripcion="Desde registro hasta cierre con venta"
          iconoBg="bg-orange-50"
          icono={<Clock size={20} className="text-orange-500" />}
        />
        <KpiCard
          label="Tiempo en etapa propuesta"
          valor={kpiValor(formatDays(metrics?.avgProposalStageDays))}
          descripcion="Promedio en etapa ofertado"
          iconoBg="bg-purple-50"
          icono={<Timer size={20} className="text-purple-500" />}
        />
        <KpiCard
          label="Seguimientos por lead"
          valor={kpiValor(formatAverage(metrics?.avgActivitiesPerLead))}
          descripcion="Promedio de actividades registradas"
          iconoBg="bg-gray-100"
          icono={<Activity size={20} className="text-gray-500" />}
        />
        <KpiCard
          label="Leads sin avance"
          valor={kpiValor(formatPercent(metrics?.stalledLeadPercentage))}
          descripcion="Leads estancados más de 30 días"
          iconoBg="bg-red-50"
          icono={<Calendar size={20} className="text-red-500" />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard
          label="Monto en pipeline"
          valor={kpiValor(formatCurrency(metrics?.pipelineTotalAmount))}
          descripcion="Monto de leads abiertos"
          iconoBg="bg-emerald-50"
          icono={<DollarSign size={20} className="text-emerald-500" />}
        />
        <KpiCard
          label="Ingresos cerrados"
          valor={kpiValor(formatCurrency(metrics?.closedRevenue))}
          descripcion="Cotizaciones cerradas con venta"
          iconoBg="bg-blue-50"
          icono={<TrendingUp size={20} className="text-blue-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Pipeline por etapa
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 mb-6">
            Cantidad de leads por estado comercial.
          </p>
          {cargandoLeads && (
            <div className="h-60 flex items-center justify-center">
              <p className="text-sm text-gray-400">Cargando pipeline...</p>
            </div>
          )}
          {!cargandoLeads && errorLeads && (
            <div className="h-60 flex items-center justify-center">
              <p className="text-sm text-red-500">No se pudo cargar el pipeline.</p>
            </div>
          )}
          {!cargandoLeads && !errorLeads && (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={pipelineData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="estado"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                  {pipelineData.map((entry) => (
                    <Cell key={entry.estado} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Estado de cotizaciones
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 mb-6">
            Distribución de propuestas del periodo.
          </p>

          {cargandoCotizaciones && (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-gray-400">Cargando cotizaciones...</p>
            </div>
          )}
          {!cargandoCotizaciones && errorCotizaciones && (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-red-500">No se pudieron cargar las cotizaciones.</p>
            </div>
          )}
          {!cargandoCotizaciones && !errorCotizaciones && cotizacionesData.length === 0 && (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-emerald-600 font-medium">
                Sin cotizaciones en el periodo seleccionado.
              </p>
            </div>
          )}
          {!cargandoCotizaciones && !errorCotizaciones && cotizacionesData.length !== 0 && (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={cotizacionesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {cotizacionesData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
