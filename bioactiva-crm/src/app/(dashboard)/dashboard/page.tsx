'use client'

import { useState, useMemo, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Legend
} from 'recharts'
import { TargetIcon }        from '@phosphor-icons/react/dist/csr/Target'
import { PercentIcon }        from '@phosphor-icons/react/dist/csr/Percent'
import { ClockIcon }          from '@phosphor-icons/react/dist/csr/Clock'
import { HourglassIcon }      from '@phosphor-icons/react/dist/csr/Hourglass'
import { PulseIcon }          from '@phosphor-icons/react/dist/csr/Pulse'
import { CurrencyDollarIcon } from '@phosphor-icons/react/dist/csr/CurrencyDollar'
import { TrendUpIcon }        from '@phosphor-icons/react/dist/csr/TrendUp'
import { CalendarXIcon }      from '@phosphor-icons/react/dist/csr/CalendarX'
import { ChartLineUpIcon }    from '@phosphor-icons/react/dist/csr/ChartLineUp'
import {
  RefreshCw, ChevronDown, ChevronUp, Filter, Calendar, Loader2,
} from 'lucide-react'

import { useDashboardMetrics }   from '@/hooks/dashboard/useDashboardMetrics'
import { EstadoCot, LeadState }  from '@/types/enums'
import type { MoneyByCurrency }   from '@/types/dashboard.types'


interface KpiCardProps {
  label:        string
  valor:        React.ReactNode
  descripcion:  string
  icono:        React.ReactNode
  iconoBg:      string
  extra?:       React.ReactNode
  compact?:     boolean
  accentBorder?: string
}

interface PeriodoTab {
  key:    string
  label:  string
  sub:    string
}

interface DateFieldProps {
  id: string
  value: string
  min?: string
  max?: string
  calendarLabel: string
  className: string
  onFocus: () => void
  onChange: (value: string) => string
}

const ANIO_INICIAL      = 2020
const ANIO_ACTUAL       = new Date().getFullYear()
const ANIO_ACTUAL_TEXTO = String(ANIO_ACTUAL)
const ANIOS             = Array.from(
  { length: ANIO_ACTUAL - ANIO_INICIAL + 1 },
  (_, index) => String(ANIO_ACTUAL - index)
)

const PIPELINE_ESTADOS = [
  { estado: LeadState.Prospecto,      backendEstado: 'EN_PROSPECTO',      color: '#6b7280' },
  { estado: LeadState.Ofertado,       backendEstado: 'OFERTADO',          color: '#f59e0b' },
  { estado: LeadState.CierreVenta,    backendEstado: 'CIERRE_CON_VENTA',  color: '#10b981' },
  { estado: LeadState.CierreSinVenta, backendEstado: 'CIERRE_SIN_VENTA', color: '#ef4444' },
]

const COTIZACION_ESTADOS = [
  { name: EstadoCot.Pendiente,  backendEstado: 'PENDIENTE',  color: '#9ca3af' },
  { name: EstadoCot.Enviada,    backendEstado: 'ENVIADA',    color: '#3b82f6' },
  { name: EstadoCot.Aceptada,   backendEstado: 'ACEPTADA',   color: '#10b981' },
  { name: EstadoCot.Rechazada,  backendEstado: 'RECHAZADA',  color: '#ef4444' },
]

const parseDateBoundary = (date: string, endOfDay = false) =>
  new Date(`${date}T${endOfDay ? '23:59:59.999' : '00:00:00'}Z`)

const toIsoDateBoundary = (date: string, endOfDay = false) =>
  new Date(`${date}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`).toISOString()

const formatDateForDisplay = (date: string) => {
  const [year, month, day] = date.split('-')
  return year && month && day ? `${day}/${month}/${year}` : ''
}

const parseDisplayDate = (date: string) => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date)
  if (!match) return null
  const [, day, month, year] = match
  const parsed = new Date(`${year}-${month}-${day}T00:00:00.000Z`)
  if (
    parsed.getUTCFullYear() !== Number(year) ||
    parsed.getUTCMonth() + 1 !== Number(month) ||
    parsed.getUTCDate() !== Number(day)
  ) return null
  return `${year}-${month}-${day}`
}

const formatTypedDate = (value: string) => {
  const digits = value.replaceAll(/\D/g, '').slice(0, 8)
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean)
    .join('/')
}


