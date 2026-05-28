'use client'

import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  Target, Percent, Clock, Timer,
  Activity, DollarSign, TrendingUp, Calendar,
  RefreshCw, Eye
} from 'lucide-react'


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

const MOCK_PIPELINE_DATA = [
  { estado: 'En prospecto',    cantidad: 2, color: '#6b7280' },
  { estado: 'Ofertado',        cantidad: 2, color: '#f59e0b' },
  { estado: 'Cierre con venta', cantidad: 0, color: '#10b981' },
  { estado: 'Cierre sin venta', cantidad: 0, color: '#ef4444' },
]

const MOCK_COTIZACIONES_DATA: { name: string; value: number; color: string }[] = []

const MOCK_KPIS = {
  leadsGenerados:     1,
  propuestaVenta:     0,
  tiempoCierre:       0,
  tiempoEtapa:        7,
  seguimientosPorLead: 0.0,
  montoEnPipeline:    0,
  ingresosCerrados:   0,
  leadsSinAvance:     75,
  leadsSinAvanceDetalle: '3 de 4 leads abiertos',
  montoCotizaciones:  '0 cotizaciones enviadas',
  ingresosDetalle:    '0 cotizaciones aceptadas',
}

const PERIODOS: PeriodoTab[] = [
  { key: 'anio',  label: 'AÑO COMPLETO',   sub: '2026' },
  { key: 'q1',    label: '1ER TRIMESTRE',  sub: 'Enero – Marzo' },
  { key: 'q2',    label: '2DO TRIMESTRE',  sub: 'Abril – Junio' },
  { key: 'q3',    label: '3ER TRIMESTRE',  sub: 'Julio – Setiembre' },
  { key: 'q4',    label: '4TO TRIMESTRE',  sub: 'Octubre – Diciembre' },
]

const ANIOS = ['2024', '2025', '2026']

function KpiCard({ label, valor, descripcion, icono, iconoBg, extra }: KpiCardProps) {
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

export default function DashboardPage() {
  const [periodoActivo, setPeriodoActivo] = useState('anio')
  const [anioActivo, setAnioActivo]       = useState('2026')
  const [fechaInicio, setFechaInicio]     = useState('2026-01-01')
  const [fechaFin, setFechaFin]           = useState('2027-01-01')

  const hoy = useMemo(() => {
    return new Date().toLocaleDateString('es-PE', {
      day:   '2-digit',
      month: 'short',
      year:  'numeric',
    })
  }, [])

  const handlePeriodo = (key: string) => {
    setPeriodoActivo(key)
    const anio = parseInt(anioActivo)
    switch (key) {
      case 'anio':
        setFechaInicio(`${anio}-01-01`)
        setFechaFin(`${anio + 1}-01-01`)
        break
      case 'q1':
        setFechaInicio(`${anio}-01-01`)
        setFechaFin(`${anio}-04-01`)
        break
      case 'q2':
        setFechaInicio(`${anio}-04-01`)
        setFechaFin(`${anio}-07-01`)
        break
      case 'q3':
        setFechaInicio(`${anio}-07-01`)
        setFechaFin(`${anio}-10-01`)
        break
      case 'q4':
        setFechaInicio(`${anio}-10-01`)
        setFechaFin(`${anio + 1}-01-01`)
        break
    }
  }

  const handleReiniciar = () => {
    setPeriodoActivo('anio')
    setAnioActivo('2026')
    setFechaInicio('2026-01-01')
    setFechaFin('2027-01-01')
  }

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
                onChange={(e) => setAnioActivo(e.target.value)}
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
            {PERIODOS.map((p) => (
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

          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Fecha inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                  outline-none focus:border-emerald-400 text-gray-700"
              />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-gray-500">Fecha fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                    outline-none focus:border-emerald-400 text-gray-700"
                />
              </div>
              <button
                onClick={handleReiniciar}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200
                  text-emerald-600 hover:bg-emerald-50 text-sm font-medium transition-colors shrink-0"
              >
                <RefreshCw size={14} />
                Reiniciar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Leads generados"
          valor={MOCK_KPIS.leadsGenerados}
          descripcion="Registrados en el periodo"
          iconoBg="bg-gray-100"
          icono={<Target size={20} className="text-gray-500" />}
        />
        <KpiCard
          label="Propuesta → Venta"
          valor={`${MOCK_KPIS.propuestaVenta}%`}
          descripcion="0 aceptadas de 0 propuestas"
          iconoBg="bg-blue-50"
          icono={<Percent size={20} className="text-blue-500" />}
        />
        <KpiCard
          label="Tiempo promedio de cierre"
          valor={`${MOCK_KPIS.tiempoCierre} días`}
          descripcion="Desde registro hasta cierre"
          iconoBg="bg-orange-50"
          icono={<Clock size={20} className="text-orange-500" />}
        />
        <KpiCard
          label="Tiempo en etapa propuesta"
          valor={`${MOCK_KPIS.tiempoEtapa} días`}
          descripcion="Desde lead hasta pasar a ofertado"
          iconoBg="bg-purple-50"
          icono={<Timer size={20} className="text-purple-500" />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Seguimientos por lead"
          valor={MOCK_KPIS.seguimientosPorLead.toFixed(1)}
          descripcion="Promedio de actividades registradas"
          iconoBg="bg-gray-100"
          icono={<Activity size={20} className="text-gray-500" />}
        />
        <KpiCard
          label="Monto en pipeline"
          valor={`S/ ${MOCK_KPIS.montoEnPipeline.toFixed(2)}`}
          descripcion={MOCK_KPIS.montoCotizaciones}
          iconoBg="bg-emerald-50"
          icono={<DollarSign size={20} className="text-emerald-500" />}
          extra={
            <button className="flex items-center gap-1.5 text-xs text-emerald-600
              hover:text-emerald-700 font-semibold border border-emerald-200
              rounded-lg px-3 py-1.5 hover:bg-emerald-50 transition-colors w-fit">
              <Eye size={12} />
              VER DETALLE
            </button>
          }
        />
        <KpiCard
          label="Ingresos cerrados"
          valor={`S/ ${MOCK_KPIS.ingresosCerrados.toFixed(2)}`}
          descripcion={MOCK_KPIS.ingresosDetalle}
          iconoBg="bg-blue-50"
          icono={<TrendingUp size={20} className="text-blue-500" />}
        />
        <KpiCard
          label="Leads sin avance"
          valor={`${MOCK_KPIS.leadsSinAvance}%`}
          descripcion={MOCK_KPIS.leadsSinAvanceDetalle}
          iconoBg="bg-red-50"
          icono={<Calendar size={20} className="text-red-500" />}
          extra={
            <button className="flex items-center gap-1.5 text-xs text-emerald-600
              hover:text-emerald-700 font-semibold border border-emerald-200
              rounded-lg px-3 py-1.5 hover:bg-emerald-50 transition-colors w-fit">
              <Eye size={12} />
              VER DETALLE
            </button>
          }
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
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={MOCK_PIPELINE_DATA}
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
                {MOCK_PIPELINE_DATA.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Estado de cotizaciones
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 mb-6">
            Distribución de propuestas del periodo.
          </p>

          {MOCK_COTIZACIONES_DATA.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-emerald-600 font-medium">
                Sin cotizaciones en el periodo seleccionado.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={MOCK_COTIZACIONES_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {MOCK_COTIZACIONES_DATA.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
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