function DateField({
  id,
  value,
  min,
  max,
  calendarLabel,
  className,
  onFocus,
  onChange,
}: Readonly<DateFieldProps>) {
  const [displayValue, setDisplayValue] = useState(formatDateForDisplay(value))
  const dateInputRef = useRef<HTMLInputElement>(null)

  const commitDisplayValue = (nextDisplayValue: string) => {
    const parsed = parseDisplayDate(nextDisplayValue)
    if (parsed) {
      const committed = onChange(parsed)
      if (committed !== parsed) {
        setDisplayValue(formatDateForDisplay(committed))
      }
      return true
    }
    return false
  }

  const handleTextChange = (nextValue: string) => {
    const formatted = formatTypedDate(nextValue)
    setDisplayValue(formatted)
    commitDisplayValue(formatted)
  }

  const invalidDisplay = displayValue.length === 10 && !parseDisplayDate(displayValue)
  const openDatePicker = () => {
    onFocus()
    const dateInput = dateInputRef.current
    if (!dateInput) return

    dateInput.focus()
    try {
      if (dateInput.showPicker) {
        dateInput.showPicker()
      } else {
        dateInput.click()
      }
    } catch {
      dateInput.click()
    }
  }

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={10}
        placeholder="dd/mm/aaaa"
        value={displayValue}
        aria-invalid={invalidDisplay}
        onFocus={onFocus}
        onChange={(event) => handleTextChange(event.target.value)}
        onBlur={() => {
          if (!commitDisplayValue(displayValue)) {
            setDisplayValue(formatDateForDisplay(value))
          }
        }}
        className={`${className} pr-11`}
      />
      <input
        ref={dateInputRef}
        type="date"
        value={value}
        min={min}
        max={max}
        aria-hidden="true"
        tabIndex={-1}
        onFocus={onFocus}
        onChange={(event) => onChange(event.target.value)}
        className="pointer-events-none absolute right-0 top-0 h-full w-11 opacity-0"
      />
      <button
        type="button"
        aria-label={calendarLabel}
        onClick={openDatePicker}
        className="absolute right-0 top-0 flex h-full w-11 cursor-pointer items-center justify-center
          rounded-r-lg text-gray-500 transition-colors hover:text-emerald-600
          focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
      >
        <Calendar size={16} aria-hidden="true" />
      </button>
    </div>
  )
}

function KpiCard({ label, valor, descripcion, icono, iconoBg, extra, compact = false, accentBorder = 'border-t-gray-200' }: Readonly<KpiCardProps>) {
  return (
    <div className={`group bg-white rounded-2xl border border-gray-100 border-t-2 ${accentBorder} cursor-default
      hover:shadow-lg hover:-translate-y-1
      transition-all duration-200 ease-out
      ${compact ? 'p-3' : 'p-6'}`}>
      <div className={`flex items-center justify-between ${compact ? 'mb-2' : 'mb-5'}`}>
        <div className={`rounded-xl flex items-center justify-center shrink-0 ${iconoBg}
          ${compact ? 'w-7 h-7' : 'w-10 h-10'}`}>
          {icono}
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em] text-right leading-snug max-w-[58%]">
          {label}
        </p>
      </div>
      <p className={`font-extrabold text-gray-900 tabular-nums leading-none tracking-tight
        ${compact ? 'text-xl' : 'text-[2.1rem]'}`}>
        {valor}
      </p>
      <p className={`text-xs text-gray-300
        translate-y-1 opacity-0
        group-hover:translate-y-0 group-hover:opacity-100 group-hover:text-gray-400
        transition-all duration-200 ease-out
        ${compact ? 'mt-1.5' : 'mt-3'}`}>
        {descripcion}
      </p>
      {extra}
    </div>
  )
}

function SectionLabel({ children, accent }: Readonly<{ children: string; accent: string }>) {
  return (
    <div className="flex items-center gap-2 pt-0">
      <div className={`w-0.75 h-4.5 rounded-full shrink-0 ${accent}`} />
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
        {children}
      </span>
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
    case 'q1': return { inicio: `${year}-01-01`, fin: `${year}-03-31` }
    case 'q2': return { inicio: `${year}-04-01`, fin: `${year}-06-30` }
    case 'q3': return { inicio: `${year}-07-01`, fin: `${year}-09-30` }
    case 'q4': return { inicio: `${year}-10-01`, fin: `${year}-12-31` }
    default:   return { inicio: `${year}-01-01`, fin: `${year}-12-31` }
  }
}

const formatPen = (value?: number) =>
  `S/ ${(value ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const formatUsd = (value?: number) =>
  `US$ ${(value ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/**
 * Muestra un monto en ambas divisas por separado (S/ y US$). El backend reporta
 * cada divisa de forma independiente y nunca las combina, por eso se apilan en
 * dos lineas en lugar de sumarse. Se renderiza con <span> para ser HTML valido
 * dentro del <p> de la KpiCard.
 */
function MoneyDual({ value }: Readonly<{ value?: MoneyByCurrency }>) {
  return (
    <span className="flex flex-col gap-0.5 leading-none">
      <span>{formatPen(value?.pen)}</span>
      <span className="text-sm font-bold text-gray-400 tabular-nums tracking-tight">
        {formatUsd(value?.usd)}
      </span>
    </span>
  )
}

const formatPercent = (value?: number) =>
  `${(value ?? 0).toLocaleString('es-PE', { maximumFractionDigits: 2 })}%`

const formatDays = (value?: number) =>
  `${(value ?? 0).toLocaleString('es-PE', { maximumFractionDigits: 1 })} días`

const formatAverage = (value?: number) =>
  (value ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export default function DashboardPage() {
  const [periodoActivo, setPeriodoActivo] = useState('anio')
  const [anioActivo, setAnioActivo]       = useState(ANIO_ACTUAL_TEXTO)
  const [fechaInicio, setFechaInicio]     = useState(`${ANIO_ACTUAL}-01-01`)
  const [fechaFin, setFechaFin]           = useState(`${ANIO_ACTUAL}-12-31`)
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)

  const dashboardParams = useMemo(() => ({
    startDate: toIsoDateBoundary(fechaInicio),
    endDate:   toIsoDateBoundary(fechaFin, true),
  }), [fechaFin, fechaInicio])
  const { data: metrics, isLoading: cargandoMetricas, isError: errorMetricas } =
    useDashboardMetrics(dashboardParams)

  const cargando = cargandoMetricas

  const kpiValor = (value: string) => cargandoMetricas ? '...' : value
  const kpiMonto = (value?: MoneyByCurrency) =>
    cargandoMetricas ? '...' : <MoneyDual value={value} />
  const handlePeriodo = (key: string) => {
    setPeriodoActivo(key)
    const { inicio, fin } = getPeriodDates(key, anioActivo)
    setFechaInicio(inicio)
    setFechaFin(fin)
  }

  const handleAnio = (anio: string) => {
    setAnioActivo(anio)
    if (periodoActivo === 'custom') return
    const { inicio, fin } = getPeriodDates(periodoActivo, anio)
    setFechaInicio(inicio)
    setFechaFin(fin)
  }

  const handleReiniciar = () => {
    setPeriodoActivo('anio')
    setAnioActivo(ANIO_ACTUAL_TEXTO)
    setFechaInicio(`${ANIO_ACTUAL}-01-01`)
    setFechaFin(`${ANIO_ACTUAL}-12-31`)
  }

  const handleFechaInicio = (date: string) => {
    if (!date) return fechaInicio
    setPeriodoActivo('custom')
    setFechaInicio(date)
    if (fechaFin < date) setFechaFin(date)
    return date
  }

  const handleFechaFin = (date: string) => {
    if (!date) return fechaFin
    setPeriodoActivo('custom')
    const nextDate = date < fechaInicio ? fechaInicio : date
    setFechaFin(nextDate)
    return nextDate
  }

  const handleFechaFocus = () => setPeriodoActivo('custom')

  const periodos = useMemo(() => getPeriodos(anioActivo), [anioActivo])
  const periodoSeleccionado = periodoActivo === 'custom'
    ? 'RANGO PERSONALIZADO'
    : `${periodos.find((periodo) => periodo.key === periodoActivo)?.label ?? 'AÑO COMPLETO'} ${anioActivo}`

  const pipelineData = useMemo(() => {
    const dist = metrics?.distribucionPipeline ?? []
    return PIPELINE_ESTADOS.map(({ estado, backendEstado, color }) => ({
      estado,
      cantidad: dist.find((d) => d.estado === backendEstado)?.cantidad ?? 0,
      fill: color,
    }))
  }, [metrics?.distribucionPipeline])

  const cotizacionesData = useMemo(() => {
    const dist = metrics?.distribucionCotizaciones ?? []
    return COTIZACION_ESTADOS
      .map(({ name, backendEstado, color }) => ({
        name,
        value: dist.find((d) => d.estado === backendEstado)?.cantidad ?? 0,
        fill: color,
      }))
      .filter((item) => item.value > 0)
  }, [metrics?.distribucionCotizaciones])

  const metricasConValor = metrics
    ? [
        metrics.totalLeads,
        metrics.conversionRate,
        metrics.avgClosingTimeDays,
        metrics.proposalToCloseRate,
        metrics.avgProposalStageDays,
        metrics.avgActivitiesPerLead,
        metrics.stalledLeadPercentage,
        metrics.averageTicketAmount.pen,
        metrics.averageTicketAmount.usd,
        metrics.pipelineTotalAmount.pen,
        metrics.pipelineTotalAmount.usd,
        metrics.closedRevenue.pen,
        metrics.closedRevenue.usd,
      ].some((value) => value !== 0)
    : false
  const sinDataPeriodo =
    !cargandoMetricas &&
    !errorMetricas &&
    !metricasConValor &&
    !pipelineData.some((item) => item.cantidad > 0) &&
    cotizacionesData.length === 0

  return (
    <div className="space-y-3">

      {/* Header */}
      <div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard comercial</h1>
          <p className="text-sm text-gray-400 mt-0.5">Métricas del periodo seleccionado</p>
        </div>
      </div>

      {/* Filtros colapsables */}
      <div className={`rounded-xl border transition-colors ${filtrosAbiertos ? 'bg-white border-gray-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
        <button
          onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
          className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Filtros</span>
            <span className="text-xs text-gray-400">
              · {periodoSeleccionado}
            </span>
          </div>
          {filtrosAbiertos
            ? <ChevronUp size={14} className="text-gray-400" />
            : <ChevronDown size={14} className="text-gray-400" />
          }
        </button>

        {filtrosAbiertos && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-400" />
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Periodo de análisis
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400">Año</span>
                <select
                  value={anioActivo}
                  onChange={(e) => handleAnio(e.target.value)}
                  className="text-xs border border-gray-100 rounded-md px-2 py-1 outline-none
                    focus:border-emerald-300 text-gray-600 bg-white cursor-pointer"
                >
                  {ANIOS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
              {periodos.map((p) => (
                <button
                  key={p.key}
                  onClick={() => handlePeriodo(p.key)}
                  className={`rounded-lg py-2 px-2.5 text-left transition-all cursor-pointer
                    ${periodoActivo === p.key
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-100'
                      : 'bg-white border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50 text-gray-500 hover:text-emerald-600'
                    }`}
                >
                  <p className={`text-[10px] font-semibold uppercase tracking-wide
                    ${periodoActivo === p.key ? 'text-emerald-100' : 'text-gray-400'}`}>
                    {p.label}
                  </p>
                  <p className={`text-xs font-medium mt-0.5
                    ${periodoActivo === p.key ? 'text-white' : 'text-gray-500'}`}>
                    {p.sub}
                  </p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-3 items-end">
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <label
                    htmlFor="dash-fecha-inicio"
                    className={`text-[11px] font-medium uppercase tracking-wide transition-colors ${
                      periodoActivo === 'custom' ? 'text-emerald-600' : 'text-gray-400'
                    }`}
                  >
                    Fecha inicio
                  </label>
                  <span className="text-[10px] font-medium text-gray-400">
                    DD/MM/YYYY
                  </span>
                </div>
                <DateField
                  key={fechaInicio}
                  id="dash-fecha-inicio"
                  value={fechaInicio}
                  max={fechaFin}
                  calendarLabel="Abrir calendario inicial"
                  onFocus={handleFechaFocus}
                  onChange={handleFechaInicio}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-600 outline-none
                    transition-colors focus:border-emerald-400 ${
                      periodoActivo === 'custom'
                        ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-100'
                        : 'border-gray-100 bg-white'
                    }`}
                />
              </div>
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <label
                      htmlFor="dash-fecha-fin"
                      className={`text-[11px] font-medium uppercase tracking-wide transition-colors ${
                        periodoActivo === 'custom' ? 'text-emerald-600' : 'text-gray-400'
                      }`}
                    >
                      Fecha fin
                    </label>
                    <span className="text-[10px] font-medium text-gray-400">
                      DD/MM/YYYY
                    </span>
                  </div>
                  <DateField
                    key={fechaFin}
                    id="dash-fecha-fin"
                    value={fechaFin}
                    min={fechaInicio}
                    calendarLabel="Abrir calendario final"
                    onFocus={handleFechaFocus}
                    onChange={handleFechaFin}
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-600 outline-none
                      transition-colors focus:border-emerald-400 ${
                        periodoActivo === 'custom'
                          ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-100'
                          : 'border-gray-100 bg-white'
                      }`}
                  />
                </div>
              </div>
              <button
                onClick={handleReiniciar}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200
                  text-gray-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50
                  text-sm font-medium transition-colors shrink-0 cursor-pointer"
              >
                <RefreshCw size={14} />
                Reiniciar
              </button>
            </div>
          </div>
        )}
      </div>

      {errorMetricas && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          No se pudieron cargar las métricas del dashboard.
        </div>
      )}

      {cargando && (
        <div className="flex min-h-52 items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-12 shadow-sm">
          <Loader2 size={20} className="animate-spin text-emerald-500" />
          <span className="text-sm text-gray-400">Cargando datos del periodo...</span>
        </div>
      )}

      {!cargando && sinDataPeriodo && (
        <output
          className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-2xl
            border border-gray-200 bg-white px-6 py-12 text-center shadow-sm"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
            <CalendarXIcon size={24} weight="duotone" className="text-emerald-600" />
          </div>
          <p className="text-sm font-semibold text-gray-600">
            No hay data para este periodo seleccionado
          </p>
        </output>
      )}

      {!cargando && !sinDataPeriodo && (
        <>

      {/* ─── PRIMERA PANTALLA ─── */}

      {/* Cabecera de sección */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-base font-bold text-gray-800">Resultados comerciales</h2>
        <span className="text-[11px] text-gray-400 uppercase tracking-wide">
          {periodoSeleccionado}
        </span>
      </div>

      {/* Lo más importante — 4 KPIs de volumen */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
          Lo más importante
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard compact accentBorder="border-t-emerald-200"
            label="Leads generados"
            valor={kpiValor(String(metrics?.totalLeads ?? 0))}
            descripcion="Registrados en el periodo"
            iconoBg="bg-emerald-50"
            icono={<TargetIcon size={16} weight="duotone" className="text-emerald-500" />}
          />
          <KpiCard compact accentBorder="border-t-emerald-200"
            label="Ticket promedio"
            valor={kpiMonto(metrics?.averageTicketAmount)}
            descripcion="Promedio de cierres con venta · soles y dólares por separado"
            iconoBg="bg-emerald-50"
            icono={<CurrencyDollarIcon size={16} weight="duotone" className="text-emerald-500" />}
          />
          <KpiCard compact accentBorder="border-t-cyan-200"
            label="Monto en pipeline"
            valor={kpiMonto(metrics?.pipelineTotalAmount)}
            descripcion="Monto de leads abiertos · soles y dólares por separado"
            iconoBg="bg-cyan-50"
            icono={<ChartLineUpIcon size={16} weight="duotone" className="text-cyan-600" />}
          />
          <KpiCard compact accentBorder="border-t-blue-200"
            label="Ingresos cerrados"
            valor={kpiMonto(metrics?.closedRevenue)}
            descripcion="Cotizaciones cerradas con venta · soles y dólares por separado"
            iconoBg="bg-blue-50"
            icono={<CurrencyDollarIcon size={16} weight="duotone" className="text-blue-500" />}
          />
        </div>
      </div>

      {/* Gráficos — altura calculada para llenar el viewport exacto:
           100svh - navbar(56) - main-top-padding(24) - contenido-sobre-charts(≈288) - gap(12) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

        <div className="bg-white rounded-2xl border border-gray-100 border-t-2 border-t-emerald-200 border-b-2 border-b-emerald-200 p-4 flex flex-col h-64 sm:h-72 lg:h-80">
          <SectionLabel accent="bg-emerald-500">Pipeline por etapa</SectionLabel>
          <p className="text-xs text-gray-400 mt-0.5 mb-3 pl-2.75">
            Cantidad de leads por estado comercial.
          </p>
          <div className="flex-1 min-h-0">
            {cargandoMetricas && (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-gray-400">Cargando...</p>
              </div>
            )}
            {!cargandoMetricas && errorMetricas && (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-red-500">No se pudo cargar el pipeline.</p>
              </div>
            )}
            {!cargandoMetricas && !errorMetricas && (
              <ResponsiveContainer width="100%" height="100%" minHeight={0}>
                <BarChart data={pipelineData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="estado"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    angle={-20}
                    textAnchor="end"
                    height={52}
                    tickFormatter={(v: string) => {
                      const map: Record<string, string> = {
                        'En prospecto':     'Prosp.',
                        'Ofertado':         'Ofert.',
                        'Cierre con venta': 'C/Venta',
                        'Cierre sin venta': 'S/Venta',
                      }
                      return map[v] ?? v
                    }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                  <Bar dataKey="cantidad" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 border-t-2 border-t-blue-200 border-b-2 border-b-blue-200 p-4 flex flex-col h-64 sm:h-72 lg:h-80">
          <SectionLabel accent="bg-blue-400">Estado de cotizaciones</SectionLabel>
          <p className="text-xs text-gray-400 mt-0.5 mb-3 pl-2.75">
            Distribución de propuestas del periodo.
          </p>
          <div className="flex-1 min-h-0">
            {cargandoMetricas && (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-gray-400">Cargando...</p>
              </div>
            )}
            {!cargandoMetricas && errorMetricas && (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-red-500">No se pudieron cargar las cotizaciones.</p>
              </div>
            )}
            {!cargandoMetricas && !errorMetricas && cotizacionesData.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-emerald-600 font-medium">Sin cotizaciones en el periodo.</p>
              </div>
            )}
            {!cargandoMetricas && !errorMetricas && cotizacionesData.length !== 0 && (
              <ResponsiveContainer width="100%" height="100%" minHeight={0}>
                <PieChart>
                  <Pie data={cotizacionesData} cx="50%" cy="50%"
                    innerRadius="30%" outerRadius="50%" paddingAngle={3} dataKey="value" />
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* ─── SCROLL ─── */}

      {/* Conversión y eficiencia */}
      <div className="space-y-2">
        <SectionLabel accent="bg-blue-500">Conversión y eficiencia</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard compact accentBorder="border-t-blue-200"
            label="Tasa de conversión"
            valor={kpiValor(formatPercent(metrics?.conversionRate))}
            descripcion="Leads convertidos en venta"
            iconoBg="bg-blue-50"
            icono={<PercentIcon size={16} weight="duotone" className="text-blue-500" />}
          />
          <KpiCard compact accentBorder="border-t-cyan-200"
            label="Propuesta → Venta"
            valor={kpiValor(formatPercent(metrics?.proposalToCloseRate))}
            descripcion="Propuestas que cierran con venta"
            iconoBg="bg-cyan-50"
            icono={<TrendUpIcon size={16} weight="duotone" className="text-cyan-600" />}
          />
          <KpiCard compact accentBorder="border-t-violet-200"
            label="Seguimientos / lead"
            valor={kpiValor(formatAverage(metrics?.avgActivitiesPerLead))}
            descripcion="Promedio de actividades registradas"
            iconoBg="bg-violet-50"
            icono={<PulseIcon size={16} weight="duotone" className="text-violet-500" />}
          />
          <KpiCard compact accentBorder="border-t-red-200"
            label="Leads sin avance"
            valor={kpiValor(formatPercent(metrics?.stalledLeadPercentage))}
            descripcion="Leads estancados más de 30 días"
            iconoBg="bg-red-50"
            icono={<CalendarXIcon size={16} weight="duotone" className="text-red-500" />}
          />
        </div>
      </div>

      {/* Tiempos */}
      <div className="space-y-2">
        <SectionLabel accent="bg-orange-400">Tiempos</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <KpiCard compact accentBorder="border-t-orange-200"
            label="Tiempo promedio de cierre"
            valor={kpiValor(formatDays(metrics?.avgClosingTimeDays))}
            descripcion="Desde registro hasta cierre con venta"
            iconoBg="bg-orange-50"
            icono={<ClockIcon size={16} weight="duotone" className="text-orange-500" />}
          />
          <KpiCard compact accentBorder="border-t-purple-200"
            label="Tiempo en etapa propuesta"
            valor={kpiValor(formatDays(metrics?.avgProposalStageDays))}
            descripcion="Promedio en etapa ofertado"
            iconoBg="bg-purple-50"
            icono={<HourglassIcon size={16} weight="duotone" className="text-purple-500" />}
          />
        </div>
      </div>

        </>
      )}

    </div>
  )
}
